declare const require: any;
declare const Buffer: any;

function nodeCrypto(): any {
  try {
    return require('crypto');
  } catch {
    return null;
  }
}

export function signReport(payload: any, privateKeyPem: string) {
  const crypto = nodeCrypto();
  if (!crypto) throw new Error('CRYPTO_UNAVAILABLE');

  const data = Buffer.from(JSON.stringify(payload));
  try {
    // Works for Ed25519/Ed448 keys.
    const sig = crypto.sign(null, data, privateKeyPem);
    return sig.toString('base64');
  } catch {
    // Fallback for RSA/ECDSA keys.
    const sig = crypto.sign('sha256', data, privateKeyPem);
    return sig.toString('base64');
  }
}
