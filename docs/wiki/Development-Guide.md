# Development Guide

## Executive Summary

This guide establishes technical standards and workflows for extending ScingOS functionality, developing custom device adapters, integrating with external systems, and contributing to the codebase. ScingOS employs a modular architecture with clearly defined extension points across LARI engines, device adapter framework, AIP protocol clients, and UI components. All development follows enterprise security standards enforced through BANE capability validation and comprehensive audit logging.

## Purpose & Scope

### Purpose

Enable developers to extend ScingOS capabilities while maintaining system integrity, security compliance, and architectural consistency. Provide clear pathways for: custom device adapter development, LARI engine integration, AIP protocol client implementation, and contribution to open-source components.

### Scope

**Included:**
- Development environment setup and toolchain configuration
- Repository structure and module architecture
- Device adapter development framework and interfaces
- LARI engine extension patterns (when applicable)
- AIP protocol client SDK usage
- Testing requirements and CI/CD integration
- Code quality standards and review process
- Security considerations for extensions

**Excluded:**
- SCINGULAR AI cloud infrastructure deployment (see [Deployment](Deployment.md))
- Firebase backend configuration (see [Firebase Integration](Firebase-Integration.md))
- End-user documentation (see [Getting Started](Getting-Started.md))
- Operational monitoring (see [Deployment](Deployment.md))

## Core Concepts

### Modular Architecture

ScingOS separates concerns across layers:
- **Client Layer:** Presentation, voice I/O, device integration (TypeScript, React, Tauri)
- **Protocol Layer:** AIP client SDK, WebSocket management, session handling
- **Adapter Layer:** Device abstraction, hardware integration, data normalization

Extensions integrate at defined interfaces without modifying core components.

### Device Adapter Framework

Base abstraction enables hardware integration:
- **Adapter Interface:** Standard methods (connect, disconnect, capture, configure)
- **Discovery Protocol:** Bluetooth, USB, WiFi enumeration
- **Data Streaming:** Real-time sensor data via AIP protocol
- **Metadata Attachment:** Device info, calibration, timestamps

Custom adapters implement base interface, register with framework, handle device-specific protocols.

### LARI Engine Integration

AI engines expose gRPC interfaces for specialized processing:
- **LARI-Language:** Code intelligence, NLP, semantic search
- **LARI-Vision:** Image analysis, defect detection, thermal processing
- **LARI-Reasoning:** Workflow orchestration, risk assessment
- **LARI-Narrator:** Report generation, natural language synthesis

Extensions may invoke engines via API (subject to BANE authorization).

See [LARI Engines](LARI-Engines.md) for detailed capabilities.

### Security Integration

All extensions operate under BANE security model:
- **Capability Requirements:** Explicit permissions for each operation
- **SDR Logging:** Audit trail for privileged actions
- **Data Minimization:** Access only required data
- **Sandboxing:** Isolate extension failures from core system

See [BANE Security](BANE-Security.md) for framework details.

## System / Process Flow

### Development Workflow

```
Fork Repository → Clone Locally → Install Dependencies →
  Configure Environment → Create Feature Branch →
  Implement Changes → Write Tests → Run Linting/Formatting →
  Local Testing → Commit Changes → Push to Fork →
  Create Pull Request → Code Review → CI/CD Validation →
  Merge to Main → Deployment Pipeline
```

### Device Adapter Development Flow

```
Define Requirements (device capabilities, data format) →
  Implement Base Adapter Interface →
  Add Discovery Logic (Bluetooth/USB/WiFi) →
  Implement Data Capture Methods →
  Add Metadata Attachment →
  Write Unit Tests →
  Integration Testing with Real Hardware →
  Submit Adapter for Review →
  Inclusion in Device Adapter Registry
```

### Extension Deployment Flow

```
Development → Testing → Security Review (BANE validation) →
  Package Extension → Version Tagging → Distribution →
  Installation on Client → Capability Grant (BANE) →
  Activation → Monitoring & Logging
```

## Interfaces & Dependencies

### Repository Structure

