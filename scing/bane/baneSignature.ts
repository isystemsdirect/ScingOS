export type SignInput = { kid: string; secret: string; payload: string };

declare const require: any;

function toBase64Url(b64: string): string {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export function hmacSha256Base64Url(secret: string, payload: string): string {
  // Node fast-path (Cloud Functions / server).
  try {
    const crypto = require('crypto');
    const b64 = crypto.createHmac('sha256', secret).update(payload).digest('base64');
    return toBase64Url(b64);
  } catch {
    throw new Error('HMAC_SHA256_UNAVAILABLE');
  }
}

export function signSnapshotHmac(input: SignInput): { alg: 'HS256'; kid: string; sig: string } {
  const sig = hmacSha256Base64Url(input.secret, input.payload);
  return { alg: 'HS256', kid: input.kid, sig };
}

export function verifySnapshotHmac(secret: string, payload: string, sig: string): boolean {
  try {
    const expected = hmacSha256Base64Url(secret, payload);
    return constantTimeEqual(expected, sig);
  } catch {
    return false;
  }
}
