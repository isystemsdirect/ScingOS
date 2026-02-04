# CB: ScingGPT App Development in VSC

> **Context Block**: All information related to the development, updates, and integration of the ScingGPT app within Visual Studio Code (VSC).

---

## 📋 App Overview

| Property | Value |
|----------|-------|
| **App Name** | ScingGPT |
| **Role** | Control node of the SCINGULAR Ecosystem |
| **Location** | `apps/scinggpt/` |
| **MCP Server** | `G:/GIT/isystemsdirect/scinggpt-mcp/dist/server.js` |
| **Purpose** | Intelligence core behind all SCINGULAR operations via voice-first, session-oriented interface |

---

## 🏗️ Architecture

```
ScingGPT
├── Electron Shell (Desktop UI)
│   ├── Voice Interaction Layer
│   ├── Session Manager
│   └── IPC Bridge
├── Node.js Backend
│   ├── MCP Integration (scinggpt-mcp)
│   ├── API Gateway
│   └── Session State
├── Firebase Services
│   ├── Authentication
│   ├── Firestore (Real-time sync)
│   ├── Cloud Functions
│   └── Storage
└── External APIs
    ├── OpenAI GPT
    ├── Anthropic Claude
    └── Google Cloud APIs
```

---

## 🛠️ Tech Stack

### Core
| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | Node.js | >=20 |
| Language | TypeScript | ^5.9.x |
| Desktop Framework | Electron | ^28.x |
| Build Tool | Vite | ^5.x |

### Backend Services
| Service | Technology |
|---------|------------|
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| Functions | Firebase Cloud Functions |
| Storage | Firebase Storage |
| MCP Server | scinggpt-mcp (stdio) |

### AI/LLM Integration
| Provider | Package |
|----------|---------|
| OpenAI | openai ^4.20.x |
| Anthropic | @anthropic-ai/sdk ^0.24.x |
| MCP Protocol | @modelcontextprotocol/sdk |

---

## 📁 Project Structure

```
apps/scinggpt/
├── package.json
├── tsconfig.json
├── electron-builder.json
├── vite.config.ts
├── src/
│   ├── main/                    # Electron main process
│   │   ├── main.ts
│   │   ├── ipc-handlers.ts
│   │   ├── session-manager.ts
│   │   └── mcp-bridge.ts
│   ├── preload/                 # Preload scripts
│   │   └── preload.ts
│   ├── renderer/                # Frontend UI
│   │   ├── App.tsx
│   │   ├── index.html
│   │   ├── main.tsx
│   │   ├── components/
│   │   │   ├── VoiceInput.tsx
│   │   │   ├── ChatInterface.tsx
│   │   │   ├── SessionPanel.tsx
│   │   │   └── StatusBar.tsx
│   │   ├── hooks/
│   │   │   ├── useVoice.ts
│   │   │   ├── useSession.ts
│   │   │   └── useMCP.ts
│   │   ├── stores/
│   │   │   ├── sessionStore.ts
│   │   │   └── chatStore.ts
│   │   └── styles/
│   │       └── globals.css
│   ├── shared/                  # Shared types & utils
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   └── ipc-channels.ts
│   └── services/                # Backend services
│       ├── firebase.ts
│       ├── openai.ts
│       ├── mcp-client.ts
│       └── voice-recognition.ts
├── tests/
│   ├── unit/
│   └── integration/
└── resources/
    └── icons/
```

---

## 🔑 API Integrations

### ScingGPT MCP Server
- **Path**: `G:/GIT/isystemsdirect/scinggpt-mcp/dist/server.js`
- **Type**: stdio
- **Config**: Defined in `mcp.json`

### Firebase Configuration
- **Project**: scingular-ai
- **Config File**: `firebase.json`
- **Emulators**: Auth (9099), Functions (5001), Firestore (8080), Storage (9199)

### OpenAI API
- **Model**: gpt-4-turbo / gpt-4o
- **Env Var**: `OPENAI_API_KEY`

### Anthropic API
- **Model**: claude-3-opus / claude-3-sonnet
- **Env Var**: `ANTHROPIC_API_KEY`

---

## 🎯 Key Features

### 1. Voice Interaction
- Web Speech API for browser-based recognition
- Optional native speech recognition via Electron
- Wake word detection ("Hey Scing")
- Voice feedback/TTS for responses

### 2. Session Management
- Persistent sessions across app restarts
- Session state stored in Firestore
- Local session cache for offline support
- Multi-device session sync

