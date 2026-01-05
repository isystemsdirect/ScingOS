"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeDeleteAfter = computeDeleteAfter;
exports.immutableArtifactFields = immutableArtifactFields;
function computeDeleteAfter(retention, createdAtIso) {
    const created = new Date(createdAtIso).getTime();
    if (retention === 'legal_hold')
        return undefined;
    const days = retention === 'extended' ? 365 * 3 : 365;
    return new Date(created + days * 24 * 60 * 60 * 1000).toISOString();
}
function immutableArtifactFields() {
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
//# sourceMappingURL=evidencePolicy.js.map