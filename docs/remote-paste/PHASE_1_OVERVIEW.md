# SCINGULAR Remote Paste — Phase 1 MVP Overview

## Goal

User copies text on Android → taps "Send Copy" → Windows receives → user pastes into any app.

**Timeline**: 4–6 weeks (MVP only, no E2EE or shell extensions yet)

---

## Non-Goals (Phase 1)

- ❌ End-to-End Encryption (prep only; Phase 2)
- ❌ Image/video sharing (Phase 2)
- ❌ Cross-user sharing (Phase 3)
- ❌ Windows shell extension (Phase 2)
- ❌ Android background clipboard sync (explicit "Send Copy" action only)
- ❌ AI content filtering (LARI integration Phase 3)

---

## Architecture

### Clients

| Platform | Tech | Role |
|----------|------|------|
| **Android** | Kotlin | Foreground-only sender; reads clipboard on demand |
| **Windows** | Tauri (Rust) | System tray; background listener; local history |
| **Backend** | Firebase | Auth, Firestore (metadata), Storage (payloads) |

### Data Flow

```
Android (User copies text)
  ↓
User taps "Send Clipboard Text"
  ↓
Clipboard → Upload to Cloud Storage (.txt file)
  ↓
Create Firestore message doc
  ↓
Windows (listening to Firestore)
  ↓
Detect new message in /users/{uid}/messages
  ↓
Download .txt from Storage
  ↓
Store in local SQLite/JSON (encrypted at rest via Windows DPAPI)
  ↓
Tray notification: "New message from Android"
  ↓
User presses Ctrl+Shift+P (or uses tray menu)
  ↓
Paste into active window

```

---

## Timeline & Deliverables

### Week 1-2: Setup + Android Login
- ✅ Firebase project created
- ✅ Firestore schema defined
- ✅ Android project scaffolded
- ✅ Login screen (email/password)
- ✅ Device registration

### Week 2-3: Android Send
- ✅ "Send Clipboard Text" button
- ✅ Clipboard read (foreground)
- ✅ Upload to Storage
- ✅ Create Firestore doc

### Week 3-4: Windows Setup + Login
- ✅ Tauri app scaffolded
- ✅ Login screen
- ✅ Device registration
- ✅ Firestore listener

### Week 4-5: Windows Receive
- ✅ Download message payload
- ✅ Store locally
- ✅ Tray menu (Paste Last, Paste From)
- ✅ Hotkey (Ctrl+Shift+P)
- ✅ Paste to clipboard

### Week 5-6: Polish + Testing
- ✅ E2E testing (send → receive → paste)
- ✅ Error handling
- ✅ Logging
- ✅ Documentation

---

## Acceptance Criteria

### Test Case 1: Basic Send → Receive

**Setup:**
1. Create Firebase project: `scing-remote-paste`
2. Enable Auth (email/password), Firestore, Storage
3. Install Android app on device/emulator
4. Install Windows app on desktop

**Steps:**
1. Log in to Android with email `test@example.com`
2. Log in to Windows with same email
3. Both devices register in Firestore
4. On Android: copy text `"Hello Windows"`
5. Tap "Send Clipboard Text"
6. Wait 2 seconds
7. On Windows: Firestore listener detects new message
8. Download payload from Storage
9. Tray notifies: "New message from Android"

**Expected:**
- ✅ Firestore shows new message doc in `users/{uid}/messages/{messageId}`
- ✅ Storage shows file `users/{uid}/messages/{messageId}.bin` containing `"Hello Windows"`
- ✅ Windows local history shows entry

### Test Case 2: Paste Last

**Setup:** Complete Test Case 1

**Steps:**
1. Open Notepad on Windows
2. Press Ctrl+Shift+P
3. Text should be pasted: `"Hello Windows"`

**Expected:**
- ✅ Notepad contains `"Hello Windows"`

### Test Case 3: History

**Setup:** Complete Test Case 1; send 3 more messages

**Steps:**
1. On Windows: tray menu → "Paste From"
2. Window shows 4 history entries (newest first)
3. Click entry #2
4. Paste into Notepad

