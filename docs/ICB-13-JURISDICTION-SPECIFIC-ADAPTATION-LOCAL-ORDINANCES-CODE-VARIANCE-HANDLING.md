# ICB-13 — JURISDICTION-SPECIFIC ADAPTATION, LOCAL ORDINANCES & CODE VARIANCE HANDLING

**STATUS:** CANONICAL / INHERITS ICB-01 THROUGH ICB-12 / NON-OPTIONAL

---

## 1. PURPOSE

ICB-13 defines how SCINGULAR:

- Adapts inspections to jurisdiction-specific rules
- Incorporates local ordinances and amendments
- Handles code variances and equivalencies
- Preserves legal correctness across regions

This block enables true multi-jurisdiction operation.

---

## 2. LOCAL ORDINANCE INGESTION

SCINGULAR SHALL support ingestion of:

- Municipal ordinances
- County regulations
- Local amendments to model codes
- Emergency or temporary orders

Each ordinance SHALL be:

- Versioned
- Date-effective
- Jurisdiction-scoped
- Source-attributed

---

## 3. CODE VARIANCE HANDLING

When a variance or alternative method is approved:

- Approval authority SHALL be recorded
- Scope and limitations SHALL be documented
- Expiration or conditions SHALL be tracked
- Variance SHALL NOT exceed legal authority

**UNAPPROVED VARIANCES ARE INVALID.**

---

## 4. EQUIVALENCY DETERMINATION

SCINGULAR MAY record equivalencies only when:

- Explicitly approved by AHJ
- Documented in writing
- Bound to a specific inspection or permit
- Non-transferable without reapproval

**EQUIVALENCY DOES NOT CREATE PRECEDENT.**

---

## 5. TEMPORAL APPLICABILITY

SCINGULAR SHALL apply:

- Codes effective on inspection date
- Ordinances effective at time of enforcement
- Emergency orders during active period only

Retroactive application is prohibited unless required by law.

---

## 6. MULTI-LOCATION OPERATIONS

For inspections spanning multiple jurisdictions:

- Each location is evaluated independently
- Strictest local requirement controls per location
- Report SHALL segment findings by jurisdiction

---

## 7. CONFLICT RESOLUTION WITH VARIANCES

When variances conflict with standard code:

- Approved variance controls within its scope
- Standard code controls outside variance
- Variance conditions MUST be verified

---

## 8. DATA MODEL REQUIREMENTS

SCINGULAR SHALL store:

- Jurisdiction identifiers
- Ordinance references
- Amendment metadata
- Variance approvals
- Equivalency determinations

All data SHALL be traceable.

---

## 9. REVIEW & OVERSIGHT

Variances and local adaptations SHALL:

- Be reviewable by supervisors
- Be auditable by authorities
- Be revocable if misapplied

---

## 10. SYSTEM ENFORCEMENT

SCINGULAR SHALL:

- Prevent application of unverified ordinances
- Block inspections with unresolved local rules
- Flag expired or invalid variances
- Preserve jurisdictional history permanently

---

END ICB-13
