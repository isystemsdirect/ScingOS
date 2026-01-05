"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MOISTURE_MOLD_DOMAIN_V1 = void 0;
exports.MOISTURE_MOLD_DOMAIN_V1 = {
    domainKey: 'moisture_mold',
    version: '1.0.0',
    title: 'Moisture & Mold Inspection Domain',
    requiredArtifacts: [
        { key: 'area_overview', description: 'Wide overview of affected area' },
        {
            key: 'closeup_surface',
            description: 'Close-up of suspected moisture surface with scale reference',
        },
        {
            key: 'source_context',
            description: 'Context photo of suspected source (plumbing, roof, window, etc.)',
        },
    ],
    requiredMeasurements: [
        { name: 'moisture_pct', unit: 'pct', tolerancePlusMinus: 1, method: 'device_sensor' },
        { name: 'ambient_temp', unit: 'F', tolerancePlusMinus: 1, method: 'manual' },
        { name: 'surface_temp', unit: 'F', tolerancePlusMinus: 1, method: 'device_sensor' },
    ],
    taxonomy: [
        { code: 'MM-01', label: 'Visible staining', defaultSeverity: 'minor' },
        { code: 'MM-02', label: 'Active moisture indication', defaultSeverity: 'moderate' },
        { code: 'MM-03', label: 'Suspected mold growth', defaultSeverity: 'major' },
        { code: 'MM-04', label: 'Structural material deterioration', defaultSeverity: 'critical' },
    ],
    severityGuidance: [
        {
            when: 'moisture_pct >= 20',
            severity: 'moderate',
            note: 'Elevated moisture consistent with active intrusion risk',
        },
        {
            when: 'visible growth present',
            severity: 'major',
            note: 'Potential mold growth requires verification/remediation guidance',
        },
        {
            when: 'material integrity compromised',
            severity: 'critical',
            note: 'Structural risk; urgent mitigation required',
        },
    ],
    reportRequirements: {
        includeDisclaimer: true,
        disclaimerText: 'Moisture and mold findings are based on visible indicators and available measurements; laboratory confirmation may be required.',
    },
};
//# sourceMappingURL=domain.js.map