import Link from 'next/link';
import { useAuthStore } from '../../lib/store/authStore';
import { useEffect, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useVoiceMvp } from '../../src/voice/client/useVoiceMvp';
import {
  createWebSpeechSynthesisBargeIn,
  setVoiceRuntime,
  type VoiceRuntimeState,
} from '@rtsf/voice/runtime/voiceRuntime';
import {
  setConversationAssistantText,
  setConversationError,
  setConversationUserText,
} from '@rtsf/ui/scingConversationStore';

export function Navbar() {
  const { user } = useAuthStore();
  const voice = useVoiceMvp();
  const enabled = voice.enabled;
  const pttDown = voice.pttDown;
  const pttUp = voice.pttUp;

  const runtimeStateRef = useRef<VoiceRuntimeState>({ status: 'idle' });
  const listenersRef = useRef(new Set<(s: VoiceRuntimeState) => void>());
  const bargeInRef = useRef(createWebSpeechSynthesisBargeIn());
  const lastVoiceRef = useRef({
    transcriptFinal: '',
    lastResponse: '',
    lastErrorCode: '' as string | null,
    correlationId: '' as string | null,
  });

  useEffect(() => {
    const runtime = {
      getState: () => runtimeStateRef.current,
      subscribe: (listener: (s: VoiceRuntimeState) => void) => {
        listenersRef.current.add(listener);
        listener(runtimeStateRef.current);
        return () => listenersRef.current.delete(listener);
      },
      startPushToTalk: () => {
        if (!enabled) return;
        try {
          if (bargeInRef.current.isSpeaking()) bargeInRef.current.cancelSpeaking();
        } catch {
          // best-effort
        }
        pttDown();
      },
      stopPushToTalk: () => {
        if (!enabled) return;
        pttUp();
      },
      isListening: () => runtimeStateRef.current.status === 'listening',
      isSpeaking: () => {
        try {
          return bargeInRef.current.isSpeaking();
        } catch {
          return false;
        }
      },
      cancelSpeaking: () => {
        try {
          bargeInRef.current.cancelSpeaking();
        } catch {
          // best-effort
        }
      },
      reset: () => {
        try {
          bargeInRef.current.cancelSpeaking();
        } catch {
          // best-effort
        }
        pttUp();
      },
    };

    setVoiceRuntime(runtime);
    return () => {
      // On unmount, revert to a truthful noop runtime.
      setVoiceRuntime({
        getState: () => ({ status: 'idle' }),
        subscribe: () => () => undefined,
        startPushToTalk: () => undefined,
        stopPushToTalk: () => undefined,
        isListening: () => false,
        isSpeaking: () => false,
        cancelSpeaking: () => undefined,
        reset: () => undefined,
      });
    };
  }, [enabled, pttDown, pttUp]);

  useEffect(() => {
    const prev = runtimeStateRef.current;
    const preserveStartedAt = (status: 'listening' | 'thinking' | 'speaking') => {
      if (prev.status === status && 'startedAt' in prev) return prev.startedAt;
      return Date.now();
    };

    let next: VoiceRuntimeState;
    if (!voice.enabled) next = { status: 'idle' };
    else if (voice.state === 'listening') next = { status: 'listening', startedAt: preserveStartedAt('listening') };
    else if (voice.state === 'thinking' || voice.state === 'transcribing') next = { status: 'thinking', startedAt: preserveStartedAt('thinking') };
    else if (voice.state === 'error') {
      next = { status: 'error', message: voice.lastError?.message || 'Voice error', at: Date.now() };
    } else next = { status: 'idle' };

    const changed =
      prev.status !== next.status ||
      (prev.status === 'error' && next.status === 'error' && prev.message !== next.message);

    if (changed) {
      runtimeStateRef.current = next;
      for (const l of listenersRef.current) l(next);
    }
  }, [voice.enabled, voice.state, voice.lastError?.message]);

  useEffect(() => {
    // Publish voice outputs to the shared conversation store.
    const prev = lastVoiceRef.current;
    if (voice.correlationId !== prev.correlationId) prev.correlationId = voice.correlationId;

    if (voice.transcriptFinal && voice.transcriptFinal !== prev.transcriptFinal) {
      prev.transcriptFinal = voice.transcriptFinal;
      setConversationUserText(voice.transcriptFinal, voice.correlationId ?? undefined);
    }

    if (voice.lastResponse && voice.lastResponse !== prev.lastResponse) {
      prev.lastResponse = voice.lastResponse;
      setConversationAssistantText(voice.lastResponse, voice.correlationId ?? undefined);
    }

    const errorCode = voice.lastError?.code ?? null;
    if (errorCode && errorCode !== prev.lastErrorCode) {
      prev.lastErrorCode = errorCode;
      setConversationError({ message: voice.lastError?.message || errorCode, correlationId: voice.correlationId ?? undefined });
    }
  }, [voice.correlationId, voice.lastError?.code, voice.lastError?.message, voice.lastResponse, voice.transcriptFinal]);

  const handleSignOut = async () => {
    try {
      if (!auth) return;
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              ScingOS
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {voice.enabled ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end text-xs leading-tight">
                  <div className="text-gray-500">
                    <span className="font-semibold">VOICE:</span> {voice.state.toUpperCase()}
                  </div>
                  {voice.lastError ? (
                    <div className="text-red-600 truncate max-w-xs">{voice.lastError.code}</div>
                  ) : voice.transcriptFinal ? (
                    <div className="text-gray-600 truncate max-w-xs">"{voice.transcriptFinal}"</div>
                  ) : voice.transcriptInterim ? (
                    <div className="text-gray-600 truncate max-w-xs">{voice.transcriptInterim}</div>
                  ) : voice.lastResponse ? (
                    <div className="text-gray-600 truncate max-w-xs">{voice.lastResponse}</div>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">
                    VOICE: {voice.state.toUpperCase()}
                  </span>
                  <button
                    onMouseDown={voice.pttDown}
                    onMouseUp={voice.pttUp}
                    onMouseLeave={voice.pttUp}
                    className="px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition"
                    title="Hold to talk (Space also works)"
                    type="button"
                  >
                    Hold to Talk
                  </button>
                </div>
              </div>
            ) : null}

            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-primary-600 transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}