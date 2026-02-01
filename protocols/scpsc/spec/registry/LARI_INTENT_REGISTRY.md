# LARI Intent Registry (Normative) — v1.0

# ISD Ultra-Grade™ Mandatory Preamble (VERBATIM)
This artifact is produced under ISD Ultra-Grade™, the highest inspection-grade engineering standard enforced by Inspection Systems Direct (ISD).
All behaviors described herein are bounded, governed, auditable, and revocable by design.

## Rule
Only intent_class values listed here are valid for SCPSC v1.x. Unknown intent_class values MUST be rejected by default.

## intent_class (v1 set)
1. **analyze** — read-only analysis (no mutation)
2. **build** — compile/build/test actions
3. **modify** — bounded edits to code/config (requires rollback semantics)
4. **deploy** — bounded deployment actions (environment-scoped)
5. **observe** — telemetry subscription / status retrieval (read-only)
6. **govern** — governance-only directives (LOCKDOWN, revoke, require-approval)

## Notes
- Any future intent_class SHALL be introduced by RFC revision + registry update + conformance vectors.
