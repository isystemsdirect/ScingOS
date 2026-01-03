# ICB-08 — INSPECTOR CREDENTIALING, SCOPE MATCHING & AUTHORIZATION CONTROL

**STATUS:** CANONICAL / INHERITS ICB-01 THROUGH ICB-07 / NON-OPTIONAL

---

## 1. PURPOSE

ICB-08 defines how SCINGULAR:

- Validates inspector credentials
- Matches credentials to inspection scope
- Enforces authorization boundaries
- Prevents unauthorized actions
- Preserves credential auditability

This block ensures only qualified actions occur.

---

## 2. INSPECTOR IDENTITY & PROFILE

Each inspector SHALL have a verified profile including:

- Legal name
- Unique inspector ID
- Employing authority or organization
- Jurisdiction(s) authorized
- License(s), certification(s), registration(s)
- License numbers and issuing bodies
- Expiration dates
- Insurance/bonding status (if applicable)

**UNVERIFIED PROFILES SHALL BE DISABLED.**

---

## 3. CREDENTIAL TYPES (CANONICAL)

Credentials MAY include:

- Building official / building inspector
- Electrical / plumbing / mechanical inspector
- Fire inspector / fire marshal
- Safety / occupational inspector
- Environmental inspector
- Housing / property inspector
- Engineer or architect (licensed)
- Technician / sampler (limited scope)

Credential types SHALL map to allowed actions.

---

## 4. SCOPE MATCHING RULES

Before an inspection starts, SCINGULAR SHALL:

- Match inspection domain(s) to credential type(s)
- Match jurisdiction to authorization
- Match inspection tasks to permitted actions

If scope exceeds credential:

- Task SHALL be blocked
- Escalation SHALL occur
- Event SHALL be logged

---

## 5. ACTION-LEVEL AUTHORIZATION

SCINGULAR SHALL enforce authorization at action level:

- Measurement types
- Testing methods
- Evidence collection
- Violation issuance
- Stop-work or emergency flags
- Report approval and signing

**UNAUTHORIZED ACTIONS SHALL NOT EXECUTE.**

---

## 6. MULTI-INSPECTOR & TEAM INSPECTIONS

When multiple inspectors participate:

- Each action is attributed to a specific inspector
- Each inspector’s scope is enforced independently
- Reports SHALL identify contributing inspectors

**NO INSPECTOR MAY COVER ANOTHER’S SCOPE.**

---

## 7. LICENSE & CREDENTIAL EXPIRATION

SCINGULAR SHALL:

- Track expiration dates
- Warn prior to expiration
- Auto-disable expired credentials
- Block inspections requiring expired credentials

**NO GRACE PERIODS WITHOUT AUTHORITY APPROVAL.**

---

## 8. OVERRIDES & EXCEPTIONS

Credential overrides:

- Require explicit authority approval
- MUST be time-limited
- MUST be logged with justification
- Cannot exceed legal limits

**SILENT OR PERMANENT OVERRIDES ARE PROHIBITED.**

---

## 9. AUDIT & COMPLIANCE LOGGING

SCINGULAR SHALL log:

- Credential checks
- Scope matches
- Authorization failures
- Overrides and approvals

Logs are audit-grade and immutable.

---

## 10. SYSTEM ENFORCEMENT

SCINGULAR SHALL:

- Block inspection start without valid credentials
- Prevent unauthorized report issuance
- Enforce signer qualification
- Preserve full credential history

---

END ICB-08