```
ScingOS/
├── client/               # Client application (Next.js, Tauri)
│   ├── components/       # React components
│   ├── lib/              # Utilities, hooks, AIP client
│   ├── pages/            # Next.js pages
│   └── public/           # Static assets
├── cloud/                # Firebase Cloud Functions
│   └── functions/        # Serverless functions
│       ├── src/
│       │   ├── isdc/     # ISDC Protocol implementation
│       │   ├── bane/     # BANE security modules
│       │   └── adapters/ # Device adapter registry
│       └── package.json
├── docs/                 # Documentation
│   └── wiki/             # Wiki documentation
├── .github/              # CI/CD workflows
└── package.json          # Root package configuration
```

### Technology Stack

**Client:**
- **Framework:** Next.js 14, React 18
- **Language:** TypeScript 5+
- **3D Graphics:** React Three Fiber 8, Three.js 0.160+
- **Desktop:** Tauri 1.x
- **State:** React Context, Firebase Realtime SDK
- **Styling:** Tailwind CSS 3

**Backend:**
- **Platform:** Firebase (Auth, Firestore, Functions, Storage, Hosting)
- **Runtime:** Node.js 20 (Cloud Functions)
- **AI:** Google Cloud AI (Gemini 1.5 models)
- **Protocol:** Custom AIP over WebSocket

**Development Tools:**
- **Linting:** ESLint with TypeScript plugins
- **Formatting:** Prettier
- **Testing:** Jest (unit), Playwright (E2E)
- **CI/CD:** GitHub Actions
- **Version Control:** Git, Conventional Commits

### Development Environment Setup

**Prerequisites:**
```bash
# Node.js 18+ (recommend via nvm)
nvm install 20
nvm use 20

# Package manager
npm install -g pnpm

# Firebase CLI
npm install -g firebase-tools

# Tauri prerequisites (for desktop development)
# See https://tauri.app/v1/guides/getting-started/prerequisites
```

**Repository Setup:**
```bash
# Clone repository
git clone https://github.com/isystemsdirect/ScingOS.git
cd ScingOS

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with Firebase credentials

# Start development server
pnpm dev
```

**Firebase Configuration:**
1. Create Firebase project (or use existing)
2. Enable Authentication, Firestore, Storage, Functions, Hosting
3. Download service account key
4. Update `.env` with project credentials

See [Firebase Integration](Firebase-Integration.md) for detailed configuration.

### AIP Protocol Client SDK

**Installation:**
```bash
pnpm add @scingos/aip-client
```

**Basic Usage:**
```typescript
import { AIPClient } from '@scingos/aip-client';

const client = new AIPClient({
  endpoint: 'wss://api.scingos.ai/aip/v1',
  authToken: firebaseIdToken,
});

await client.connect();

// Send command
const response = await client.sendCommand({
  type: 'voice_command',
  payload: { text: 'start inspection' }
});

// Subscribe to events
client.on('status_update', (status) => {
  console.log('Status:', status);
});
```

See [AIP Protocol](AIP-Protocol.md) for complete specification.

## Security, Privacy & Governance

### Secure Development Practices

