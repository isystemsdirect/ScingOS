## ScingOS File & Packaging Layer (.sg* formats)

### Overview

ScingOS uses a suite of proprietary file extensions—collectively `.sg*` formats—to represent native data types, enable optimal storage and audit, and drive deep integration across core engines (AI, legal, security, billing). This packaging layer sits between all major subsystems and is referenced consistently in AIP, BANE, Legal, and the frontend stack. All major flows should reference files by logical ID via the AIP protocol and apply runtime policies defined herein.

### Extension Catalog and Responsibilities

| Extension       | Purpose / Domain                         | Structure / Key Fields                                          | Primary Engine Ownership             |
|-----------------|------------------------------------------|-----------------------------------------------------------------|--------------------------------------|
| `.sga`          | Agent profile (for UI)                   | JSON/YAML manifest: name, model, capabilities, audit refs       | ScingOS client (UI), surfaces files  |
| `.sgu`          | User-side personalization                | JSON: user config, keys, preferences                            | ScingOS client (UI)                  |
| `.sgt`          | Task spec bundle (UI)                    | Assignment, status, references, agent links                     | ScingOS client (UI)                  |
| `.sgpck`        | Installable package                      | Manifest: features, licensing, version, audit references        | ScingOS client, LARI-Fi (billing)    |
| `.sguapp`       | App installer/update                     | App metadata, code refs, trust anchors                          | ScingOS client                       |
| `.sgm`          | Model (AI, analytic)                     | Model config, weights, provenance, version                      | SCINGULAR AI / LARI                  |
| `.sgd`          | Structured data / report sidecar         | Tabular data, snapshot, form data, headers                      | SCINGULAR AI / LARI                  |
| `.sgx`          | Memory bundle                            | Session memory, context, engine history                         | SCINGULAR AI / LARI                  |
| `.sgn`          | Data/inspection memory sidecar           | Related data, extracted fragments, session refs                 | SCINGULAR AI / LARI                  |
| `.sgk`          | Legal/contract bundle                    | Terms, license, jurisdiction, signature, audit                  | BANE + Legal engine                  |
| `.sge`          | Governing/entitlement artifact           | Jurisdiction tags, export control, ToU/contract refs            | BANE + Legal engine                  |
| `.sgi`          | Sensitive/regulated artifact             | Licensing, export control, security policy refs                 | BANE + Legal engine                  |

### Subsystem Mapping

- ScingOS client: understands `.sga`, `.sgu`, `.sgt`, `.sgpck`, `.sguapp`, and surfaces them in the frontend UI for selection, download, and display.
- SCINGULAR AI / LARI: consumes `.sgm`, `.sgd`, `.sgx`, `.sgn` as model, data, and memory inputs for inference and enrichment.
- BANE + Legal engine: controls the loading/gating of `.sgk`, `.sge`, and `.sgi` files, enforcing jurisdiction, ToU, and audit requirements.
- LARI-Fi (billing): ties entitlement/billing logic to `.sgpck` installs and `.sgm` model usage. Metadata in Firestore and internal state tracks version, licensing, jurisdiction, usage counters, and export status.

### API and Schema Guidance

- AIP Protocol: Messages reference files by logical ID rather than raw paths (e.g., `load_agent_profile(sga_id)`, `mount_model(sgm_id)`). All actions are logged/audited in the BANE engine.
- Firestore schema: Extend agent, model, package, and memory collections with:
  - `file_type` (e.g., `sga`, `sgm`)
  - `schema_version`
  - Security/financial flags corresponding to `.sgi`, `.sge`, and billing artifacts
- Legal Framework: Explicitly govern `.sge` and `.sgi` files for retention, export, jurisdiction, and ToU. List contract scope and reporting flows for each file type.
- Security/BANE: Policies define who can load `.sgk`, decrypt `.sge`, and mandate that all meaningful access or approval actions are signed/logged (SDR, WORM).

### Implementation Notes

- Implement a backend (and optionally frontend) "file-spec" library to read/write the JSON/YAML manifests and headers for `.sg*` files.
- Include MIME-type mappings and handlers so the client routes files to correct flows.
- For upgrades, begin by emitting `.sgd` and `.sgn` sidecar files (structured data/memory) with existing report exports (PDF, image sets), without altering universal file semantics.

### Versioning & Compliance

- Each file embeds a schema version; major changes may break compatibility.
- All engine actions on `.sg*` files should respect version, audit, and legal context.
- File operations must be signed/verified, with BANE audit IDs attached where applicable.

---

*This section canonizes the ScingOS File & Packaging Layer as a new architectural pillar. All future design, implementation, and operational flows must reference these definitions, with regular updates provided by the Architecture team.*