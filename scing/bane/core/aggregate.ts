import type { BaneFinding, BaneSeverity, BaneVerdict } from '../types';

const severityRank: Record<BaneSeverity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const verdictRank: Record<BaneVerdict, number> = {
  allow: 1,
  sanitize: 2,
  review: 3,
  deny: 4,
};

export function aggregate(findings: BaneFinding[]): { verdict: BaneVerdict; severity: BaneSeverity } {
  if (!findings.length) return { verdict: 'allow', severity: 'low' };

  let maxSeverity: BaneSeverity = 'low';
  let maxVerdict: BaneVerdict = 'allow';

  for (const f of findings) {
    if (severityRank[f.severity] > severityRank[maxSeverity]) maxSeverity = f.severity;
    if (verdictRank[f.verdict] > verdictRank[maxVerdict]) maxVerdict = f.verdict;
  }

  return { verdict: maxVerdict, severity: maxSeverity };
}
