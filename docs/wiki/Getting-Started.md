# Getting Started with ScingOS

## Executive Summary

ScingOS is a voice-first operating system that provides inspection professionals with secure, real-time access to SCINGULAR AI's cloud intelligence infrastructure. This guide establishes the foundational workflow: account provisioning, client installation, voice interface calibration, inspection execution, and report generation. The system operates as a thin client connecting to distributed AI engines via the AIP protocol, ensuring enterprise-grade security through BANE's capability-based authorization model.

## Purpose & Scope

### Purpose

Establish operational competency for new users across account setup, client deployment, voice calibration, inspection workflow execution, and report generation. Enable rapid onboarding while maintaining adherence to security protocols and data governance requirements.

### Scope

**Included:**
- Account registration and profile configuration
- Client installation (web, desktop via Tauri)
- Voice calibration and wake word training
- Core inspection workflow via SCING voice interface
- Report generation via LARI-Narrator engine
- Basic troubleshooting and support escalation paths

**Excluded:**
- Advanced LARI engine configuration (see [LARI Engines](LARI-Engines.md))
- Custom device adapter development (see [Development Guide](Development-Guide.md))
- Enterprise deployment architecture (see [Deployment](Deployment.md))
- Security policy administration (see [BANE Security](BANE-Security.md))

## Core Concepts

### Voice-First Architecture

ScingOS prioritizes natural language interaction through SCING (Scing Voice Orchestrator). Voice commands activate distributed AI processing in SCINGULAR AI cloud infrastructure, with responses synthesized and delivered via text-to-speech. This model eliminates traditional menu navigation while preserving full audit trails through BANE's Security Decision Records.

### Thin-Client Design

The client application handles presentation, voice I/O, and device integration. All AI inference, code intelligence, and report generation execute in the cloud. This separation enables:
- Consistent experience across platforms (web, desktop, future mobile)
- Automatic updates without client-side deployment
- Minimal local resource requirements
- Centralized security policy enforcement

### Bona Fide Intelligence Principles

Human agency remains paramount. AI systems augment professional expertise rather than automate decision-making. All AI outputs include confidence scores, reasoning chains, and override mechanisms. Critical actions require explicit human approval, logged via BANE SDR (Security Decision Records).

See [BFI Philosophy](BFI-Philosophy.md) for complete framework.

### AIP Protocol Communication

Augmented Intelligence Portal protocol manages client-cloud interaction via WebSocket (TLS 1.3, port 443). Stateful sessions maintain context across conversations. Capability tokens from BANE authorize each action. Message format uses JSON for commands, binary streams for media.

See [AIP Protocol](AIP-Protocol.md) for technical specification.

## System / Process Flow

### Initial Setup Flow

```
Account Creation → Email Verification → Profile Configuration →
  Client Installation → Permission Grants → Connectivity Verification →
  Voice Calibration → Wake Word Training → Command Practice →
  First Inspection → Report Generation
```

### Voice Command Processing

```
User: "Hey, Scing!" (wake word)
  ↓
Local Detection (on-device model)
  ↓
Audio Capture & Streaming
  ↓
AIP → Speech-to-Text (Google Cloud)
  ↓
LARI-Language: Intent Recognition & Entity Extraction
  ↓
BANE: Capability Validation
  ↓
LARI Engine Routing (parallel execution)
  ↓
Response Synthesis
  ↓
Text-to-Speech (Google Cloud)
  ↓
Audio Playback + Neural 3D Visualization
```

### Inspection Workflow

```
Session Initiation (voice or UI)
  ↓
Property Details Collection
  ↓
Sequential Area Inspection:
  - Voice documentation of findings
  - Photo capture (manual or voice-triggered)
  - Real-time LARI analysis (Vision, Language, Reasoning)
  - Safety alerts via LARI-Guardian
  ↓
Session Completion & Review
  ↓
LARI-Narrator: Report Generation
  ↓
Human Review & Finalization
  ↓
BANE: Cryptographic Signing
  ↓
Export & Delivery
```

## Interfaces & Dependencies

### Authentication Interface

**Firebase Authentication:**
- Email/password with verification
- Google OAuth 2.0
- Enterprise SSO (SAML integration)
- Multi-factor authentication (optional)

