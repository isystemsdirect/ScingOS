import type { VoiceMode } from './types';

export type VoiceConfig = {
  mode: VoiceMode;
  locale: string;
  vadEnabled: boolean;
  sttProvider: string;
  ttsProvider: string;
};

function envBool(value: unknown, fallback: boolean): boolean {
  if (typeof value !== 'string') return fallback;
  const v = value.trim().toLowerCase();
  if (v === 'true' || v === '1' || v === 'yes') return true;
  if (v === 'false' || v === '0' || v === 'no') return false;
  return fallback;
}

export function getVoiceConfig(): VoiceConfig {
  const modeRaw = process.env.NEXT_PUBLIC_VOICE_MODE;
  const mode = (modeRaw === 'hands_free' || modeRaw === 'push_to_talk' ? modeRaw : 'push_to_talk') as VoiceMode;

  return {
    mode,
    locale: process.env.NEXT_PUBLIC_VOICE_LOCALE || 'en-US',
    vadEnabled: envBool(process.env.NEXT_PUBLIC_VOICE_VAD, true),
    sttProvider: process.env.VOICE_STT_PROVIDER || 'local-webspeech',
    ttsProvider: process.env.VOICE_TTS_PROVIDER || 'none',
  };
}
