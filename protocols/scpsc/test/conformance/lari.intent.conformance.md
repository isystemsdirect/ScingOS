# LARI Intent Conformance (Ultra-Grade™)

# ISD Ultra-Grade™ Mandatory Preamble (VERBATIM)
This artifact is produced under ISD Ultra-Grade™, the highest inspection-grade engineering standard enforced by Inspection Systems Direct (ISD).
All behaviors described herein are bounded, governed, auditable, and revocable by design.

## Rule
Each vector MUST have an adjacent `.expect.json` file declaring expected outcome:
- `{ "expect": "pass" }` for positive vectors
- `{ "expect": "fail" }` for negative vectors (expected enforcement failure)

Conformance PASSES when actual outcome matches expected outcome.

## Coverage
- Positives: analyze, build, deploy, observe, govern, modify
- Negatives: unknown intent class, modify missing rollback, build missing commands, govern invalid directive

## Evidence Artifacts
- .evidence/lari/lari.intent.conformance.report.json
- .evidence/lari/lari.intent.conformance.report.txt
- .evidence/lari/*.evidence.json
