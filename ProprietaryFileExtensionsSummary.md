## SCINGULAR Proprietary File Extensions – Executive Summary

The SCINGULAR `.sg*` file family is the official object model for ScingOS and the SCINGULAR AI platform. It standardizes how modules, agents, models, data, memory, identity, and app bundles are serialized, encrypted, versioned, and governed across the ecosystem, while continuing to use universal formats (PDF, DOCX, JPG, IFC, etc.) for customer‑facing artifacts.

At a high level, every `.sg*` file has three layers:  
- A **header** with type, schema version, OS version, tenant and identity references, and a policy identifier used by BANE and the Legal Engine.  
- A **payload** containing structured content (JSON, binary, or hybrid) specific to that extension’s role.  
- Optional **cryptographic wrapping** using a shared BANE crypto interface for authenticated encryption, digital signatures, and key wrapping, so security and legal policy are enforced consistently.

This architecture does not replace your existing ScingOS design; it refines and names the objects moving through it. The thin ScingOS client (Next.js), the AIP protocol layer, and the SCINGULAR AI backend (LARI, BANE, LARI‑Fi, Firebase “highway”) remain intact. What changes is that every significant artifact flowing through those layers now has a precise type and enforcement story.

***

## Extension families at a glance

### Core and kernel

- **`.sgc` – ScingOS Core Module**  
  Self‑contained bundle of configuration, logic, and capability definitions for ScingOS features.  
  **Theoretical role:** Represents “organs” of the OS that can be updated, rolled back, and audited as discrete units instead of monolithic binaries.

- **`.sgk` – Kernel / Driver Pack**  
  Low‑level adapters and hardware/OS integration points.  
  **Theoretical role:** Isolates high‑risk code (drivers, privileged hooks) into strictly signed and policy‑gated artifacts so BANE can control which environments and devices may load them.

### Agents, models, and logic

- **`.sga` – Agent Profile**  
  Describes a Scing agent’s role, tools, policies, and AIP channels.  
  **Theoretical role:** Encodes behavior as data so changes to how an agent behaves are transparent, versioned, and reviewable instead of being hidden inside code.

- **`.sgm` – Model Package**  
  Contains model weights plus metadata such as domains, licenses, jurisdictions, and risk tags.  
  **Theoretical role:** Treats trained models as governed power sources; LARI‑Fi, BANE, and Legal can decide who is allowed to run which models, where, and on what data.

- **`.sgp` – Prompt / Logic Pack**  
  Holds routing graphs, system prompts, and tool selection logic.  
  **Theoretical role:** Makes the “intent wiring” between users, agents, and tools explicit, testable, and auditable under your Bona Fide Intelligence principles.

### Data, graphs, and memory

- **`.sgd` – Structured Data Container**  
  Structured store for inspections, events, metrics, and operational records, aligned with your Firebase/“highway” schema.  
  **Theoretical role:** Separates business‑grade data from transient logs so data can be shared, warehoused, and monetized cleanly.

- **`.sgx` – Knowledge Graph**  
  Represents entities and relationships such as assets, defects, codes, devices, and people.  
  **Theoretical role:** Gives SCINGULAR a first‑class “map” of the inspection and code world instead of relying on opaque embeddings.

- **`.sgn` – Neural Snapshot**  
  Stores episodic memory for Scing and agents, with pointers back to original PDFs, images, and reports.  
  **Theoretical role:** Decouples personalization from raw evidence, preserving evidentiary integrity while still allowing adaptive behavior.

### Security, identity, and legal

- **`.sge` – Encrypted Object**  
  Generic encrypted envelope for any payload, using authenticated encryption with BANE‑managed keys and rich policy headers.  
  **Theoretical role:** Provides a single, consistent way to make sensitive objects “super encrypted” under BANE control, regardless of internal type.

- **`.sgi` – Identity Capsule**  
  Signed (and optionally encrypted) identity record for users, devices, agents, and tenants, including contracts, roles, and entitlements.  
  **Theoretical role:** Acts as a “passport” in your ecosystem; BANE and the Legal Engine read `.sgi` capsules to decide whether a given action or decrypt is legally and contractually allowed.

### UI, themes, and applications

- **`.sgu` – UI Component**  
  Reusable interface components for ScingOS, including layout and behavior.  
  **Theoretical role:** Enforces consistent interaction patterns and reduces duplication across surfaces.

- **`.sgt` – Theme Pack**  
  Visual themes including color, typography, and motion, aligned with SCINGULAR and ScingOS branding.  
  **Theoretical role:** Ensures a coherent “face” for ScingOS while enforcing accessibility and BFI‑aligned UX constraints.

- **`.sgpck` – Package**  
  Bundle of modules, agents, models, UI components, and configuration into an installable unit.  
  **Theoretical role:** Gives BANE and LARI‑Fi coherent units of value and risk—what you sell, meter, and secure—rather than a loose collection of files.

- **`.sguapp` – Unified App Bundle**  
  A cross‑device ScingOS experience, combining packages, themes, and identity hooks for deployment across web, desktop, and devices.  
  **Theoretical role:** Represents a complete application in the ScingOS ecosystem, suitable for distribution, licensing, and lifecycle management.

***

## Encryption and BANE integration

All sensitive `.sg*` types can be wrapped using a shared BANE crypto interface so that “super encryption” is implemented once and reused everywhere:

- **Content protection**  
  - Authenticated encryption (for example, AES‑256‑GCM today, with a roadmap to post‑quantum hybrids).  
  - Unique content keys per file with nonces and associated data bound to header and policy information.

- **Key management**  
  - Content keys are random and wrapped by BANE under master keys, user/tenant keys, and license keys.  
  - Decryption requires both cryptographic authorization and policy approval (jurisdiction, role, contract, risk score).

- **Audit and policy**  
  - Every decrypt or load is logged as a signed BANE event tied to identity capsules and the governing legal documents.  
  - Policies define who may load which extension types in which contexts, aligning technical enforcement with contracts and regulatory requirements.

***

## Interoperability and business posture

The `.sg*` family is proprietary in specification and tooling but interoperable in practice: universal formats remain the primary carrier for customer evidence and deliverables, while `.sg*` sidecars and envelopes carry ScingOS intelligence, governance metadata, and monetization signals.

Legally and commercially, your EULAs and SaaS terms treat these formats as SCINGULAR intellectual property and trade secrets, restrict unauthorized reverse engineering, and tie use of keys, models, and packages to explicit contracts and LARI‑Fi billing. The Legal Engine and BANE ensure that technical behavior respects those agreements in real time.