# Runbook — Incorrect hard stop reported

## Detection

- BANE reports hard stop that operators/users dispute.
- Hard stops increase unexpectedly after deploy.

## Immediate mitigation

- Switch downstream policy to safer but less disruptive mode:
  - keep critical hazards hard-stop
  - increase reliance on alerts only (if available)
- Consider rollback if newly introduced.

## Verification

- Validate:
  - WeatherSignal severityIndex is within expected bounds.
  - Hazard set is correct.
  - Certainty and staleness flags are correctly carried.

## Post-incident

- Capture:
  - decision snapshot (severityIndex, hazards, certaintyScore)
  - policy that triggered
- Add regression tests for the disputed scenario.
