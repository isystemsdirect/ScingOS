import type { ArtifactEvent, ArtifactEventType, ArtifactRecord } from './evidenceTypes';
import { computeDeleteAfter } from './evidencePolicy';
import { nextWormRef } from './evidenceWorm';

export function makeArtifact(params: {
  artifactId: string;
  orgId: string;
  inspectionId: string;
  type: ArtifactRecord['type'];
  source: ArtifactRecord['source'];
  tags?: string[];
  title?: string;
  description?: string;
  createdAt: string;
  provenance: ArtifactRecord['provenance'];
  contentHash: string;
  sizeBytes?: number;
  mimeType?: string;
  retentionClass?: ArtifactRecord['retention']['class'];
}): ArtifactRecord {
  const createdAt = params.createdAt;
  const retentionClass = params.retentionClass ?? 'standard';
  return {
    artifactId: params.artifactId,
    orgId: params.orgId,
    inspectionId: params.inspectionId,
    type: params.type,
    source: params.source,
    title: params.title,
    description: params.description,
    tags: params.tags ?? [],
    provenance: params.provenance,
    integrity: {
      contentHash: params.contentHash,
      hashAlg: 'sha256',
      sizeBytes: params.sizeBytes,
      mimeType: params.mimeType,
      integrityState: 'pending',
    },
    storage: { uploadState: 'local' },
    retention: {
      class: retentionClass,
      deleteAfter: computeDeleteAfter(retentionClass, createdAt),
    },
    createdAt,
    updatedAt: createdAt,
    finalized: false,
  };
}

export function makeArtifactEvent(params: {
  eventId: string;
  orgId: string;
  inspectionId: string;
  artifactId?: string;
  type: ArtifactEventType;
  ts: string;
  actor: ArtifactEvent['actor'];
  device?: ArtifactEvent['device'];
  engineId?: string;
  details?: any;
  prevWorm?: { thisHash: string; index: number } | null;
  wormScope: 'inspection' | 'artifact' | 'org';
  wormScopeId: string;
}): ArtifactEvent {
  const eventPayload = {
    eventId: params.eventId,
    orgId: params.orgId,
    inspectionId: params.inspectionId,
    artifactId: params.artifactId,
    type: params.type,
    ts: params.ts,
    actor: params.actor,
    device: params.device,
    engineId: params.engineId,
    details: params.details ?? null,
  };
  const worm = nextWormRef(
    params.prevWorm ?? null,
    params.wormScope,
    params.wormScopeId,
    eventPayload
  );
  return { ...(eventPayload as any), worm } as ArtifactEvent;
}
