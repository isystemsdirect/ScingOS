const BANNED_CLINICAL_LABELS = [
  'depressed',
  'depression',
  'anxious',
  'anxiety',
  'bipolar',
  'ptsd',
  'schizophrenia',
  'adhd',
  'ocd',
  'autistic',
  'autism',
];

export function containsBannedClinicalLabel(text: string): boolean {
  const s = text.toLowerCase();
  return BANNED_CLINICAL_LABELS.some((w) => s.includes(w));
}

export function assertNonClinicalOutput(text: string): void {
  if (containsBannedClinicalLabel(text)) {
    throw new Error('HPP_RULE_VIOLATION: clinical labeling is prohibited');
  }
}

export type AllowedModulation =
  | 'verbosity'
  | 'pacing'
  | 'checkpoints'
  | 'task_chunking'
  | 'escalation_thresholds'
  | 'confirmation_frequency';

export const ALLOWED_MODULATIONS: ReadonlyArray<AllowedModulation> = [
  'verbosity',
  'pacing',
  'checkpoints',
  'task_chunking',
  'escalation_thresholds',
  'confirmation_frequency',
];

export function assertAllowedModulation(m: string): void {
  if (!ALLOWED_MODULATIONS.includes(m as AllowedModulation)) {
    throw new Error(`HPP_RULE_VIOLATION: modulation not allowed: ${m}`);
  }
}
