const SECRET_KEYS = new Set([
  'password',
  'pass',
  'token',
  'idToken',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'privateKey',
  'authorization',
]);

export function redact(value: any): any {
  if (value == null) return value;
  if (typeof value === 'string') {
    // strip obvious bearer tokens
    return value.replace(/Bearer\s+[A-Za-z0-9\-\._~\+\/]+=*/g, 'Bearer [REDACTED]');
  }
  if (Array.isArray(value)) return value.map(redact);
  if (typeof value === 'object') {
    const out: any = {};
    for (const [k, v] of Object.entries(value)) {
      if (SECRET_KEYS.has(k)) out[k] = '[REDACTED]';
      else out[k] = redact(v);
    }
    return out;
  }
  return value;
}

export function safeStack(stack?: string): string | undefined {
  if (!stack) return stack;
  // keep stack but remove query strings that might include tokens
  return stack.replace(/\?.*$/gm, '?[REDACTED_QS]');
}
