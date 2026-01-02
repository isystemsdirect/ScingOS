# SCINGOS — SCINGULAR AI/OS

SCINGOS is the native + web-augmented environment for the SCINGULAR AI/OS ecosystem.  
It combines a Tauri native shell, a Next.js front-end, and a neural-driven 3D interface for the SCINGULAR Engine.

## Structure

- `ScingOSEnvironment/`
  - Tauri native shell
  - Next.js (App Router)
  - Three.js / React Three Fiber 3D environment
  - Neural visual pipeline (mock + Firebase-backed)

## Neural 3D Environment

The current environment renders:

- A neural-reactive 3D scene (`app/components/Scene3D.tsx`)
- A HUD showing:
  - `Neural mode` (idle / thinking / speaking / error)
  - `Intensity` (0–1)

Neural state source:

- `neural/mockNeuralState.ts`
  - Cycles modes every few seconds (baseline behavior)
- `hooks/useNeuralVisualState.ts`
  - Switches between mock and Firebase-based state using:
    - `NEXT_PUBLIC_USE_FIREBASE_NEURAL`

Firebase wiring:

- `firebase/client.ts` — Firebase app + Firestore init
- `firebase/neuralState.ts` — subscribes to `neural/current` doc

## Environment Concept

The environment is the start of the SCINGULAR XI 3D interface:

- Neural-driven visuals (no static UI)
- Avatar and environment behavior controlled by internal AI state
- Future integration:
  - Sense Reactive Technology (SRT)® driving:
    - Avatar morphing
    - Reactive color schemes
    - SCING mood states
    - Dynamic background states

## Development

From `ScingOSEnvironment`:

```bash
npm install
npm run tauri dev
```

Requirements:

* Node.js
* Rust + Cargo
* Tauri prerequisites for Windows
# ScingOS

**Voice-First Bona Fide Intelligence Gateway Operating System**

