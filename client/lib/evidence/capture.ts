import { makeArtifact } from '@scing/evidence/evidenceStore';
import type { ArtifactRecord } from '@scing/evidence';

function toHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let out = '';
  for (const b of bytes) out += b.toString(16).padStart(2, '0');
  return out;
}

export async function hashFile(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  if (!globalThis.crypto?.subtle) throw new Error('WEBCRYPTO_UNAVAILABLE');
  const digest = await globalThis.crypto.subtle.digest('SHA-256', buf);
  return toHex(digest);
}

export function createArtifactRecord(params: {
  artifactId: string;
  orgId: string;
  inspectionId: string;
  engineId: string;
  type: ArtifactRecord['type'];
  source: ArtifactRecord['source'];
  uid: string;
  deviceId: string;
  contentHash: string;
  sizeBytes?: number;
  mimeType?: string;
  location?: { lat: number; lng: number; accM?: number };
  tags?: string[];
  title?: string;
  description?: string;
}): ArtifactRecord {
  const ts = new Date().toISOString();
  return makeArtifact({
    artifactId: params.artifactId,
    orgId: params.orgId,
    inspectionId: params.inspectionId,
    type: params.type,
    source: params.source,
    tags: params.tags ?? [],
    title: params.title,
    description: params.description,
    createdAt: ts,
    provenance: {
      capturedAt: ts,
      capturedBy: { uid: params.uid, orgId: params.orgId },
      capturedOn: { deviceId: params.deviceId },
      location: params.location,
      engineId: params.engineId,
      inspectionId: params.inspectionId,
    },
    contentHash: params.contentHash,
    sizeBytes: params.sizeBytes,
    mimeType: params.mimeType,
  });
}
