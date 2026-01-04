import type { VoiceError } from '../types';
import type { WebSpeechStt } from './webSpeechStt';

export type VoiceMvpState = 'idle' | 'listening' | 'transcribing' | 'thinking' | 'error';

export type VoiceMvpSnapshot = {
  state: VoiceMvpState;
  transcriptInterim: string;
  transcriptFinal: string;
  lastResponse: string;
  lastError: VoiceError | null;
  correlationId: string | null;
};

export type VoiceMvpController = {
  snapshot: () => VoiceMvpSnapshot;
  pushToTalkDown: () => void;
  pushToTalkUp: () => void;
  reset: () => void;
  dispose: () => void;
};

function createCorrelationId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `corr_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function createVoiceMvpController(params: {
  stt: WebSpeechStt;
  submitToNeural: (args: { correlationId: string; text: string }) => Promise<{ textOut: string }>;
  onChange: (snap: VoiceMvpSnapshot) => void;
  timeoutMs?: number;
}): VoiceMvpController {
  let state: VoiceMvpState = 'idle';
  let transcriptInterim = '';
  let transcriptFinal = '';
  let lastResponse = '';
  let lastError: VoiceError | null = null;
  let correlationId: string | null = null;

  let finalReceived = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let disposed = false;

  const timeoutMs = typeof params.timeoutMs === 'number' ? params.timeoutMs : 12_000;

  const snapshot = (): VoiceMvpSnapshot => ({
    state,
    transcriptInterim,
    transcriptFinal,
    lastResponse,
    lastError,
    correlationId,
  });

  const emit = () => params.onChange(snapshot());

  const clearTimer = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };

  const setState = (next: VoiceMvpState) => {
    state = next;
    emit();
  };

  const fail = (err: VoiceError) => {
    clearTimer();
    lastError = err;
    setState('error');
  };

  const reset = () => {
    clearTimer();
    transcriptInterim = '';
    transcriptFinal = '';
    lastResponse = '';
    lastError = null;
    correlationId = null;
    finalReceived = false;
    setState('idle');
  };

  const pushToTalkDown = () => {
    if (disposed) return;

    if (state === 'listening') return;
    if (state === 'transcribing' || state === 'thinking') return;
    if (state === 'error') reset();

    if (!params.stt.isSupported()) {
      fail({ code: 'STT_FAILED', message: 'SpeechRecognition not supported.', recoverable: false });
      return;
    }

    correlationId = createCorrelationId();
    transcriptInterim = '';
    transcriptFinal = '';
    lastError = null;
    finalReceived = false;

    clearTimer();
    timer = setTimeout(() => {
      if (disposed) return;
      if (finalReceived) return;
      params.stt.abort();
      fail({ code: 'NO_AUDIO', message: 'No final transcript received.', recoverable: true });
    }, timeoutMs);

    setState('listening');
    params.stt.start();
  };

  const pushToTalkUp = () => {
    if (disposed) return;
    if (state !== 'listening') return;

    setState('transcribing');
    params.stt.stop();
  };

  const dispose = () => {
    disposed = true;
    clearTimer();
    params.stt.abort();
  };

  // Bind STT callbacks by wrapping the provided stt.
  // The stt object itself owns callback wiring; this controller handles only state transitions.
  // NOTE: We assume the stt passed in already forwards onInterim/onFinal/onError to these hooks.
  const onInterim = (text: string) => {
    if (disposed) return;
    transcriptInterim = text;
    emit();
  };

  const onFinal = async (text: string) => {
    if (disposed) return;
    finalReceived = true;
    clearTimer();

    transcriptFinal = text;
    transcriptInterim = '';
    emit();

    const corr = correlationId ?? createCorrelationId();
    setState('thinking');

    try {
      const out = await params.submitToNeural({ correlationId: corr, text });
      lastResponse = out.textOut;
      setState('idle');
    } catch (e: any) {
      fail({ code: 'NETWORK', message: e?.message || 'Failed to submit to Neural.', recoverable: true });
    }
  };

  const onError = (err: VoiceError) => {
    if (disposed) return;
    fail(err);
  };

  // Expose hooks via (hacky but minimal) properties on stt object.
  // This keeps controller small without introducing extra event emitter plumbing.
  (params.stt as any).__voiceMvpHooks = { onInterim, onFinal, onError };

  emit();

  return {
    snapshot,
    pushToTalkDown,
    pushToTalkUp,
    reset,
    dispose,
  };
}
