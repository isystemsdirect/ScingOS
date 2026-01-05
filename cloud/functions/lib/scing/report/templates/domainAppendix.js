"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.domainAppendixBlock = domainAppendixBlock;
const sensorRegistry_1 = require("../../sensors/sensorRegistry");
function domainAppendixBlock(params) {
    const providerIds = (params.sensorCaptures ?? []).map((s) => s.providerId);
    providerIds.sort();
    const uniqIds = providerIds.filter((id, idx) => id !== providerIds[idx - 1]);
    const byId = new Map();
    for (const p of Object.values(sensorRegistry_1.SENSOR_REGISTRY))
        byId.set(p.info().providerId, p);
    const sensorProvidersUsed = uniqIds
        .map((providerId) => {
        const p = byId.get(providerId);
        return p ? p.info() : null;
    })
        .filter(Boolean);
    return {
        section: 'domain_pack',
        title: `Domain Pack: ${params.domain.title} (v${params.domain.version})`,
        content: {
            requiredArtifacts: params.domain.requiredArtifacts,
            requiredMeasurements: params.domain.requiredMeasurements,
            taxonomy: params.domain.taxonomy,
            disclaimers: params.domain.reportRequirements,
            sensorProvidersUsed,
        },
    };
}
//# sourceMappingURL=domainAppendix.js.map