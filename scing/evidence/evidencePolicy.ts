export type RetentionClass = 'standard' | 'extended' | 'legal_hold';

export function computeDeleteAfter(
  retention: RetentionClass,
  createdAtIso: string
): string | undefined {
  const created = new Date(createdAtIso).getTime();
  if (retention === 'legal_hold') return undefined;
  const days = retention === 'extended' ? 365 * 3 : 365;
  return new Date(created + days * 24 * 60 * 60 * 1000).toISOString();
}

export function immutableArtifactFields() {
  return [
    'integrity.contentHash',
    'integrity.hashAlg',
    'provenance.capturedAt',
    'provenance.capturedBy.uid',
    'provenance.capturedOn.deviceId',
    'provenance.engineId',
    'type',
    'source',
    'orgId',
    'inspectionId',
    'artifactId',
  ];
}
