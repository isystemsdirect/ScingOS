declare const require: any;

function nodeCrypto(): any {
  try {
    return require('crypto');
  } catch {
    return null;
  }
}

export function sha256Hex(buf: unknown): string {
  const crypto = nodeCrypto();
  if (!crypto) throw new Error('SHA256_UNAVAILABLE');
  return crypto.createHash('sha256').update(buf as any).digest('hex');
}

export function stableJsonStringify(obj: any): string {
  return JSON.stringify(obj, Object.keys(obj).sort());
}
