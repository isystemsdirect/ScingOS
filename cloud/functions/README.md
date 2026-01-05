# ScingOS Cloud Functions

**Serverless Backend for SCINGULAR AI Platform**

---

## Overview

This directory contains Firebase Cloud Functions providing backend services for ScingOS:

- **BANE**: Security governance and capability-based authorization
- **LARI**: AI engines (language, vision, reasoning)
- **AIP**: Communication protocol handlers

## Tech Stack

- **Runtime**: Node.js 18
- **Language**: TypeScript
- **Platform**: Firebase Cloud Functions (2nd gen)
- **Database**: Firestore
- **Storage**: Cloud Storage

## Getting Started

### Prerequisites

- Node.js v18 or higher
- Firebase CLI: `npm install -g firebase-tools`
- Firebase project configured

### Installation

```bash
cd cloud/functions
npm install
```

### Development

```bash
# Build TypeScript
npm run build

# Run emulators
npm run serve

# Watch mode
npm run build:watch
```

### Testing

```bash
npm test
npm run test:watch
```

### Deployment

```bash
# Deploy all functions
npm run deploy

# Deploy specific function
firebase deploy --only functions:bane.requestCapability
```

## Project Structure

```
functions/
├── src/
│   ├── index.ts         # Main entry point
│   ├── bane/            # Security governance
│   │   ├── index.ts
│   │   ├── capability.ts
│   │   ├── sdr.ts
│   │   └── policy.ts
│   ├── lari/            # AI engines
│   │   ├── index.ts
│   │   ├── language.ts
│   │   ├── vision.ts
│   │   └── reasoning.ts
│   └── aip/             # Protocol handlers
│       └── index.ts
├── lib/                 # Compiled output
├── package.json
├── tsconfig.json
└── .eslintrc.js
```

## Available Functions

### BANE (Security)

- `bane.requestCapability`: Request capability token for an action
- `bane.createSDR`: Create Security Decision Record
- `bane.checkPolicy`: Check if action is allowed by policy

### LARI (AI)

- `lari.understandIntent`: Natural language understanding
- `lari.detectDefects`: Computer vision defect detection
- `lari.generateReport`: Generate inspection report

### AIP (Protocol)

- `aip.handleMessage`: Handle AIP protocol messages

### Triggers

- `onUserCreate`: Triggered when user account is created
- `onInspectionComplete`: Triggered when inspection status changes to completed

## Environment Variables

Set in Firebase Functions config:

```bash
firebase functions:config:set \
  bane.secret_key="your-secret-key" \
  openai.api_key="sk-..." \
  elevenlabs.api_key="..."
```

Or use `.env` for local development.

## Logging

View logs:

```bash
# All functions
firebase functions:log

# Specific function
firebase functions:log --only bane.requestCapability

# Follow (live)
firebase functions:log --only bane.requestCapability --follow
```

## Testing Functions

Using Firebase CLI:

```bash
# Interactive shell
firebase functions:shell

# Call function
> bane.requestCapability({ action: 'camera.read' })
```

Using curl:

```bash
curl -X POST https://us-central1-YOUR-PROJECT.cloudfunctions.net/bane-requestCapability \
  -H "Content-Type: application/json" \
  -d '{"data":{"action":"camera.read"}}'
```

## Development Workflow

1. Make changes in `src/`
2. Build: `npm run build`
3. Test locally: `npm run serve`
4. Test with emulators
5. Deploy: `npm run deploy`

---

*Built with Bona Fide Intelligence | © 2025 Inspection Systems Direct LLC*