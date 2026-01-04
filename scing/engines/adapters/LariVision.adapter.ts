import type { LariEngineInput } from '../../lari/contracts/lariInput.schema';
import type { LariEngineOutput, LariFinding } from '../../lari/contracts/lariOutput.schema';
import { validateLariInput } from '../../lari/contracts/validateLariInput';
import { emitEngineOutput } from '../../lari/runtime/emitEngineOutput';
import { getDomain } from '../../domains/domainRegistry';
import { getSensorProviderById } from '../../sensors/sensorRegistry';

type DomainArtifactRequirement = { key: string; description: string };

function mapDefaultSeverity(s: string): LariFinding['severity'] {
  if (s === 'minor') return 'minor';
  if (s === 'moderate') return 'moderate';
  if (s === 'major') return 'major';
  if (s === 'critical') return 'critical';
  return 'info';
}

function artifactMatchesKey(params: {
  artifact: { artifactId: string; type: string };
  key: string;
}): boolean {
  const { artifact, key } = params;
  const a = `${artifact.type}|${artifact.artifactId}`.toLowerCase();
  const k = key.toLowerCase();
  if (a.includes(k)) return true;

  // Deterministic heuristic mapping for common IDs/types (keeps gold sets simple).
  if (k === 'roof_overview' && (a.includes('overview') || a.includes('roof_overview'))) return true;
  if (k === 'penetration_detail' && (a.includes('penetration') || a.includes('vent') || a.includes('chimney') || a.includes('flashing'))) return true;
  if (k === 'damage_closeup' && (a.includes('damage') || a.includes('closeup') || a.includes('crack') || a.includes('missing'))) return true;
  if (k === 'slope_edge' && (a.includes('slope') || a.includes('edge'))) return true;

  if (k === 'panel_overview' && (a.includes('panel') && a.includes('overview'))) return true;
  if (k === 'breaker_detail' && (a.includes('breaker') || a.includes('arcing') || a.includes('burn'))) return true;

  return false;
}

function requiredArtifactKeys(params: {
  domainArtifacts: ReadonlyArray<DomainArtifactRequirement>;
  artifacts: Array<{ artifactId: string; type: string }>;
}): { missingKeys: string[]; presentKeys: Set<string> } {
  const presentKeys = new Set<string>();

  for (const r of params.domainArtifacts) {
    for (const a of params.artifacts) {
      if (artifactMatchesKey({ artifact: a, key: r.key })) {
        presentKeys.add(r.key);
        break;
      }
    }
  }

  const missingKeys = params.domainArtifacts
    .map((r) => r.key)
    .filter((k) => !presentKeys.has(k));

  return { missingKeys, presentKeys };
}

function pickRoofingFinding(params: {
  domainTaxonomy: ReadonlyArray<{ code: string; label: string; defaultSeverity: string }>;
  artifacts: Array<{ artifactId: string; type: string }>;
}): { title: string; code: string; severity: LariFinding['severity']; evidenceArtifactId: string } | null {
  const rf02 = params.domainTaxonomy.find((t) => t.code === 'RF-02');
  if (!rf02) return null;

  const damage = params.artifacts.find((a) => artifactMatchesKey({ artifact: a, key: 'damage_closeup' }));
  if (!damage) return null;

  return {
    title: rf02.label,
    code: rf02.code,
    severity: mapDefaultSeverity(rf02.defaultSeverity),
    evidenceArtifactId: damage.artifactId,
  };
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

  // CB-15: Sensor providers must be explicit and auditable.
  const sensorWarnings: string[] = [];
  const sensorErrors: string[] = [];
  for (const s of i.sensorCaptures ?? []) {
    const p = getSensorProviderById(s.providerId);
    if (!p) {
      sensorErrors.push(`SENSOR_PROVIDER_UNKNOWN:${s.providerId}`);
      continue;
    }
    const info = p.info();
    if (info.status === 'stub') sensorWarnings.push(`SENSOR_STUB_USED:${info.providerId}`);
  }
  if (sensorErrors.length) {
    sensorErrors.sort();
    return { blocked: true, reason: 'INPUT_SCHEMA_VIOLATION', errors: sensorErrors };
  }

  const domainKey = params.fields.domainKey;
  const domain = domainKey ? getDomain(domainKey) : null;
  if (!domain) {
    const output: LariEngineOutput = {
      engineId: 'LARI-VISION',
      inspectionId: i.inspectionId,
      producedAt: i.receivedAt,
      findings: [],
      assumptions: ['Vision did not run because no domain pack was selected.'],
      limitations: ['Domain pack selection is required for taxonomy-constrained Vision outputs.'],
      engineWarnings: ['MISSING_DOMAIN_PACK'],
      schemaVersion: '1.0.0',
    };

    const res = emitEngineOutput({ output });
    if (res.blocked === true)
      return { blocked: true, reason: 'OUTPUT_SCHEMA_VIOLATION', errors: res.errors };
    return { blocked: false, output: res.output };
  }

  const { missingKeys } = requiredArtifactKeys({
    domainArtifacts: domain.requiredArtifacts ?? [],
    artifacts: i.artifacts ?? [],
  });

  const engineWarnings = [
    ...sensorWarnings,
    ...missingKeys.map((k) => `MISSING_REQUIRED_ARTIFACT:${k}`),
  ];

  const missingCritical = new Set<string>();
  if (domain.domainKey === 'roofing') {
    if (missingKeys.includes('roof_overview')) missingCritical.add('roof_overview');
    if (missingKeys.includes('penetration_detail')) missingCritical.add('penetration_detail');
  }
  if (domain.domainKey === 'electrical') {
    if (missingKeys.includes('panel_overview')) missingCritical.add('panel_overview');
    if (missingKeys.includes('breaker_detail')) missingCritical.add('breaker_detail');
  }

  const findings: LariFinding[] = [];

  // Taxonomy-constrained deterministic baseline: we only emit findings with titles from the domain taxonomy.
  if (domain.domainKey === 'roofing') {
    const f = pickRoofingFinding({
      domainTaxonomy: domain.taxonomy ?? [],
      artifacts: i.artifacts ?? [],
    });
    if (f) {
      const verificationNote = missingCritical.size
        ? ` Verification required (missing critical artifacts: ${Array.from(missingCritical).sort().join(', ')}).`
        : '';

      findings.push({
        findingId: `vision_${f.code}_${i.inspectionId}`,
        title: f.title,
        severity: f.severity,
        description: `Taxonomy-constrained roofing finding.${verificationNote}`,
        evidence: [{ kind: 'artifact', refId: f.evidenceArtifactId }],
        confidence: { confidenceScore: 0.6, uncertaintyScore: 0.4, uncertaintyDrivers: ['heuristic_baseline'] },
      });
    }
  }

  const output: LariEngineOutput = {
    engineId: 'LARI-VISION',
    inspectionId: i.inspectionId,
    producedAt: i.receivedAt,
    findings,
    assumptions: [
      'Vision emits taxonomy-constrained findings only.',
      'This adapter is deterministic and uses artifact metadata/type/id heuristics only.',
    ],
    limitations: [
      'Vision outputs are limited by provided artifacts and their metadata.',
      'Missing required artifacts may require re-capture for verification.',
    ],
    engineWarnings,
    schemaVersion: '1.0.0',
  };

  const res = emitEngineOutput({ output });
  if (res.blocked === true)
    return { blocked: true, reason: 'OUTPUT_SCHEMA_VIOLATION', errors: res.errors };
  return { blocked: false, output: res.output };
}
