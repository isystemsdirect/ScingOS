# ICB-16 — AUTOMATION, DECISION SUPPORT & HUMAN-IN-THE-LOOP CONTROLS

**STATUS:** CANONICAL / INHERITS ICB-01 THROUGH ICB-15 / NON-OPTIONAL

---

## 1. PURPOSE

ICB-16 defines how SCINGULAR:

- Uses automation and decision support
- Preserves human authority and accountability
- Prevents unsanctioned autonomous action
- Ensures explainability of system outputs
- Maintains legal and ethical control

This block prevents uncontrolled or opaque automation.

---

## 2. AUTOMATION SCOPE DEFINITIONS

SCINGULAR automation MAY:

- Generate checklists
- Suggest applicable codes
- Flag potential violations
- Calculate risk scores
- Draft reports
- Schedule follow-ups

SCINGULAR automation SHALL NOT:

- Issue final enforcement actions without authorization
- Override inspector or authority decisions
- Certify compliance independently
- Conceal uncertainty or assumptions

---

## 3. HUMAN-IN-THE-LOOP REQUIREMENTS

The following actions require human authorization:

- Final violation confirmation
- Severity escalation to Critical
- Stop-work or emergency actions
- Report issuance and signing
- Inspection closure

Human decisions SHALL be logged and attributed.

---

## 4. DECISION SUPPORT TRANSPARENCY

SCINGULAR SHALL:

- Expose decision inputs
- Identify data sources used
- Surface confidence levels
- Highlight uncertainty or missing data

**BLACK-BOX DECISIONS ARE PROHIBITED.**

---

## 5. OVERRIDE & REVIEW MECHANISMS

Automated suggestions MAY be overridden only by:

- Authorized inspectors
- Supervisors
- Authorities having jurisdiction

Overrides SHALL:

- Require justification
- Be logged immutably
- Preserve original system output

---

## 6. ERROR HANDLING & FAIL-SAFE MODES

When automation confidence is low:

- System SHALL flag uncertainty
- Human review SHALL be required
- Automation SHALL degrade gracefully

Fail-safe mode SHALL favor safety and compliance.

---

## 7. MODEL UPDATES & LEARNING CONTROLS

SCINGULAR SHALL:

- Version decision-support models
- Prevent unapproved self-modification
- Require validation before deployment
- Preserve prior model behavior for historical inspections

**UNCONTROLLED LEARNING IS PROHIBITED.**

---

## 8. BIAS, FAIRNESS & CONSISTENCY

SCINGULAR SHALL:

- Monitor for decision bias
- Enforce consistent treatment across cases
- Flag anomalous recommendations
- Support review of automated patterns

---

## 9. AUDITABILITY & TRACEABILITY

All automated outputs SHALL be:

- Traceable to inputs
- Time-stamped
- Reviewable
- Reproducible

Automation history is auditable.

---

## 10. SYSTEM ENFORCEMENT

SCINGULAR SHALL:

- Block unauthorized autonomous actions
- Enforce human authorization gates
- Preserve automation decision logs
- Support regulatory and legal review

---

END ICB-16
