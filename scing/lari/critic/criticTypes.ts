export type CriticDecision =
  | { allow: true }
  | { allow: false; reason: string };

export type CriticResult = {
  findingId: string;
  decision: CriticDecision;
  adjustments?: {
    confidenceScore?: number;
    uncertaintyScore?: number;
    addWarning?: string;
  };
};
