# SCINGULAR Remote Paste — Phase 1 MVP

**Status**: Phase 1 MVP scaffolding complete  
**Target**: Text sync between Android and Windows via Firebase  
**Start Date**: 2026-01-28

---

## Quick Start

### Prerequisites

- **Android**: Android Studio, Kotlin 1.9+, min SDK 26
- **Windows**: Rust 1.70+, Node.js 18+, npm 8+, WebView2 Runtime
- **Firebase**: Project `spectrocap` with Auth + Firestore + Storage enabled

### Setup

1. **Create Firebase Project**
   ```bash
   # Navigate to https://console.firebase.google.com
   # Create project: spectrocap (or spectrocap-dev / spectrocap-prod)
   # Enable: Authentication (Email/Password), Firestore, Storage
   ```

2. **Deploy Firestore + Storage Rules** (Lane 3)
   ```bash
   # Copy rules to Firebase Console or use Firebase CLI:
   firebase deploy --only firestore:rules,storage
   # Rules are in: cloud/firebase/firestore.rules and storage.rules
   ```

3. **Android Setup** (Lane 1 — Kotlin Sender)
   ```bash
   cd apps/android/spectrocap-android
   # Download google-services.json from Firebase Console → App settings
   # Place in app/ directory
   # Open in Android Studio
   ./gradlew build              # Build via Gradle
   ./gradlew installDebug       # Install on device/emulator
   # Or use Android Studio Run menu (Shift+F10)
   ```
   See [apps/android/spectrocap-android/README.md](./android/spectrocap-android/README.md) for detailed setup.

4. **Windows Setup** (Lane 2 — This Document)
   ```bash
   cd apps/windows/spectrocap-win
   cp .env.example .env.local
   # Edit .env.local with Firebase credentials
   npm install
   npm run dev           # Terminal 1: Vite dev server
   npm run tauri:dev     # Terminal 2: Tauri window + app
   ```

5. **Smoke Test**
   - See `apps/windows/spectrocap-win/smoke-test.sh`
   - Or see README.md in Windows client directory

---

## Apps Directory

```
apps/
├── android/
│   └── spectrocap-android/     (Lane 1 — Kotlin + Jetpack Compose)
│       ├── app/
│       ├── build.gradle
│       └── ...
├── windows/
│   └── spectrocap-win/         (Lane 2 — Tauri + Vite + TypeScript)
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.ts
│       │   ├── firebase.ts
│       │   ├── device.ts
│       │   ├── receive.ts
│       │   ├── clipboard.ts
│       │   ├── historyStore.ts
│       │   └── lariCap.ts
│       ├── src-tauri/
│       │   ├── src/
│       │   │   ├── main.rs
│       │   │   └── lib.rs
│       │   └── tauri.conf.json
│       ├── .env.example
│       ├── README.md
│       └── package.json
└── README.md               (This file)

## File Structure

```
remote-paste/
├── apps/
│   ├── android/           ← Kotlin app (Compose)
│   │   ├── build.gradle
│   │   ├── AndroidManifest.xml
│   │   └── MainActivity.kt
│   └── windows/           ← Tauri (Rust + React)
│       ├── src/           ← Rust code
│       ├── src-tauri/     ← Tauri config
│       ├── Cargo.toml
│       └── package.json
├── services/
│   └── remote-paste/      ← Backend Cloud Functions (Phase 2)
├── shared/
│   └── remote-paste/      ← Shared types, rules, config
│       ├── types.ts
│       ├── firebase-config.json
│       ├── firestore.rules
│       └── storage.rules
└── docs/
    └── remote-paste/      ← Architecture & flow docs
        ├── PHASE_1_OVERVIEW.md
        ├── FIRESTORE_SCHEMA.md
        ├── ANDROID_FLOW.md
        ├── WINDOWS_FLOW.md
        └── SECURITY_MODEL.md (Phase 2)
