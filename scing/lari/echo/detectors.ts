import { sha256Hex } from '../../evidence/evidenceHash';
import { stableJsonDeep } from '../../report/reportDeterminism';
import type { EchoAnomaly } from './echoTypes';

function aid(prefix: string, seed: unknown) {
  // Deterministic anomaly IDs: stable hash over the anomaly seed.
  return `${prefix}_${sha256Hex(stableJsonDeep(seed)).slice(0, 24)}`;
}

export function detectThreshold(params: {
  measurement: { measurementId: string; name: string; value: number; unit: string };
  limit: number;
  comparator: '>' | '<' | '>=' | '<=';
}): EchoAnomaly | null {
  const v = params.measurement.value;
  const pass =
    params.comparator === '>'
      ? v > params.limit
      : params.comparator === '>='
        ? v >= params.limit
        : params.comparator === '<'
          ? v < params.limit
          : v <= params.limit;
  if (!pass) return null;

  const seed = {
    type: 'threshold_exceeded',
    measurementId: params.measurement.measurementId,
    name: params.measurement.name,
    value: v,
    unit: params.measurement.unit,
    limit: params.limit,
    comparator: params.comparator,
  };

  return {
    anomalyId: aid('echo', seed),
    type: 'threshold_exceeded',
    title: `${params.measurement.name} threshold exceeded`,
    description: `${params.measurement.name} is ${v}${params.measurement.unit} which violates limit ${params.comparator}${params.limit}${params.measurement.unit}.`,
    threshold: { limit: params.limit, unit: params.measurement.unit, comparator: params.comparator },
    evidence: [{ kind: 'measurement', refId: params.measurement.measurementId }],
    confidence: { confidenceScore: 0.9, uncertaintyScore: 0.1, uncertaintyDrivers: [] },
    nextChecks: [
      'Re-measure same location',
      'Measure adjacent reference area',
      'Capture close-up artifact with scale reference',
    ],
  };
}

export function detectMissingRequired(params: {
  required: string[];
  presentNames: string[];
  inspectionId: string;
  domainKey: string;
  domainVersion: string;
}): EchoAnomaly[] {
  const missing = params.required.filter((r) => !params.presentNames.includes(r));
  return missing.map((name) => {
    const seed = {
      type: 'missing_required_measurement',
      inspectionId: params.inspectionId,
      domainKey: params.domainKey,
      domainVersion: params.domainVersion,
      name,
    };

    return {
      anomalyId: aid('echo', seed),
      type: 'missing_required_measurement',
      title: `Missing required measurement: ${name}`,
      description: `Required measurement "${name}" is missing for this domain.`,
      evidence: [
        {
          kind: 'field_input',
          refId: params.inspectionId,
          note: `missing measurement requirement (${params.domainKey}@${params.domainVersion})`,
        },
      ],
      confidence: { confidenceScore: 0.95, uncertaintyScore: 0.05, uncertaintyDrivers: [] },
      nextChecks: [`Capture measurement "${name}" with unit and tolerance`, 'Log method and provenance'],
    };
  });
}
