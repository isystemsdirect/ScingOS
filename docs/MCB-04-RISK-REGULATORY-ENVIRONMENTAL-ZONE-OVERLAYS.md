# MCB-04 — RISK, REGULATORY & ENVIRONMENTAL ZONE OVERLAYS

**STATUS:** CANONICAL / INHERITS MCB-01 THROUGH MCB-03 / FEEDS ICB-04, ICB-06, ICB-07, ICB-13 / NON-OPTIONAL

---

## 1. PURPOSE

MCB-04 defines how SCINGULAR:

- Identifies risk-based and regulatory zones tied to location
- Activates additional inspection requirements
- Elevates risk scoring and enforcement urgency
- Injects zone-specific rules into the ICB pipeline
- Prevents omission of geographically triggered obligations

This block makes geography operationally meaningful.

---

## 2. ZONE CLASSES (CANONICAL)

SCINGULAR SHALL resolve the following zone types when data is available:

**Life-safety & natural hazard zones:**

- Floodplains (all designations)
- Wildfire risk zones
- Seismic zones
- High-wind / hurricane zones
- Landslide or subsidence zones

**Environmental & regulatory zones:**

- Wetlands and protected waters
- Environmental protection areas
- Brownfields / contaminated sites
- Coastal management zones
- Drinking water protection zones

**Infrastructure & critical zones:**

- Critical infrastructure buffers
- Transportation corridors
- Utility easements
- Hazardous material proximity zones

---

## 3. INPUTS & DATA SOURCES

MCB-04 SHALL consume:

- Frozen MapContext (MCB-01)
- Jurisdiction boundaries (MCB-02)
- Authority overlays (MCB-03)
- GIS zone datasets (versioned and source-attributed)

Zone datasets SHALL be:

- Authoritative
- Versioned
- Date-effective

---

## 4. INTERSECTION & RESOLUTION LOGIC

For each zone type:

- Perform point-in-polygon intersection using normalized lat/lon
- If parcel polygon exists, perform polygon intersection
- Resolve zone membership
- Detect partial or edge intersections

Multiple zones may apply simultaneously.

---

## 5. ZONE EFFECTS ON INSPECTION LOGIC

When a zone applies, SCINGULAR SHALL:

- Activate additional inspection checklist items
- Require zone-specific documentation
- Elevate baseline risk scoring
- Modify enforcement timelines where required
- Trigger specialized authority involvement

MCB-04 declares zones.
ICBs decide consequences.

---

## 6. OUTPUT STRUCTURE (OVERLAYS OBJECT)

MCB-04 SHALL populate:

```ts
MapContext.overlays {
  zoning_ids[]
  floodplain_ids[] {
    zone_code
    regulatory_authority
    effective_date
  }
  wildfire_zone_ids[]
  environmental_zone_ids[]
  critical_infrastructure_ids[]
}
```

Each entry SHALL:

- Reference a canonical zone registry
- Include dataset source and version
- Include effective dates

---

## 7. CONFIDENCE & ESCALATION

Zone confidence SHALL account for:

- Dataset resolution
- Boundary precision
- Parcel vs point agreement

Low confidence SHALL:

- Trigger escalation
- Require human review
- Block zone-dependent enforcement until resolved

---

## 8. TEMPORAL APPLICABILITY

Zone rules SHALL apply based on:

- Zone designation effective date
- Inspection execution date
- Permit or enforcement date where required

Expired or future zones SHALL NOT apply.

---

## 9. AUDIT & TRACEABILITY

MCB-04 SHALL:

- Log all zone intersections
- Preserve dataset identifiers
- Bind zone results to map_context_id
- Support replay and verification

---

## 10. SYSTEM ENFORCEMENT

SCINGULAR SHALL:

- Prevent omission of applicable zones
- Block inspections when critical zone data is missing
- Preserve zone history permanently
- Expose zone context to auditors and reports

---

END MCB-04
