import type { BaneFinding, BaneSeverity, BaneVerdict } from '../types';

const sRank: Record<BaneSeverity, number> = { low: 1, medium: 2, high: 3, critical: 4 };
const vRank: Record<BaneVerdict, number> = { allow: 1, sanitize: 2, review: 3, deny: 4 };

export function sortFindings(findings: BaneFinding[]): BaneFinding[] {
  return [...findings].sort((a, b) => {
    const sd = sRank[b.severity] - sRank[a.severity];
    if (sd !== 0) return sd;
    const vd = vRank[b.verdict] - vRank[a.verdict];
    if (vd !== 0) return vd;
    return a.id.localeCompare(b.id);
  });
}
