import type { BaneOutput } from '../types';

const FORBIDDEN_FRAGMENTS = [
  'system prompt',
  'developer message',
  'detector',
  'regex',
  'pattern',
  'rule',
  'threshold',
  'internal',
  'policy id',
];

export function sanitizePublicMessage(msg: string): string {
  const lower = msg.toLowerCase();
  for (const f of FORBIDDEN_FRAGMENTS) {
    if (lower.includes(f)) {
      return 'Request denied by security policy. This attempt has been logged.';
    }
  }
  return msg;
}

export function finalizePublicFacing(out: BaneOutput): BaneOutput {
  if (out.publicMessage) out.publicMessage = sanitizePublicMessage(out.publicMessage);
  return out;
}
