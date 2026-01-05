"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvidenceLinkError = void 0;
exports.composeDeterministicReport = composeDeterministicReport;
const evidenceHash_1 = require("../evidence/evidenceHash");
const defaultTemplate_1 = require("./templates/defaultTemplate");
const buildPrismGraph_1 = require("../lari/prism/buildPrismGraph");
const prismGraphSection_1 = require("./templates/prismGraphSection");
const domainRegistry_1 = require("../domains/domainRegistry");
const domainAppendix_1 = require("./templates/domainAppendix");
const reportDeterminism_1 = require("./reportDeterminism");
const lariSeal_1 = require("./seals/lariSeal");
const regulatoryDisclosure_1 = require("../compliance/regulatoryDisclosure");
const investorPack_1 = require("../export/investorPack");
class EvidenceLinkError extends Error {
    constructor(missing) {
        super(`EVIDENCE_LINK_MISSING_${missing.length}`);
        this.name = 'EvidenceLinkError';
        this.missing = missing;
    }
}
exports.EvidenceLinkError = EvidenceLinkError;
function assertEvidenceLinks(params) {
    const known = new Set(params.artifacts.map((a) => a.artifactId));
    const missing = [];
    const check = (owner, ids) => {
        for (const id of ids) {
            if (!known.has(id))
                missing.push(`${owner}:${id}`);
        }
    };
    for (const f of params.findings)
        check(`finding:${f.findingId}`, f.relatedArtifactIds ?? []);
    for (const c of params.classifications)
        check(`classification:${c.classificationId}`, c.relatedArtifactIds ?? []);
    for (const m of params.mapLayers)
        check(`map:${m.layerId}`, m.relatedArtifactIds ?? []);
    if (missing.length) {
        missing.sort();
        throw new EvidenceLinkError(missing);
    }
}
function deterministicReportId(params) {
    // Canon: report output must be deterministic for the same state.
    const domain = params.inspection.domainKey ? (0, domainRegistry_1.getDomain)(params.inspection.domainKey) : null;
    const payload = {
        composer: {
            // Bump this any time report content schema changes.
            format: 'deterministic_report_with_prism_v2',
        },
        domain: domain
            ? {
                domainKey: domain.domainKey,
                version: domain.version,
            }
            : null,
        inspection: {
            inspectionId: params.inspection.inspectionId,
            orgId: params.inspection.orgId,
            title: params.inspection.title,
            description: params.inspection.description ?? null,
            status: params.inspection.status,
            createdAt: params.inspection.createdAt,
            updatedAt: params.inspection.updatedAt,
            finalizedAt: params.inspection.finalizedAt ?? null,
            requiredArtifactTypes: params.inspection.requiredArtifactTypes,
            requiredMinimumArtifacts: params.inspection.requiredMinimumArtifacts,
            location: params.inspection.location ?? null,
            addressText: params.inspection.addressText ?? null,
        },
        artifacts: (0, reportDeterminism_1.stableSort)(params.artifacts, (a) => `${a.createdAt}|${a.artifactId}`).map((a) => ({
            artifactId: a.artifactId,
            createdAt: a.createdAt,
            type: a.type,
            source: a.source,
            contentHash: a.integrity.contentHash,
            integrityState: a.integrity.integrityState,
            finalized: a.finalized,
            tags: a.tags,
            capturedAt: a.provenance.capturedAt,
            engineId: a.provenance.engineId,
        })),
        findings: [...params.findings]
            .sort((a, b) => {
            const ra = (0, reportDeterminism_1.stableSeverityRank)(a.severity);
            const rb = (0, reportDeterminism_1.stableSeverityRank)(b.severity);
            if (ra !== rb)
                return ra - rb;
            const ka = `${a.createdAt}|${a.findingId}`;
            const kb = `${b.createdAt}|${b.findingId}`;
            return ka < kb ? -1 : ka > kb ? 1 : 0;
        })
            .map((f) => ({
            findingId: f.findingId,
            createdAt: f.createdAt,
            engineId: f.engineId,
            title: f.title,
            severity: f.severity,
            confidence: f.confidence,
            rationale: f.rationale ?? null,
            relatedArtifactIds: [...f.relatedArtifactIds].sort(),
            codeRefs: f.codeRefs,
        })),
        classifications: (0, reportDeterminism_1.stableSort)(params.classifications, (c) => `${c.createdAt}|${c.classificationId}`).map((c) => ({
            classificationId: c.classificationId,
            createdAt: c.createdAt,
            engineId: c.engineId,
            label: c.label,
            confidence: c.confidence,
            relatedArtifactIds: [...c.relatedArtifactIds].sort(),
            metadata: c.metadata ?? null,
        })),
        mapLayers: (0, reportDeterminism_1.stableSort)(params.mapLayers ?? [], (m) => `${m.createdAt}|${m.layerId}`).map((m) => ({
            layerId: m.layerId,
            createdAt: m.createdAt,
            engineId: m.engineId,
            name: m.name,
            kind: m.kind,
            relatedArtifactIds: [...m.relatedArtifactIds].sort(),
            storage: m.storage ?? null,
        })),
    };
    return `report_${(0, evidenceHash_1.sha256Hex)((0, reportDeterminism_1.stableJsonDeep)(payload))}`;
}
function composeDeterministicReport(params) {
    const inspection = params.inspection;
    const domain = inspection.domainKey ? (0, domainRegistry_1.getDomain)(inspection.domainKey) : null;
    const artifacts = (0, reportDeterminism_1.stableSort)(params.artifacts, (a) => `${a.createdAt}|${a.artifactId}`);
    const findings = [...params.findings].sort((a, b) => {
        const ra = (0, reportDeterminism_1.stableSeverityRank)(a.severity);
        const rb = (0, reportDeterminism_1.stableSeverityRank)(b.severity);
        if (ra !== rb)
            return ra - rb;
        const ka = `${a.createdAt}|${a.findingId}`;
        const kb = `${b.createdAt}|${b.findingId}`;
        return ka < kb ? -1 : ka > kb ? 1 : 0;
    });
    const classifications = (0, reportDeterminism_1.stableSort)(params.classifications, (c) => `${c.createdAt}|${c.classificationId}`);
    const mapLayers = (0, reportDeterminism_1.stableSort)(params.mapLayers ?? [], (m) => `${m.createdAt}|${m.layerId}`);
    // Enforce evidence-link integrity before composing.
    assertEvidenceLinks({ artifacts, findings, classifications, mapLayers });
    const prism = (0, buildPrismGraph_1.buildPrismGraph)({ artifacts, findings, classifications });
    const sections = [];
    for (const sec of defaultTemplate_1.DEFAULT_SECTIONS) {
        if (sec === 'overview') {
            sections.push({
                section: sec,
                title: defaultTemplate_1.SECTION_TITLES[sec],
                content: {
                    title: inspection.title,
                    inspectionId: inspection.inspectionId,
                    status: inspection.status,
                    generatedAt: inspection.updatedAt,
                    counts: {
                        artifacts: artifacts.length,
                        findings: findings.length,
                        classifications: classifications.length,
                        mapLayers: mapLayers.length,
                    },
                    topSeverities: Array.from(new Set(findings.map((f) => f.severity))),
                },
            });
        }
        if (sec === 'scope') {
            sections.push({
                section: sec,
                title: defaultTemplate_1.SECTION_TITLES[sec],
                content: {
                    method: 'SCINGULAR evidence-based inspection; findings are artifact-linked and chain-of-custody tracked.',
                    requiredMinimumArtifacts: inspection.requiredMinimumArtifacts,
                    requiredArtifactTypes: inspection.requiredArtifactTypes,
                },
            });
        }
        if (sec === 'site') {
            sections.push({
                section: sec,
                title: defaultTemplate_1.SECTION_TITLES[sec],
                content: {
                    location: inspection.location ?? null,
                    addressText: inspection.addressText ?? null,
                    notes: inspection.description ?? null,
                },
            });
        }
        if (sec === 'evidence_summary') {
            sections.push({
                section: sec,
                title: defaultTemplate_1.SECTION_TITLES[sec],
                content: artifacts.map((a) => ({
                    artifactId: a.artifactId,
                    type: a.type,
                    source: a.source,
                    capturedAt: a.provenance.capturedAt,
                    engineId: a.provenance.engineId,
                    contentHash: a.integrity.contentHash,
                    finalized: a.finalized,
                    integrityState: a.integrity.integrityState,
                    tags: a.tags,
                })),
            });
        }
        if (sec === 'findings') {
            sections.push({
                section: sec,
                title: defaultTemplate_1.SECTION_TITLES[sec],
                content: findings.map((f) => ({
                    findingId: f.findingId,
                    title: f.title,
                    severity: f.severity,
                    confidence: f.confidence,
                    rationale: f.rationale ?? null,
                    relatedArtifactIds: f.relatedArtifactIds,
                    codeRefs: f.codeRefs,
                })),
            });
        }
        if (sec === 'prism_graph') {
            sections.push({
                section: sec,
                title: defaultTemplate_1.SECTION_TITLES[sec],
                content: (0, prismGraphSection_1.prismGraphSection)(prism),
            });
        }
        if (sec === 'classifications') {
            sections.push({
                section: sec,
                title: defaultTemplate_1.SECTION_TITLES[sec],
                content: classifications.map((c) => ({
                    classificationId: c.classificationId,
                    label: c.label,
                    confidence: c.confidence,
                    relatedArtifactIds: c.relatedArtifactIds,
                    metadata: c.metadata ?? null,
                })),
            });
        }
        if (sec === 'maps') {
            sections.push({
                section: sec,
                title: defaultTemplate_1.SECTION_TITLES[sec],
                content: mapLayers.map((m) => ({
                    layerId: m.layerId,
                    name: m.name,
                    kind: m.kind,
                    relatedArtifactIds: m.relatedArtifactIds,
                    storage: m.storage ?? null,
                })),
            });
        }
        if (sec === 'appendix') {
            if (domain) {
                sections.push((0, domainAppendix_1.domainAppendixBlock)({
                    domain,
                    sensorCaptures: params.inspection.sensorCaptures,
                }));
                if (domain.reportRequirements?.includeDisclaimer && domain.reportRequirements?.disclaimerText) {
                    sections.push({
                        section: 'disclaimer',
                        title: 'Disclaimer',
                        content: {
                            text: domain.reportRequirements.disclaimerText,
                            domainKey: domain.domainKey,
                            domainVersion: domain.version,
                        },
                    });
                }
            }
            sections.push({
                section: sec,
                title: defaultTemplate_1.SECTION_TITLES[sec],
                content: {
                    evidenceIndex: artifacts.map((a) => ({
                        artifactId: a.artifactId,
                        contentHash: a.integrity.contentHash,
                        wormScope: 'artifact',
                        note: 'Use audit wormHeads + artifactEvents to verify custody chain at export time.',
                    })),
                },
            });
        }
    }
    const seal = (0, lariSeal_1.lariSealBlock)(inspection.updatedAt);
    if (seal)
        sections.push(seal);
    const reportId = deterministicReportId({
        inspection: params.inspection,
        artifacts: params.artifacts,
        findings: params.findings,
        classifications: params.classifications,
        mapLayers: params.mapLayers,
    });
    return {
        reportId,
        orgId: inspection.orgId,
        inspectionId: inspection.inspectionId,
        generatedAt: inspection.updatedAt,
        version: '1',
        sections,
        evidenceRefs: artifacts.map((a) => a.artifactId),
        exportBlocks: params.includeExportBlocks
            ? {
                regulatoryDisclosure: (0, regulatoryDisclosure_1.regulatoryDisclosure)(),
                investorPack: (0, investorPack_1.investorPack)(),
            }
            : undefined,
    };
}
//# sourceMappingURL=reportComposer.js.map