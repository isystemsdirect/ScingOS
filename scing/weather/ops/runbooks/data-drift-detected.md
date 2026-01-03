# Runbook — Data drift detected

## Detection
- Accuracy benchmarking indicates drift.
- Provider bias suspected (systematic over/under severity).

## Immediate mitigation
- Keep runtime decisions unchanged by accuracy metrics.
- Enable staging shadow comparisons to validate the drift.
- Consider lowering confidence for affected conditions via config (not code) if supported.

## Verification
- Confirm drift is real using fixed-time replay datasets.
- Confirm downstream decisions remain deterministic.

## Post-incident
- Document:
  - drift signature
  - impacted hazards/regions
  - mitigation steps
- Plan provider adjustment with dual-ingest transition.
