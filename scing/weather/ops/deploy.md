# WCB-10 — Deployment, Operations & Lifecycle

## 01) Environment strategy

### Environments
- **dev**
  - Mocked providers optional.
  - Aggressive logging.
  - Fast polling allowed.
- **staging**
  - Real providers.
  - Production-like polling.
  - Shadow comparisons enabled.
- **prod**
  - Conservative polling.
  - Strict rate limits.
  - Full audit logging.

### Rules
- No cross-environment data sharing.
- WeatherSignal schema versions must match across environments before promotion.

## 02) Secrets & config management

### Rules
- Provider keys live in a secure secrets store (environment variables injected by the platform, or a secrets manager).
- No secrets in repo, logs, or client bundles.
- Rotate keys on schedule and immediately on incident.

### Config-only controls
- Thresholds, polling intervals, and overrides are config-only.
- Config changes require approval + change log entry.

## 03) Deployment & rollout (staging → prod)

### Staging deploy
1. Deploy to staging.
2. Enable **shadow ingest** (no downstream effect).
3. Validate:
   - normalization correctness
   - severity deltas within expected bounds
   - alert behavior (dedupe, escalation, suppression)

### Production rollout
1. Deploy the same build artifact/version to prod.
2. Enable downstream usage gradually via a **feature flag**.
3. Monitor SLOs and ops health alerts during the ramp.

### Rules
- Never deploy provider changes or severity math changes directly to prod without staging shadow validation.
- Rollout must be reversible within one command.

## 04) Rollback strategy

### Rules
- Keep last known-good WeatherSignal schema + logic.
- Rollback actions:
  - Stop new ingest.
  - Revert to previous version.
  - Retain historical data.
- Rollback must not erase audit logs.

### One-command rollback (operator intent)
- Operators must have a single documented command in the deployment system that:
  - disables ingest and/or downstream consumption feature flag, and
  - reverts to the previously deployed version.

## 08) Cost & rate-limit control (operational posture)

### Rules
- Centralized rate limiter per provider.
- Backoff on HTTP 429.
- Cache-first reads for downstream engines.
- Monthly usage report generated.

### Actions
- Adjust polling cadence if costs exceed budget.
- Add secondary provider only if justified by reliability needs.
