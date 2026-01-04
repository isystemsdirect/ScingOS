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

  if (domain.domainKey === 'roofing') {
    // Safe-access slope limit (future-tunable): flag steep roofs deterministically.
    const SAFE_ACCESS_SLOPE_DEG = 45;
    const slope = params.input.measurements.find((x) => x.name === 'roof_slope');
    if (slope && slope.value.unit === 'deg') {
      const a = detectThreshold({
        measurement: {
          measurementId: slope.measurementId,
          name: slope.name,
          value: slope.value.value,
          unit: String(slope.value.unit),
        },
        limit: SAFE_ACCESS_SLOPE_DEG,
        comparator: '>=',
      });
      if (a) out.push(a);
    }
  }

  if (domain.domainKey === 'electrical') {
    // Voltage out of range thresholds (deterministic; config later).
    const v = params.input.measurements.find((x) => x.name === 'line_voltage');
    if (v && v.value.unit === 'v') {
      const value = v.value.value;
      if (Number.isFinite(value) && (value < 110 || value > 125)) {
        const a = detectThreshold({
          measurement: {
            measurementId: v.measurementId,
            name: v.name,
            value,
            unit: String(v.value.unit),
          },
          limit: value < 110 ? 110 : 125,
          comparator: value < 110 ? '<' : '>',
        });
        if (a) out.push(a);
      }
    }

    // Boolean-like measurements: 1 = pass, 0 = fail.
    const gfci = params.input.measurements.find((x) => x.name === 'gfci_trip_test');
    if (gfci && gfci.value.unit === 'bool') {
      const pass = gfci.value.value;
      if (Number.isFinite(pass) && pass <= 0) {
        const a = detectThreshold({
          measurement: {
            measurementId: gfci.measurementId,
            name: gfci.name,
            value: gfci.value.value,
            unit: String(gfci.value.unit),
          },
          limit: 0,
          comparator: '<=',
        });
        if (a) out.push(a);
      }
    }
  }

  return out;
}
