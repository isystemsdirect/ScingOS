import type { GeoPoint } from '../evidence';

export type InspectionStatus =
  | 'open'
  | 'in_progress'
  | 'ready_to_finalize'
  | 'final'
  | 'archived';

export type InspectionRecord = {
  inspectionId: string;
  orgId: string;

  // Domain pack binding (immutable once created)
  domainKey?: string;
  domainVersion?: string;

  title: string;
  description?: string;

  createdAt: string;
  updatedAt: string;

  createdByUid: string;
  assignedToUid?: string;

  status: InspectionStatus;

  location?: GeoPoint;
  addressText?: string;

  // workflow toggles
  requiredArtifactTypes: Array<
    | 'photo'
    | 'video'
    | 'thermal_image'
    | 'spectral_scan'
    | 'sonar_scan'
    | 'gpr_scan'
    | 'document'
    | 'other'
  >;
  requiredMinimumArtifacts: number;

  // finalization
  readyToFinalizeAt?: string;
  finalizedAt?: string;
  finalizedByUid?: string;

  // report pointers
  currentReportId?: string;
};

export type FinalizeDecision =
  | { allow: true; status: 'ready_to_finalize' | 'final'; reasons: string[] }
  | { allow: false; status: 'open' | 'in_progress' | 'archived'; reasons: string[] };
