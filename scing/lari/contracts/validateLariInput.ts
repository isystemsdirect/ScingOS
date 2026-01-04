import type { LariEngineInput } from './lariInput.schema';
import { areUnitsCompatible, isKnownUnit, type UnitId, unitKind } from './units';

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function isIsoLike(v: unknown): boolean {
  return typeof v === 'string' && v.includes('T') && (v.endsWith('Z') || v.includes('+'));
}

export function validateLariInput(
  i: LariEngineInput
): { ok: true } | { ok: false; errors: string[] } {
  const errors: string[] = [];

  if (!isNonEmptyString(i.engineId)) errors.push('MISSING_ENGINE_ID');
  if (!isNonEmptyString(i.inspectionId)) errors.push('MISSING_INSPECTION_ID');
  if (!isIsoLike(i.receivedAt)) errors.push('INVALID_RECEIVED_AT');
  if (i.schemaVersion !== '1.0.0') errors.push('UNSUPPORTED_SCHEMA_VERSION');

  if (!Array.isArray(i.artifacts)) errors.push('ARTIFACTS_NOT_ARRAY');
  if (!Array.isArray(i.measurements)) errors.push('MEASUREMENTS_NOT_ARRAY');
  if (!Array.isArray(i.fieldInputs)) errors.push('FIELDINPUTS_NOT_ARRAY');

  if (i.sensorCaptures !== undefined && !Array.isArray(i.sensorCaptures)) {
    errors.push('SENSORCAPTURES_NOT_ARRAY');
  }

  const artifactIds = new Set<string>();
  for (const [idx, a] of (i.artifacts ?? []).entries()) {
    if (!isNonEmptyString(a.artifactId)) errors.push(`ARTIFACT_${idx}_MISSING_ID`);
    else {
      if (artifactIds.has(a.artifactId)) errors.push(`ARTIFACT_${idx}_DUPLICATE_ID`);
      artifactIds.add(a.artifactId);
    }
    if (!isNonEmptyString(a.type)) errors.push(`ARTIFACT_${idx}_MISSING_TYPE`);
  }

  for (const [idx, m] of (i.measurements ?? []).entries()) {
    if (!isNonEmptyString(m.measurementId)) errors.push(`MEAS_${idx}_MISSING_ID`);
    if (!isNonEmptyString(m.name)) errors.push(`MEAS_${idx}_MISSING_NAME`);
    if (!isIsoLike(m.observedAt)) errors.push(`MEAS_${idx}_INVALID_OBSERVED_AT`);

    if (!m.value || typeof m.value !== 'object') {
      errors.push(`MEAS_${idx}_MISSING_VALUE`);
      continue;
    }

    const unit = (m.value as any).unit as unknown;
    const value = (m.value as any).value as unknown;
    if (!isKnownUnit(String(unit))) {
      errors.push(`MEAS_${idx}_UNKNOWN_UNIT`);
    }
    if (typeof value !== 'number' || !Number.isFinite(value)) {
      errors.push(`MEAS_${idx}_NON_FINITE_VALUE`);
    }

    const kind = m.kind;
    if (isKnownUnit(String(unit))) {
      const u = String(unit) as UnitId;
      const uk = unitKind(u);
      if (kind !== 'unknown' && kind !== uk) {
        // Allow ratio/count/percent to be used only with compatible units.
        errors.push(`MEAS_${idx}_UNIT_KIND_MISMATCH`);
      }

      // preferredUnits: if provided, must be compatible with this measurement kind.
      const preferred = i.constraints?.preferredUnits ?? [];
      for (const pu of preferred) {
        if (kind !== 'unknown' && unitKind(pu) !== kind) {
          errors.push(`PREFERRED_UNIT_INCOMPATIBLE_WITH_KIND_${kind}`);
        }
        if (!areUnitsCompatible(pu, u)) {
          errors.push(`PREFERRED_UNIT_INCOMPATIBLE_${pu}_${u}`);
        }
      }
    }

    const tol = m.value.tolerance;
    if (tol) {
      if (tol.abs !== undefined && (typeof tol.abs !== 'number' || !Number.isFinite(tol.abs) || tol.abs < 0)) {
        errors.push(`MEAS_${idx}_INVALID_TOL_ABS`);
      }
      if (tol.rel !== undefined && (typeof tol.rel !== 'number' || !Number.isFinite(tol.rel) || tol.rel < 0 || tol.rel > 1)) {
        errors.push(`MEAS_${idx}_INVALID_TOL_REL`);
      }
    }

    if (!Array.isArray(m.evidence) || m.evidence.length === 0) {
      errors.push(`MEAS_${idx}_NO_EVIDENCE`);
    } else {
      for (const [ei, e] of m.evidence.entries()) {
        if (!isNonEmptyString(e.refId)) errors.push(`MEAS_${idx}_EVID_${ei}_MISSING_REFID`);
        if (!isNonEmptyString(e.kind)) errors.push(`MEAS_${idx}_EVID_${ei}_MISSING_KIND`);
      }
    }
  }

  for (const [idx, f] of (i.fieldInputs ?? []).entries()) {
    if (!isNonEmptyString(f.fieldId)) errors.push(`FIELD_${idx}_MISSING_ID`);
    if (!isNonEmptyString(f.label)) errors.push(`FIELD_${idx}_MISSING_LABEL`);
    if (!isNonEmptyString(f.valueText)) errors.push(`FIELD_${idx}_MISSING_VALUE`);
    if (!isIsoLike(f.observedAt)) errors.push(`FIELD_${idx}_INVALID_OBSERVED_AT`);

    if (!Array.isArray(f.evidence) || f.evidence.length === 0) {
      errors.push(`FIELD_${idx}_NO_EVIDENCE`);
    }
  }

  for (const [idx, s] of ((i.sensorCaptures ?? []) as any[]).entries()) {
    if (!s || typeof s !== 'object') {
      errors.push(`SENSORCAPTURE_${idx}_INVALID`);
      continue;
    }
    if (!isNonEmptyString((s as any).providerId)) errors.push(`SENSORCAPTURE_${idx}_MISSING_PROVIDER`);
    if (!isNonEmptyString((s as any).captureId)) errors.push(`SENSORCAPTURE_${idx}_MISSING_CAPTURE`);
  }

  return errors.length ? { ok: false, errors } : { ok: true };
}
