import type { LariEngineInput } from '../contracts/lariInput.schema';
import type { EchoAnomaly } from './echoTypes';
import { detectThreshold, detectMissingRequired } from './detectors';
import { getDomain } from '../../domains/domainRegistry';

export function runEcho(params: { input: LariEngineInput; domainKey?: string }): EchoAnomaly[] {
  const out: EchoAnomaly[] = [];

  const domainKey = params.domainKey;
  const domain = domainKey ? getDomain(domainKey) : null;
  if (!domain) return out;

  const names = params.input.measurements.map((m) => m.name);

  out.push(
    ...detectMissingRequired({
      required: domain.requiredMeasurements.map((m) => m.name),
      presentNames: names,
      inspectionId: params.input.inspectionId,
      domainKey: domain.domainKey,
      domainVersion: domain.version,
    })
  );

  // Domain-specific threshold rules (deterministic; tunable via pack).
  if (domain.domainKey === 'moisture_mold') {
    const m = params.input.measurements.find((x) => x.name === 'moisture_pct');
    if (m && (m.value.unit === 'pct' || m.value.unit === '%')) {
      const a = detectThreshold({
        measurement: {
          measurementId: m.measurementId,
          name: m.name,
          value: m.value.value,
          unit: String(m.value.unit),
        },
        limit: 20,
        comparator: '>=',
      });
      if (a) out.push(a);
    }
  }

  return out;
}
