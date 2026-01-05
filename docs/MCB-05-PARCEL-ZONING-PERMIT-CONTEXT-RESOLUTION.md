# MCB-05 — PARCEL, ZONING & PERMIT CONTEXT RESOLUTION

**STATUS:** CANONICAL / INHERITS MCB-01 THROUGH MCB-04 / FEEDS ICB-04, ICB-07, ICB-08, ICB-09, ICB-13 / NON-OPTIONAL

---

## 1. PURPOSE

MCB-05 defines how SCINGULAR:

- Resolves parcel-level context
- Interprets zoning and land-use constraints
- Associates permits and approvals to a location
- Determines inspection scope boundaries
- Prevents inspections from exceeding lawful parcel authority

This block binds inspections to property reality.

---

## 2. PARCEL IDENTIFICATION

SCINGULAR SHALL:

- Resolve parcel ID from MapContext when available
- Validate parcel geometry and centroid
- Identify parcel authority source (assessor/GIS)
- Detect split or merged parcels

Parcel data SHALL be source-attributed and versioned.

---

## 3. PARCEL CLASSIFICATION

Each parcel SHALL be classified as:

- Residential
- Commercial
- Industrial
- Agricultural
- Mixed-use
- Public / Government
- Undetermined

Classification SHALL inform:

- Inspection domain eligibility
- Credential requirements
- Checklist activation

---

## 4. ZONING RESOLUTION

SCINGULAR SHALL:

- Identify zoning designation(s)
- Resolve zoning authority
- Capture allowed, conditional, and prohibited uses
- Identify overlay zoning districts when present

Zoning data is contextual — not all zoning rules are inspection rules.

---

## 5. PERMIT & APPROVAL CONTEXT

When permit data is available, SCINGULAR SHALL:

- Link permits to parcel
- Identify permit type and scope
- Capture permit status (active, expired, closed)
- Identify inspection milestones
- Capture variance or condition references

Permit data SHALL override default inspection assumptions within its scope.

---

## 6. SCOPE CONSTRAINT LOGIC

SCINGULAR SHALL:

- Constrain inspection scope to parcel boundaries
- Prevent inspection of adjacent parcels without authority
- Restrict checklist items based on zoning and permit scope

Out-of-scope actions SHALL be blocked.

---

## 7. MULTI-PARCEL & SHARED FACILITY HANDLING

When inspections span multiple parcels:

- Each parcel SHALL have distinct context
- Shared facilities SHALL be identified
- Authority scope SHALL be verified per parcel

---

## 8. CONFIDENCE & ESCALATION

Parcel or permit ambiguity SHALL:

- Reduce confidence score
- Trigger escalation
- Block permit-dependent inspections until resolved

---

## 9. OUTPUT STRUCTURE

MCB-05 SHALL populate:

```ts
MapContext.parcel {
  parcel_id
  parcel_source
  land_use_class
  zoning_ids[]
  permit_refs[] {
    permit_id
    permit_type
    permit_status
    scope_notes
  }
}
```

---

## 10. AUDIT & TRACEABILITY

SCINGULAR SHALL:

- Preserve parcel and permit linkages
- Log data sources and timestamps
- Bind parcel context to map_context_id
- Support audit replay

---

## 11. SYSTEM ENFORCEMENT

SCINGULAR SHALL:

- Block inspections without required parcel context
- Prevent unauthorized scope expansion
- Preserve parcel history permanently
- Expose parcel context to reports and auditors

---

END MCB-05
