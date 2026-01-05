"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeIndex = computeIndex;
function computeIndex(params) {
    const severities = Array.from(new Set(params.findings.map((f) => f.severity)));
    const tags = Array.from(new Set(params.artifacts.flatMap((a) => a.tags)));
    return {
        inspectionId: params.inspectionId,
        orgId: params.orgId,
        createdAt: params.createdAt,
        updatedAt: params.updatedAt,
        status: params.status,
        artifactCount: params.artifacts.length,
        findingsCount: params.findings.length,
        classificationsCount: params.classifications.length,
        topSeverities: severities,
        tags,
        reportReady: params.status === 'final' && params.artifacts.every((a) => a.finalized),
    };
}
//# sourceMappingURL=evidenceIndex.js.map