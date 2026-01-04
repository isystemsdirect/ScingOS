import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { getVoiceConfig } from '../config';
import type { VoiceError } from '../types';
import { createWebSpeechStt } from './webSpeechStt';
import { createVoiceMvpController, type VoiceMvpState } from './voiceMvpController';
import { useAuthStore } from '../../../lib/store/authStore';

export function useVoiceMvp() {
  const router = useRouter();
  const { user } = useAuthStore();

  const cfg = useMemo(() => getVoiceConfig(), []);
  const enabled = cfg.enabled;

  const [state, setState] = useState<VoiceMvpState>('idle');
  const [transcriptInterim, setTranscriptInterim] = useState('');
  const [transcriptFinal, setTranscriptFinal] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [lastError, setLastError] = useState<VoiceError | null>(null);

  const controllerRef = useRef<ReturnType<typeof createVoiceMvpController> | null>(null);

  const identityHeaders = useMemo(() => {
    const identityId = user?.uid || 'local-dev';
    return {
      'x-bane-identity': identityId,
      'x-bane-capabilities': 'bane:invoke',
    } as const;
  }, [user?.uid]);

  useEffect(() => {
    if (!enabled) return;

    // SSR guard.
    if (typeof window === 'undefined') return;

    const stt = createWebSpeechStt({
      locale: cfg.locale,
      callbacks: {
        onInterim: (text) => (stt as any).__voiceMvpHooks?.onInterim?.(text),
        onFinal: (text) => (stt as any).__voiceMvpHooks?.onFinal?.(text),
        onError: (err) => (stt as any).__voiceMvpHooks?.onError?.(err),
      },
    });

    const controller = createVoiceMvpController({
      stt,
      submitToNeural: async ({ correlationId, text }) => {
        const res = await fetch('/api/scing/chat', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            ...identityHeaders,
          },
          body: JSON.stringify({ correlationId, text }),
        });

        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          throw new Error(payload?.message || payload?.error || `HTTP ${res.status}`);
        }

        const json = (await res.json()) as { textOut: string };
        return { textOut: json.textOut };
      },
      onChange: (snap) => {
        setState(snap.state);
        setTranscriptInterim(snap.transcriptInterim);
        setTranscriptFinal(snap.transcriptFinal);
        setLastResponse(snap.lastResponse);
        setLastError(snap.lastError);
      },
      timeoutMs: 12_000,
    });

    controllerRef.current = controller;

    const stopAll = () => controller.dispose();

    // Stop recognition on route change.
    router.events.on('routeChangeStart', stopAll);

    return () => {
      router.events.off('routeChangeStart', stopAll);
      controller.dispose();
      controllerRef.current = null;
    };
  }, [cfg.locale, enabled, identityHeaders, router.events]);

  const pttDown = useCallback(() => controllerRef.current?.pushToTalkDown(), []);
  const pttUp = useCallback(() => controllerRef.current?.pushToTalkUp(), []);

  // Spacebar PTT.
  useEffect(() => {
    if (!enabled) return;

    const isTypingTarget = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName?.toLowerCase();
      return tag === 'input' || tag === 'textarea' || (el as any).isContentEditable;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      if (e.repeat) return;
      if (isTypingTarget(e.target) || isTypingTarget(document.activeElement)) return;
      e.preventDefault();
      pttDown();
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      if (isTypingTarget(e.target) || isTypingTarget(document.activeElement)) return;
      e.preventDefault();
      pttUp();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [enabled, pttDown, pttUp]);

  return {
    enabled,
    state,
    transcriptInterim,
    transcriptFinal,
    lastResponse,
    lastError,
    pttDown,
    pttUp,
  };
}
