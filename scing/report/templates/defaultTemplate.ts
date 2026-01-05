import type { ReportSection } from '../reportDeterminism';

export const DEFAULT_SECTIONS: ReportSection[] = [
  'overview',
  'scope',
  'site',
  'evidence_summary',
  'findings',
  'prism_graph',
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
  prism_graph: 'Prism Reasoning Graph',
  classifications: 'Classifications',
  maps: 'Maps & Measurements',
  appendix: 'Appendix (Evidence Index)',
};
