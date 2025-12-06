# SCINGULAR Proprietary File Extension Specification

**Status:** Internal design specification  
**Owner:** Inspection Systems Direct LLC (ISD)  
**Scope:** SCINGULAR OS / ScingOS, SCINGULAR AI, LARI, BANE, AIP, and SCINGULAR-native apps.

---

## 1. Purpose

SCINGULAR OS uses a family of proprietary `.sg*` file extensions to:

- Represent SCINGULAR-native data structures (inspections, AI artifacts, social objects, logs).  
- Enable deep OS-level understanding (type, version, security sensitivity, and engine ownership).  
- Support cross-device synchronization, AIP streaming, and WORM-style audit behavior.

This specification defines the core `.sg*` extensions, their semantics, and how the OS and engines should handle them.

---

## 2. Naming Convention and General Rules

- All SCINGULAR-native file formats use the prefix: **`.sg`**  
- A short suffix indicates the **domain** or **engine** (e.g., `.sgai`, `.sgos`, `.sglog`).  
- Each file embeds:
  - A **type header** (magic bytes or JSON/YAML header).
  - A **version** (semantic versioning, e.g., `1.2.0`).
  - A **provenance block** referencing BANE audit IDs where applicable.

The OS must:

- Refuse to open or must sandbox files with invalid or missing headers.  
- Route files to the correct engine (LARI, SCING, BANE, Social, etc.) based on the suffix + internal type header, not the suffix alone.

---

## 3. Core Extension Families

### 3.1 AI and Analytics Formats

#### 3.1.1 `.sgai` – SCINGULAR AI Artifact

Represents AI-generated artifacts and intermediate reasoning outputs.

**Examples:**

- Inspection analysis summaries.  
- Code interpretation snippets.  
- LARI sub-engine outputs (VISION, MAPPER, GUARDIAN, NARRATOR, etc.).

**Required fields (conceptual):**

- `type` – e.g., `inspection.analysis`, `code.assist`, `social.moderation`.  
- `engine` – e.g., `LARI-VISION`, `LARI-MAPPER`, `LARI-GUARDIAN`.  
- `version` – schema version.  
- `source` – references to input files (photos, LiDAR, sensor data).  
- `bane_audit_id` – link to BANE WORM record when applicable.

#### 3.1.2 `.sgml` – Model and Inference Metadata

Represents model configuration and inference context.

**Usage:**

- Caching model selection decisions.  
- Recording prompt templates, safety rules, and runtime parameters per workflow.  

---

### 3.2 OS and Workspace Formats

#### 3.2.1 `.sgos` – SCINGULAR OS Workspace

Represents a workspace on a device or across devices.

**Contains:**

- Open inspections and dashboards.  
- Window/layout metadata.  
- Active devices and adapters bound to this workspace.  
- User + org identifiers, jurisdiction, and feature flags.

Used for:

- Restoring state across sessions and devices.  
- Enabling “resume where you left off” behavior via AIP streaming.

#### 3.2.2 `.sgwp` – Work Package

A portable work unit (e.g., inspection job bundle) combining:

- Forms, media references, AI artifacts, and assignment metadata.  
- Status (assigned, in-progress, completed).  
- Permissions and sharing controls.

Intended for:

- Dispatch and offline workflows.  
- Export/import between organizations under controlled conditions.

---

### 3.3 Security and Audit Formats

#### 3.3.1 `.sglog` – BANE Audit Log Segment

Represents an append-only segment of BANE’s WORM audit log.

**Characteristics:**

- Signed and tamper-evident.  
- May be stored locally, then synchronized.  
- Contains references to actions across other `.sg*` files (e.g., `.sgai`, `.sgwp`, `.sgos`).

Engines should **never** mutate `.sglog` files; only append via controlled processes.

#### 3.3.2 `.sgsec` – Security Policy Bundle

Represents a set of security and policy rules consumed by BANE and LARI-LEGAL.

**Contents:**

- Capability definitions.  
- Jurisdiction/sector-specific rules.  
- Mappings from product plans and contracts to feature gates.

Used by:

- BANE at runtime to enforce zero-trust rules.  
- LARI-LEGAL to inform legal compliance decisions.

---

### 3.4 Data and Content Formats

#### 3.4.1 `.sgdata` – Structured Data Container

A generic structured data envelope for:

- Inspection form snapshots.  
- Telemetry and sensor readings.  
- Tabular data used by analytics engines.

Backed internally by JSON, Avro, Parquet, or similar, with SCINGULAR-specific headers.

#### 3.4.2 `.sgmedia` – Media Manifest

Does not store raw media, but a manifest describing:

- Linked photos, videos, LiDAR point clouds, thermal images, and audio.  
- Storage locations (local path, cloud object keys).  
- Integrity hashes and BANE audit references.

---

### 3.5 Application and Social Formats

#### 3.5.1 `.sgapp` – SCINGULAR App Package

Represents an installable or updatable SCINGULAR-native app or module.

**Includes:**

- App metadata (name, version, permissions, required engines).  
- Code bundles or references (e.g., WASM, JS, native modules).  
- Signature and trust information (BANE/BFI trust anchors).

#### 3.5.2 `.sgsoc` – Social Object

Represents a social object in the SCINGULAR Social ecosystem:

- Posts, comments, threads, reactions, or shared inspection artifacts.  
- References to originating inspections or `.sgai` artifacts when applicable.  
- Privacy and visibility settings.

---

## 4. Versioning and Compatibility

- All `.sg*` formats must include a **schema version**.  
- Backwards compatibility rules:
  - Minor version increases (`1.1.0` → `1.2.0`) should be read by older clients where feasible.  
  - Major version changes (`1.x` → `2.x`) may break compatibility; migration tools should be provided.

AIP must be capable of:

- Negotiating supported versions between device and cloud.  
- Rejecting or isolating files with incompatible versions.

---

## 5. Engine Responsibilities

### 5.1 LARI

- Produces and consumes `.sgai`, `.sgml`, `.sgdata`, `.sgmedia`.  
- Must always include provenance fields linking back to source data and BANE logs.

### 5.2 SCING

- Orchestrates user interaction with `.sgos`, `.sgwp`, `.sgsoc`.  
- Surfaces appropriate information from `.sglog` and `.sgsec` when needed (e.g., for legal notices or security prompts).

### 5.3 BANE

- Owns `.sglog` and `.sgsec`.  
- Verifies integrity and signatures of `.sg*` files where required.  
- Coordinates with LARI-LEGAL to attach policy and legal context to actions.

---

## 6. Implementation Guidance

- Implement file-type detection based on **internal headers**, not suffix alone.  
- Treat all `.sg*` files as potentially sensitive; apply encryption and access controls according to their classification.  
- Provide export bridges to standard formats (e.g., JSON, CSV, PDF) where contractually permitted, without leaking licensed or proprietary data.

---

## 7. Versioning

- Version: 1.0.0  
- Source Blueprint: SCINGULAR Proprietary File Extension Specification (internal Space document).  
- Last Updated: December 6, 2025  
- Maintainers: SCINGULAR OS Architecture team
