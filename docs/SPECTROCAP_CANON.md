# SpectroCAP™ — LARI-CAP Canonical Architecture

**Status**: Canonical naming established (2026-01-28)

---

## Canonical Identity

```
SpectroCAP™ = LARI-CAP → BANE → SCINGULAR™
```

### Names (Locked)

| Term | Meaning | Usage |
|------|---------|-------|
| **SpectroCAP™** | Product/software name (user-facing) | UI, marketing, user docs |
| **LARI-CAP** | Orchestration sub-engine (LARI family) | Architecture, code, integration |
| **BANE** | Security/governance layer | Audit, policy enforcement |

---

## LARI-CAP Definition

**Full Name**: LARI-CAP (Capture-Analysis-Provision)  
**Family**: LARI sub-engine  
**Scope**: SpectroCAP™ operations + extensible to other native ScingOS workflows  
**Engine ID**: `lari-cap`

### Role

LARI-CAP orchestrates the complete SpectroCAP™ workflow:

```
LARI-CAP Orchestration
  ├─ Intake: Capture inspection scope, evidence, context
  ├─ Analysis: Apply LARI reasoning engines (domain-specific)
  ├─ Provisioning: Generate reports, recommendations, export
  └─ Extensibility: Reusable for native ScingOS tools beyond SpectroCAP™
```

---

## Integration Points

### Within SpectroCAP™

```
SpectroCAP™ UI
  ↓
LARI-CAP (orchestrator)
  ├─ LARI-CORE (reasoning)
  ├─ LARI-SECURITY (threat analysis)
  ├─ LARI-OPS (operational context)
  └─ LARI-EDL (ecosystem/standards)
  ↓
BANE (governance, audit, enforcement)
  ↓
SCINGULAR™ (execution, cloud services)
```

### Beyond SpectroCAP™

Other native ScingOS tools may invoke LARI-CAP for workflow orchestration:

```
Remote Paste
Remote Camera
Device Manager
(future tools)
  ↓
LARI-CAP (shared orchestration)
  ↓
Sub-engines + BANE + SCINGULAR™
```

---

## Code Locations

| File | Purpose |
|------|---------|
| `scing/lari/spectrocap.ts` | LARI-CAP interface definition |
| `scing/lari/impl/spectrocap.default.ts` | Default LARI-CAP implementation |
| `scing/engines/spectrocap/` | SpectroCAP-specific engines (registered with LARI-CAP) |
| `docs/SPECTROCAP_CANON.md` | This file (canonical reference) |
| `docs/remote-paste/PHASE_1_OVERVIEW.md` | Remote Paste integration with LARI-CAP |

---

## Engine Registry Entry

```typescript
'lari-cap': {
  id: 'lari-cap',
  family: 'lari',
  subEngine: 'lari-cap',
  displayName: 'LARI-CAP (Capture-Analysis-Provision)',
  description: 'SpectroCAP™ orchestration engine; extensible for native ScingOS workflows',
  provider: 'internal',
  model: 'orchestrator',
  supportsLongContext: true,
  supportsTools: true,
  supportsStreaming: true,
  tags: ['lari-sub-engine', 'spectrocap', 'orchestrator', 'extensible'],
}
```

---

## Phase Delivery

### Phase 1 (Current)
- [x] Canonical naming established
- [x] Engine interface defined
- [ ] Remote Paste integration (Phase 1 MVP text sync)
- [ ] Initial LARI-CAP implementation (stubs)

### Phase 2
- [ ] Full LARI-CAP implementation
- [ ] SpectroCAP™ MVP (inspection capture + basic analysis)
- [ ] BANE audit trail integration
- [ ] Report generation

### Phase 3+
- [ ] Image/media support
- [ ] Advanced domain reasoning
- [ ] Multi-jurisdictional compliance
- [ ] Extensibility to other native tools

---

## Immutable Rules

1. **Product name is always SpectroCAP™** — never rename
2. **LARI-CAP is the exclusive orchestration engine** — no alternatives
3. **BANE governance is mandatory** — non-negotiable for Inspection Systems Direct
4. **SCINGULAR™ is the execution layer** — cloud backend
5. **Extensibility is core** — LARI-CAP may serve other native ScingOS tools

---

## References

- [Remote Paste Phase 1 Overview](./remote-paste/PHASE_1_OVERVIEW.md)
- [Android Flow Integration](./remote-paste/ANDROID_FLOW.md)
- [Windows Flow Integration](./remote-paste/WINDOWS_FLOW.md)
- [LARI Architecture](./ARCHITECTURE.md)
- [BANE Security](./BANE-SECURITY.md)
