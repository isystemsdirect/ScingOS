export const ELECTRICAL_DOMAIN_V1 = {
  domainKey: 'electrical',
  version: '1.0.0',
  title: 'Electrical Inspection Domain',
  requiredArtifacts: [
    {
      key: 'panel_overview',
      description: 'Wide shot of electrical panel with door open (safe distance)',
    },
    { key: 'panel_labeling', description: 'Close-up of labeling / circuit directory' },
    { key: 'breaker_detail', description: 'Close-up of breakers and any suspected defects' },
    {
      key: 'outlet_sample',
      description: 'Representative outlet/switch sample photos for the area',
    },
  ],
  requiredMeasurements: [
    { name: 'line_voltage', unit: 'v', tolerancePlusMinus: 2, method: 'manual' },
    { name: 'outlet_polarity', unit: 'bool', tolerancePlusMinus: 0, method: 'manual' },
    { name: 'gfci_trip_test', unit: 'bool', tolerancePlusMinus: 0, method: 'manual' },
  ],
  taxonomy: [
    { code: 'EL-01', label: 'Improper labeling / missing directory', defaultSeverity: 'minor' },
    { code: 'EL-02', label: 'Loose / damaged outlet or cover', defaultSeverity: 'moderate' },
    {
      code: 'EL-03',
      label: 'Double-tapped breaker / improper termination (observed)',
      defaultSeverity: 'major',
    },
    {
      code: 'EL-04',
      label: 'Overheating / burn marks / arcing indicators (observed)',
      defaultSeverity: 'critical',
    },
    {
      code: 'EL-05',
      label: 'Missing GFCI protection indicator (observed)',
      defaultSeverity: 'major',
    },
  ],
  severityGuidance: [
    {
      when: 'burn_marks_present',
      severity: 'critical',
      note: 'Potential arcing/overheating; urgent evaluation recommended',
    },
    {
      when: 'line_voltage_out_of_range',
      severity: 'major',
      note: 'Voltage deviation may indicate wiring/service issue',
    },
    {
      when: 'gfci_fails_trip_test',
      severity: 'major',
      note: 'Safety device failure requires correction',
    },
  ],
  reportRequirements: {
    includeDisclaimer: true,
    disclaimerText:
      'Electrical findings are based on visible conditions and limited field tests. This is not a code compliance certification. For safety concerns, consult a licensed electrician.',
  },
} as const;
