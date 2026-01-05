export type SignalRole = 'propose' | 'critique';

export type NeuralSignal = {
  role: SignalRole;
  content: Record<string, unknown>; // arbitrary payload
  tags?: string[];
  annotations?: Record<string, unknown>;
};

export function invertSemantics(s: NeuralSignal): NeuralSignal {
  const nextRole: SignalRole = s.role === 'propose' ? 'critique' : 'propose';

  return {
    ...s,
    role: nextRole,
    tags: [...(s.tags ?? []), nextRole === 'critique' ? 'constraint' : 'affordance'],
    annotations: {
      ...(s.annotations ?? {}),
      inverted: true,
      dualMap: {
        intent: 'constraint',
        confidence: 'uncertainty',
        propose: 'critique',
        affordance: 'risk',
        expression: 'interpretation',
      },
    },
  };
}

export function blendSemantics(base: NeuralSignal, dual: NeuralSignal, a: number): NeuralSignal {
  // semantic mixing: we do NOT “average” content; we attach weighted overlays
  const w = Math.max(0, Math.min(1, a));

  return {
    ...base,
    // When w grows, allow dual role to dominate tagging while preserving base content.
    role: w > 0.5 ? dual.role : base.role,
    tags: [...(base.tags ?? []), ...(w > 0.15 ? (dual.tags ?? []) : [])],
    annotations: {
      ...(base.annotations ?? {}),
      mobiusBlend: {
        weight: w,
        overlayRole: dual.role,
      },
      ...(w > 0.15 ? (dual.annotations ?? {}) : {}),
    },
  };
}
