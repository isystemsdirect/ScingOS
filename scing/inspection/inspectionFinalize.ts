import type { InspectionRecord } from './inspectionTypes';
import type { ArtifactRecord } from '../evidence';
import { evaluateFinalize } from './inspectionPolicy';

export function computeNextStatus(params: {
  inspection: InspectionRecord;
  artifacts: ArtifactRecord[];
  online: boolean;
}): { nextStatus: InspectionRecord['status']; reasons: string[] } {
  const d = evaluateFinalize(params);
  if (!d.allow) return { nextStatus: params.inspection.status, reasons: d.reasons };
  return { nextStatus: d.status, reasons: d.reasons };
}