### 3. MCP Integration
- Direct stdio communication with scinggpt-mcp
- Tool execution via MCP protocol
- SpectroLINE lane integration
- Real-time tool results streaming

### 4. Cloud Sync
- Real-time Firestore synchronization
- Offline-first architecture
- Conflict resolution strategies
- Secure data encryption at rest

---

## 🔐 Security Considerations

### Authentication
- Firebase Authentication (OAuth, Email/Password)
- Session tokens with expiration
- Secure IPC between Electron processes

### Data Protection
- End-to-end encryption for sensitive data
- Secure storage of API keys (electron-store + keytar)
- GDPR-compliant data handling

### Network Security
- HTTPS-only communication
- Certificate pinning for critical endpoints
- Rate limiting on API calls

### MCP Gate (Remote)
- Read-only mode by default (REMOTE_GATE.json)
- Allowed tools whitelist
- Audit logging for all requests

---

## 📦 Dependencies

### Core Dependencies
```json
{
  "electron": "^28.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "zustand": "^4.4.7",
  "firebase": "^10.7.1",
  "openai": "^4.20.1",
  "@anthropic-ai/sdk": "^0.24.0",
  "@modelcontextprotocol/sdk": "^1.0.0"
}
```

### Dev Dependencies
```json
{
  "typescript": "^5.3.3",
  "vite": "^5.0.2",
  "electron-builder": "^24.9.1",
  "@vitejs/plugin-react": "^4.2.1",
  "vitest": "^1.0.0"
}
```

---

## 🧪 Testing Strategy

### Unit Testing
- Framework: Vitest
- Coverage target: 80%
- Focus: Services, hooks, utilities

### Integration Testing
- Firebase emulator suite
- MCP mock server
- IPC channel testing

### E2E Testing
- Playwright for Electron
- Voice interaction mocking
- Session flow validation

### Load Testing
- Artillery for API endpoints
- Concurrent session simulation
- Memory leak detection

---

## 🚀 Development Workflow

### Setup
```powershell
cd apps/scinggpt
npm install
npm run dev
```

### Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start Electron in dev mode |
| `npm run build` | Build for production |
| `npm run test` | Run test suite |
| `npm run lint` | ESLint check |
| `npm run package` | Create distributable |

---

## 🌿 Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `develop` | Integration branch for features |
| `feature/scinggpt-*` | Individual features |
| `hotfix/scinggpt-*` | Emergency fixes |

### Current Branch
- **Active**: `scpsc-ultra-grade-foundation-clean`
- **Target**: Merge to `develop` after validation

---

## 📊 Deployment Pipeline

### CI/CD Stages
1. **Lint & Type Check** - ESLint + TypeScript validation
2. **Unit Tests** - Vitest with coverage
3. **Build** - Electron builder
4. **Integration Tests** - Firebase emulator suite
5. **Package** - Create installers (Win, Mac, Linux)
6. **Deploy** - Auto-publish to releases

### Platform Targets
- Windows (x64, arm64)
- macOS (x64, arm64)
- Linux (AppImage, deb)

---

## ✅ Actionable Next Steps

### Phase 1: Setup (Current)
- [x] CB document created
- [ ] Initialize `apps/scinggpt/` directory
- [ ] Create `package.json` with dependencies
- [ ] Set up TypeScript configuration
- [ ] Configure Vite + Electron

### Phase 2: Backend
- [ ] Implement Firebase service layer
- [ ] Create MCP bridge for scinggpt-mcp
- [ ] Set up OpenAI/Anthropic clients
- [ ] Implement session manager

### Phase 3: Frontend
- [ ] Build Electron shell
- [ ] Create React UI components
- [ ] Implement voice interaction
- [ ] Design session panel

### Phase 4: Testing
- [ ] Unit test coverage
- [ ] Integration tests with emulators
- [ ] E2E test scenarios
- [ ] Load testing

### Phase 5: Deployment
- [ ] Configure electron-builder
- [ ] Set up CI/CD pipeline
- [ ] Create release workflow
- [ ] Documentation

---

## 📚 Related Resources

| Resource | Path |
|----------|------|
| MCP Config | `mcp.json` |
| Firebase Config | `firebase.json` |
| Cloud Functions | `cloud/functions/` |
| ScingGPT Remote Proxy | `.tools/scinggpt-remote/` |
| SpectroLINE Protocol | `.spectroline/SPECTROLINE_PROTOCOL.md` |
| Ask ScingGPT Script | `.tools/scinggpt/ask_scinggpt.ps1` |

---

*Last Updated: 2026-02-03*
*Branch: scpsc-ultra-grade-foundation-clean*
