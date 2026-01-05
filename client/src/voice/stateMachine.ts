import type { VoiceError, VoiceState } from './types';

export type VoiceStateChange = {
  from: VoiceState;
  to: VoiceState;
  correlationId?: string;
};

export type VoiceStateMachine = {
  getState: () => VoiceState;
  transition: (to: VoiceState, meta?: { correlationId?: string }) => VoiceState;
  fail: (err: VoiceError, meta?: { correlationId?: string }) => VoiceState;
};

const TRANSITIONS: Record<VoiceState, ReadonlyArray<VoiceState>> = {
  idle: ['listening'],
  listening: ['capturing', 'idle'],
  capturing: ['transcribing', 'idle'],
  transcribing: ['thinking', 'error'],
  thinking: ['speaking', 'idle', 'error'],
  speaking: ['idle', 'error'],
  error: ['idle', 'degraded'],
  degraded: ['idle'],
};

export function isLegalVoiceTransition(from: VoiceState, to: VoiceState): boolean {
  return TRANSITIONS[from].includes(to);
}

export function makeVoiceStateMachine(params?: {
  initial?: VoiceState;
  onChange?: (c: VoiceStateChange) => void;
  onIllegal?: (c: VoiceStateChange) => void;
}) : VoiceStateMachine {
  let state: VoiceState = params?.initial ?? 'idle';

  const transition = (to: VoiceState, meta?: { correlationId?: string }) => {
    const from = state;
    if (!isLegalVoiceTransition(from, to)) {
      const change: VoiceStateChange = { from, to, correlationId: meta?.correlationId };
      params?.onIllegal?.(change);
      throw new Error(`VOICE_ILLEGAL_TRANSITION:${from}->${to}`);
    }
    state = to;
    params?.onChange?.({ from, to, correlationId: meta?.correlationId });
    return state;
  };

  const fail = (err: VoiceError, meta?: { correlationId?: string }) => {
    // Keep error handling explicit: transition into 'error' if legal; otherwise throw.
    const from = state;
    if (!isLegalVoiceTransition(from, 'error')) {
      const change: VoiceStateChange = { from, to: 'error', correlationId: meta?.correlationId };
      params?.onIllegal?.(change);
      throw new Error(`VOICE_ILLEGAL_TRANSITION:${from}->error`);
    }
    state = 'error';
    params?.onChange?.({ from, to: 'error', correlationId: meta?.correlationId });
    void err;
    return state;
  };

  return {
    getState: () => state,
    transition,
    fail,
  };
}
