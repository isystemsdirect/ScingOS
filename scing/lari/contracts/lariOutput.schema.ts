export type EvidenceRef = {
  kind: 'artifact' | 'measurement' | 'field_input' | 'external_standard';
  refId: string;
  note?: string;
};

export type ConfidenceBlock = {
  confidenceScore: number; // 0.0 – 1.0
  uncertaintyScore: number; // 0.0 – 1.0
  uncertaintyDrivers: string[]; // explicit reasons
};

export type LariFinding = {
  findingId: string;
  title: string;
  severity?: 'info' | 'minor' | 'moderate' | 'major' | 'critical';
  description: string;
  evidence: EvidenceRef[];
  confidence: ConfidenceBlock;
};

export type LariEngineOutput = {
  engineId: string;
  inspectionId: string;
  producedAt: string;

  findings: LariFinding[];

  assumptions: string[];
  limitations: string[];

  engineWarnings?: string[];

  schemaVersion: '1.0.0';
};
