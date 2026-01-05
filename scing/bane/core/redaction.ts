export type RedactionSpan = { start: number; end: number; label: string };

export function mergeSpans(spans: RedactionSpan[]): RedactionSpan[] {
  const s = [...spans].sort((a, b) => a.start - b.start || a.end - b.end);
  const out: RedactionSpan[] = [];
  for (const cur of s) {
    const prev = out[out.length - 1];
    if (!prev || cur.start > prev.end) {
      out.push({ ...cur });
    } else {
      prev.end = Math.max(prev.end, cur.end);
      prev.label = prev.label || cur.label;
    }
  }
  return out;
}

export function applyRedactions(text: string, spans: RedactionSpan[]): string {
  if (!spans.length) return text;
  const merged = mergeSpans(spans);
  let out = '';
  let last = 0;
  for (const sp of merged) {
    out += text.slice(last, sp.start);
    out += `[REDACTED:${sp.label}]`;
    last = sp.end;
  }
  out += text.slice(last);
  return out;
}
