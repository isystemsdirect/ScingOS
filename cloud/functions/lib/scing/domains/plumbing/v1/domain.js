"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLUMBING_DOMAIN_V1 = void 0;
exports.PLUMBING_DOMAIN_V1 = {
    domainKey: 'plumbing',
    version: '1.0.0',
    title: 'Plumbing Inspection Domain',
    requiredArtifacts: [
        { key: 'under_sink_overview', description: 'Under-sink wide photo showing supply + drain' },
        { key: 'fixture_closeup', description: 'Close-up of fixture/valve/connection with scale reference' },
        { key: 'water_heater_label', description: 'Water heater label/model/serial if applicable' },
    ],
    requiredMeasurements: [],
    taxonomy: [
        { code: 'PL-01', label: 'Minor leak indicator', defaultSeverity: 'minor' },
        { code: 'PL-02', label: 'Active leak', defaultSeverity: 'moderate' },
        { code: 'PL-03', label: 'Improper/unsafe connection', defaultSeverity: 'major' },
        { code: 'PL-04', label: 'Significant water damage risk', defaultSeverity: 'critical' },
    ],
    severityGuidance: [
        {
            when: 'active_leak_present',
            severity: 'moderate',
            note: 'Active leakage can cause rapid damage; prioritize mitigation.',
        },
        {
            when: 'unsafe_connection',
            severity: 'major',
            note: 'Improper connections may fail suddenly and should be corrected.',
        },
    ],
    reportRequirements: {
        includeDisclaimer: true,
        disclaimerText: 'Plumbing findings are based on visible indicators and reported conditions at inspection time; concealed piping conditions may require further invasive verification.',
    },
};
//# sourceMappingURL=domain.js.map