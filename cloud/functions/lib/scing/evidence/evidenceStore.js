"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeArtifact = makeArtifact;
exports.makeArtifactEvent = makeArtifactEvent;
const evidencePolicy_1 = require("./evidencePolicy");
const evidenceWorm_1 = require("./evidenceWorm");
function makeArtifact(params) {
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
            deleteAfter: (0, evidencePolicy_1.computeDeleteAfter)(retentionClass, createdAt),
        },
        createdAt,
        updatedAt: createdAt,
        finalized: false,
    };
}
function makeArtifactEvent(params) {
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
    const worm = (0, evidenceWorm_1.nextWormRef)(params.prevWorm ?? null, params.wormScope, params.wormScopeId, eventPayload);
    return { ...eventPayload, worm };
}
//# sourceMappingURL=evidenceStore.js.map