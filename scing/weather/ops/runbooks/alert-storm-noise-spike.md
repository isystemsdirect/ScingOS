# Runbook — Alert storm / noise spike

## Detection

- Sudden spike in alert notifications.
- Duplicate alerts not being suppressed.
- `alert_delivery_latency` increasing from queue/processing pressure.

## Immediate mitigation

- Enable stricter suppression for `info`/`caution` when certainty is low.
- Increase dedupe window.
- Temporarily rate-limit non-critical notifications.

## Verification

- Confirm critical alerts still deliver within SLO.
- Confirm duplicates suppressed deterministically.

## Post-incident

- Identify root cause:
  - provider schema change
  - normalization regression
  - incorrect dedupe key
- Add a regression scenario test.
