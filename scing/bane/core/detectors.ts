import type { BaneFinding, BaneInput, BaneSeverity, BaneVerdict } from '../types';
import type { PolicyHints } from '../policy/banePolicy';

export type DetectorResult = BaneFinding[];

export type Detector = {
  id: string;
  order: number;
  detect: (input: BaneInput, hints: PolicyHints) => DetectorResult;
};

export function finding(params: {
  id: string;
  title: string;
  severity: BaneSeverity;
  verdict: BaneVerdict;
  rationale: string;
  tags?: string[];
  evidence?: string;
}): BaneFinding {
  return {
    id: params.id,
    title: params.title,
    severity: params.severity,
    verdict: params.verdict,
    rationale: params.rationale,
    tags: params.tags,
    evidence: params.evidence,
  };
}

export function runDetectors(detectors: Detector[], input: BaneInput, hints: PolicyHints): BaneFinding[] {
  const sorted = [...detectors].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  const out: BaneFinding[] = [];
  for (const d of sorted) {
    const res = d.detect(input, hints);
    if (res && res.length) out.push(...res);
  }
  return out;
}
