import type { ReportSection } from '../reportDeterminism';

export const DEFAULT_SECTIONS: ReportSection[] = [
  'overview',
  'scope',
  'site',
  'evidence_summary',
  'findings',
  'classifications',
  'maps',
  'appendix',
];

export const SECTION_TITLES: Record<string, string> = {
  overview: 'Executive Overview',
  scope: 'Scope & Method',
  site: 'Site & Conditions',
  evidence_summary: 'Evidence Summary',
  findings: 'Findings',
  classifications: 'Classifications',
  maps: 'Maps & Measurements',
  appendix: 'Appendix (Evidence Index)',
};
