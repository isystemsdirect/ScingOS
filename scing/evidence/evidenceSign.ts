declare const require: any;
declare const Buffer: any;

export type DeviceKeypair = { kid: string; publicKeyPem: string; privateKeyPem: string };

function nodeCrypto(): any {
  try {
    return require('crypto');
  } catch {
    return null;
  }
}

function toBase64Url(b64: string): string {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function signEd25519Base64Url(privateKeyPem: string, payload: string): string {
  const crypto = nodeCrypto();
  if (!crypto) throw new Error('ED25519_UNAVAILABLE');
  const sig = crypto.sign(null, Buffer.from(payload), privateKeyPem).toString('base64');
  return toBase64Url(sig);
}

export function verifyEd25519Base64Url(
  publicKeyPem: string,
  payload: string,
  sigB64Url: string
): boolean {
  const crypto = nodeCrypto();
  if (!crypto) return false;

  const b64 = sigB64Url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64 + '==='.slice((b64.length + 3) % 4);
  const sig = Buffer.from(pad, 'base64');

  return crypto.verify(null, Buffer.from(payload), publicKeyPem, sig);
}
