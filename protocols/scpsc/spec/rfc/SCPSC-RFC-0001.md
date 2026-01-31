# SCPSC-RFC-0001 — SCPSC Signal Envelope (NORMATIVE)

# ISD Ultra-Grade™ Mandatory Preamble (VERBATIM)
This artifact is produced under ISD Ultra-Grade™, the highest inspection-grade engineering standard enforced by Inspection Systems Direct (ISD).
All behaviors described herein are bounded, governed, auditable, and revocable by design.

## 0. Status, Change Control, and Authority
- **Status:** Normative (v1.0 Draft for review)
- **Change Control:** Any modification SHALL be recorded as a revision delta with requirement impact analysis.
- **Canonical Acronym:** **SCPSC** is the sole permitted abbreviation for SpectroCAPSCING™. No aliases.

## 1. Scope
This RFC defines the **SCPSC Signal Envelope**, the mandatory cryptographically-verifiable container for all SCPSC signals across all transports (e.g., WebSocket, gRPC streaming, QUIC) and all device classes (SEA-D, SEA-M, SEA-T, SEA-W, SEA-E).

## 2. Non-Goals
SCPSC is NOT:
- A remote desktop / pixel transport system
- A keystroke mirroring system
- A bypass mechanism for SDK security boundaries
- An uncontrolled autonomy system

## 3. Normative Language
The terms MUST, SHALL, SHOULD, MAY are normative. Any ambiguity SHALL be resolved via ISD Ultra-Grade change control.

## 4. Definitions
- **ABFI:** Augmented Bona Fide Intelligence — provenance-bound intelligence augmentation under continuous enforcement.
- **Principal:** The authenticated originator of delegated authority (human or institution).
- **DIA:** Delegated Intelligence Authority — the formal grant enabling bounded execution.
- **SCPSC Signal:** A typed, signed declaration of intent/execution/state/governance, not a raw command.
- **BANE-G / BANE-L:** Global and Local boundary enforcement layers; execution requires dual-consent.

## 5. Envelope Overview (Conceptual)
A valid SCPSC envelope SHALL bind:
1) **Provenance** (principal identity and authentication reference)  
2) **Authority** (DIA scope + constraints + expiry)  
3) **Intent Structure** (LARI intent class + payload)  
4) **Governance** (dual-consent enforcement expectations)  
5) **Integrity** (signature + hash chaining or equivalent)  

If any binding is missing or unverifiable, execution SHALL NOT occur.

## 6. Envelope Schema (Normative)
### 6.1 Required Top-Level Fields
A compliant envelope MUST include:
- `scpsc_version` (string)
- `signal_id` (string; UUID recommended)
- `signal_class` (enum: INTENT, EXECUTION, STATE, GOVERNANCE)
- `timestamp` (ISO-8601 string)
- `principal` (object; MUST include principal identity reference)
- `delegated_authority` (object; MUST include scope and expires_at)
- `lari` (object; MUST include lari_version + intent_class + intent_payload)
- `governance` (object; MUST include execution enforcement expectations)
- `integrity` (object; MUST include signature metadata)

**Requirement IDs:** SCPSC-ENV-001, SCPSC-ENV-003, SCPSC-ENV-004, SCPSC-ENV-005

### 6.2 Additional Properties
Unknown top-level fields MUST be rejected by default to prevent stealth expansion.
**Requirement ID:** SCPSC-ENV-002

## 7. Governance Binding (BANE Dual-Consent)
For any signal that can cause endpoint state mutation (EXECUTION class or higher-risk INTENT escalation):
- **BANE-G** evaluation SHALL occur at the SCPSC Core prior to emission or routing.
- **BANE-L** evaluation SHALL occur at the endpoint SEA prior to actuation.
- Execution SHALL require **BANE-G ∧ BANE-L** approval.

**Requirement ID:** SCPSC-GOV-001

## 8. Replay Resistance and Idempotency
All envelopes SHOULD include idempotency semantics:
- `signal_id` + `timestamp` + `scope` MUST be sufficient to reject replay within policy-defined windows.
- Endpoints SHALL track recent `signal_id` values within a bounded cache window.
- Expired envelopes MUST be rejected.

**Requirement ID:** SCPSC-ENV-006

## 9. Audit Evidence (Ultra-Grade)
For any state mutation actuation, the system SHALL produce audit evidence including:
- intent snapshot (LARI payload reference)
- governance decision trace (BANE-G/BANE-L outcomes)
- target state before/after references (diff or snapshot)
- timestamps and signature verification results
- evidence references (logs, artifacts, hashes)

**Requirement ID:** SCPSC-AUD-001

## 10. Security Considerations (Minimum Bar)
- Signed envelopes are mandatory for executable flows.
- Trust anchors SHALL be pinned per device/org policy.
- Least-privilege scopes SHALL be enforced.
- LOCKDOWN must halt actuation and preserve evidence.

## 11. Conformance
This RFC is conformant only when:
- Schema validates required fields and rejects unknown fields
- Negative vectors fail as expected
- Conformance matrix entries are mapped to evidence artifacts

See: `spec/conformance/CONFORMANCE_MATRIX.md`
