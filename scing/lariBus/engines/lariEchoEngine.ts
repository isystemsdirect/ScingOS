import type { EngineContract, EngineInput, EngineOutput } from '../busTypes';
import type { LariEngineInput, LariInputMeasurement } from '../../lari/contracts/lariInput.schema';
import type { UnitId } from '../../lari/contracts/units';
import { isKnownUnit, unitKind } from '../../lari/contracts/units';
import { runEcho } from '../../lari/echo/runEcho';
import { getDomain } from '../../domains/domainRegistry';

type EchoTelemetryMeasurement = {
  measurementId?: string;
  name?: string;
  observedAt?: string;
  value?: number;
  unit?: string;
  evidence?: Array<{
    kind: 'artifact' | 'measurement' | 'field_input' | 'external_standard';
    refId: string;
    note?: string;
  }>;
};

const nowIso = (): string => new Date().toISOString();

const normalizeMeasurement = (m: EchoTelemetryMeasurement): LariInputMeasurement | null => {
  if (!m) return null;
  const measurementId =
    typeof m.measurementId === 'string' && m.measurementId.length > 0 ? m.measurementId : null;
  const name = typeof m.name === 'string' && m.name.length > 0 ? m.name : null;
  const observedAt =
    typeof m.observedAt === 'string' && m.observedAt.length > 0 ? m.observedAt : nowIso();
  const value = typeof m.value === 'number' && Number.isFinite(m.value) ? m.value : null;
  const unit = typeof m.unit === 'string' ? m.unit : null;

  if (!measurementId || !name || value === null || !unit) return null;
  if (!isKnownUnit(unit)) return null;

  return {
    measurementId,
    name,
    kind: unitKind(unit as UnitId),
    observedAt,
    value: { value, unit: unit as UnitId },
    evidence: Array.isArray(m.evidence) ? m.evidence : [],
  };
};

const extractMeasurementsFromTelemetry = (payload: any): LariInputMeasurement[] => {
  const out: LariInputMeasurement[] = [];

  const maybeList = payload?.measurements;
  if (Array.isArray(maybeList)) {
    for (const raw of maybeList) {
      const m = normalizeMeasurement(raw);
      if (m) out.push(m);
    }
    return out;
  }

  const m = normalizeMeasurement(payload as any);
  if (m) out.push(m);
  return out;
};

const mapEchoTypeToSeverity = (t: string): 'info' | 'minor' | 'major' | 'critical' => {
  switch (t) {
    case 'missing_required_measurement':
      return 'minor';
    case 'threshold_exceeded':
      return 'major';
    default:
      return 'minor';
  }
};

export function createLariEchoEngine(): EngineContract {
  const state: {
    domainKey: string | null;
    measurements: LariInputMeasurement[];
    emittedFindingIds: Set<string>;
  } = {
    domainKey: null,
    measurements: [],
    emittedFindingIds: new Set(),
  };

  const emitHud = (): EngineOutput => {
    return {
      kind: 'hud',
      payload: {
        engineId: 'LARI-ECHO',
        overlays: [
          {
            kind: 'text',
            text: `Echo: ${state.measurements.length} measurements`,
            severity: 'info',
          },
        ],
      },
    };
  };

  return {
    engineId: 'LARI-ECHO',
    displayName: 'Echo (anomaly detection)',
    gates: [],

    handle: async (ctx, input: EngineInput): Promise<EngineOutput[]> => {
      if (input.kind === 'command') {
        if (input.name === 'echo:set_domain') {
          const dk = typeof input.args?.domainKey === 'string' ? input.args.domainKey : null;
          state.domainKey = dk;
          return [
            {
              kind: 'log',
              level: 'info',
              message: 'Echo domain updated',
              data: { domainKey: dk },
            },
          ];
        }
        return [];
      }

      if (input.kind === 'telemetry') {
        const ms = extractMeasurementsFromTelemetry(input.payload);
        if (ms.length > 0) {
          // Latest snapshot semantics (deterministic ordering by name then id).
          state.measurements = ms
            .slice()
            .sort((a, b) =>
              a.name === b.name
                ? a.measurementId.localeCompare(b.measurementId)
                : a.name.localeCompare(b.name)
            );
        }
        return [];
      }

      if (input.kind !== 'tick') return [];

      const domainKey = state.domainKey ?? 'moisture_mold';
      const domain = getDomain(domainKey);
      if (!domain) return [];

      const lariInput: LariEngineInput = {
        engineId: 'LARI-ECHO',
        inspectionId: ctx.session.inspectionId,
        receivedAt: ctx.nowIso(),
        artifacts: [],
        measurements: state.measurements,
        fieldInputs: [],
        schemaVersion: '1.0.0',
      };

      const anomalies = runEcho({ input: lariInput, domainKey });
      const outputs: EngineOutput[] = [];

      outputs.push(emitHud());

      for (const a of anomalies) {
        const findingId = a.anomalyId;
        if (state.emittedFindingIds.has(findingId)) continue;
        state.emittedFindingIds.add(findingId);

        const relatedArtifactIds = (a.evidence ?? [])
          .filter((e) => e.kind === 'artifact')
          .map((e) => e.refId);

        outputs.push({
          kind: 'finding',
          record: {
            findingId,
            orgId: ctx.auth.orgId,
            inspectionId: ctx.session.inspectionId,
            engineId: 'LARI-ECHO',
            title: a.title,
            severity: mapEchoTypeToSeverity(a.type),
            confidence: a.confidence.confidenceScore,
            rationale: a.description,
            relatedArtifactIds,
            codeRefs: [
              {
                authority: domain.domainKey,
                code: a.type,
                version: domain.version,
              },
            ],
            createdAt: ctx.nowIso(),
            updatedAt: ctx.nowIso(),
          },
        });
      }

      return outputs;
    },
  };
}
