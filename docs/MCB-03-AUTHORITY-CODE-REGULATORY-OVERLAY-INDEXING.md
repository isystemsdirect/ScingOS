# MCB-03 — AUTHORITY, CODE & REGULATORY OVERLAY INDEXING

**STATUS:** CANONICAL / INHERITS MCB-01, MCB-02 / FEEDS ICB-02, ICB-03, ICB-04, ICB-06, ICB-07 / NON-OPTIONAL

---

## 1. PURPOSE

MCB-03 defines how SCINGULAR:

- Maps resolved jurisdictions to governing authorities
- Determines which code families and regulators apply
- Indexes adopted code editions and amendments
- Establishes the authority-to-code linkage used by ICB logic
- Prevents application of non-adopted or incorrect standards

This block binds place to power.

---

## 2. AUTHORITY CLASSES (CANONICAL)

For each resolved jurisdiction, SCINGULAR SHALL identify regulatory authorities:

- Building / Construction Authority
- Fire Authority
- Health Authority
- Environmental Authority
- Occupational Safety Authority
- Housing Authority
- Zoning / Planning Authority

Each authority SHALL be identified by:

- Legal name
- Authority type
- Governing jurisdiction
- Enforcement scope

---

## 3. CODE FAMILY CLASSES (CANONICAL)

SCINGULAR SHALL index the following code families when adopted:

- Building (e.g., structural, residential)
- Fire & Life Safety
- Electrical
- Mechanical
- Plumbing
- Energy Conservation
- Property Maintenance
- Environmental / Health
- Occupational Safety
- Housing Quality / Habitability
- Zoning / Land Use (informational)

Only adopted families may be applied.

---

## 4. ADOPTION & EDITION RESOLUTION

For each authority and code family, SCINGULAR SHALL determine:

- Whether the code family is adopted
- The adopted edition year
- All local amendments
- Effective and sunset dates
- Incorporated reference standards

Unadopted or expired editions SHALL NOT be used.

---

## 5. OVERLAY INDEX STRUCTURE (CANONICAL)

MCB-03 SHALL produce an overlay index:

```ts
AuthorityCodeOverlayIndex {
  authority_id
  authority_type
  jurisdiction_id
  enforcement_scope

  code_families[] {
    family_name
    adopted                // true/false
    edition_year
    amendments_ref
    incorporated_standards[]
    effective_date
    sunset_date
  }
}
```

Each entry SHALL include source attribution and dataset version identifiers.

---

## 6. MULTI-AUTHORITY & OVERLAP HANDLING

When multiple authorities apply:

- Each authority SHALL be indexed separately
- Overlapping enforcement SHALL be preserved
- Conflict resolution is deferred to ICB-02

MCB-03 does not decide precedence.
MCB-03 only declares applicability.

---

## 7. TEMPORAL APPLICABILITY RULES

SCINGULAR SHALL apply:

- Codes effective on inspection date
- Emergency orders during their active period
- Permit-specific adoptions when applicable

Retroactive application is prohibited unless required by law.

---

## 8. CONFIDENCE & VALIDATION

MCB-03 SHALL validate:

- Authority existence
- Adoption evidence
- Edition accuracy
- Amendment completeness

Missing or ambiguous adoption data SHALL:

- Reduce confidence scores
- Trigger escalation
- Block ICB execution if unresolved

---

## 9. OUTPUT BINDING

MCB-03 output SHALL:

- Bind to map_context_id
- Bind to jurisdiction identifiers
- Feed directly into InspectionContext
- Be immutable once finalized

ICB engine SHALL consume this index as authoritative input.

---

## 10. AUDIT & TRACEABILITY

SCINGULAR SHALL:

- Log authority and code resolution steps
- Preserve adoption sources
- Record dataset versions and timestamps
- Support replay for audits and disputes

---

## 11. SYSTEM ENFORCEMENT

SCINGULAR SHALL:

- Block use of unadopted codes
- Prevent manual authority substitution
- Flag conflicting adoption records
- Preserve overlay history permanently

---

END MCB-03
