# ICB-18 — DATA RETENTION, ARCHIVAL, DESTRUCTION & LEGAL HOLD GOVERNANCE

**STATUS:** CANONICAL / INHERITS ICB-01 THROUGH ICB-17 / NON-OPTIONAL

---

## 1. PURPOSE

ICB-18 defines how SCINGULAR:

- Retains inspection records
- Archives historical data
- Executes lawful destruction
- Enforces legal holds
- Preserves long-term evidentiary integrity

This block controls the data lifecycle from creation to disposition.

---

## 2. DATA CLASSES SUBJECT TO RETENTION

The following data classes SHALL be governed:

- Inspection records
- Reports and amendments
- Evidence (all media types)
- Corrective action records
- Credential and training records
- Audit and access logs
- Automation and decision logs
- Integration exchange logs

**NO DATA CLASS IS EXEMPT.**

---

## 3. RETENTION RULE HIERARCHY

Retention SHALL follow this precedence:

1. Statutory or regulatory requirement
2. Court order or legal hold
3. Authority having jurisdiction
4. Contractual obligation
5. Internal governance policy

**THE LONGEST APPLICABLE RETENTION PERIOD CONTROLS.**

---

## 4. RETENTION PERIOD ASSIGNMENT

SCINGULAR SHALL:

- Assign retention periods per data class
- Bind retention to jurisdiction and authority
- Track start and end dates
- Prevent premature expiration

Retention metadata SHALL be immutable.

---

## 5. ARCHIVAL REQUIREMENTS

When data transitions to archival:

- Data SHALL remain immutable
- Accessibility SHALL be preserved
- Searchability SHALL be maintained
- Context and metadata SHALL remain intact

Archival data remains discoverable.

---

## 6. LEGAL HOLD ENFORCEMENT

When a legal hold is initiated:

- All destruction SHALL halt
- All affected data SHALL be locked
- Hold scope SHALL be defined
- Hold status SHALL be logged

**LEGAL HOLDS OVERRIDE ALL RETENTION POLICIES.**

---

## 7. DESTRUCTION AUTHORIZATION

Data destruction MAY occur only when:

- Retention period has expired
- No legal hold exists
- Destruction is permitted by law
- Authorization is recorded

**UNAUTHORIZED DESTRUCTION IS A SYSTEM FAILURE.**

---

## 8. DESTRUCTION METHODS

When destruction is authorized:

- Digital data SHALL be securely erased
- Physical media SHALL be destroyed per standard
- Destruction SHALL be irreversible
- Proof of destruction SHALL be recorded

Destruction SHALL preserve an audit record.

---

## 9. AUDITABILITY & VERIFICATION

SCINGULAR SHALL:

- Log all retention decisions
- Log all archival transitions
- Log all destruction events
- Support verification of compliance

Retention audits SHALL be supported.

---

## 10. SYSTEM ENFORCEMENT

SCINGULAR SHALL:

- Prevent manual deletion
- Enforce retention automatically
- Block destruction under legal hold
- Preserve retention and destruction history permanently

---

END ICB-18
