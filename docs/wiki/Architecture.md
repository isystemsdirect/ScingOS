# ScingOS Architecture Deep Dive

**Comprehensive Technical Architecture Documentation**

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Layer Architecture](#layer-architecture)
3. [Component Architecture](#component-architecture)
4. [AIP Protocol Deep Dive](#aip-protocol-deep-dive)
5. [Data Flow](#data-flow)
6. [Neural 3D Environment Architecture](#neural-3d-environment-architecture)
7. [Client-Server Communication](#client-server-communication)
8. [Security Architecture](#security-architecture)
9. [File System Architecture](#file-system-architecture)
10. [Deployment Models](#deployment-models)
11. [Technology Stack](#technology-stack)
12. [Scalability Considerations](#scalability-considerations)
13. [Integration Points](#integration-points)
14. [Performance Optimization](#performance-optimization)
15. [Disaster Recovery](#disaster-recovery)

---

## System Overview

ScingOS is a distributed, cloud-native operating system built on a three-layer architecture that separates concerns while maintaining tight integration through the proprietary AIP (Augmented Intelligence Portal) protocol.

### Architectural Principles

1. **Thin-Client Philosophy**: Heavy processing offloaded to cloud
2. **Zero-Trust Security**: Every action requires explicit authorization
3. **Real-Time First**: WebSocket-based bidirectional communication
4. **Modular Design**: Pluggable components and engines
5. **Stateful Sessions**: Context preserved across devices and sessions
6. **Observable Systems**: Comprehensive logging and monitoring
7. **Graceful Degradation**: Fallback modes when services unavailable

### High-Level Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                         CLOUD LAYER                                │
│                    SCINGULAR AI Platform                           │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  SCING - Voice Orchestrator                                   │ │
│  │  • Wake word detection (Hey, Scing!)                         │ │
│  │  • Natural language understanding (Dialogflow/Custom NLP)    │ │
│  │  • Multi-turn conversation management                        │ │
│  │  • Intent routing to LARI engines                           │ │
│  │  • Voice synthesis (Google Cloud TTS)                        │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  LARI - AI Engine Suite                                      │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │ │
│  │  │ Language │ │  Vision  │ │  Mapper  │ │Reasoning │       │ │
│  │  │  Engine  │ │  Engine  │ │  Engine  │ │  Engine  │       │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │ │
│  │  │ Guardian │ │ Narrator │ │  Social  │ │    Fi    │       │ │
│  │  │  Engine  │ │  Engine  │ │  Engine  │ │  Engine  │       │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  BANE - Security Governor                                    │ │
│  │  • Capability-based authorization                            │ │
│  │  • Security Decision Records (SDR) - cryptographic audit     │ │
│  │  • WORM audit logging                                        │ │
│  │  • Threat detection & "demon mode"                           │ │
│  │  • Policy enforcement engine                                 │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Firebase Services                                           │ │
│  │  • Authentication (Firebase Auth)                            │ │
│  │  • Database (Firestore)                                      │ │
│  │  • Storage (Cloud Storage)                                   │ │
│  │  • Functions (Cloud Functions)                               │ │
│  │  • Hosting (Firebase Hosting)                                │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────┬─────────────────────────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────────┐
│                      PROTOCOL LAYER                                │
│                       AIP Protocol                                 │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Transport: WebSocket (wss://) with HTTPS fallback           │ │
│  │  Security: TLS 1.3 + capability tokens                       │ │
│  │  Messaging: JSON-based with binary streaming                 │ │
│  │  Sessions: Stateful with heartbeat & reconnection            │ │
│  │  Versioning: Protocol version negotiation                    │ │
│  └──────────────────────────────────────────────────────────────┘ │
└─────────────────────────────┼─────────────────────────────────────┘
                              │
┌─────────────────────────────┼─────────────────────────────────────┐
│                       CLIENT LAYER                                 │
│                         ScingOS                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Platform Implementations                                    │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │ │
│  │  │   Web    │  │ Desktop  │  │  Mobile  │  │  Tablet  │    │ │
│  │  │(Next.js) │  │ (Tauri)  │  │ (Future) │  │ (Future) │    │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Core Client Components                                      │ │
│  │  • React Three Fiber (3D neural environment)                 │ │
│  │  • Firebase Client SDK (auth, database, storage)             │ │
│  │  • Voice input/output (Web Audio API, getUserMedia)          │ │
│  │  • AIP client library (WebSocket management)                 │ │
│  │  • Device adapter framework (hardware integration)           │ │
│  │  • State management (React Context, Firebase sync)           │ │
│  └──────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────┘
```

---

## Layer Architecture

### Cloud Layer: SCINGULAR AI

The cloud layer hosts all AI processing, business logic, and data persistence.

**Responsibilities:**
- Voice understanding and generation
- AI inference and reasoning
- Data storage and retrieval
- Security policy enforcement
- Business logic execution
- Report generation

**Key Services:**
- **Google Cloud AI**: Gemini models for vision and language
- **Firebase**: Backend as a service
- **Cloud Functions**: Serverless compute
- **Cloud Storage**: File and media storage
- **Firestore**: Real-time database
- **Cloud Run**: Container hosting (future)

**Scaling Strategy:**
- Horizontal scaling via Firebase/Google Cloud auto-scaling
- Regional deployment for low latency
- CDN for static assets
- Load balancing built into Firebase

### Protocol Layer: AIP

The AIP protocol layer handles all communication between client and cloud.

**Characteristics:**
- **Bidirectional**: Full duplex WebSocket communication
- **Stateful**: Session-oriented with persistent context
- **Secure**: TLS 1.3 encryption + capability tokens
- **Reliable**: Message acknowledgment and retry logic
- **Extensible**: Protocol version negotiation

**Message Categories:**
1. **Authentication**: Login, token refresh, capability grant
2. **Command/Control**: User commands, system control
3. **Data Streaming**: Sensor data, media, telemetry
4. **Status/Events**: System status, notifications, updates
5. **Error Handling**: Error codes, retry signals

See [AIP Protocol Deep Dive](#aip-protocol-deep-dive) for details.

### Client Layer: ScingOS

The client layer provides user interface and local device integration.

**Platform Support:**
- **Web**: Next.js application (current)
- **Desktop**: Tauri native app (current)
- **Mobile**: iOS/Android (planned Q2 2026)
- **Tablet**: Optimized tablet experience (planned)

**Client Responsibilities:**
- User interface rendering
- Voice input/output
- 3D neural environment
- Local device integration
- Offline capability (limited)
- State synchronization

---

## Component Architecture

### SCING: Voice Orchestrator

SCING is the conversational interface that coordinates all user interactions.

**Architecture:**

```
┌───────────────────────────────────────────────────────────────┐
│                  SCING Voice Orchestrator                      │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Wake Word Detection                                    │  │
│  │  • Continuous microphone monitoring                     │  │
│  │  • Local wake word model (on-device)                    │  │
│  │  • Trigger phrase: "Hey, Scing!"                        │  │
│  │  • Low power consumption                                │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Speech-to-Text (STT)                                   │  │
│  │  • Google Cloud Speech-to-Text API                      │  │
│  │  • Streaming recognition                                │  │
│  │  • Multi-language support                               │  │
│  │  • Noise cancellation                                   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Natural Language Processing (NLP)                      │  │
│  │  • Intent classification                                │  │
│  │  • Entity extraction                                    │  │
│  │  • Context management                                   │  │
│  │  • Sentiment analysis                                   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Dialogue Management                                    │  │
│  │  • Multi-turn conversation state                        │  │
│  │  • Context persistence across sessions                  │  │
│  │  • Clarification requests                               │  │
│  │  • Error recovery                                       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Intent Router                                          │  │
│  │  • Route to appropriate LARI engine                     │  │
│  │  • Parallel engine invocation                           │  │
│  │  • Result aggregation                                   │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Text-to-Speech (TTS)                                   │  │
│  │  • Google Cloud Text-to-Speech                          │  │
│  │  • Natural voice synthesis                              │  │
│  │  • Emotion and tone control                             │  │
│  │  • SSML markup support                                  │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

**Data Flow:**
1. User says "Hey, Scing!"
2. Wake word model activates
3. Audio stream sent to STT
4. Text processed by NLP
5. Intent routed to LARI
6. Response generated
7. TTS produces audio
8. Audio played to user

### LARI: AI Engine Suite

LARI consists of specialized AI engines, each focused on specific capabilities.

#### LARI-Language Engine

**Purpose**: Code intelligence, NLP, and compliance checking

**Architecture:**

```
┌───────────────────────────────────────────────────────────────┐
│              LARI-Language Engine                              │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Code Intelligence System                               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │  │
│  │  │     ICC     │  │    NFPA     │  │     NEC     │    │  │
│  │  │ International│  │  National   │  │  National   │    │  │
│  │  │   Code      │  │  Fire       │  │  Electrical │    │  │
│  │  │   Council   │  │  Protection │  │   Code      │    │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘    │  │
│  │  ┌─────────────┐  ┌─────────────┐                     │  │
│  │  │    OSHA     │  │   Custom    │                     │  │
│  │  │Occupational │  │Jurisdiction │                     │  │
│  │  │   Safety    │  │    Codes    │                     │  │
│  │  └─────────────┘  └─────────────┘                     │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Semantic Search & Retrieval                            │  │
│  │  • Vector embeddings (text-embedding-004)               │  │
│  │  • Multi-jurisdictional indexing                        │  │
│  │  • Fuzzy matching and synonyms                          │  │
│  │  • Version-aware lookup                                 │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Query Processing                                       │  │
│  │  • Natural language to code reference                   │  │
│  │  • Multi-code correlation                               │  │
│  │  • Jurisdiction resolution                              │  │
│  │  • Citation generation                                  │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

**Data Sources:**
- ICC: International Building Code, Residential Code, etc.
- NFPA: Fire and life safety codes
- NEC: Electrical code standards
- OSHA: Workplace safety regulations
- State/local amendments and jurisdictional variations

#### LARI-Vision Engine

**Purpose**: Image analysis, defect detection, thermal analysis

**Architecture:**

```
┌───────────────────────────────────────────────────────────────┐
│               LARI-Vision Engine                               │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Image Preprocessing                                    │  │
│  │  • Normalization and scaling                            │  │
│  │  • Color correction                                     │  │
│  │  • Noise reduction                                      │  │
│  │  • Image enhancement                                    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Gemini 1.5 Flash Vision Model                          │  │
│  │  • Object detection and classification                  │  │
│  │  • Scene understanding                                  │  │
│  │  • Text extraction (OCR)                                │  │
│  │  • Anomaly detection                                    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Defect Detection Models                                │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │  │
│  │  │  Cracks  │  │  Water   │  │  Mold    │             │  │
│  │  │ Detection│  │  Damage  │  │ Detection│             │  │
│  │  └──────────┘  └──────────┘  └──────────┘             │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │  │
│  │  │ Thermal  │  │ Electrical│  │ Structural│            │  │
│  │  │ Anomaly  │  │  Issues  │  │  Defects │             │  │
│  │  └──────────┘  └──────────┘  └──────────┘             │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  3D Reconstruction                                      │  │
│  │  • Photogrammetry pipeline                              │  │
│  │  • Depth estimation                                     │  │
│  │  • Point cloud generation                               │  │
│  │  • Mesh reconstruction                                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Result Generation                                      │  │
│  │  • Confidence scoring                                   │  │
│  │  • Bounding box annotation                              │  │
│  │  • Severity classification                              │  │
│  │  • Recommendation generation                            │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

**Supported Image Types:**
- Standard photography (RGB)
- Thermal/infrared imagery
- Multispectral imaging
- High-resolution microscopy
- Panoramic and 360° images

#### LARI-Mapper Engine

**Purpose**: LiDAR processing and 3D spatial mapping

**Architecture:**

```
┌───────────────────────────────────────────────────────────────┐
│                LARI-Mapper Engine                              │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Point Cloud Processing                                 │  │
│  │  • LiDAR data ingestion                                 │  │
│  │  • Noise filtering and outlier removal                  │  │
│  │  • Downsampling and optimization                        │  │
│  │  • Color mapping from imagery                           │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Spatial Analysis                                       │  │
│  │  • Surface normal estimation                            │  │
│  │  • Feature extraction                                   │  │
│  │  • Plane detection                                      │  │
│  │  • Object segmentation                                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  3D Space Mapping                                       │  │
│  │  • Room detection and labeling                          │  │
│  │  • Wall, floor, ceiling extraction                      │  │
│  │  • Door and window identification                       │  │
│  │  • Furniture and fixture mapping                        │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Annotation System                                      │  │
│  │  • Spatial markers and notes                            │  │
│  │  • Measurement tools                                    │  │
│  │  • Defect location tagging                              │  │
│  │  • Photo alignment to 3D space                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Output Generation                                      │  │
│  │  • Floor plan generation (2D)                           │  │
│  │  • Virtual walkthrough creation                         │  │
│  │  • Measurement reports                                  │  │
│  │  • 3D model export (OBJ, PLY, etc.)                     │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

#### LARI-Reasoning Engine

**Purpose**: Workflow orchestration and decision support

**Architecture:**

```
┌───────────────────────────────────────────────────────────────┐
│             LARI-Reasoning Engine                              │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Context Aggregation                                    │  │
│  │  • Gather inputs from all LARI engines                  │  │
│  │  • Compile inspection data                              │  │
│  │  • Historical context retrieval                         │  │
│  │  • User preferences and settings                        │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Decision Tree Models                                   │  │
│  │  • Rule-based logic trees                               │  │
│  │  • Machine learning classifiers                         │  │
│  │  • Bayesian inference                                   │  │
│  │  • Expert system rules                                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Risk Assessment                                        │  │
│  │  • Severity scoring (1-10 scale)                        │  │
│  │  • Probability estimation                               │  │
│  │  • Impact analysis                                      │  │
│  │  • Prioritization ranking                               │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Recommendation Generation                              │  │
│  │  • Corrective actions                                   │  │
│  │  • Compliance steps                                     │  │
│  │  • Cost estimates                                       │  │
│  │  • Timeline projections                                 │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Compliance Verification                                │  │
│  │  • Code requirement checking                            │  │
│  │  • Multi-jurisdictional validation                      │  │
│  │  • Certification requirements                           │  │
│  │  • Regulatory reporting                                 │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

#### LARI-Guardian Engine

**Purpose**: Monitoring, alerting, and predictive maintenance

**Key Features:**
- Real-time monitoring of inspection data
- Anomaly detection algorithms
- Predictive maintenance forecasting
- Safety scoring and risk alerts
- Trend analysis and reporting

#### LARI-Narrator Engine

**Purpose**: Natural language report generation

**Capabilities:**
- Professional report templates
- Natural language generation
- Multi-format export (PDF, DOCX, HTML)
- Branded output customization
- Citation and reference management

#### LARI-Social Engine

**Purpose**: Community and collaboration features (future)

**Planned Features:**
- Content moderation AI
- Sentiment analysis
- Trust scoring
- Recommendation algorithms
- Collaboration tools

#### LARI-Fi Engine

**Purpose**: Billing intelligence and revenue optimization

**Functions:**
- Usage tracking and analytics
- Subscription management
- Revenue optimization
- Fraud detection
- Payment processing integration

### BANE: Security Governor

BANE (Backend Augmented Neural Engine) enforces zero-trust security across all operations.

**Architecture:**

```
┌───────────────────────────────────────────────────────────────┐
│                   BANE Security Governor                       │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Capability-Based Authorization                         │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │  Capability Token Structure                        │ │  │
│  │  │  {                                                 │ │  │
│  │  │    "user_id": "...",                               │ │  │
│  │  │    "capabilities": ["inspect", "report", ...],     │ │  │
│  │  │    "scope": {...},                                 │ │  │
│  │  │    "issued_at": "...",                             │ │  │
│  │  │    "expires_at": "...",                            │ │  │
│  │  │    "signature": "..."                              │ │  │
│  │  │  }                                                 │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  │  • RBAC (Role-Based Access Control)                     │  │
│  │  • ABAC (Attribute-Based Access Control)                │  │
│  │  • Dynamic capability elevation                         │  │
│  │  • Context-aware permissions                            │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Security Decision Records (SDR)                        │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │  SDR Structure                                     │ │  │
│  │  │  {                                                 │ │  │
│  │  │    "id": "...",                                    │ │  │
│  │  │    "timestamp": "...",                             │ │  │
│  │  │    "actor": "...",                                 │ │  │
│  │  │    "action": "...",                                │ │  │
│  │  │    "resource": "...",                              │ │  │
│  │  │    "result": "granted|denied",                     │ │  │
│  │  │    "reason": "...",                                │ │  │
│  │  │    "signature": "...",                             │ │  │
│  │  │    "hash_chain": "..."                             │ │  │
│  │  │  }                                                 │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                                                          │  │
│  │  • Cryptographic signing (Ed25519)                      │  │
│  │  • Hash chain for immutability                          │  │
│  │  • Tamper detection                                     │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  WORM Audit Logging                                     │  │
│  │  • Write Once Read Many storage                         │  │
│  │  • Firestore with security rules                        │  │
│  │  • Retention policies (7 years default)                 │  │
│  │  • Query and analysis tools                             │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Threat Detection                                       │  │
│  │  • Anomaly detection (unusual patterns)                 │  │
│  │  • Attack pattern recognition                           │  │
│  │  • Rate limiting and throttling                         │  │
│  │  • "Demon Mode" - aggressive defense                    │  │
│  │  • Automated incident response                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                          ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  Policy Engine                                          │  │
│  │  • Policy definition language (JSON-based)              │  │
│  │  • Rule evaluation logic                                │  │
│  │  • Policy versioning                                    │  │
│  │  • Dynamic policy updates                               │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

**Security Flows:**

1. **Authentication Flow:**
   - User provides credentials
   - Firebase Auth validates
   - BANE issues capability token
   - Token includes granted capabilities
   - Token cryptographically signed

2. **Authorization Flow:**
   - Client requests action with token
   - BANE validates token signature
   - Checks capabilities match required action
   - Evaluates context (time, location, device)
   - Grants or denies with SDR logging

3. **Audit Flow:**
   - Every privileged action logged
   - SDR created and signed
   - Hash chain links to previous SDR
   - WORM storage ensures immutability
   - Query tools for compliance reporting

---

## AIP Protocol Deep Dive

The Augmented Intelligence Portal (AIP) protocol is the communication backbone of ScingOS.

### Protocol Stack

```
┌────────────────────────────────────────────────┐
│  Application Layer - AIP Messages              │
│  (JSON payloads, command/response)             │
└────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────┐
│  Presentation Layer - Serialization            │
│  (JSON encoding/decoding, compression)         │
└────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────┐
│  Session Layer - AIP Session Management        │
│  (Handshake, heartbeat, reconnection)          │
└────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────┐
│  Transport Layer - WebSocket / HTTPS           │
│  (ws:// or wss:// with fallback to long-poll)  │
└────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────┐
│  Security Layer - TLS 1.3                      │
│  (Certificate validation, encryption)          │
└────────────────────────────────────────────────┘
                    ▼
┌────────────────────────────────────────────────┐
│  Network Layer - TCP/IP                        │
└────────────────────────────────────────────────┘
```

### Connection Establishment

**WebSocket Handshake:**

```typescript
// Client initiates connection
const socket = new WebSocket('wss://api.scingos.ai/aip/v1');

// Server responds with upgrade
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: ...
Sec-WebSocket-Protocol: aip-v1
```

**Authentication Flow:**

```
Client                            Server
  │                                  │
  ├──── Connect (WebSocket) ────────▶│
  │                                  │
  │◀──── Connection Established ─────┤
  │                                  │
  ├──── AUTH_REQUEST ───────────────▶│
  │   { type: "auth_request",        │
  │     token: "Firebase_ID_Token" } │
  │                                  │
  │                                  ├─ Validate token
  │                                  ├─ Check BANE policies
  │                                  ├─ Issue capabilities
  │                                  │
  │◀──── AUTH_RESPONSE ──────────────┤
  │   { type: "auth_response",       │
  │     status: "success",            │
  │     capabilities: [...],          │
  │     session_id: "..." }           │
  │                                  │
  ├──── READY ──────────────────────▶│
  │                                  │
```

### Session Management

**Session Lifecycle:**

1. **Initialization**: Authentication and capability grant
2. **Active**: Command/response exchanges
3. **Idle**: Heartbeat maintenance
4. **Suspended**: Network interruption, reconnection pending
5. **Terminated**: Logout or timeout

**Heartbeat Mechanism:**

```javascript
// Client sends heartbeat every 30 seconds
{
  "type": "heartbeat",
  "timestamp": "2025-12-12T19:00:00Z",
  "session_id": "..."
}

// Server responds
{
  "type": "heartbeat_ack",
  "timestamp": "2025-12-12T19:00:00Z",
  "server_time": "2025-12-12T19:00:00.123Z"
}
```

### Message Format

**Standard Message Structure:**

```typescript
interface AIPMessage {
  type: string;                    // Message type
  id: string;                      // Unique message ID
  timestamp: string;               // ISO 8601 timestamp
  session_id?: string;             // Session identifier
  payload: any;                    // Type-specific payload
  signature?: string;              // Optional cryptographic signature
}
```

**Message Types:**

1. **Authentication Messages:**
   - `auth_request`: Initial authentication
   - `auth_response`: Auth result with capabilities
   - `token_refresh`: Refresh expired token

2. **Capability Messages:**
   - `capability_request`: Request additional capabilities
   - `capability_grant`: Grant capabilities
   - `capability_revoke`: Revoke capabilities

3. **Command Messages:**
   - `voice_command`: Voice input from user
   - `device_data`: Data from integrated devices
   - `query`: Data query request

4. **Response Messages:**
   - `command_result`: Result of command execution
   - `query_result`: Query response
   - `error`: Error information

5. **Streaming Messages:**
   - `stream_start`: Begin data stream
   - `stream_data`: Stream chunk
   - `stream_end`: End stream

6. **Status Messages:**
   - `status_update`: System status change
   - `notification`: User notification
   - `heartbeat`: Keep-alive ping

### Data Streaming

**Streaming Protocol for Large Data:**

```javascript
// Start stream
{
  "type": "stream_start",
  "stream_id": "...",
  "content_type": "audio/wav",
  "total_size": 1024000
}

// Stream chunks
{
  "type": "stream_data",
  "stream_id": "...",
  "sequence": 1,
  "data": "base64_encoded_chunk..."
}

// End stream
{
  "type": "stream_end",
  "stream_id": "...",
  "checksum": "sha256_hash"
}
```

### Security Features

**End-to-End Encryption:**
- TLS 1.3 for transport
- Additional application-layer encryption for sensitive data
- Perfect forward secrecy

**Message Signing:**
- Critical messages signed with Ed25519
- Signature verification on receipt
- Replay attack protection via timestamp + nonce

### Error Handling

**Error Code Catalog:**

| Code | Category | Description |
|------|----------|-------------|
| 1000 | Auth | Authentication failed |
| 1001 | Auth | Token expired |
| 1002 | Auth | Insufficient capabilities |
| 2000 | Protocol | Invalid message format |
| 2001 | Protocol | Unsupported protocol version |
| 3000 | Engine | LARI engine error |
| 3001 | Engine | Timeout |
| 4000 | Data | Invalid input data |
| 4001 | Data | Data not found |
| 5000 | System | Internal server error |

**Retry Logic:**
- Exponential backoff: 1s, 2s, 4s, 8s, 16s
- Maximum 5 retries
- Permanent failures don't retry

### Upgrade Framework

**Version Negotiation:**

```javascript
// Client announces supported versions
{
  "type": "version_negotiation",
  "supported_versions": ["1.0", "1.1", "2.0"]
}

// Server selects version
{
  "type": "version_selected",
  "version": "1.1",
  "features": ["streaming", "compression", "binary"]
}
```

**Feature Detection:**
- Clients declare supported features
- Server enables compatible features
- Graceful degradation for unsupported features

---

## Data Flow

### Complete Inspection Workflow

```
User Voice Command
      │
      ▼
┌─────────────────┐
│  1. Wake Word   │ "Hey, Scing!"
│     Detection   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  2. Speech to   │ Google Cloud STT
│     Text (STT)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  3. NLP         │ Intent: "start_inspection"
│     Processing  │ Entities: {"type": "residential"}
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  4. BANE Auth   │ Check capabilities
│     Check       │ Issue SDR
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  5. LARI        │
│    Routing      │
└────────┬────────┘
         │
         ├──────────────────┬──────────────────┬────────────────┐
         │                  │                  │                │
         ▼                  ▼                  ▼                ▼
┌──────────────┐   ┌──────────────┐  ┌──────────────┐  ┌─────────────┐
│LARI-Language │   │ LARI-Vision  │  │ LARI-Mapper  │  │LARI-Reasoning│
│              │   │              │  │              │  │              │
│Fetch codes   │   │Analyze images│  │Process LiDAR │  │Assess risk   │
│ICC, NFPA, etc│   │Detect defects│  │Create 3D map │  │Recommend     │
└──────┬───────┘   └──────┬───────┘  └──────┬───────┘  └──────┬──────┘
       │                  │                  │                  │
       └──────────────────┴──────────────────┴──────────────────┘
                                  │
                                  ▼
                          ┌──────────────┐
                          │LARI-Narrator │
                          │              │
                          │Generate      │
                          │Report        │
                          └──────┬───────┘
                                 │
                                 ▼
                          ┌──────────────┐
                          │  Firestore   │
                          │  Storage     │
                          │  Save Report │
                          └──────┬───────┘
                                 │
                                 ▼
                          ┌──────────────┐
                          │  TTS         │
                          │  "Report     │
                          │   generated" │
                          └──────┬───────┘
                                 │
                                 ▼
                          ┌──────────────┐
                          │  User        │
                          │  Receives    │
                          │  Audio +     │
                          │  Visual      │
                          │  Feedback    │
                          └──────────────┘
```

---

## Neural 3D Environment Architecture

### React Three Fiber Integration

**Component Hierarchy:**

```
App
└── NeuralEnvironment
    ├── Canvas (R3F)
    │   ├── Scene3D
    │   │   ├── AvatarMesh
    │   │   ├── ParticleSystem
    │   │   ├── EnvironmentLighting
    │   │   └── BackgroundShader
    │   ├── Camera (PerspectiveCamera)
    │   └── Effects
    │       ├── Bloom
    │       └── ChromaticAberration
    └── HUD (HTML Overlay)
        ├── NeuralModeIndicator
        ├── IntensityMeter
        └── StatusMessages
```

### Firebase State Management

**Neural State Document:**

```javascript
// Firestore: neural/current
{
  "mode": "thinking",           // idle | thinking | speaking | error
  "intensity": 0.75,             // 0.0 - 1.0
  "timestamp": "...",
  "active_engines": [
    "lari-language",
    "lari-vision"
  ],
  "current_task": "analyzing_image"
}
```

**Real-time Synchronization:**

```typescript
// Client subscribes to neural state
const unsubscribe = onSnapshot(
  doc(db, 'neural', 'current'),
  (snapshot) => {
    const state = snapshot.data();
    updateNeuralVisuals(state);
  }
);
```

### Mock vs Live Neural State

**Development Mode:**

```typescript
// hooks/useNeuralVisualState.ts
const useLiveNeuralState = 
  process.env.NEXT_PUBLIC_USE_FIREBASE_NEURAL === 'true';

if (useLiveNeuralState) {
  // Subscribe to Firebase
  return useFirebaseNeuralState();
} else {
  // Use mock cycling state
  return useMockNeuralState();
}
```

---

## Client-Server Communication

### Sequence Diagram: Voice Command

```
User    Client         AIP          BANE         LARI         Firebase
 │         │            │            │            │             │
 │─speak─▶ │            │            │            │             │
 │         │──connect──▶│            │            │             │
 │         │◀─ack───────│            │            │             │
 │         │─auth_req──▶│───verify──▶│            │             │
 │         │            │◀─granted───│            │             │
 │         │◀auth_resp──│            │            │             │
 │         │            │            │            │             │
 │         │─voice_cmd─▶│──check────▶│            │             │
 │         │            │◀─allowed───│            │             │
 │         │            │─route─────────────────▶ │             │
 │         │            │                         │─process────▶│
 │         │            │                         │◀─data───────│
 │         │            │◀─result────────────────│             │
 │         │◀─response──│            │            │             │
 │◀audio───│            │            │            │             │
```

---

## Security Architecture

### Token Flow

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Login (email/password)
     ▼
┌────────────────┐
│ Firebase Auth  │
└────┬───────────┘
     │ 2. ID Token
     ▼
┌────────────────┐
│  AIP Gateway   │
└────┬───────────┘
     │ 3. Verify + Request Capabilities
     ▼
┌────────────────┐
│     BANE       │
└────┬───────────┘
     │ 4. Issue Capability Token
     ▼
┌────────────────┐
│   Client       │
│  (stores token)│
└────┬───────────┘
     │ 5. Subsequent requests include token
     ▼
┌────────────────┐
│  AIP Endpoint  │
└────┬───────────┘
     │ 6. Validate token + Check capability
     ▼
┌────────────────┐
│     BANE       │
└────┬───────────┘
     │ 7. Grant/Deny + Create SDR
     ▼
┌────────────────┐
│   Firestore    │
│  (audit log)   │
└────────────────┘
```

### Encryption

**At Rest:**
- Firestore: AES-256 encryption (Google-managed keys)
- Cloud Storage: AES-256 encryption
- Secrets: Google Secret Manager

**In Transit:**
- TLS 1.3 for all connections
- Perfect forward secrecy (PFS)
- Certificate pinning on mobile (future)

### Audit Logging

**Logged Events:**
- Authentication attempts
- Capability grants/denials
- Data access
- Report generation
- Configuration changes
- Security incidents

**Log Retention:**
- 7 years for compliance-related logs
- 1 year for operational logs
- Indefinite for security incidents

---

## File System Architecture

### .sg* Proprietary Extensions Catalog

| Extension | Purpose | Use Case |
|-----------|---------|----------|
| `.sga` | Agent profile | UI agent manifests |
| `.sgu` | User personalization | User preferences and keys |
| `.sgt` | Task specification | Assignment and status tracking |
| `.sgpck` | Installable package | Feature packages with licensing |
| `.sguapp` | App installer | Application updates |
| `.sgm` | AI model | Model configs and weights |
| `.sgd` | Structured data | Report data and snapshots |
| `.sgx` | Memory bundle | Session context and history |
| `.sgn` | Data memory sidecar | Inspection data fragments |
| `.sgk` | Legal/contract | Terms and licenses |
| `.sge` | Entitlement artifact | Jurisdiction and export control |
| `.sgi` | Sensitive artifact | Regulated data with policies |

See [File Extension Documentation](../FILE-EXTENSION.md) for complete specifications.

---

## Deployment Models

### Cloud-Native (Current)

**Architecture:**
- Firebase Hosting for web client
- Firebase Functions for backend logic
- Firestore for database
- Cloud Storage for media
- Google Cloud AI for ML

**Benefits:**
- Zero infrastructure management
- Auto-scaling
- High availability
- Global CDN
- Pay-per-use pricing

### Hybrid Deployment

**Architecture:**
- Cloud AI processing
- On-premise data storage
- VPN/private interconnect
- Local caching

**Use Cases:**
- Data sovereignty requirements
- Regulated industries
- Cost optimization for large datasets

### Owned Infrastructure (Future)

**Migration Path:**
- Phase 1: Cloud-native (current)
- Phase 2: Hybrid with data replication
- Phase 3: Full migration to owned servers
- Phase 4: Cloud as backup/DR

**Target Architecture:**
- Kubernetes cluster
- Self-hosted databases
- Private AI model hosting
- Edge locations for low latency

---

## Technology Stack

### Cloud Layer

| Component | Technology | Version |
|-----------|------------|---------|
| Authentication | Firebase Auth | Latest |
| Database | Firestore | Latest |
| Storage | Cloud Storage | Latest |
| Functions | Cloud Functions | Node.js 20 |
| AI/ML | Google Cloud AI | Gemini 1.5 |
| Speech | Cloud Speech-to-Text | V2 |
| TTS | Cloud Text-to-Speech | Latest |
| Hosting | Firebase Hosting | Latest |

### Client Layer

| Component | Technology | Version |
|-----------|------------|---------|
| Framework | Next.js | 14.x |
| UI Library | React | 18.x |
| Language | TypeScript | 5.x |
| 3D Graphics | React Three Fiber | 8.x |
| 3D Engine | Three.js | 0.160+ |
| State | React Context | - |
| Styling | Tailwind CSS | 3.x |
| Desktop | Tauri | 1.x |

### Development Tools

| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| Prettier | Code formatting |
| Jest | Unit testing |
| Playwright | E2E testing |
| Husky | Git hooks |
| Commitlint | Commit message linting |

---

## Scalability Considerations

### Horizontal Scaling

**Firebase Auto-scaling:**
- Cloud Functions scale automatically
- Firestore scales to millions of operations
- Cloud Storage handles petabytes
- No manual configuration required

**Load Distribution:**
- Global CDN for static assets
- Regional Cloud Functions deployment
- Read replicas for Firestore (future)

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Voice command latency | < 500ms | ~800ms |
| Image analysis | < 3s | ~5s |
| Report generation | < 10s | ~15s |
| 3D scene render | 60 FPS | 45-60 FPS |
| AIP message latency | < 100ms | ~150ms |

### Optimization Strategies

**Client-side:**
- Code splitting and lazy loading
- Image optimization and compression
- 3D model LOD (Level of Detail)
- Service worker caching

**Server-side:**
- Database query optimization
- Firestore index tuning
- Cloud Function cold start reduction
- CDN caching strategies

---

## Integration Points

### Firebase Services

**Authentication:**
- Email/password
- Google OAuth
- Custom tokens (for AIP)
- Future: SAML, hardware keys

**Firestore Collections:**
```
users/
  {userId}/
    profile
    preferences
    sessions/
inspections/
  {inspectionId}/
    metadata
    findings/
    media/
reports/
  {reportId}/
    content
    metadata
devices/
  {deviceId}/
    configuration
    data/
neural_state/
  current
  history/
audit_logs/
  {logId}/
```

### Google Cloud AI

**APIs Used:**
- Gemini 1.5 Flash (vision and language)
- Cloud Speech-to-Text (voice input)
- Cloud Text-to-Speech (voice output)
- Cloud Translation (future multi-language)

### Third-Party APIs

**Planned Integrations:**
- Weather APIs (environmental context)
- Mapping services (location data)
- Payment processors (Stripe)
- Email services (SendGrid)
- SMS services (Twilio)

---

## Performance Optimization

### Database Optimization

**Firestore Indexes:**
- Composite indexes for common queries
- Single-field indexes on frequently filtered fields
- TTL policies for temporary data

**Query Patterns:**
- Pagination for large result sets
- Limit queries to 50-100 results
- Use cursors for infinite scroll
- Cache frequently accessed data

### Network Optimization

**Compression:**
- Gzip for text data
- WebP for images
- Opus for audio
- H.264 for video

**CDN Strategy:**
- Cache static assets indefinitely
- Cache API responses (where appropriate)
- Regional edge locations
- Pre-warming cache for common requests

### 3D Rendering Optimization

**Level of Detail:**
- Multiple LOD levels for complex models
- Distance-based switching
- Frustum culling
- Occlusion culling (future)

**Shader Optimization:**
- Simplified shaders for mobile
- Instanced rendering for particles
- Texture atlasing
- Geometry instancing

---

## Disaster Recovery

### Backup Architecture

**Firestore Backups:**
- Automated daily backups
- 30-day retention
- Point-in-time recovery
- Cross-region replication

**Cloud Storage Backups:**
- Versioning enabled
- Lifecycle policies
- Cross-region replication
- 90-day retention for deleted files

### Recovery Procedures

**Database Recovery:**
1. Identify backup point
2. Create new Firestore database
3. Restore from backup
4. Update application config
5. Verify data integrity
6. Switch traffic

**Estimated RTO:** 4 hours  
**Estimated RPO:** 24 hours

### Business Continuity

**Service Redundancy:**
- Multi-region deployment
- Automatic failover
- Health monitoring
- Incident response plan

**Communication Plan:**
- Status page for service updates
- Email notifications
- In-app messaging
- Social media updates

---

## Conclusion

The ScingOS architecture is designed for scalability, security, and extensibility. The three-layer design (Cloud, Protocol, Client) provides clear separation of concerns while maintaining tight integration through the AIP protocol.

Key architectural strengths:
- **Zero-trust security** via BANE
- **Real-time communication** via AIP
- **Modular AI engines** via LARI
- **Thin-client design** for universal access
- **Cloud-native** for automatic scaling
- **Observable systems** for monitoring and debugging

For more details on specific components, see:
- [AIP Protocol Specification](AIP-Protocol.md)
- [BANE Security Framework](BANE-Security.md)
- [LARI Engines Documentation](LARI-Engines.md)
- [Development Guide](Development-Guide.md)

---

_Architecture documentation maintained by the ScingOS engineering team. Last updated: December 2025._
