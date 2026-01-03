# MCB-01 — MAPCONTEXT CORE SCHEMA, NORMALIZATION & PROVENANCE

**STATUS:** CANONICAL / LOAD-FIRST (MAP LAYER) / FEEDS ICB PIPELINE / NON-OPTIONAL

---

## 1. PURPOSE

MCB-01 defines the foundational mapping object (“MapContext”) that the SCINGULAR mapping layer produces and the inspection layer consumes.

MapContext SHALL:

- Normalize all location inputs into a single canonical schema
- Preserve provenance (where the location data came from)
- Track confidence (how reliable the location resolution is)
- Provide immutable identifiers to bind inspections to geography
- Prevent downstream ICB logic from executing on ambiguous geography

MCB-01 does not decide inspection legality.
MCB-01 only produces jurisdiction-relevant geographic truth.

---

## 2. CORE PRINCIPLES

**PRINCIPLE A: SINGLE SOURCE OF GEOGRAPHIC TRUTH**

- Exactly one MapContext object SHALL be authoritative per inspection execution.

**PRINCIPLE B: IMMUTABLE AFTER RESOLUTION**

- Once MapContext is finalized for an inspection run, it SHALL NOT change.

**PRINCIPLE C: CONFIDENCE-DRIVEN SAFETY**

- Low-confidence geo resolution SHALL halt or require escalation.

**PRINCIPLE D: PROVENANCE IS MANDATORY**

- Every field in MapContext SHALL be attributable to a source and timestamp.

---

## 3. CANONICAL MAPCONTEXT OBJECT (REQUIRED FIELDS)

SCINGULAR SHALL produce MapContext as an immutable object containing:

```ts
MapContext {
  map_context_id                // unique immutable ID for this MapContext
  created_at_utc                // ISO timestamp
  created_by_actor              // system/user/service identity

  // --- RAW INPUTS ---
  input {
    input_type                  // gps | address | parcel | manual_pin | imported_gis | mixed
    raw_lat                      // optional
    raw_lon                      // optional
    raw_address_text             // optional
    raw_parcel_id                // optional
    raw_boundary_hint            // optional
    raw_source_refs[]            // optional: file IDs, API calls, dataset tags
  }

  // --- NORMALIZED GEOGRAPHY ---
  normalized {
    lat                          // required after normalization
    lon                          // required after normalization
    geohash                      // required
    altitude_m                   // optional
    horizontal_accuracy_m        // optional
    vertical_accuracy_m          // optional
  }

  // --- REVERSE GEOCODED ADDRESS (WHEN AVAILABLE) ---
  address {
    formatted                    // normalized formatted address
    street1
    street2
    city
    county
    state_province
    postal_code
    country
  }

  // --- PARCEL / CADASTRAL CONTEXT (WHEN AVAILABLE) ---
  parcel {
    parcel_id
    parcel_source               // county assessor / GIS dataset name
    centroid_lat
    centroid_lon
    parcel_polygon_ref          // pointer to geometry storage
    land_use_class              // residential | commercial | industrial | agricultural | mixed | unknown
  }

  // --- PROVENANCE & DATA SOURCES ---
  provenance {
    geocode_provider            // provider name/version
    reverse_geocode_provider
    parcel_provider
    gis_layers_provider
    datasets[]                  // dataset identifiers + version tags
    retrieval_timestamps_utc[]  // timestamps per source pull
  }

  // --- CONFIDENCE & QUALITY ---
  confidence {
    geocode_confidence_score     // 0.0 - 1.0
    address_confidence_score     // 0.0 - 1.0
    parcel_match_confidence      // 0.0 - 1.0
    boundary_match_confidence    // 0.0 - 1.0
    overall_confidence_score     // 0.0 - 1.0
    confidence_notes[]           // reasons for low confidence
  }

  // --- BOUNDARY MEMBERSHIP PLACEHOLDERS (FILLED BY MCB-02+) ---
  boundaries {
    country_id
    state_id
    county_id
    city_id
    special_district_ids[]       // fire district, watershed, utility, etc.
  }

  // --- OVERLAY INTERSECTIONS PLACEHOLDERS (FILLED BY MCB-04+) ---
  overlays {
    zoning_ids[]
    floodplain_ids[]
    wildfire_zone_ids[]
    environmental_zone_ids[]
    critical_infrastructure_ids[]
  }

  // --- MAP ENGINE EXECUTION CONTROLS ---
  controls {
    resolution_mode              // strict | balanced | permissive
    allow_low_confidence         // boolean (default false)
    escalation_required          // boolean
    escalation_reason            // if escalation_required true
    frozen                        // boolean; once true MapContext is immutable
  }

  // --- AUDIT LOG ANCHOR ---
  audit {
    map_context_hash             // trust anchor hash of serialized MapContext
    access_log_ref               // pointer to immutable access log stream
  }
}
```

