"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPrismGraph = buildPrismGraph;
const evidenceHash_1 = require("../../evidence/evidenceHash");
const reportDeterminism_1 = require("../../report/reportDeterminism");
function nodeId(kind, id) {
    return `${kind}:${id}`;
}
function buildPrismGraph(params) {
    const artifacts = (0, reportDeterminism_1.stableSort)(params.artifacts ?? [], (a) => a.artifactId);
    const findings = (0, reportDeterminism_1.stableSort)(params.findings ?? [], (f) => f.findingId);
    const classifications = (0, reportDeterminism_1.stableSort)(params.classifications ?? [], (c) => c.classificationId);
    const nodes = [];
    const edges = [];
    for (const a of artifacts) {
        nodes.push({
            id: nodeId('artifact', a.artifactId),
            kind: 'artifact',
            label: a.type,
            meta: {
                artifactId: a.artifactId,
                source: a.source,
                engineId: a.provenance.engineId,
                capturedAt: a.provenance.capturedAt,
                contentHash: a.integrity.contentHash,
            },
        });
    }
    for (const f of findings) {
        nodes.push({
            id: nodeId('finding', f.findingId),
            kind: 'finding',
            label: f.title,
            meta: {
                findingId: f.findingId,
                severity: f.severity,
                confidence: f.confidence,
                engineId: f.engineId,
                createdAt: f.createdAt,
            },
        });
        const rel = (0, reportDeterminism_1.stableSort)(f.relatedArtifactIds ?? [], (x) => x);
        for (const artifactId of rel) {
            edges.push({
                from: nodeId('finding', f.findingId),
                to: nodeId('artifact', artifactId),
                kind: 'evidence',
            });
        }
    }
    for (const c of classifications) {
        nodes.push({
            id: nodeId('classification', c.classificationId),
            kind: 'classification',
            label: c.label,
            meta: {
                classificationId: c.classificationId,
                confidence: c.confidence,
                engineId: c.engineId,
                createdAt: c.createdAt,
            },
        });
        const rel = (0, reportDeterminism_1.stableSort)(c.relatedArtifactIds ?? [], (x) => x);
        for (const artifactId of rel) {
            edges.push({
                from: nodeId('classification', c.classificationId),
                to: nodeId('artifact', artifactId),
                kind: 'classifies',
            });
        }
    }
    const stable = {
        version: '1',
        nodes: (0, reportDeterminism_1.stableSort)(nodes, (n) => `${n.kind}|${n.id}`),
        edges: (0, reportDeterminism_1.stableSort)(edges, (e) => `${e.kind}|${e.from}|${e.to}`),
    };
    const graphHash = (0, evidenceHash_1.sha256Hex)((0, reportDeterminism_1.stableJsonDeep)(stable));
    return {
        ...stable,
        graphHash,
    };
}
//# sourceMappingURL=buildPrismGraph.js.map