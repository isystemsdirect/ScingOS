"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildManifest = buildManifest;
const evidenceHash_1 = require("../evidence/evidenceHash");
const reportDeterminism_1 = require("./reportDeterminism");
function buildManifest(params) {
    const hashes = params.blobs.map((b) => ({
        name: b.name,
        sha256: (0, evidenceHash_1.sha256Hex)((0, reportDeterminism_1.stableJsonDeep)(b.json)),
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
//# sourceMappingURL=reportManifest.js.map