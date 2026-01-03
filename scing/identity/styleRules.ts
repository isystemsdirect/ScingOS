import type { GatingDecision } from './types';

export type StyleFilterOptions = {
  allowSorry?: boolean;
};

const normalizeWhitespace = (s: string): string =>
  s
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

const removeAll = (text: string, patterns: RegExp[]): string => {
  let out = text;
  for (const p of patterns) out = out.replace(p, '');
  return out;
};

const replaceAll = (text: string, replacements: Array<[RegExp, string]>): string => {
  let out = text;
  for (const [p, r] of replacements) out = out.replace(p, r);
  return out;
};

const capHedges = (text: string): string => {
  // Collapse repeated hedge phrases to a single occurrence.
  return text
    .replace(/\b(maybe)(\s+maybe)+\b/gi, 'maybe')
    .replace(/\b(possibly)(\s+possibly)+\b/gi, 'possibly')
    .replace(/\b(i think)(\s+i think)+\b/gi, 'I think');
};

const enforceSingleQuestion = (text: string): string => {
  const first = text.indexOf('?');
  if (first === -1) return text;
  const before = text.slice(0, first + 1);
  const after = text.slice(first + 1).replace(/\?/g, '');
  return before + after;
};

export function applyStyleRules(draft: string, decision: GatingDecision, opts: StyleFilterOptions = {}): string {
  let out = draft ?? '';

  // 5) Forbidden patterns
  const forbiddenRemove: RegExp[] = [
    /\b(?:sit tight|wait|give me time|give me a moment|give me a minute)\b/gi,
    /\b(?:i\s*['’]?m\s+excited|i\s*['’]?m\s+thrilled)\b/gi,
  ];

  out = removeAll(out, forbiddenRemove);

  const replacements: Array<[RegExp, string]> = [
    [/\bI can\s*not\b/gi, "I'm not able to"],
    [/\bI can't\b/gi, "I'm not able to"],
  ];

  out = replaceAll(out, replacements);

  if (!opts.allowSorry) {
    // Remove "sorry" in most cases (identity forbids begging/panic). Keep it simple and deterministic.
    out = out.replace(/(^|\n)\s*sorry[\s,.:;-]*/gi, '$1');
    out = out.replace(/\bsorry\b/gi, '');
  }

  out = capHedges(out);

  // 4/7) ASK & PAUSE: at most one question.
  if (decision.disposition === 'ask' || decision.disposition === 'pause') {
    out = enforceSingleQuestion(out);
  }

  // 5) Verbosity clamps
  if (decision.constraints.forbidOverExplain || decision.outputLimits.maxLength === 'short') {
    // Target 3–8 lines: keep the first 8 non-empty lines.
    const lines = out
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    out = lines.slice(0, 8).join('\n');
  }

  // No empty output unless silence is allowed.
  out = normalizeWhitespace(out);
  if (!out && decision.constraints.silenceAllowed) return '';
  if (!out) return 'Noted.';

  return out;
}
