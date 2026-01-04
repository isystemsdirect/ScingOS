import type { LariEngineInput } from '../../lari/contracts/lariInput.schema';
import type { LariEngineOutput, LariFinding } from '../../lari/contracts/lariOutput.schema';
import { validateLariInput } from '../../lari/contracts/validateLariInput';
import { runEcho } from '../../lari/echo/runEcho';
import { emitEngineOutput } from '../../lari/runtime/emitEngineOutput';

function mapSeverity(type: string): LariFinding['severity'] {
  if (type === 'threshold_exceeded') return 'moderate';
  if (type === 'missing_required_measurement') return 'minor';
  if (type === 'sudden_delta') return 'major';
  return 'info';
}

export async function handle(params: {
  input: LariEngineInput;
  fields: { domainKey?: string };
}): Promise<
  | { blocked: true; reason: 'INPUT_SCHEMA_VIOLATION' | 'OUTPUT_SCHEMA_VIOLATION'; errors: string[] }
  | { blocked: false; output: LariEngineOutput }
> {
  const i = params.input;

  const vi = validateLariInput(i);
  if (vi.ok === false) {
    return { blocked: true, reason: 'INPUT_SCHEMA_VIOLATION', errors: vi.errors };
  }

  const anomalies = runEcho({ input: i, domainKey: params.fields.domainKey });

  const output: LariEngineOutput = {
    engineId: 'LARI-ECHO',
    inspectionId: i.inspectionId,
    producedAt: i.receivedAt,
    findings: anomalies.map((a) => ({
      findingId: a.anomalyId,
      title: a.title,
      severity: mapSeverity(a.type),
      description: a.description,
      evidence: a.evidence,
      confidence: a.confidence,
    })),
    assumptions: ['Echo flags indicators only; it does not assert cause.'],
    limitations: ['Echo operates on structured measurements, artifacts metadata, and stored snapshots only.'],
    engineWarnings: [],
    schemaVersion: '1.0.0',
  };

  const res = emitEngineOutput({ output });
  if (res.blocked === true)
    return { blocked: true, reason: 'OUTPUT_SCHEMA_VIOLATION', errors: res.errors };
  return { blocked: false, output: res.output };
}