**Token Management:**
- Firebase ID tokens for authentication
- BANE capability tokens for authorization
- Automatic refresh with session maintenance

### Voice Interface

**SCING Commands:**
- Wake word: "Hey, Scing!"
- Inspection control: start, pause, complete
- Documentation: note findings, capture photos
- Queries: code lookup, defect analysis
- Report generation: draft, review, finalize

See [SCING Interface](SCING-Interface.md) for complete command reference.

### Visual Interface

**Primary UI Elements:**
- Neural 3D environment (React Three Fiber, Firebase state sync)
- Inspection dashboard (sessions, history, drafts)
- Settings panels (voice, profile, billing, offline data)
- Report viewer/editor (visual editing, photo management)

See [Neural 3D Environment](Neural-3D-Environment.md) for architecture.

### API Interface

**Programmatic Access:**
- REST API for CRUD operations
- WebSocket subscriptions for real-time updates
- Webhook notifications for async events

See [API Reference](API-Reference.md) for endpoints.

### Device Integration

**Hardware Adapters:**
- Thermal cameras (FLIR), distance measurers (Leica)
- Drones (DJI), borescopes (Olympus)
- Base adapter interface with Bluetooth/USB/WiFi discovery

See [Development Guide](Development-Guide.md) for adapter development.

## Security, Privacy & Governance

### Authentication & Authorization

**Layered Security:**
1. Firebase Authentication (identity verification)
2. BANE Capability Tokens (action authorization)
3. AIP Protocol (encrypted transport)
4. Firestore Security Rules (data access control)

**Session Security:**
- Automatic timeout (configurable, default 12 hours)
- Device tracking and remote logout
- IP-based anomaly detection (BANE Guardian)

### Data Protection

**Encryption:**
- In transit: TLS 1.3 for all communication (AIP, API, Firebase)
- At rest: AES-256 for Firestore, Cloud Storage (Google-managed keys)

**Privacy Controls:**
- Voice data sharing: opt-in only, with explicit consent
- Data retention: user-configurable policies
- Anonymization: PII stripped from training data
- GDPR/CCPA compliance: export, deletion, access rights

### Audit Logging

**Security Decision Records (SDR):**
- Every privileged action logged and cryptographically signed
- WORM storage (Write Once Read Many) for immutability
- User-accessible audit trail via Settings
- Compliance export for regulatory requirements

See [BANE Security](BANE-Security.md) for complete framework.

## Operational Notes

### Performance Expectations

Current performance (v0.1.0-alpha):
- Voice command latency: ~800ms (target <500ms)
- Image analysis: ~5s per image (target <3s)
- Report generation: ~15s (target <10s)
- System uptime: 99.5% target, monitored at https://status.scingos.ai

### Network Requirements

