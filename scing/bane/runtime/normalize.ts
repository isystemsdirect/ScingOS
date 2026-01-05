import type { BaneInput } from '../types';

export type NormalizedBaneInput = {
  original: BaneInput;
  forDetection: BaneInput;
};

export function normalizeForDetection(input: BaneInput): NormalizedBaneInput {
  const text = input.text ?? '';
  const normalized = text.replace(/\s+/g, ' ').trim().toLowerCase();

  return {
    original: input,
    forDetection: {
      ...input,
      // detectors use normalized text; redactions apply to original
      text: normalized,
    },
  };
}
