# ICB-06 — VIOLATION CLASSIFICATION, RISK SCORING & PRIORITIZATION ENGINE

**STATUS:** CANONICAL / INHERITS ICB-01 THROUGH ICB-05 / NON-OPTIONAL

---

## 1. PURPOSE

ICB-06 defines the mandatory logic by which SCINGULAR:

- Identifies violations
- Classifies severity
- Calculates risk
- Prioritizes enforcement actions
- Determines escalation thresholds

This block ensures consistent, defensible decision-making.

---

## 2. VIOLATION IDENTIFICATION RULES

A violation exists when:

- An observed condition conflicts with an adopted code, statute, permit, or order
- A required safeguard, system, or condition is missing or inoperative
- Evidence demonstrates non-compliance within inspection scope

Violations SHALL be:

- Explicitly tied to authority
- Explicitly tied to code section
- Supported by evidence (ICB-05)

**UNSUPPORTED VIOLATIONS ARE INVALID.**

---

## 3. SEVERITY CLASSIFICATION (LOCKED TIERS)

SCINGULAR SHALL assign one severity level per violation:

### Level 1 — Minor

- Administrative or cosmetic non-compliance
- No immediate safety, health, or environmental impact
- Does not impair system function
- Correctable without operational shutdown

### Level 2 — Major

- Functional impairment
- Potential safety, health, or environmental risk
- Could escalate if left uncorrected
- Requires timely corrective action

### Level 3 — Critical

- Imminent life-safety, structural, environmental, or health threat
- Active hazard or system failure
- Triggers stop-work, evacuation, or emergency response

**SEVERITY SHALL NOT BE USER-EDITABLE.**

---

## 4. RISK SCORING MODEL

SCINGULAR SHALL calculate a numeric risk score for each violation using the following factors:

- Severity level (weighted highest)
- Exposure likelihood
- Occupancy or population impact
- Environmental sensitivity
- System redundancy or fail-safe presence
- Duration of condition
- Historical recurrence

Risk score SHALL be stored and auditable.

---

## 5. AGGREGATE INSPECTION RISK

For each inspection:

- Individual violation scores SHALL be aggregated
- The highest severity violation controls overall status
- Aggregate risk SHALL inform enforcement urgency

Overall status options:

- Compliant
- Conditionally compliant
- Non-compliant
- Imminent danger

---

## 6. PRIORITIZATION & ENFORCEMENT TRIGGERS

SCINGULAR SHALL automatically trigger:

For Minor:

- Corrective notice
- Standard deadline
- Optional re-inspection

For Major:

- Mandatory corrective action
- Defined deadline
- Required verification

For Critical:

- Immediate escalation
- Stop-work or emergency flag
- Authority notification
- Accelerated re-inspection

Triggers SHALL align with authority rules (ICB-02).

---

## 7. MULTI-VIOLATION HANDLING

When multiple violations exist:

- Each violation is scored independently
- Interacting risks are evaluated
- Compounding effects increase aggregate risk

Low-severity violations MAY escalate when cumulative risk is high.

---

## 8. DISCRETION CONSTRAINTS

SCINGULAR SHALL:

- Prohibit manual downgrading of severity
- Require justification for any upgrade
- Log all overrides with authority reference

**NO SILENT MODIFICATIONS ARE PERMITTED.**

---

## 9. HISTORICAL & TREND ANALYSIS

SCINGULAR SHALL:

- Track recurring violations
- Detect patterns of non-compliance
- Increase risk weighting for repeat findings
- Surface chronic compliance failures

---

## 10. SYSTEM ENFORCEMENT

SCINGULAR SHALL:

- Enforce standardized classification
- Prevent report issuance without scoring
- Lock severity once issued
- Preserve all scoring history

---

END ICB-06
