# SCINGULAR Remote Paste — Phase 1 MVP

**Status**: Phase 1 MVP scaffolding complete  
**Target**: Text sync between Android and Windows via Firebase  
**Start Date**: 2026-01-28

---

## Quick Start

### Prerequisites

- **Android**: Android Studio, Kotlin 1.9+, min SDK 26
- **Windows**: Rust 1.70+, Node.js 18+, Tauri CLI
- **Firebase**: Project `scing-remote-paste` (create one-time)

### Setup

1. **Create Firebase Project**
   ```bash
   # Navigate to https://console.firebase.google.com
   # Create project: scing-remote-paste
   # Enable: Auth (email/password), Firestore, Storage
   ```

2. **Android Setup**
   ```bash
   cd apps/android
   # Download google-services.json from Firebase Console → App settings
   # Place in app/ directory
   # Open in Android Studio
   # Build and run
   ```

3. **Windows Setup**
   ```bash
   cd apps/windows
   npm install
   npm run dev
   # Tauri dev server starts
   ```

4. **Deploy Security Rules**
   ```bash
   firebase deploy --only firestore:rules,storage
   # Uses rules from shared/remote-paste/
   ```

---

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
- [x] Android app scaffolded
- [x] Windows/Tauri app scaffolded
- [x] Documentation written

### 🔄 In Progress
- [ ] Android login screen implementation
- [ ] Android device registration
- [ ] Android "Send Clipboard Text" button
- [ ] Windows login screen implementation
- [ ] Windows Firestore listener
- [ ] Windows local database (SQLite)
- [ ] Windows tray menu & hotkeys
- [ ] E2E testing (send → receive → paste)

### ❌ Not Started (Phase 2+)
- [ ] End-to-End Encryption (XChaCha20-Poly1305)
- [ ] Image/media support
- [ ] Windows shell extension
- [ ] Android Quick Settings tile
- [ ] Cross-user sharing
- [ ] LARI content filtering

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

### Android
```bash
cd apps/android
# Build in Android Studio or:
./gradlew build
./gradlew installDebug  # Install on device/emulator
```

### Windows
```bash
cd apps/windows
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
