import type { BaneInput } from '../types';

export type IntegrityResult = { ok: true } | { ok: false; code: 'REPLAY' | 'BAD_SIGNATURE' };

const seenNonces = new Map<string, number>();

export function checkIntegrity(input: BaneInput): IntegrityResult {
  const auth = input.req?.auth;
  const nonce = auth?.nonce;
  const now = Date.now();

  if (nonce) {
    const prev = seenNonces.get(nonce);
    if (prev && now - prev < 10 * 60 * 1000) return { ok: false, code: 'REPLAY' };
    seenNonces.set(nonce, now);

    if (seenNonces.size > 10_000) {
      const firstKey = seenNonces.keys().next().value as string | undefined;
      if (firstKey) seenNonces.delete(firstKey);
    }
  }

  // Signature verification is environment-specific; hook only.
  // If your gateway provides signature validation upstream, leave this as ok.
  return { ok: true };
}