```

---

## Phase 1 Scope

### ✅ Complete
- [x] Repo structure created
- [x] Firebase schema documented
- [x] Security rules written
- [x] Android app scaffolded (Kotlin + Firebase + Device mgmt + Clipboard read + LARI-CAP adapter)
- [x] Windows/Tauri app scaffolded
- [x] Documentation written (comprehensive)

### 🔄 In Progress
- [ ] Android smoke test validation
- [ ] Windows smoke test validation
- [ ] E2E testing (send → receive → paste)

### ❌ Not Started (Phase 2+)
- [ ] End-to-End Encryption (XChaCha20-Poly1305)
- [ ] Image/media support
- [ ] Windows shell extension
- [ ] Android Quick Settings tile
- [ ] Cross-user sharing
- [ ] LARI-CAP content filtering (Claude Haiku summarization)

---

## Testing Acceptance Criteria

See [PHASE_1_OVERVIEW.md](./docs/remote-paste/PHASE_1_OVERVIEW.md#acceptance-criteria)

**Summary**:
1. Login on Android + Windows with same account → both register
2. Copy text on Android → send → Windows receives within 2 seconds
3. Tray → Paste Last → text pastes into Notepad
4. History window shows prior messages
5. Firestore shows message docs; Storage shows .txt blobs

---

## Documentation

- **[PHASE_1_OVERVIEW.md](./docs/remote-paste/PHASE_1_OVERVIEW.md)** — Goals, timeline, acceptance criteria
- **[FIRESTORE_SCHEMA.md](./docs/remote-paste/FIRESTORE_SCHEMA.md)** — Database structure & rules
- **[ANDROID_FLOW.md](./docs/remote-paste/ANDROID_FLOW.md)** — Screen flow, code structure, dependencies
- **[WINDOWS_FLOW.md](./docs/remote-paste/WINDOWS_FLOW.md)** — Tauri flow, hotkeys, local storage

---

## Security (MVP Baseline)

- ✅ Firebase Authentication (email/password)
- ✅ Firestore rules: user-scoped read/write
- ✅ Storage rules: user-scoped access
- ✅ HTTPS for all communication
- ❌ No encryption (plaintext in Phase 1; Phase 2: XChaCha20-Poly1305)
- ❌ No signatures (Phase 2: Ed25519)

---

## Development Commands

### Android (Lane 1)
```bash
cd apps/android/spectrocap-android

# Build
./gradlew build                    # Compile app

# Run on device or emulator
./gradlew installDebug             # Install debug build
./gradlew devices                  # List connected devices

# Clean
./gradlew clean                    # Remove build artifacts

# Lint (optional)
./gradlew lint                     # Check for code issues
./gradlew ktlintCheck              # Kotlin style check
```

### Windows (Lane 2)
```bash
cd apps/windows/spectrocap-win
npm install              # Install deps
npm run dev             # Tauri dev (hot reload)
npm run build           # Build release
npm run test            # Run tests
```

---

## Known Limitations (MVP)

1. **Single device per user**: Race condition if same user logs in from both devices simultaneously
2. **No encryption**: Plaintext in Storage (Phase 2)
3. **Android foreground only**: Explicit "Send Copy" action (no background sync)
4. **Text only**: No images/files (Phase 2)
5. **All recipients**: Messages go to all user devices (Phase 2: selective)
6. **Windows paste**: Simulates Ctrl+V (some apps may not respond)

---

## Deployment

### Firebase
```bash
# Deploy security rules
firebase deploy --only firestore:rules,storage

# View logs
firebase functions:log
```

### Android
- Build signed APK in Android Studio
- Upload to Play Store or distribute via APK

### Windows
- Build: `npm run build`
- Output: `src-tauri/target/release/`
- Distribute .exe or MSI (WixToolset, Phase 2)

---

## Troubleshooting

### Android: "google-services.json not found"
→ Download from Firebase Console (Project Settings → Your Apps)

### Windows: "Tauri build fails"
→ Check Rust installation: `rustc --version`  
→ Update Tauri CLI: `npm install -g @tauri-apps/cli@latest`

### Firebase auth fails
→ Verify Firestore is in Native mode (not Datastore)  
→ Check authentication is enabled for email/password

---

## Next Steps

1. **Week 1**: Implement Android login + device registration
2. **Week 2**: Implement Android "Send Clipboard Text"
3. **Week 3**: Implement Windows login + Firestore listener
4. **Week 4**: Implement Windows local DB + tray menu + paste
5. **Week 5**: Polish + E2E testing
6. **Week 6**: Documentation + MVP release

---

## References

- [Firebase Console](https://console.firebase.google.com)
- [Tauri Docs](https://tauri.app/en/docs/getting-started/prerequisites)
- [Android Compose](https://developer.android.com/jetpack/compose)
- [Kotlin Docs](https://kotlinlang.org/docs)
- [Rust Book](https://doc.rust-lang.org/book)

---

**Owner**: Inspection Systems Direct LLC  
**License**: Proprietary (SCINGULAR IP)  
**Security Contact**: security@isystemsdirect.com
