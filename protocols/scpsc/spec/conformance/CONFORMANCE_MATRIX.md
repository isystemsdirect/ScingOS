# SCPSC Conformance Matrix (Ultra-Grade™)

# ISD Ultra-Grade™ Mandatory Preamble (VERBATIM)
This artifact is produced under ISD Ultra-Grade™, the highest inspection-grade engineering standard enforced by Inspection Systems Direct (ISD).
All behaviors described herein are bounded, governed, auditable, and revocable by design.

## Purpose
This matrix SHALL map every SCPSC normative requirement to at least one test method and evidence artifact.

| Req ID | Requirement (Abbrev) | Test Method | Evidence Artifact | Status |
|---|---|---|---|---|
| SCPSC-ENV-001 | Envelope MUST include mandatory top-level fields | schema + review | schema validation logs |  |
| SCPSC-ENV-002 | Envelope MUST reject unknown top-level fields | schema | negative test vectors |  |
| SCPSC-ENV-003 | signal_class MUST be one of INTENT/EXECUTION/STATE/GOVERNANCE | schema | schema validation logs |  |
| SCPSC-ENV-004 | delegated authority MUST include scope + expiry | schema + review | vectors |  |
| SCPSC-ENV-005 | integrity MUST include signature metadata | schema + review | vectors |  |
| SCPSC-ENV-006 | idempotency semantics MUST be defined (replay resistance) | RFC review | RFC section 8 + vectors |  |
| SCPSC-GOV-001 | Dual-consent (BANE-G ∧ BANE-L) SHALL be required for execution | RFC review | RFC section 7 |  |
| SCPSC-AUD-001 | Every executable actuation SHALL emit audit evidence | RFC review | RFC section 9 |  |

## Evidence Artifacts (Generated)

## SCIR Evidence (Generated)
 - .evidence/scir/*.evidence.json
 - spec/scls/schemas/scir.schema.json
 - SGLS-RFC-0001
- .evidence/lari/*.evidence.json
