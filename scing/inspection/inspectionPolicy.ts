import type { InspectionRecord, FinalizeDecision } from './inspectionTypes';
import type { ArtifactRecord } from '../evidence';

export function evaluateFinalize(params: {
  inspection: InspectionRecord;
  artifacts: ArtifactRecord[];
  online: boolean;
}): FinalizeDecision {
  const reasons: string[] = [];
  const { inspection, artifacts, online } = params;

  if (!inspection.requiredMinimumArtifacts || inspection.requiredMinimumArtifacts < 1)
    reasons.push('POLICY_REQUIRED_MIN_ARTIFACTS_NOT_SET');
  if (inspection.requiredMinimumArtifacts && artifacts.length < inspection.requiredMinimumArtifacts)
    reasons.push('NOT_ENOUGH_ARTIFACTS');

  const failed = artifacts.filter((a) => a.integrity.integrityState === 'failed');
  if (failed.length > 0) reasons.push('ARTIFACT_INTEGRITY_FAILED');

  const notFinalized = artifacts.filter((a) => !a.finalized);
  if (notFinalized.length > 0) reasons.push('ARTIFACTS_NOT_FINALIZED');

  // type policy
  const requiredTypes = new Set(inspection.requiredArtifactTypes ?? []);
  if (requiredTypes.size > 0) {
    for (const t of requiredTypes) {
      const has = artifacts.some((a) => a.type === t);
      if (!has) reasons.push(`MISSING_REQUIRED_TYPE:${t}`);
    }
  }

  // offline rule: can be ready_to_finalize, cannot be final
  if (!online) {
    if (reasons.length === 0)
      return { allow: true, status: 'ready_to_finalize', reasons: ['OFFLINE_READY_ONLY'] };
    const denyStatus =
      inspection.status === 'archived'
        ? 'archived'
        : inspection.status === 'open'
          ? 'open'
          : 'in_progress';
    return { allow: false, status: denyStatus, reasons };
  }

  if (reasons.length > 0) {
    const denyStatus =
      inspection.status === 'archived'
        ? 'archived'
        : inspection.status === 'open'
          ? 'open'
          : 'in_progress';
    return { allow: false, status: denyStatus, reasons };
  }
  return { allow: true, status: 'final', reasons: ['OK'] };
}
