# LARI Intent Conformance (Ultra-Grade™)

# ISD Ultra-Grade™ Mandatory Preamble (VERBATIM)
This artifact is produced under ISD Ultra-Grade™, the highest inspection-grade engineering standard enforced by Inspection Systems Direct (ISD).
All behaviors described herein are bounded, governed, auditable, and revocable by design.

## Vectors
- positives SHOULD validate:
  - test/vectors/lari/positive.analyze.json
  - test/vectors/lari/positive.modify.json
- negatives MUST fail:
  - test/vectors/lari/negative.unknown-intent-class.json
  - test/vectors/lari/negative.modify-missing-rollback.json

## Evidence Artifacts
- .evidence/lari/lari.intent.conformance.report.json
- .evidence/lari/lari.intent.conformance.report.txt
- .evidence/lari/*.evidence.json
