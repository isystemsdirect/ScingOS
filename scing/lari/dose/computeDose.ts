import type { LariFinding } from '../contracts/lariOutput.schema';
import { getDomain } from '../../domains/domainRegistry';

export type DoseFinding = {
  findingId: string;
  normalizedSeverity: 'info' | 'minor' | 'moderate' | 'major' | 'critical';
  exposure: number; // 1..5
  likelihood: number; // 1..5
  rationale: string;
};

export type DoseOutput = {
  doseFindings: DoseFinding[];
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function baseSeverity(f: LariFinding): DoseFinding['normalizedSeverity'] {
  return f.severity ?? 'info';
}

function defaultScores(sev: DoseFinding['normalizedSeverity']): { exposure: number; likelihood: number } {
  if (sev === 'critical') return { exposure: 5, likelihood: 4 };
  if (sev === 'major') return { exposure: 4, likelihood: 3 };
  if (sev === 'moderate') return { exposure: 3, likelihood: 3 };
  if (sev === 'minor') return { exposure: 2, likelihood: 2 };
  return { exposure: 1, likelihood: 1 };
}

function guidanceNotes(params: {
  domainKey?: string;
  finding: LariFinding;
}): string[] {
  if (!params.domainKey) return [];
  const domain = getDomain(params.domainKey);
  if (!domain?.severityGuidance?.length) return [];

  const title = (params.finding.title ?? '').toLowerCase();
  const desc = (params.finding.description ?? '').toLowerCase();

  const triggers = new Set<string>();

  if (domain.domainKey === 'roofing') {
    if (title.includes('missing shingles') || title.includes('cracked')) triggers.add('missing_shingles_present');
    if (title.includes('flashing')) triggers.add('flashing_compromised');
    if (title.includes('leak')) triggers.add('active_leak_signs');
  }

  if (domain.domainKey === 'electrical') {
    if (title.includes('burn') || title.includes('arcing') || desc.includes('burn') || desc.includes('arcing')) {
      triggers.add('burn_marks_present');
    }
    if (title.includes('line_voltage') || desc.includes('voltage')) triggers.add('line_voltage_out_of_range');
    if (title.includes('gfci') || desc.includes('gfci')) triggers.add('gfci_fails_trip_test');
  }

  const notes: string[] = [];
  for (const g of domain.severityGuidance) {
    if (triggers.has(g.when)) notes.push(g.note);
  }

  return notes;
}

export function computeDose(params: {
  findings: LariFinding[];
  domainKey?: string;
}): DoseOutput {
  const domain = params.domainKey ? getDomain(params.domainKey) : null;

  const doseFindings: DoseFinding[] = (params.findings ?? []).map((f) => {
    let normalizedSeverity = baseSeverity(f);
    let { exposure, likelihood } = defaultScores(normalizedSeverity);

    const title = (f.title ?? '').toLowerCase();
    const desc = (f.description ?? '').toLowerCase();

    // Roofing special-case: Active leak indicators => exposure >= 4.
    if (domain?.domainKey === 'roofing' && title.includes('active leak')) {
      exposure = Math.max(exposure, 4);
    }

    // Electrical safety escalation (deterministic override).
    if (domain?.domainKey === 'electrical') {
      if (title.includes('burn') || title.includes('arcing') || desc.includes('burn') || desc.includes('arcing')) {
        normalizedSeverity = 'critical';
        exposure = 5;
        likelihood = Math.max(likelihood, 4);
      }
    }

    const notes = guidanceNotes({ domainKey: params.domainKey, finding: f });
    const rationaleParts = [
      `Base severity: ${normalizedSeverity}.`,
      notes.length ? `Guidance: ${notes.join(' | ')}` : null,
    ].filter(Boolean);

    return {
      findingId: f.findingId,
      normalizedSeverity,
      exposure: clamp(exposure, 1, 5),
      likelihood: clamp(likelihood, 1, 5),
      rationale: rationaleParts.join(' '),
    };
  });

  return { doseFindings };
}
