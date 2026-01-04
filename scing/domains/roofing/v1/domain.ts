export const ROOFING_DOMAIN_V1 = {
  domainKey: 'roofing',
  version: '1.0.0',
  title: 'Roofing Inspection Domain',
  requiredArtifacts: [
    { key: 'roof_overview', description: 'Wide overview of entire roof plane' },
    { key: 'slope_edge', description: 'Slope and edge detail with scale reference' },
    {
      key: 'penetration_detail',
      description: 'Close-up of penetrations (vents, chimneys, flashing)',
    },
    { key: 'damage_closeup', description: 'Close-up of suspected damage with ruler or scale' },
  ],
  requiredMeasurements: [
    { name: 'roof_slope', unit: 'deg', tolerancePlusMinus: 1, method: 'derived' },
    { name: 'shingle_exposure', unit: 'in', tolerancePlusMinus: 0.25, method: 'manual' },
  ],
  taxonomy: [
    { code: 'RF-01', label: 'Granule loss', defaultSeverity: 'minor' },
    { code: 'RF-02', label: 'Cracked or missing shingles', defaultSeverity: 'moderate' },
    { code: 'RF-03', label: 'Flashing deterioration', defaultSeverity: 'major' },
    { code: 'RF-04', label: 'Active leak indicators', defaultSeverity: 'critical' },
    { code: 'RF-05', label: 'Structural sagging', defaultSeverity: 'critical' },
  ],
  severityGuidance: [
    {
      when: 'missing_shingles_present',
      severity: 'moderate',
      note: 'Exposed underlayment increases intrusion risk',
    },
    {
      when: 'flashing_compromised',
      severity: 'major',
      note: 'High likelihood of water intrusion at penetrations',
    },
    {
      when: 'active_leak_signs',
      severity: 'critical',
      note: 'Immediate repair recommended to prevent damage',
    },
  ],
  reportRequirements: {
    includeDisclaimer: true,
    disclaimerText:
      'Roofing findings are visual in nature and may be limited by access, pitch, weather conditions, and safety constraints.',
  },
} as const;
