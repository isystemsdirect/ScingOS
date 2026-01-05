# ICB-02 — JURISDICTION & AUTHORITY RESOLUTION ENGINE

**STATUS:** CANONICAL / INHERITS ICB-01 / NON-OPTIONAL

---

## 1. PURPOSE

ICB-02 defines how SCINGULAR determines:

- Which laws apply
- Which authority controls
- Which code edition governs
- How conflicts are resolved
- When stricter rules override others

**THIS BLOCK IS THE LEGAL COMPASS OF THE INSPECTION SYSTEM.**

---

## 2. JURISDICTION IDENTIFICATION LOGIC

For every inspection, SCINGULAR SHALL identify:

- Physical location (geo-coordinates + civic address)
- Inspection domain(s)
- Property or site classification
- Permit or approval context
- Inspection trigger (routine, milestone, complaint, incident)

**JURISDICTION MUST BE RESOLVED BEFORE ANY INSPECTION LOGIC EXECUTES.**

---

## 3. AUTHORITY STACK (ORDER OF EVALUATION)

Authorities SHALL be evaluated in this sequence:

### LEVEL 1 — FEDERAL

- Occupational safety regulators
- Environmental protection regulators
- Housing authorities
- Aviation regulators (when aerial systems are used)

### LEVEL 2 — STATE

- State labor and safety agencies
- State environmental agencies
- State building code authorities
- State housing and health departments

### LEVEL 3 — LOCAL (AUTHORITY HAVING JURISDICTION)

- City or county building departments
- Fire marshal offices
- Local health departments
- Local ordinances and amendments

**LOCAL AUTHORITY OVERRIDES WHEN STRICTER.**

---

## 4. CODE & STANDARD SELECTION RULES

SCINGULAR SHALL:

- Apply ONLY legally adopted codes
- Apply the adopted edition year
- Apply all local amendments
- Apply incorporated reference standards

**UNADOPTED MODEL CODES SHALL NOT BE USED.**

---

## 5. CONFLICT RESOLUTION RULES

When multiple requirements apply:

- Rule 1: Life-safety > Environmental > Property > Administrative
- Rule 2: Stricter requirement prevails
- Rule 3: Local > State > Federal (when stricter)
- Rule 4: Statute overrides guidance
- Rule 5: Permit conditions override defaults

**ALL RESOLUTION DECISIONS SHALL BE LOGGED AND TRACEABLE.**

---

## 6. MULTI-DOMAIN INSPECTIONS

If an inspection spans multiple domains:

- Each domain is evaluated independently
- The most restrictive result controls
- Reports SHALL segment findings by domain

---

## 7. JURISDICTION CHANGE HANDLING

SCINGULAR SHALL support:

- Code adoption cycles
- Ordinance updates
- Emergency orders
- Boundary or annexation changes

Historical inspections SHALL remain tied to the authority in effect at time of inspection.

---

## 8. SYSTEM ENFORCEMENT

SCINGULAR SHALL:

- Block inspections without resolved jurisdiction
- Prevent user override of authority resolution
- Flag ambiguous jurisdiction for escalation
- Version all jurisdiction logic

---

END ICB-02