![ScingOS](https://img.shields.io/badge/ScingOS-v0.1.0-blue) ![License](https://img.shields.io/badge/license-Proprietary-red) ![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Desktop-green)

---

## Overview

ScingOS is a voice-first, touchless operating layer where **Scing** is the primary face and voice, coordinating context, memory, tools, and workflows across all devices through the **SCINGULAR AI** platform. Rather than behaving like a traditional desktop OS, ScingOS functions as a **Scing-centric gateway**—users speak to Scing, and Scing orchestrates everything else.

ScingOS is the **body** to SCINGULAR AI's **brain**, connecting users to powerful cloud-based intelligence through the proprietary **AIP (Augmented Intelligence Portal) protocol**.

---

## Mission and Vision

**Empower inspectors, property owners, and regulatory agencies** with instant access to up-to-date compliance standards, actionable insights, and workflow automation. ScingOS is engineered to expand seamlessly as user and data needs grow, from secure cloud deployments to dedicated server infrastructure.

### Core Philosophy: Bona Fide Intelligence (BFI)

At the heart of ScingOS is the philosophy of **Bona Fide Intelligence**. In this ecosystem:

- **AI = Augmented Intelligence**, not Artificial Intelligence
- The goal is to **genuinely augment human capability** with transparent, trustworthy systems
- Intelligence amplifies perception, decision-making, and connection while **preserving human agency**
- Systems are authentic, human-serving, and transparent by design

---

## Technology Highlights

### Architecture

- **Modular, cloud-native architecture** for flexible deployment and scaling
- **Voice-first interface** with "Hey, Scing!" wake-word activation
- **Cross-device synchronization** with persistent context and memory
- **Thin-client design** that offloads heavy processing to SCINGULAR AI cloud

### Core Components

#### 🎤 **SCING** - Voice Interface & Orchestrator

- Natural language understanding and task routing
- Voice-activated, hands-free operation
- Context-aware conversation management
- Cross-platform UI coordination

#### 🧠 **LARI** - Language and Reasoning Intelligence Engines

- Perception and analysis engines
- Standards lookup and code intelligence
- Multi-jurisdictional compliance verification
- Inspection workflow automation

#### 🛡️ **BANE** - Backend Augmented Neural Engine (Security Governor)

- Zero-trust security framework
- Capability-based authorization
- Immutable audit trails (Security Decision Records)
- Threat detection and isolation ("demon mode")
- Policy enforcement and data minimization

#### 🔗 **AIP Protocol** - Augmented Intelligence Portal

- Real-time communication between client and cloud
- Secure, authenticated data channels
- Task orchestration and result delivery

### Technology Stack

- **Frontend**: Next.js / React
- **Backend**: Firebase (Authentication, Firestore, Cloud Functions, Storage)
- **AI Platform**: SCINGULAR AI cloud services
- **Security**: BANE governance layer with cryptographic verification
- **Protocol**: AIP (proprietary real-time protocol)

---

## Key Capabilities

- ✅ **Single conversational gateway** to SCINGULAR AI tools and agents
- ✅ **Contextual memory** that persists across sessions under user control
- ✅ **Real-time status and logs** showing what the system is doing
- ✅ **Domain-specific workflows** (inspection, compliance, operations)
- ✅ **Multi-jurisdictional code intelligence** with semantic AI search
- ✅ **Interactive dashboards** with sentiment analysis and automated reporting
- ✅ **Device integration** for cameras, LiDAR, drones, and inspection equipment
- ✅ **Verifiable authenticity** through cryptographically signed reports

---

## Getting Started

### For Users

1. Access a ScingOS surface (web client bound to your SCINGULAR AI project)
2. Sign in with your organization account via Firebase Authentication
3. Wake Scing: **"Hey, Scing!"**
4. State your intent (e.g., "Start a new inspection session")
5. Follow Scing's prompts as it assembles context, agents, and tools

### For Developers

1. Clone this repository

   ```bash
   git clone https://github.com/isystemsdirect/ScingOS.git
   cd ScingOS
   ```

2. Review architecture documentation
   - See `/docs/ARCHITECTURE.md` for system design
   - See `/docs/AIP-PROTOCOL.md` for protocol specification

3. Configure Firebase and SCINGULAR AI credentials

   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. Run the ScingOS client locally

   ```bash
   npm install
   npm run dev
   ```

5. Inspect AIP traffic, logs, and workflows in the developer console

---

## Project Structure

```
ScingOS/
├── README.md              # This file
├── ARCHITECTURE.md        # System architecture overview
├── LICENSE               # Software license
├── CHANGELOG.md          # Version history
├── client/               # ScingOS client application
│   ├── components/       # React components
│   ├── pages/           # Next.js pages
│   ├── lib/             # Utility libraries
│   └── styles/          # Styling
├── cloud/               # Backend cloud functions
│   ├── functions/       # Firebase Cloud Functions
│   └── firestore/       # Firestore rules and indexes
├── docs/                # Comprehensive documentation
│   ├── AIP-PROTOCOL.md  # AIP protocol specification
│   ├── SCING-INTERFACE.md
│   ├── BANE-SECURITY.md
│   ├── LARI-ENGINES.md
│   ├── FIREBASE-INTEGRATION.md
│   ├── BFI-PHILOSOPHY.md
│   └── DEPLOYMENT.md
└── tests/               # Testing suite
```

---

## Roadmap

### ✅ Phase 1: Foundation (Completed Q4 2025)

- Core architecture development
- Voice interface (Scing) implementation
- Firebase integration
- Basic security framework (BANE)

### 🔄 Phase 2: Beta Launch (Q1-Q2 2026)

- Closed beta with select inspection partners
- Knowledge base refinement
- Multi-jurisdictional code intelligence
- Enhanced device integration

### 🔜 Phase 3: Public Release (Q2-Q3 2026)

- Public launch with subscription tiers
- Code assistant integration
- Advanced workflow automation
- Mobile applications (iOS/Android)

### 🚀 Phase 4: Enterprise Scale (Late 2026+)

- LiDAR mapping and 3D modeling expansion
- Server depot migration preparations
- Enterprise partnerships
- Advanced AI capabilities
- International expansion

---

## Market Impact

- Addresses rising demand for **digital inspection and compliance** in real estate, construction, and industrial sectors
- Differentiates through **rapid, AI-driven code lookup** and workflow automation
- Supports **subscription-based models** and premium service tiers
- Ready to migrate from cloud infrastructure to **owned server depot** as usage scales

---

## Security & Governance

ScingOS implements a **zero-trust security model** through BANE:

- **Capability-based authorization** - no action without explicit permission
- **Immutable audit trails** - every privileged action is logged and signed
- **Data minimization** - components access only the minimum data required
- **Threat isolation** - suspicious behavior triggers immediate containment
- **Cryptographic verification** - reports and decisions are provably authentic

See `/docs/BANE-SECURITY.md` for complete security architecture.

### Legal Documentation

Comprehensive legal and governance documents are available in the `/legal` directory:

- **[Legal Index](legal/README.md)** - Overview of all legal documents
- **[Privacy Policy](legal/PRIVACY_POLICY.md)** - Data practices and user rights
- **[Security Policy](legal/SECURITY_POLICY.md)** - Security framework and controls
- **[Terms of Use](legal/TERMS_OF_USE.md)** - Platform usage terms
- **[EULA](legal/EULA.md)** - End user license agreement

For partnership and enterprise agreements, see the complete [legal documentation](legal/).

---

## Contributing

We welcome contributions from the community! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on:

- Code standards
- Commit conventions
- Pull request process
- Testing requirements

Before contributing:

- Review our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- Sign the [Contributor License Agreement](legal/CONTRIBUTOR_LICENSE_AGREEMENT.md)

### Using AI Assistants (ChatGPT, GitHub Copilot, etc.)

Want to use ChatGPT or other AI assistants with this repository? See our **[AI Assistant Access Guide](docs/AI-ASSISTANT-ACCESS.md)** for:

- Repository URL for sharing with ChatGPT: `https://github.com/isystemsdirect/ScingOS`
- How to provide context to AI assistants
- Best practices for AI-assisted development
- Security considerations

---

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[Architecture Overview](docs/ARCHITECTURE.md)** - System design and components
- **[AIP Protocol](docs/AIP-PROTOCOL.md)** - Communication protocol specification
- **[Scing Interface](docs/SCING-INTERFACE.md)** - Voice interface guidelines
- **[BANE Security](docs/BANE-SECURITY.md)** - Security governance framework
- **[LARI Engines](docs/LARI-ENGINES.md)** - AI reasoning engines
- **[Firebase Integration](docs/FIREBASE-INTEGRATION.md)** - Backend setup
- **[BFI Philosophy](docs/BFI-PHILOSOPHY.md)** - Bona Fide Intelligence principles
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production deployment
- **[AI Assistant Access](docs/AI-ASSISTANT-ACCESS.md)** - Guide for using ChatGPT and other AI assistants with this repository

---

## Status

**Current Version**: 0.1.0 (Alpha)

**Development Status**: Active Development

- ✅ Core architecture established
- ✅ Firebase backend integrated
- ✅ Voice interface (Scing) prototype operational
- 🔄 BANE security framework in progress
- 🔄 Device integration adapters in development
- ⏳ Public beta planned Q2 2026

---

## About Inspection Systems Direct

**ScingOS** is developed by [Inspection Systems Direct LLC](https://isystemsdirect.com), founded in 2023 to build AI-assisted inspection software for every industry.

**ISDCProtocol2025**: Our core technology, the ISD-Communications Protocol (ISD-C), enables standardized, intelligent inspection workflows across all sectors. The 2025 version includes advanced details synchronization, conflict resolution, and real-time inspection data management. See [ISDCProtocol2025 Documentation](docs/ISDC-PROTOCOL-2025.md) for details.

**SCINGULAR AI**: The cloud intelligence platform powering ScingOS, providing the "brain" for reasoning, perception, and decision support.

---

## License

This project is proprietary software. See [LICENSE](LICENSE) for details.

© 2025 Inspection Systems Direct LLC. All rights reserved.

---

## Contact & Support

- **Website**: [isystemsdirect.com](https://isystemsdirect.com)
- **Email**: isystemsdirect@gmail.com
- **GitHub**: [@isystemsdirect](https://github.com/isystemsdirect)

---

## Acknowledgments

ScingOS represents the intersection of expert inspection knowledge and next-generation AI. The platform delivers robust data architecture, regulatory adaptability, and workflow automation—scaling confidently to meet the future of compliance and property intelligence.

**ScingOS**: Where voice meets intelligence, and humans remain in control.

---

_Powered by SCINGULAR AI | Built with Bona Fide Intelligence_
