import { makeArtifact } from '../../scing/evidence/evidenceStore';

test('artifact created with sha256 hash and pending integrity', () => {
  const ts = new Date().toISOString();
  const a = makeArtifact({
    artifactId: 'a1',
    orgId: 'o1',
    inspectionId: 'i1',
    type: 'photo',
    source: 'builtin_camera',
    createdAt: ts,
    provenance: {
      capturedAt: ts,
      capturedBy: { uid: 'u1', orgId: 'o1' },
      capturedOn: { deviceId: 'd1' },
      engineId: 'LARI-VISION',
      inspectionId: 'i1',
    },
    contentHash: 'deadbeef',
  });

  expect(a.integrity.hashAlg).toBe('sha256');
  expect(a.integrity.integrityState).toBe('pending');
  expect(a.finalized).toBe(false);
});
