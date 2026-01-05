# MCB-02 — POLITICAL, ADMINISTRATIVE & SPECIAL-JURISDICTION RESOLUTION

**STATUS:** CANONICAL / INHERITS MCB-01 / FEEDS ICB-02, ICB-03, ICB-13 / NON-OPTIONAL

---

## 1. PURPOSE

MCB-02 defines how SCINGULAR:

- Resolves political and administrative jurisdictions
- Identifies Authorities Having Jurisdiction (AHJ)
- Determines overlapping and special districts
- Produces jurisdictional truth from geography
- Prevents inspections from executing under the wrong authority

This block is the jurisdiction truth engine.

---

## 2. JURISDICTION CLASSES (CANONICAL)

SCINGULAR SHALL resolve the following classes:

**Primary political:**

- Country
- State / Province
- County / Parish
- City / Municipality / Township

**Special / functional districts:**

- Fire protection districts
- Emergency response districts
- Health department regions
- Environmental or watershed districts
- Utility service districts
- Flood control districts
- School districts (when relevant)
- Special regulatory zones created by law

Multiple districts may overlap.

---

## 3. RESOLUTION INPUTS

MCB-02 SHALL consume:

- Frozen MapContext from MCB-01
- Normalized lat/lon
- Parcel polygon (when available)
- Boundary layer datasets (versioned)

Boundary datasets SHALL be:

- Source-attributed
- Versioned
- Date-effective

---

## 4. RESOLUTION LOGIC

For each jurisdiction class:

- Perform point-in-polygon check using normalized lat/lon
- If parcel polygon exists, perform polygon intersection
- Resolve primary membership
- Detect overlaps or boundary proximity

If multiple candidates exist:

- Select governing jurisdiction per law
- Flag ambiguity when unresolved

---

## 5. EDGE CASE HANDLING

MCB-02 SHALL handle:

- Boundary-adjacent locations
- Annexed or de-annexed parcels
- Recently incorporated municipalities
- Split parcels across boundaries
- Temporary jurisdictional changes

Edge cases SHALL:

- Reduce confidence scores
- Trigger escalation when required

---

## 6. OUTPUT STRUCTURE (BOUNDARIES OBJECT)

MCB-02 SHALL populate:

```ts
MapContext.boundaries {
  country_id
  state_id
  county_id
  city_id
  special_district_ids[] {
    district_id
    district_type
    governing_authority
  }
}
```

Each ID SHALL:

- Reference a canonical jurisdiction registry
- Include dataset source and version
- Include effective date

---

## 7. CONFIDENCE & VALIDATION

Boundary confidence SHALL be calculated using:

- Dataset resolution
- Boundary age
- Distance from boundary edges
- Parcel vs point agreement

Low confidence SHALL:

- Set escalation_required = true
- Block ICB execution until resolved

---

## 8. TEMPORAL VALIDITY

Jurisdictions SHALL be applied based on:

- Effective dates of boundaries
- Inspection execution date
- Permit or enforcement date where required

Retroactive application is prohibited unless required by law.

---

## 9. AUDIT & TRACEABILITY

MCB-02 SHALL:

- Log all boundary queries
- Preserve jurisdiction membership decisions
- Record dataset versions used
- Bind jurisdiction results to map_context_id

---

## 10. SYSTEM ENFORCEMENT

SCINGULAR SHALL:

- Block inspections without resolved primary jurisdiction
- Prevent manual jurisdiction override
- Flag conflicting boundary results
- Preserve jurisdiction history permanently

---

END MCB-02
