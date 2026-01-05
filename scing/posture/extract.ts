import {
  HIGH_CAPS_RATIO,
  RAPID_MESSAGES_2MIN,
  REPEAT_PHRASE_HIGH,
  VERY_LONG_CHARS,
  VERY_SHORT_CHARS,
} from './config';
import type { PostureFeatures, PostureInput } from './types';

const clamp01 = (v: number): number => {
  if (!Number.isFinite(v)) return 0;
  if (v <= 0) return 0;
  if (v >= 1) return 1;
  return v;
};

const toSafeString = (v: unknown): string => (typeof v === 'string' ? v : '');

const hasAny = (text: string, needles: string[]): boolean => {
  const t = text.toLowerCase();
  return needles.some((n) => t.includes(n));
};

const calcCapsRatio = (text: string): number => {
  let letters = 0;
  let caps = 0;
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    const isLetter = (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
    if (!isLetter) continue;
    letters += 1;
    if (code >= 65 && code <= 90) caps += 1;
  }
  if (letters <= 0) return 0;
  return caps / letters;
};

export function extractSignals(input: PostureInput): PostureFeatures {
  const text = toSafeString(input.text);
  const msgLen = Number.isFinite(input.interaction.messageLengthChars)
    ? input.interaction.messageLengthChars
    : text.length;

  const messagesLast2Min = input.interaction.messagesLast2Min ?? 0;
  const repeatedPhrases = input.interaction.repeatedPhrases ?? 0;

  const capsRatio =
    typeof input.interaction.capsRatio === 'number'
      ? input.interaction.capsRatio
      : calcCapsRatio(text);

  const isVeryShort = msgLen <= VERY_SHORT_CHARS;
  const isVeryLong = msgLen >= VERY_LONG_CHARS;
  const rapidFire = messagesLast2Min >= RAPID_MESSAGES_2MIN;
  const highCaps = capsRatio >= HIGH_CAPS_RATIO;
  const repetition = repeatedPhrases >= REPEAT_PHRASE_HIGH;

  const directiveVerbs = [
    ' do ',
    ' build ',
    ' implement ',
    ' ship ',
    ' execute ',
    ' generate ',
    ' fix ',
    ' now ',
  ];
  const directiveLoose = ['do', 'build', 'implement', 'ship', 'execute', 'generate', 'fix', 'now'];
  const exploratoryMarkers = ['what if', 'could', 'ideas', 'options', 'compare', 'why', 'explain'];
  const overloadMarkers = [
    'too much',
    'overwhelmed',
    'confused',
    'lost',
    "can't track",
    'cant track',
  ];
  const frustrationMarkers = ["why isn't", 'still', 'wasting', 'ridiculous', 'broken', 'come on'];
  const confidenceMarkers = [
    'exactly',
    'perfect',
    "that's it",
    'that’s it',
    'proceed',
    'locked',
    'go',
  ];

  const t = ` ${text.toLowerCase()} `;

  const directiveHit = hasAny(t, directiveVerbs) || hasAny(text.toLowerCase(), directiveLoose);
  const exploratoryHit = hasAny(text, exploratoryMarkers);
  const overloadHit = hasAny(text, overloadMarkers);
  const frustrationHit = hasAny(text, frustrationMarkers);
  const confidenceHit = hasAny(text, confidenceMarkers);

  const voiceTension = input.sensors?.voiceTension ?? 0;
  const bioStress = input.sensors?.bioStress ?? 0;
  const tension = clamp01(Math.max(voiceTension, bioStress));
  const speed = clamp01(input.sensors?.voiceRate ?? 0);

  const timePressure = input.context.timePressure ?? 'medium';
  const hasSecurityFlags = !!input.context.hasSecurityFlags;

  return {
    text,
    messageLengthChars: msgLen,
    isVeryShort,
    isVeryLong,
    rapidFire,
    highCaps,
    repetition,
    directiveHit,
    exploratoryHit,
    overloadHit,
    frustrationHit,
    confidenceHit,
    tension,
    speed,
    timePressure,
    hasSecurityFlags,
  };
}
