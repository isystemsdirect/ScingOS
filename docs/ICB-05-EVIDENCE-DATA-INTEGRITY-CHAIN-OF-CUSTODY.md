# ICB-05 — EVIDENCE, DATA INTEGRITY & CHAIN-OF-CUSTODY

**STATUS:** CANONICAL / INHERITS ICB-01 THROUGH ICB-04 / NON-OPTIONAL

---

## 1. PURPOSE

ICB-05 defines how SCINGULAR captures, validates, stores, and protects inspection evidence so that it is:

- Legally defensible
- Audit-grade
- Tamper-evident
- Court-admissible

---

## 2. EVIDENCE CLASSES (CANONICAL)

Evidence SHALL be classified as:

- Photo
- Video
- Audio
- Measurement
- Sensor data
- Document
- Sample / lab result
- Inspector note

Each class has distinct validation rules.

---

## 3. EVIDENCE CAPTURE RULES

All evidence SHALL:

- Be time-stamped
- Be geo-tagged where applicable
- Be bound to inspection ID
- Be bound to checklist item
- Identify capturing agent

**EVIDENCE WITHOUT METADATA IS INVALID.**

---

## 4. PHOTO & VIDEO REQUIREMENTS

Photo/Video SHALL:

- Preserve original resolution
- Prohibit post-capture alteration
- Retain EXIF or equivalent metadata
- Allow annotation WITHOUT modifying original

Annotations SHALL be stored as overlays.

---

## 5. MEASUREMENT & SENSOR DATA

Measurements SHALL:

- Identify instrument used
- Include calibration status
- Include unit of measure
- Record environmental context

Unverified instrument data SHALL be flagged.

---

## 6. SAMPLES & LAB RESULTS

When samples are collected:

- Chain-of-custody is mandatory
- Collection time/location recorded
- Handling transfers logged
- Laboratory attribution required

**BROKEN CHAIN INVALIDATES RESULTS.**

---

## 7. INSPECTOR NOTES

Notes SHALL:

- Be factual and observational
- Avoid opinions or design advice
- Be time-locked once report is issued

Notes are discoverable records.

---

## 8. DATA STORAGE & IMMUTABILITY

SCINGULAR SHALL:

- Store originals immutably
- Version any derivative data
- Log all access events
- Prevent deletion

Data retention SHALL follow law.

---

## 9. AUDIT & DISCOVERY READINESS

All data SHALL be:

- Searchable
- Exportable
- Traceable
- Timestamp-verifiable

**NO “INTERNAL ONLY” DATA EXEMPTION EXISTS.**

---

## 10. SYSTEM ENFORCEMENT

SCINGULAR SHALL:

- Reject invalid evidence
- Flag integrity violations
- Block report issuance if evidence rules fail
- Preserve full audit trail

---

END ICB-05