---

## 4. NORMALIZATION RULES (INPUT → CANONICAL)

MCB-01 SHALL normalize inputs using these rules:

**RULE 1: LAT/LON REQUIRED AFTER NORMALIZATION**

- If input is address-only, reverse geocode to lat/lon.
- If input is parcel-only, use parcel centroid lat/lon.

**RULE 2: ACCURACY CAPTURE WHEN AVAILABLE**

- GPS accuracy SHALL be captured if device provides it.

**RULE 3: ADDRESS STANDARDIZATION**

- Normalize address strings (case, abbreviations, formatting).

**RULE 4: PARCEL LINKING**

- If parcel ID provided, retrieve parcel centroid and polygon ref.
- If parcel ID not provided, attempt parcel lookup by address if supported.

**RULE 5: GEOHASH REQUIRED**

- Compute geohash from normalized lat/lon for quick indexing.

**RULE 6: SOURCE ATTRIBUTION REQUIRED**

- Every derived field SHALL include provenance references.

---

## 5. CONFIDENCE SCORING & HALT CONDITIONS

MCB-01 SHALL compute confidence scores and enforce halt logic:

**HARD HALT CONDITIONS (INSPECTION CANNOT START):**

- normalized.lat or normalized.lon missing
- overall_confidence_score < 0.60 (strict mode default)
- boundary_match_confidence < 0.60 when boundaries are required
- parcel required for inspection type but parcel_match_confidence < threshold

**SOFT HALT / ESCALATION CONDITIONS:**

- overall_confidence_score between 0.60 and 0.75
- address_confidence_score low but GPS high
- boundary ambiguity detected (near border, conflicting layers)

When halt or escalation occurs:

- controls.escalation_required = true
- controls.escalation_reason MUST be set
- ICB execution SHALL NOT proceed until resolved

---

## 6. IMMUTABILITY & FREEZE RULES

Once MapContext is finalized:

- controls.frozen SHALL be set true
- map_context_hash SHALL be computed and stored
- any attempted mutation SHALL be blocked and logged

MapContext immutability is a legal defensibility requirement.

---

## 7. MAPCONTEXT → ICB BINDING CONTRACT

ICB engine SHALL accept only:

- A single frozen MapContext per inspection run
- A MapContext with acceptable confidence thresholds
- A MapContext with complete provenance

ICB engine SHALL:

- Bind InspectionContext to map_context_id
- Store map_context_hash alongside report IDs
- Include map_context_id in report metadata

---

## 8. AUDIT & TRACEABILITY REQUIREMENTS

MCB-01 SHALL ensure:

- Every MapContext is attributable
- Every MapContext is reproducible (same inputs → same outputs where deterministic)
- All map queries and dataset pulls are logged
- All confidence decisions are recorded

---

## 9. SYSTEM ENFORCEMENT

SCINGULAR SHALL:

- Reject non-normalized location inputs
- Reject non-attributed geodata
- Block inspections on ambiguous geography
- Preserve MapContext permanently under retention rules
- Expose MapContext to auditors as read-only truth

---

END MCB-01
