# WCB-10 — Monitoring & SLOs

## 05) Monitoring

### Metrics (minimum)
- `ingest_success_rate`
- `ingest_latency_p95`
- `cache_freshness`
- `alert_delivery_latency`

### Rules
- Breaches trigger ops alerts (system health), not end-user alerts.
- End-user weather hazard alerts are a separate channel from ops health alerts.

## SLOs (example targets)
- 99.9% ingest success
- <30s critical alert delivery (from ingest to downstream availability)

## 06) Operational alerting (system health)

### Alert conditions
- Provider outage
- Repeated anomalies
- Stale cache beyond limits

### Rules
- Ops alerts never surface to end users.
- Ops alerts must include:
  - scope (environment)
  - impacted provider/component
  - last-known-good timestamp
  - mitigation suggestion