**Code Security:**
- No hardcoded credentials (use environment variables)
- Input validation on all external data
- SQL injection prevention (use parameterized queries)
- XSS prevention (sanitize HTML, use React's JSX escaping)
- CSRF protection (use Firebase Auth tokens)

**Dependency Management:**
- Regular security audits via `pnpm audit`
- Automated updates via Dependabot
- License compliance checking
- Avoid dependencies with known vulnerabilities

### Capability-Based Authorization

**Extension Permissions:**
All extension code must request capabilities via BANE:

```typescript
import { requestCapability } from '@scingos/bane-client';

async function performPrivilegedAction() {
  const granted = await requestCapability({
    capability: 'device:read',
    scope: { deviceId: 'thermal-camera-1' },
    reason: 'Capture thermal image for inspection'
  });
  
  if (!granted) {
    throw new Error('Capability not granted');
  }
  
  // Proceed with action
}
```

**SDR Logging:**
Privileged actions automatically logged:

```typescript
import { createSDR } from '@scingos/bane-client';

await createSDR({
  action: 'device_data_capture',
  actor: userId,
  resource: 'thermal-camera-1',
  result: 'success',
  metadata: { imageCount: 3 }
});
```

### Data Privacy

**User Data Handling:**
- Minimize data collection (collect only what's necessary)
- Encrypt sensitive data before storage
- Respect user privacy settings
- Implement data deletion on user request
- GDPR/CCPA compliance for PII

**Voice Data:**
- Opt-in required for voice recording retention
- Anonymization before training data usage
- User-configurable retention policies
- Explicit consent for sharing

## Operational Notes

### Code Quality Standards

**Linting:**
```bash
# Run ESLint
pnpm lint

# Auto-fix issues
pnpm lint:fix
```

**Formatting:**
```bash
# Check formatting
pnpm format:check

# Auto-format
pnpm format
```

**Type Checking:**
```bash
# TypeScript type check
pnpm typecheck
```

### Testing Requirements

**Unit Tests:**
- **Coverage:** Minimum 70% for new code
- **Framework:** Jest with React Testing Library
- **Location:** Co-located with source (`*.test.ts`, `*.test.tsx`)
- **Run:** `pnpm test`

```typescript
// Example unit test
import { render, screen } from '@testing-library/react';
import { InspectionButton } from './InspectionButton';

test('renders inspection button', () => {
  render(<InspectionButton />);
  expect(screen.getByText('Start Inspection')).toBeInTheDocument();
});
```

**Integration Tests:**
- Test component interactions
- Mock Firebase services
- Test device adapter integration
- Run: `pnpm test:integration`

**E2E Tests:**
- **Framework:** Playwright
- **Scenarios:** Critical user flows (login, inspection, report generation)
- **Run:** `pnpm test:e2e`

### CI/CD Integration

**GitHub Actions Workflows:**
- **Lint & Type Check:** On every commit
- **Unit Tests:** On PR creation and updates
- **E2E Tests:** On merge to main
- **Build Validation:** Ensure client builds successfully
- **Deploy:** Automatic deployment to staging/production (conditional)

**Quality Gates:**
- All tests pass
- Linting passes
- Type checking passes
- No security vulnerabilities (pnpm audit)
- Code review approved

### Version Control

**Branching Strategy:**
- `main`: Stable, production-ready code
- `develop`: Integration branch for features
- `feature/*`: Feature development
- `bugfix/*`: Bug fixes
- `hotfix/*`: Emergency production fixes

**Commit Messages:**
Follow Conventional Commits:
```
feat(device-adapter): add FLIR thermal camera support
fix(voice): improve wake word detection accuracy
docs(wiki): update LARI engines documentation
chore(deps): update Firebase SDK to v10
```

**Pull Request Process:**
1. Create PR from feature branch to develop
2. Automated CI/CD checks run
3. Code review (minimum 1 approval required)
4. Address review feedback
5. Merge using squash commits

## Implementation Notes

### Device Adapter Development

**Base Adapter Interface:**
```typescript
interface DeviceAdapter {
  // Lifecycle
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  
  // Configuration
  configure(config: DeviceConfig): Promise<void>;
  getCapabilities(): DeviceCapabilities;
  
  // Data Capture
  capture(): Promise<DeviceData>;
  stream(callback: (data: DeviceData) => void): () => void; // Returns cleanup
  
  // Metadata
  getMetadata(): DeviceMetadata;
}
```

**Example: Thermal Camera Adapter:**
```typescript
import { BaseAdapter } from '@scingos/adapters';

export class FLIRThermalAdapter extends BaseAdapter {
  async connect(): Promise<void> {
    // Bluetooth discovery and connection
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['thermal-imaging-service'] }]
    });
    await device.gatt.connect();
    // Store connection reference
  }
  
  async capture(): Promise<DeviceData> {
    // Capture thermal image
    const imageData = await this.readCharacteristic('thermal-image');
    
    return {
      type: 'thermal-image',
      data: imageData,
      metadata: {
        deviceId: this.deviceId,
        timestamp: new Date().toISOString(),
        temperature: { min: -20, max: 120 },
        resolution: { width: 160, height: 120 }
      }
    };
  }
  
  // Implement other interface methods...
}
```

**Adapter Registration:**
```typescript
import { AdapterRegistry } from '@scingos/adapters';
import { FLIRThermalAdapter } from './FLIRThermalAdapter';

AdapterRegistry.register({
  id: 'flir-thermal-e8',
  name: 'FLIR E8 Thermal Camera',
  manufacturer: 'FLIR',
  adapter: FLIRThermalAdapter,
  capabilities: ['thermal-imaging', 'video-stream']
});
```

### LARI Engine Integration

**Invoke LARI-Vision (Image Analysis):**
```typescript
import { LARIClient } from '@scingos/lari-client';

const lari = new LARIClient({ authToken });

const analysisResult = await lari.vision.analyzeImage({
  imageUrl: 'gs://bucket/inspections/123/image.jpg',
  detectionTypes: ['cracks', 'water-damage', 'mold'],
  confidenceThreshold: 0.7
});

console.log('Defects detected:', analysisResult.defects);
// [{ type: 'crack', confidence: 0.85, boundingBox: [x, y, w, h] }]
```

**Invoke LARI-Language (Code Lookup):**
```typescript
const codeResult = await lari.language.queryCode({
  query: 'minimum stair riser height residential',
  jurisdiction: 'California',
  standards: ['ICC', 'California Building Code']
});

console.log('Code citation:', codeResult.citation);
// "CBC 1011.5.2: Maximum riser height 7-3/4 inches"
```

### UI Component Development

**React Component Standards:**
```typescript
// Use functional components with hooks
import { useState, useEffect } from 'react';

interface InspectionPanelProps {
  inspectionId: string;
  onComplete: () => void;
}

export function InspectionPanel({ inspectionId, onComplete }: InspectionPanelProps) {
  const [findings, setFindings] = useState([]);
  
  useEffect(() => {
    // Load findings from Firestore
    const unsubscribe = watchFindings(inspectionId, setFindings);
    return unsubscribe; // Cleanup
  }, [inspectionId]);
  
  return (
    <div className="inspection-panel">
      {findings.map(finding => (
        <FindingCard key={finding.id} finding={finding} />
      ))}
    </div>
  );
}
```

**Styling with Tailwind:**
```tsx
<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
  Start Inspection
</button>
```

### API Integration

**REST API Client:**
```typescript
import { ScingOSAPIClient } from '@scingos/api-client';

const api = new ScingOSAPIClient({
  baseURL: 'https://api.scingos.ai/v1',
  authToken: firebaseIdToken
});

// Create inspection
const inspection = await api.inspections.create({
  type: 'residential',
  propertyAddress: '123 Main St',
  clientName: 'John Doe'
});

// List inspections
const inspections = await api.inspections.list({
  page: 1,
  limit: 20,
  filter: { status: 'completed' }
});
```

See [API Reference](API-Reference.md) for complete endpoint documentation.

### Local Development with Firebase Emulator

**Start Emulators:**
```bash
firebase emulators:start
```

**Connect Client to Emulators:**
```typescript
// .env.development
NEXT_PUBLIC_USE_FIREBASE_EMULATORS=true
NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=localhost:8080
NEXT_PUBLIC_AUTH_EMULATOR_HOST=localhost:9099
NEXT_PUBLIC_STORAGE_EMULATOR_HOST=localhost:9199
```

**Seed Test Data:**
```bash
firebase emulators:exec "pnpm test:seed"
```

## See Also

### Internal Documentation

- [Architecture](Architecture.md) - System architecture and component design
- [Getting Started](Getting-Started.md) - User onboarding and initial setup
- [Deployment](Deployment.md) - Production deployment procedures
- [Firebase Integration](Firebase-Integration.md) - Firebase configuration
- [AIP Protocol](AIP-Protocol.md) - Communication protocol specification
- [API Reference](API-Reference.md) - REST API endpoint documentation
- [BANE Security](BANE-Security.md) - Security framework and audit logging

### External Resources

- ScingOS Repository: https://github.com/isystemsdirect/ScingOS
- Firebase Documentation: https://firebase.google.com/docs
- Tauri Documentation: https://tauri.app/v1/guides
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber

## Terminology Alignment

- **AIP:** Augmented Intelligence Portal (communication protocol)
- **BANE:** Backend Augmented Neural Engine (security governor)
- **LARI:** Language and Reasoning Intelligence (AI engine suite)
- **SCING:** Scing Voice Orchestrator (voice interface)
- **SDR:** Security Decision Record (audit log entry)
- **BFI:** Bona Fide Intelligence (AI philosophy framework)
- **Adapter:** Device integration abstraction layer
- **Capability:** Permission token for specific actions

---

**Last Updated:** December 12, 2025  
**Document Version:** 1.0  
**ScingOS Version:** 0.1.0-alpha
