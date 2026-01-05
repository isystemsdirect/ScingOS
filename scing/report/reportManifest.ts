import { sha256Hex } from '../evidence/evidenceHash';
import { stableJsonDeep } from './reportDeterminism';

export type ExportManifest = {
  manifestVersion: '1';
  orgId: string;
  inspectionId: string;
  reportId: string;
  createdAt: string;

  // hashes of included json blobs
  hashes: Array<{ name: string; sha256: string }>;

  // evidence summary
  artifacts: Array<{
    artifactId: string;
    contentHash: string;
    integrityState: string;
    finalized: boolean;
  }>;

  // custody anchors
  wormHeads: Array<{
    scope: string;
    scopeId: string;
    thisHash: string;
    index: number;
    prevHash?: string;
  }>;
};

export function buildManifest(params: {
  orgId: string;
  inspectionId: string;
  reportId: string;
  createdAt: string;
  blobs: Array<{ name: string; json: unknown }>;
  artifacts: Array<{
    artifactId: string;
    contentHash: string;
    integrityState: string;
    finalized: boolean;
  }>;
  wormHeads: Array<{
    scope: string;
    scopeId: string;
    thisHash: string;
    index: number;
    prevHash?: string;
  }>;
}): ExportManifest {
  const hashes = params.blobs.map((b) => ({
    name: b.name,
    sha256: sha256Hex(stableJsonDeep(b.json)),
  }));
  return {
    manifestVersion: '1',
    orgId: params.orgId,
    inspectionId: params.inspectionId,
    reportId: params.reportId,
    createdAt: params.createdAt,
    hashes,
    artifacts: params.artifacts,
    wormHeads: params.wormHeads,
  };
}
