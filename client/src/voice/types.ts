export type VoiceMode = 'push_to_talk' | 'hands_free';

export type VoiceState =
  | 'idle'
  | 'listening'
  | 'capturing'
  | 'transcribing'
  | 'thinking'
  | 'speaking'
  | 'error'
  | 'degraded';

export type AudioFrame = {
  ts: number;
  pcm16: Uint8Array;
  sampleRate: 16000;
  channels: 1;
};

export type TranscriptSegment = {
  id: string;
  tsStart: number;
  tsEnd: number;
  text: string;
  isFinal: boolean;
  confidence?: number;
};

export type VoiceIntentPacket = {
  correlationId: string;
  sessionId: string;
  mode: VoiceMode;
  segments: TranscriptSegment[];
  rawText: string;
  locale: string;
  inputConfidence: number;
  meta: {
    vadUsed: boolean;
    device?: string;
  };
};

export type TTSRequest = {
  correlationId: string;
  voiceId: string;
  text: string;
  format: 'mp3' | 'wav';
  sampleRate?: number;
  speakingRate?: number;
};

export type TTSResponse = {
  correlationId: string;
  audio: Uint8Array;
  format: 'mp3' | 'wav';
};

export type VoiceError = {
  code: 'MIC_DENIED' | 'NO_AUDIO' | 'STT_FAILED' | 'TTS_FAILED' | 'NETWORK' | 'UNKNOWN';
  message: string;
  recoverable: boolean;
};

// Invariant: SRT mirrors VoiceState; no fake states.
export const VOICE_SRT_INVARIANT = 'SRT mirrors VoiceState; no fake states.' as const;
