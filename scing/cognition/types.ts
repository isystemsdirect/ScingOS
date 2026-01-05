export type Hypothesis = {
  id: string;
  payload: any;
  confidence: number; // 0.0 – 1.0
  stability: number; // 0.0 – 1.0
};

export type HypothesisSet = {
  hypotheses: Hypothesis[];
  variance: number;
  collapsed: boolean;
};

export type CollapseResult = {
  selected: Hypothesis;
  confidence: number;
  collapseReason: 'variance_threshold' | 'max_confidence' | 'timeout';
};
