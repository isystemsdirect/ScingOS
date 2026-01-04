import type { SituationSnapshot } from '../../sensors/types';

export type NextBestAction =
  | { type: 'suggest_actions'; actions: string[] }
  | { type: 'recommend_checkpoint'; checkpoint: string }
  | { type: 'reduce_voice_verbosity' }
  | { type: 'cb_first' }
  | { type: 'none' };

export type NextBestActionResult = {
  predictionConfidence: number;
  askedCheckpoint: boolean;
  checkpointQuestion?: string;
  actions: NextBestAction[];
  reasons: string[];
};

function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

function oneCheckpoint(question: string): string {
  // Enforce single checkpoint question max.
  return question.replace(/[?]+$/g, '?');
}

export function computeNextBestAction(params: {
  snapshot: SituationSnapshot;
  userOptedInPredictions: boolean;
  proactiveGate?: number; // default 0.75
}): NextBestActionResult {
  const gate = typeof params.proactiveGate === 'number' ? params.proactiveGate : 0.75;
  const { snapshot } = params;

  const reasons = [...snapshot.derivedState.reasons];

  // Prediction confidence is conservative: fused confidence × derived confidence.
  const predictionConfidence = clamp01(snapshot.fused.confidence * snapshot.derivedState.confidence);

  if (!params.userOptedInPredictions) {
    return { predictionConfidence, askedCheckpoint: false, actions: [{ type: 'none' }], reasons: [...reasons, 'predictions disabled by user'] };
  }

  // Only take proactive action when confidence meets gate.
  if (predictionConfidence < gate) {
    const checkpointQuestion = oneCheckpoint('Quick check: do you want me to keep this brief and action-first?');
    return {
      predictionConfidence,
      askedCheckpoint: true,
      checkpointQuestion,
      actions: [{ type: 'recommend_checkpoint', checkpoint: checkpointQuestion }],
      reasons: [...reasons, 'prediction confidence below gate'],
    };
  }

  const actions: NextBestAction[] = [];

  if (snapshot.derivedState.load === 'high') {
    actions.push({ type: 'reduce_voice_verbosity' });
    actions.push({ type: 'suggest_actions', actions: ['Confirm the next single priority', 'Break into the next 3 steps'] });
    reasons.push('load high: shorter turns + checkpoints');
  }

  if (snapshot.derivedState.energy === 'low') {
    actions.push({ type: 'cb_first' });
    actions.push({ type: 'suggest_actions', actions: ['List the next 1–3 actions', 'Defer deep branching unless asked'] });
    reasons.push('energy low: CB-first and reduce branching');
  }

  if (snapshot.derivedState.focus === 'low') {
    actions.push({ type: 'suggest_actions', actions: ['Offer a short checkpoint summary', 'Ask to confirm priorities'] });
    reasons.push('focus low: checkpoint and priority confirmation');
  }

  if (actions.length === 0) actions.push({ type: 'none' });

  return { predictionConfidence, askedCheckpoint: false, actions, reasons };
}
