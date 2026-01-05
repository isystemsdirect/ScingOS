import type { EvidenceRef, ConfidenceBlock } from '../contracts/lariOutput.schema';

export type EchoAnomalyType =
  | 'threshold_exceeded'
  | 'sudden_delta'
  | 'inconsistent_readings'
  | 'repeat_pattern'
  | 'missing_required_measurement';

export type EchoAnomaly = {
  anomalyId: string;
  type: EchoAnomalyType;
  title: string;
  description: string;
  delta?: { from: number; to: number; unit: string };
  threshold?: { limit: number; unit: string; comparator: '>' | '<' | '>=' | '<=' };
  evidence: EvidenceRef[];
  confidence: ConfidenceBlock;
  nextChecks: string[];
};
