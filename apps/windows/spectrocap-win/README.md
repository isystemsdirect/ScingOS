# SpectroCAP™ Windows Client (Phase 1)

**Remote Paste Text Synchronization** — Tauri + Firebase

## Overview

Windows desktop tray application for SpectroCAP™ Phase 1 MVP:

- **Login**: Email/Password via Firebase Auth
- **Receive**: Listen to Firestore messages, download text from Storage
- **History**: View recent received messages in-app
- **Paste**: Copy message text to clipboard with one click
- **Tray Menu**: Quick access to "Paste Last" and "Quit"

## Prerequisites

- **Node.js**: 18+ (verify: `node -v`)
- **npm**: 8+ (verify: `npm -v`)
- **Rust**: 1.70+ (verify: `rustc -V`)
- **Cargo**: (installed with Rust)
- **WebView2 Runtime**: Usually pre-installed on Windows 10/11
- **Firebase Project**: With Auth + Firestore + Storage enabled (see Lane 3)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase project credentials:

```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
```

**Find these values:**
1. Open [Firebase Console](https://console.firebase.google.com)
2. Select your SpectroCAP project
3. Click **Project Settings** (gear icon)
4. Select **"Your apps"** section
5. Click your Web app configuration
6. Copy each value to `.env.local`

### 3. Run Development

**Terminal 1: Vite dev server**
```bash
npm run dev
```

**Terminal 2: Tauri development window**
```bash
npm run tauri dev
```

### 4. Create Test User

In Firebase Console → **Authentication**:

1. Click **"Create user"** (or use existing)
2. Enter email: `test@example.com`
3. Enter password: `Test1234`
4. Create

### 5. Smoke Test

#### 5a. Login in the SpectroCAP app window

- Email: `test@example.com`
- Password: `Test1234`
- Click "Sign In"

#### 5b. Create a test message (Firebase Console)

1. Go to **Firestore Database**
2. Create collection: `users`
3. Create document: `{uid of your test user}`
4. Create subcollection: `messages`
5. Create document with ID (e.g., `msg-001`) and fields:

```json
{
  "messageId": "msg-001",
  "senderDeviceId": "test-device-id",
  "type": "text",
  "createdAt": <server timestamp>,
  "recipients": "all",
  "storagePath": "users/{uid}/messages/msg-001.txt",
  "mime": "text/plain",
  "sizeBytes": 5
}
```

#### 5c. Upload message payload (Storage)

1. Go to **Storage** → **Files**
2. Create path: `users/{uid}/messages/`
3. Upload a `.txt` file with name: `msg-001.txt`
4. Content: `hello` (or any text)

#### 5d. Verify in app

- SpectroCAP window should refresh
- "Recent Messages" section should show the message
- Click "Copy to Clipboard" button
- Paste in Notepad → should see `hello`

## File Structure

```
spectrocap-win/
├── src/
│   ├── main.ts               # App entry point
│   ├── app.ts                # UI component (login + history)
│   ├── firebase.ts           # Firebase SDK config
│   ├── device.ts             # Device registration
│   ├── receive.ts            # Message receive pipeline
│   ├── historyStore.ts       # Local history management
│   ├── clipboard.ts          # Clipboard operations
│   ├── lariCap.ts            # LARI-CAP hook adapter (Phase 1)
│   └── style.css             # Basic styling
├── src-tauri/
│   ├── src/
│   │   ├── main.rs           # Tauri entry point
│   │   └── lib.rs            # Tauri commands + tray menu
│   ├── tauri.conf.json       # Tauri configuration
│   └── icons/                # App icons
├── index.html                # HTML entry point
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # npm dependencies
├── .env.example              # Firebase config template
└── .env.local               # ⚠️ DO NOT COMMIT (local config)
```

## Commands

### Development

```bash
npm run dev          # Start Vite dev server
npm run tauri dev    # Start Tauri + attach debugger
```

### Build

```bash
npm run build        # Build for production
npm run tauri build  # Build Tauri MSI installer
```

## Phase 1 Constraints

✅ **Text-only**: Phase 1 supports plaintext messages only  
✅ **Authentication**: Email/Password via Firebase  
✅ **Device Registry**: One device per user (simple for MVP)  
✅ **Unencrypted**: Storage payloads are plaintext  
✅ **No Signatures**: Trust Firestore rules + Auth for security  
✅ **All Recipients**: Messages broadcast to all user's devices  

## Phase 2+ Roadmap

⏳ **End-to-End Encryption**: XChaCha20-Poly1305 (symmetric) + ECDH (key envelope)  
⏳ **Message Signatures**: Ed25519 verification  
⏳ **LARI-CAP Integration**: Full orchestration engine coordination  
⏳ **Global Hotkeys**: Ctrl+Shift+P (Paste Last), Ctrl+Shift+V (History)  
⏳ **Image/File Support**: Beyond text  
⏳ **Device Trust**: BANE-governed authorization  

## LARI-CAP (Phase 1 Notes)

Phase 1 includes hook adapters in `src/lariCap.ts`:

- `verifyContext()` → Always returns `true` (Phase 1 pass-through)
- `finalizePaste()` → Returns text unchanged (Phase 2: sanitization + filtering)
- `evaluateRecipient()` → Always returns `true` (Phase 2: BANE trust)

Phase 2 will invoke these from the SCINGOS engine registry for intelligent filtering.

## Troubleshooting

### WebView2 Not Found

**Error**: `WebView2 runtime not found`

**Solution**: Install [Microsoft Edge WebView2 Runtime](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

### Firebase Config Not Loaded

**Error**: Messages fail to sync; console shows "undefined" for Firebase keys

**Solution**:
1. Verify `.env.local` exists (not `.env.example`)
2. Restart `npm run dev` and `npm run tauri dev`
3. Check browser console (F12) for errors

### Tray Icon Not Showing

**Windows 11 Known Issue**: System tray icons may be hidden

**Solution**: Right-click system tray → "Show hidden icons" → Pin SpectroCAP

### Device Not Registering

**Error**: No document created in `/users/{uid}/devices/{deviceId}`

**Solution**:
1. Verify Firestore rules are deployed (Lane 3)
2. Check browser console for auth errors
3. Ensure user is authenticated before device registration

## License

Proprietary — See `/LICENSE` at repo root

## Support

- **Issues**: [GitHub Issues](https://github.com/isystemsdirect/ScingOS)
- **Docs**: [Lane 2 Specification](../../docs/remote-paste/)
- **Archive**: [Remote Paste Phase 1 Overview](../../docs/remote-paste/PHASE_1_OVERVIEW.md)
