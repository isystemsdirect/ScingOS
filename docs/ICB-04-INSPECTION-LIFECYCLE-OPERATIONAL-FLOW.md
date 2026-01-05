# ICB-04 — INSPECTION LIFECYCLE & OPERATIONAL FLOW CONTROL

**STATUS:** CANONICAL / INHERITS ICB-01, ICB-02, ICB-03 / NON-OPTIONAL

---

## 1. PURPOSE

ICB-04 defines the required operational flow for all inspections executed, simulated, audited, or reported by SCINGULAR.

**NO INSPECTION MAY SKIP, REORDER, OR PARTIALLY EXECUTE THIS FLOW.**

---

## 2. LIFECYCLE STAGES (LOCKED SEQUENCE)

All inspections SHALL progress through the following stages:

- Stage 0 — Intake & Trigger
- Stage 1 — Pre-Inspection Validation
- Stage 2 — On-Site Execution
- Stage 3 — Evaluation & Analysis
- Stage 4 — Report Generation
- Stage 5 — Enforcement & Follow-Up
- Stage 6 — Closure or Escalation

---

## 3. STAGE 0 — INTAKE & TRIGGER

Valid triggers include:

- Permit milestone
- Routine schedule
- Complaint
- Incident or failure
- Regulatory requirement
- Owner/operator request

SCINGULAR SHALL:

- Record trigger source
- Timestamp initiation
- Assign inspection domain(s)
- Lock trigger metadata

---

## 4. STAGE 1 — PRE-INSPECTION VALIDATION

SCINGULAR SHALL:

- Resolve jurisdiction (ICB-02)
- Resolve applicable authority
- Resolve adopted codes & editions
- Validate inspector credentials
- Generate inspection checklist
- Classify baseline risk

**FAILURE AT THIS STAGE SHALL HALT INSPECTION.**

---

## 5. STAGE 2 — ON-SITE EXECUTION

SCINGULAR SHALL allow only:

- Visual observation
- Non-destructive testing
- Authorized measurements
- Evidence capture

SCINGULAR SHALL:

- Enforce scope limits (ICB-03)
- Timestamp all actions
- Bind evidence to checklist items
- Prevent unauthorized actions

---

## 6. STAGE 3 — EVALUATION & ANALYSIS

SCINGULAR SHALL:

- Compare findings to code requirements
- Identify violations
- Classify severity (ICB-01)
- Perform risk scoring
- Flag life-safety or critical issues

**NO HUMAN EDITING OF FACTUAL FINDINGS IS PERMITTED.**

---

## 7. STAGE 4 — REPORT GENERATION

SCINGULAR SHALL:

- Compile findings into structured report
- Cite authority and code sections
- Separate facts from notes
- Insert mandatory disclaimers
- Assign unique report ID
- Digitally lock report

---

## 8. STAGE 5 — ENFORCEMENT & FOLLOW-UP

When violations exist:

- Corrective actions SHALL be generated
- Deadlines SHALL be assigned
- Re-inspection logic SHALL be scheduled

Critical violations SHALL:

- Trigger stop-work or emergency flags
- Escalate per authority rules

---

## 9. STAGE 6 — CLOSURE OR ESCALATION

Inspections SHALL:

- Close upon verified compliance
- Escalate upon non-compliance
- Preserve full audit trail

**NO DATA MAY BE DELETED.**

---

## 10. SYSTEM ENFORCEMENT

SCINGULAR SHALL:

- Enforce stage order
- Block manual bypass
- Log all transitions
- Preserve immutable lifecycle history

---

END ICB-04