**Expected:**
- ✅ Notepad shows the message from entry #2
- ✅ History persists after app restart

---

## Security Baseline (MVP)

| Aspect | Implementation |
|--------|-----------------|
| **Authentication** | Firebase Email/Password |
| **Authorization** | Firestore rules: user UID scoped |
| **Transport** | HTTPS (Firebase) |
| **At-Rest** | Plaintext in Phase 1; DPAPI on Windows for local history |
| **Encryption** | ❌ Not implemented (Phase 2) |
| **Signatures** | ❌ Not implemented (Phase 2) |
| **Audit Trail** | ✅ Firestore auto-timestamps & audit logs (Firebase) |

---

## File Structure

```
remote-paste/
  ├─ apps/
  │  ├─ android/
  │  │  ├─ ScingRemotePaste/           (Android Studio project)
  │  │  ├─ build.gradle
  │  │  ├─ AndroidManifest.xml
  │  │  └─ ...
  │  └─ windows/
  │     ├─ src/
  │     │  ├─ main.rs
  │     │  └─ lib.rs
  │     ├─ Cargo.toml
  │     ├─ src-tauri/
  │     └─ package.json
  ├─ services/
  │  └─ remote-paste/
  │     ├─ cloud-functions/ (future: cleanup, expiration, etc.)
  │     └─ README.md
  ├─ shared/
  │  └─ remote-paste/
  │     ├─ schema.ts (message types)
  │     ├─ firestore-rules.json
  │     └─ storage-rules.json
  └─ docs/
     └─ remote-paste/
        ├─ PHASE_1_OVERVIEW.md (this file)
        ├─ FIRESTORE_SCHEMA.md
        ├─ ANDROID_FLOW.md
        ├─ WINDOWS_FLOW.md
        └─ SECURITY_MODEL.md
```

---

## Firebase Project Setup (One-Time)

1. **Create Firebase project:**
   ```
   Name: scing-remote-paste
   Region: us-central1
   ```

2. **Enable services:**
   - Authentication → Email/Password
   - Firestore → Native mode
   - Cloud Storage

3. **Create web app:**
   - Register for "Web (< >)"
   - Download config JSON
   - Store locally (never commit)

4. **Deploy security rules:**
   ```bash
   firebase deploy --only firestore:rules,storage
   ```

---

## Known Limitations (MVP)

1. **Single device per user:** Android logs out if Windows logs in (race condition). Phase 2: support multiple devices.
2. **No encryption:** Plaintext in Storage. Phase 2: XChaCha20-Poly1305 + key envelopes.
3. **No background sync:** Android requires explicit "Send Copy" action.
4. **No image support:** Text only in Phase 1.
5. **No selective recipients:** All messages go to all user devices. Phase 2: device filters.
6. **Windows paste:** Simulates Ctrl+V; some apps may not respond (clipboard-based fallback Phase 2).

---

## Success Metrics

- ✅ Text sent from Android reaches Windows in < 2 seconds
- ✅ Users can retrieve full history (≥ 10 entries)
- ✅ Paste works in ≥ 95% of Windows apps
- ✅ Zero plaintext stored outside user scope (Firestore/Storage)
- ✅ Both clients handle graceful logout/re-login
- ✅ Users cannot access other users' messages (Firestore rules enforced)

---

## Next Steps (Phase 2)

1. **E2EE implementation:**
   - XChaCha20-Poly1305 symmetric encryption
   - X25519 ECDH for key derivation
   - Ed25519 signatures for verification

2. **Image support:**
   - Share Intent receiver (Android)
   - Image picker (Android)
   - Image clipboard on Windows

3. **Windows shell extension:**
   - Right-click "Paste from Remote"
   - Auto-paste last without hotkey

4. **Android Quick Settings tile:**
   - Persistent "Send Copy" action

5. **Media types:**
   - Audio, video, documents
   - Resumable uploads (chunking)

---

## References

- [Firestore Schema](./FIRESTORE_SCHEMA.md)
- [Android Flow](./ANDROID_FLOW.md)
- [Windows Flow](./WINDOWS_FLOW.md)
- [Security Model](./SECURITY_MODEL.md) (Phase 2)
