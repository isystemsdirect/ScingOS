# MCB-06 — OFFLINE OPERATION, FIELD RESILIENCE & DEGRADED-MODE MAPPING

**STATUS:** CANONICAL / INHERITS MCB-01 THROUGH MCB-05 / FEEDS ICB-04, ICB-05, ICB-19 / NON-OPTIONAL (ALL-INCLUSIVE MODE)

---

## 1. PURPOSE

MCB-06 defines how SCINGULAR:

- Maintains mapping integrity when connectivity is limited or lost
- Enables lawful inspection execution in the field
- Preserves jurisdictional correctness under degraded conditions
- Prevents unsafe or non-compliant operation while offline
- Ensures post-recovery reconciliation without data corruption

This block makes field operations reliable and defensible.

---

## 2. OPERATING MODES (CANONICAL)

SCINGULAR SHALL support the following map operating modes:

- **ONLINE** — Full connectivity; live boundary, overlay, and parcel resolution
- **DEGRADED** — Partial connectivity; limited refresh, cached validation
- **OFFLINE** — No connectivity; cache-only operation
- **LOCKED** — Connectivity restored but reconciliation pending

Mode SHALL be determined automatically and logged.

---

## 3. CACHE STRATEGY & PRE-FETCH RULES

Prior to field operations, SCINGULAR SHALL:

- Pre-fetch base map tiles
- Cache jurisdiction boundaries
- Cache authority overlays
- Cache risk and regulatory zones
- Cache parcel and zoning context where permitted

Cached data SHALL:

- Be versioned
- Include effective dates
- Include provenance metadata

---

## 4. OFFLINE MAPCONTEXT GENERATION

When offline or degraded:

- MapContext MAY be generated only from cached data
- Confidence scores SHALL be downgraded automatically
- controls.resolution_mode SHALL be set to strict
- escalation_required SHALL be evaluated

If required data is not cached:

- Inspection SHALL NOT start
- User SHALL be notified

---

## 5. RESTRICTED CAPABILITIES IN OFFLINE MODE

In offline or degraded mode, SCINGULAR SHALL:

- Block initiation of inspections requiring live authority confirmation
- Block inspections dependent on permit status changes
- Block enforcement actions requiring real-time authority notice
- Allow evidence capture and observation only when permitted

Legal safety overrides convenience.

---

## 6. EVIDENCE HANDLING WHILE OFFLINE

Offline evidence SHALL:

- Be time-stamped locally
- Be cryptographically hashed at capture
- Be queued for upload
- Preserve capture order

Evidence SHALL NOT be editable prior to sync.

---

## 7. RECONCILIATION & SYNC RULES

When connectivity is restored:

- MapContext SHALL be revalidated against live datasets
- Jurisdiction or overlay changes SHALL be detected
- Conflicts SHALL be flagged for human review
- controls.frozen SHALL remain until reconciliation completes

If material conflict exists:

- Inspection SHALL be paused
- Escalation SHALL occur

---

## 8. TEMPORAL BINDING

Offline inspections SHALL:

- Be bound to the dataset versions cached at time of execution
- Preserve temporal context for audits
- Avoid retroactive reinterpretation unless legally required

---

## 9. AUDIT & TRACEABILITY

MCB-06 SHALL:

- Log operating mode transitions
- Log cache versions used
- Preserve offline execution history
- Support replay and forensic analysis

---

## 10. SYSTEM ENFORCEMENT

SCINGULAR SHALL:

- Prevent silent offline execution
- Clearly label offline/degraded inspections
- Enforce conservative defaults
- Preserve full operational history

---

END MCB-06
