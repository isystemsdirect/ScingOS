# MCB-07 — GIS EVIDENCE BINDING, SPATIAL TRACEABILITY & LOCATION-ANCHORED PROOF

**STATUS:** CANONICAL / INHERITS MCB-01 THROUGH MCB-06 / FEEDS ICB-05, ICB-09, ICB-23 / NON-OPTIONAL (ALL-INCLUSIVE MODE)

---

## 1. PURPOSE

MCB-07 defines how SCINGULAR:

- Spatially binds inspection evidence to geography
- Anchors proof to physical location
- Enables map-based traceability and replay
- Strengthens legal defensibility of findings
- Prevents evidence misuse or misattribution

This block turns maps into evidence anchors.

---

## 2. EVIDENCE–LOCATION BINDING PRINCIPLES

All evidence SHALL be:

- Linked to a frozen MapContext (MCB-01)
- Associated with precise spatial coordinates
- Time-synchronized with capture events
- Immutable once bound

Unbound evidence is invalid for official findings.

---

## 3. SUPPORTED EVIDENCE TYPES

MCB-07 SHALL support spatial binding for:

- Photographs
- Video recordings
- Audio recordings
- Sensor measurements
- Environmental samples
- Inspector annotations
- Drone and aerial imagery (where authorized)

Each type SHALL follow type-specific rules.

---

## 4. SPATIAL METADATA REQUIREMENTS

Each evidence item SHALL include:

```ts
SpatialMetadata {
  evidence_id
  map_context_id
  capture_lat
  capture_lon
  capture_altitude_m (if available)
  horizontal_accuracy_m
  capture_timestamp_utc
  capture_device_id
  capture_method          // handheld, fixed, drone, sensor, imported
  zone_refs[]             // flood, wildfire, environmental, etc.
  parcel_ref              // when applicable
}
```

Missing required metadata invalidates the evidence.

---

## 5. MAP PINNING & GEOMETRY ASSOCIATION

SCINGULAR SHALL:

- Place evidence pins on map views
- Allow association to parcel polygons or structures
- Support line or area geometries for extended features
- Preserve original geometry data

Visualization SHALL NOT modify source data.

---

## 6. DRONE & AERIAL EVIDENCE CONTROLS

When aerial methods are used:

- Authorization SHALL be verified (ICB-08)
- Flight metadata SHALL be recorded
- Altitude and coverage SHALL be logged
- Restricted airspace SHALL be respected

Unauthorized aerial evidence SHALL be flagged.

---

## 7. ZONE & CONTEXT INHERITANCE

Spatial evidence SHALL automatically inherit:

- Jurisdiction context (MCB-02)
- Authority overlays (MCB-03)
- Risk and regulatory zones (MCB-04)
- Parcel context (MCB-05)

This inheritance SHALL be immutable.

---

## 8. TAMPER PREVENTION & INTEGRITY

MCB-07 SHALL:

- Hash evidence at capture
- Bind hash to spatial metadata
- Detect location tampering
- Detect timestamp manipulation

Integrity violations SHALL:

- Invalidate evidence
- Be logged
- Trigger escalation

---

## 9. AUDIT, REPLAY & FORENSICS

SCINGULAR SHALL support:

- Map-based replay of inspections
- Evidence filtering by location and time
- Forensic reconstruction of inspection paths
- Export of spatial evidence for proceedings

All replay SHALL use original data only.

---

## 10. SYSTEM ENFORCEMENT

SCINGULAR SHALL:

- Block report issuance without spatially bound evidence (when required)
- Prevent evidence detachment from MapContext
- Preserve GIS-evidence linkage permanently
- Expose spatial proof to auditors and authorities

---

END MCB-07
