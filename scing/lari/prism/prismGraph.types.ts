export type PrismNodeKind = 'artifact' | 'finding' | 'classification';

export type PrismEdgeKind = 'evidence' | 'supports' | 'classifies';

export type PrismNode = {
  id: string;
  kind: PrismNodeKind;
  label: string;
  meta?: Record<string, unknown>;
};

export type PrismEdge = {
  from: string;
  to: string;
  kind: PrismEdgeKind;
  note?: string;
  weight?: number;
};

export type PrismGraph = {
  version: '1';
  nodes: PrismNode[];
  edges: PrismEdge[];
  graphHash: string;
};
