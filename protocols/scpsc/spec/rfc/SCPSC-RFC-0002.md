# SCPSC-RFC-0002 — LARI Intent Schema (NORMATIVE)

# ISD Ultra-Grade™ Mandatory Preamble (VERBATIM)
This artifact is produced under ISD Ultra-Grade™, the highest inspection-grade engineering standard enforced by Inspection Systems Direct (ISD).
All behaviors described herein are bounded, governed, auditable, and revocable by design.

## 0. Status
- **Status:** Normative (v1.0 Draft for review)
- **Change Control:** Registry + schema + conformance vectors MUST move together.

## 1. Scope
This RFC defines the canonical structure and validation rules for the `lari` object, including `intent_class` and `intent_payload`, used within the SCPSC Signal Envelope (SCPSC-RFC-0001).

## 2. Non-Goals
- Defining transport-level routing
- Defining endpoint adapter implementations
- Allowing untyped free-form payload blobs

## 3. Requirements (High Level)
- Unknown `intent_class` MUST be rejected by default. (SCPSC-LARI-001)
- `intent_payload` MUST conform to the contract for the given `intent_class`. (SCPSC-LARI-002)
- `modify` intents MUST require rollback semantics. (SCPSC-LARI-003)
- Governance directives MUST be explicit and enumerable. (SCPSC-LARI-004)

## 4. Registry
See: `spec/registry/LARI_INTENT_REGISTRY.md`

## 5. Schema
Schema source of truth:
- `spec/schemas/lari.intent.schema.json`

## 6. Security + Governance Considerations
- `modify` and `deploy` intents SHALL be treated as elevated-risk and SHOULD require stricter BANE policy conditions.
- Any ambiguity SHALL be resolved by deny-by-default behavior.

## 7. Conformance
Vectors SHALL be validated via AJV tooling and evidence artifacts SHALL be generated.
See:
- `test/vectors/lari/*`
- `.evidence/lari/*`
- `test/conformance/lari.intent.conformance.md`
