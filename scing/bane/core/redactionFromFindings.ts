import type { BaneFinding } from '../types';
import type { RedactionSpan } from './redaction';

export function redactionsFromFindings(text: string, findings: BaneFinding[]): RedactionSpan[] {
  const spans: RedactionSpan[] = [];

  for (const f of findings) {
    if (f.verdict !== 'sanitize') continue;

    const emailRe = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
    for (const m of text.matchAll(emailRe)) {
      const idx = m.index ?? -1;
      if (idx >= 0) spans.push({ start: idx, end: idx + m[0].length, label: 'PII' });
    }

    const phoneRe = /\b(\+?1[\s-]?)?(\(?\d{3}\)?[\s-]?)\d{3}[\s-]?\d{4}\b/g;
    for (const m of text.matchAll(phoneRe)) {
      const idx = m.index ?? -1;
      if (idx >= 0) spans.push({ start: idx, end: idx + m[0].length, label: 'PII' });
    }
  }

  return spans;
}
