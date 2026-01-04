import type { VoiceError } from '../types';

export type WebSpeechSttCallbacks = {
  onInterim?: (text: string) => void;
  onFinal?: (text: string, confidence?: number) => void;
  onError?: (err: VoiceError) => void;
  onStart?: () => void;
  onEnd?: () => void;
};

export type WebSpeechStt = {
  isSupported: () => boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognition;

type SpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: ((ev: Event) => any) | null;
  onend: ((ev: Event) => any) | null;
  onerror: ((ev: any) => any) | null;
  onresult: ((ev: any) => any) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function normalizeSpeechError(err: any): VoiceError {
  const codeRaw = typeof err?.error === 'string' ? err.error : '';
  const message = typeof err?.message === 'string' ? err.message : 'Speech recognition failed.';

  if (codeRaw === 'not-allowed' || codeRaw === 'service-not-allowed') {
    return { code: 'MIC_DENIED', message, recoverable: true };
  }

  if (codeRaw === 'no-speech' || codeRaw === 'audio-capture') {
    return { code: 'NO_AUDIO', message, recoverable: true };
  }

  if (codeRaw === 'network') {
    return { code: 'NETWORK', message, recoverable: true };
  }

  if (codeRaw) {
    return { code: 'STT_FAILED', message: `${codeRaw}: ${message}`, recoverable: true };
  }

  return { code: 'UNKNOWN', message, recoverable: true };
}

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;

  const w = window as any;
  return (w.SpeechRecognition || w.webkitSpeechRecognition || null) as SpeechRecognitionCtor | null;
}

export function createWebSpeechStt(params: { locale: string; callbacks: WebSpeechSttCallbacks }): WebSpeechStt {
  let recognition: SpeechRecognition | null = null;

  const isSupported = () => Boolean(getSpeechRecognitionCtor());

  const ensureRecognition = (): SpeechRecognition | null => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return null;

    // Recreate each session to avoid sticky internal state.
    const r = new Ctor() as any as SpeechRecognition;
    r.continuous = false;
    r.interimResults = true;
    r.lang = params.locale;

    r.onstart = () => params.callbacks.onStart?.();
    r.onend = () => params.callbacks.onEnd?.();

    r.onerror = (ev) => {
      params.callbacks.onError?.(normalizeSpeechError(ev));
    };

    r.onresult = (ev) => {
      // SpeechRecognitionEvent API shape (browser-provided).
      const results = ev?.results;
      const resultIndex = typeof ev?.resultIndex === 'number' ? ev.resultIndex : 0;
      if (!results) return;

      for (let i = resultIndex; i < results.length; i++) {
        const r = results[i];
        const alt0 = r?.[0];
        const text = typeof alt0?.transcript === 'string' ? alt0.transcript : '';
        const confidence = typeof alt0?.confidence === 'number' ? alt0.confidence : undefined;

        if (r?.isFinal) {
          if (text.trim()) params.callbacks.onFinal?.(text.trim(), confidence);
        } else {
          params.callbacks.onInterim?.(text);
        }
      }
    };

    recognition = r;
    return r;
  };

  const start = () => {
    const r = ensureRecognition();
    if (!r) {
      params.callbacks.onError?.({
        code: 'STT_FAILED',
        message: 'SpeechRecognition is not supported in this browser.',
        recoverable: false,
      });
      return;
    }

    try {
      r.start();
    } catch (e: any) {
      params.callbacks.onError?.({
        code: 'STT_FAILED',
        message: e?.message || 'Failed to start SpeechRecognition.',
        recoverable: true,
      });
    }
  };

  const stop = () => {
    try {
      recognition?.stop();
    } catch {
      // ignore
    }
  };

  const abort = () => {
    try {
      recognition?.abort();
    } catch {
      // ignore
    }
  };

  return { isSupported, start, stop, abort };
}
