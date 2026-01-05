export interface BFIEngine {
  id: string;
  name: string;
  purpose: string;
  cognitiveRole: string;

  dependencies: string[];
  failureModes: string[];

  visualChannel: string;
  policySurface: string[];

  confidenceScore: number;
  lastReviewedAt: string;

  // Compatibility fields (older registry versions may include these)
  version?: string;
  family?: string;
}
