import type { InspectionReport, ReportBlock } from './reportSchema';

export function composeReport(params: {
  inspectionId: string;
  orgId: string;
  sections: ReportBlock[];
  evidenceRefs: string[];
}): InspectionReport {
  return {
    inspectionId: params.inspectionId,
    orgId: params.orgId,
    generatedAt: new Date().toISOString(),
    sections: params.sections,
    evidenceRefs: params.evidenceRefs,
  };
}