**Minimum:**
- Bandwidth: 5 Mbps down, 2 Mbps up
- Latency: <200ms to SCINGULAR AI
- Firewall: Allow outbound WebSocket (wss://) on port 443

**Recommended:**
- Bandwidth: 10+ Mbps for optimal photo upload, real-time sync
- Stable connection (avoid cellular tethering for production use)

### Offline Capabilities

**Available Offline:**
- Code database queries (if pre-downloaded)
- Photo capture and local storage
- Text-based note-taking

**Requires Connectivity:**
- Voice interaction (STT, AI processing, TTS)
- LARI engine assistance
- Report generation (LARI-Narrator)
- Cross-device synchronization

### Storage Management

**Local Cache:**
- 500MB-2GB depending on code databases
- Automatic expiration (30 days)
- Manual clearing via Settings

**Cloud Storage Quotas:**
- Free: 1GB
- Professional: 10GB
- Business: 50GB
- Enterprise: Unlimited (custom)

## Implementation Notes

### Account Setup

1. Navigate to organization portal or https://app.scingos.ai
2. Select authentication method (email/password, Google OAuth, SSO)
3. Complete email verification
4. Configure profile:
   - Professional credentials (certifications: ASHI, InterNACHI, ICC)
   - Jurisdiction (enables automatic code standard selection)
   - Notification preferences
5. Select subscription tier if applicable:
   - Free: 10 inspections/month
   - Professional: $49/month, unlimited inspections
   - Business: $99/month, team collaboration
   - Enterprise: Custom pricing, dedicated support

### Client Installation

**Web Application:**
- Access via modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- No installation required
- Full feature parity with desktop

**Desktop Application (Tauri):**
- **Windows:** Download `ScingOS-Setup-x64.exe`, run with admin privileges
- **macOS:** Download `ScingOS-x64.dmg`, drag to Applications, grant permissions on first launch
- **Linux:** Install via `.AppImage`, `.deb`, or `.rpm`

**Initial Configuration:**
1. Launch and sign in
2. Grant permissions (microphone required, camera/location optional)
3. Verify connectivity (Firebase, AIP, Firestore)
4. Configure storage preferences
5. Download offline code databases (optional)

### Voice Calibration

**Microphone Setup:**
1. Settings → Voice & Audio
2. Select input device
3. Adjust volume (target: green zone)
4. Enable noise cancellation if available

**Wake Word Training:**
1. Click "Train Wake Word"
2. Quiet environment, consistent distance (6-12 inches)
3. Complete prompts:
   - "Hey, Scing!" (3x)
   - "Scing, are you there?" (1x)
   - "Scing, help me with this inspection" (1x)
4. Verify: test activation, observe response time (<500ms target)

**Sensitivity Tuning:**
- False negatives: increase sensitivity, retrain
- False positives: decrease sensitivity, minimize background noise

### First Inspection

**Initiation:**
- Voice: "Hey, Scing, start a new inspection"
- Specify type: residential, commercial, pre-purchase, insurance
- Provide property details (address enables jurisdiction auto-detection)

**Execution:**
1. Navigate areas systematically (exterior, interior, systems)
2. Document findings via voice: "Note: [observation]"
3. Capture photos: "Scing, take a photo of this defect"
4. LARI assistance operates in background:
   - LARI-Vision: defect detection on photos
   - LARI-Language: relevant code suggestions
   - LARI-Reasoning: severity assessment
   - LARI-Guardian: safety alerts

**Code Queries:**
- "Scing, what ICC codes apply to [topic]?"
- "Scing, check code compliance for [component]"
- Automatic jurisdiction consideration (state/local amendments)

### Report Generation

**Process:**
1. Complete inspection: "Scing, I've completed the inspection"
2. Review findings summary
3. Generate: "Scing, generate my inspection report"
4. Select template (Standard Residential, Commercial, Pre-Purchase, Custom)
5. Review draft, make edits (voice or visual editor)
6. Finalize: "Scing, finalize this report"
7. Cryptographic signing via BANE, audit log preservation

**Export Formats:**
- PDF (default, print-ready)
- DOCX (editable)
- HTML (web-viewable)
- JSON (system integration)

**Delivery:**
- Email to client (auto-generated cover message)
- Client portal upload (secure access)
- Local download
- Verification link: https://verify.scingos.ai/reports/[id]

## See Also

### Internal Documentation

- [Home](Home.md) - Wiki overview and navigation
- [Architecture](Architecture.md) - System architecture and component design
- [SCING Interface](SCING-Interface.md) - Voice command reference
- [LARI Engines](LARI-Engines.md) - AI engine capabilities
- [BANE Security](BANE-Security.md) - Security framework
- [Development Guide](Development-Guide.md) - Extension and integration
- [Deployment](Deployment.md) - Production deployment architecture

### External Resources

- ScingOS Portal: https://app.scingos.ai
- Status Page: https://status.scingos.ai
- Support: support@scingos.ai

## Terminology Alignment

- **SCING:** Scing Voice Orchestrator (AI voice interface)
- **LARI:** Language and Reasoning Intelligence (AI engine suite)
- **BANE:** Backend Augmented Neural Engine (security governor)
- **AIP:** Augmented Intelligence Portal (communication protocol)
- **SDR:** Security Decision Record (audit log entry)
- **BFI:** Bona Fide Intelligence (AI philosophy framework)

---

**Last Updated:** December 12, 2025  
**Document Version:** 1.0  
**ScingOS Version:** 0.1.0-alpha
