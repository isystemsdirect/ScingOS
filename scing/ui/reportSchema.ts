export type ReportSection =
  | 'overview'
  | 'imagery'
  | 'maps'
  | 'measurements'
  | 'spectral'
  | 'acoustic'
  | 'hazards'
  | 'flight'
  | 'findings'
  | 'appendix';

export type ReportBlock = {
  section: ReportSection;
  title: string;
  content: any;
};

export type InspectionReport = {
  inspectionId: string;
  orgId: string;
  generatedAt: string;
  sections: ReportBlock[];
  evidenceRefs: string[];
  signatures?: any[];
};
