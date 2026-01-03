# Runbook — Provider outage

## Detection
- `ingest_success_rate` drops below SLO.
- Repeated HTTP failures or timeouts.
- Cache freshness drifting beyond max age thresholds.

## Immediate mitigation
- Reduce polling cadence.
- Enable secondary provider if available.
- If both providers failing:
  - Freeze ingest.
  - Continue serving last known signals.
  - Ensure downstream engines bias conservative under staleness.

## Verification
- Confirm cache freshness improves.
- Confirm no user-facing ops health messages are shown.
- Confirm hazard alert dedupe is stable (no alert storm).

## Post-incident
- Record provider incident window.
- Rotate keys if suspicion of compromise.
- Update rate-limit/backoff settings if needed.
