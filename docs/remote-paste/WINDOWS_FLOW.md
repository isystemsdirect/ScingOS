# Windows Flow — SCINGULAR Remote Paste Phase 1 (Tauri)

## Architecture

```
UI (React + TypeScript)
  ↓
React State (Context API or Zustand)
  ↓
Tauri Invoke (command bridge)
  ↓
Rust Backend (tauri-plugin-shell, clipboard, etc.)
  ↓
Firebase JS SDK (Auth, Firestore, Storage)
  ↓
System Tray + Hotkeys (Tauri core)
  ↓
Backend (Firebase Cloud)
```

---

## 1. App Startup & Init

```
[Tauri App Start]
  ↓
[Check Tauri Config]
  ├─ Tray enabled
  ├─ Hidden window by default
  └─ Hotkeys registered (Ctrl+Shift+P, Ctrl+Shift+V)
  ↓
[Initialize Firebase]
  ├─ Load firebase config from .env or embedded
  ├─ Initialize Auth, Firestore, Storage
  └─ Subscribe to onAuthStateChanged()
  ↓
[Check localStorage for saved auth state]
  ├─ If valid token exists: restore session
  ├─ Restore deviceId from localStorage
  └─ Show tray menu (logged in state)
  ├─ If no token: show login window
```

---

## 2. Login Window

### UI Components
```
┌─────────────────────────────┐
│   SCINGULAR Remote Paste    │
├─────────────────────────────┤
│                             │
│  Email:    [___________]    │
│  Password: [___________]    │
│                             │
│  [Login]  [Sign Up]         │
│                             │
│  Status: Ready              │
└─────────────────────────────┘
```

### Flow

```
[User enters email + password]
  ↓
[User clicks "Login"]
  ↓
[Validate input]
  ├─ email is valid
  ├─ password.length >= 6
  └─ if invalid → show error + return
  ↓
[Firebase Auth.signInWithEmailAndPassword(email, password)]
  ├─ Loading state: disable buttons, show spinner
  ├─ Success:
  │   1. Save token to localStorage (Firebase auto-handles)
  │   2. Get uid = Auth.currentUser.uid
  │   3. Save uid to localStorage
  │   4. Generate deviceId = UUID (if not exists in localStorage)
  │   5. Register device in Firestore:
  │      users/{uid}/devices/{deviceId}:
  │        {
  │          deviceId,
  │          platform: "windows",
  │          name: "My Windows PC" (or os.hostname()),
  │          createdAt: new Date(),
  │          lastSeenAt: new Date(),
  │          status: "active"
  │        }
  │   6. Hide login window
  │   7. Show tray menu
  │   8. Start Firestore listener
  └─ Error:
      └─ Show toast: "Login failed: {error.message}"
```

### Sign Up (Scaffold)

```
[User clicks "Sign Up"]
  ↓
[Show sign-up form]
  ├─ Email
  ├─ Password
  ├─ Confirm Password
  └─ [Create Account]
  ↓
[Firebase Auth.createUserWithEmailAndPassword(email, password)]
  ├─ Success → Proceed to device registration
  └─ Error → Show error toast
```

---

## 3. Firestore Listener (Background)

```
[On login complete]
  ↓
[Subscribe to users/{uid}/messages collection]
  ├─ Order by: createdAt (descending)
  ├─ Listen for real-time updates
  └─ Callback on each new message
  ↓
[On new message detected]
  ├─ Check if messageId already in local DB
  ├─ If duplicate: skip (avoid re-processing)
  ├─ If new:
  │   1. Download payload from Storage
  │   2. Decrypt (Phase 2) or read as plaintext (Phase 1)
  │   3. Store in local SQLite + metadata
  │   4. Update "last" pointer to this message
  │   5. Show tray notification: "New message from Android"
  └─ If error: log + continue
```

---

## 4. Local Storage (SQLite or JSON)

### SQLite Schema (Option A)

```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  message_id TEXT NOT NULL,
  sender_device_id TEXT,
  type TEXT DEFAULT 'text',
  content TEXT,
  created_at INTEGER,
  downloaded_at INTEGER,
  is_favorite BOOLEAN DEFAULT 0,
  is_last BOOLEAN DEFAULT 0
);

CREATE TABLE devices (
  id TEXT PRIMARY KEY,
  device_id TEXT,
  platform TEXT,
  name TEXT,
  created_at INTEGER,
  last_seen_at INTEGER
);
```

### JSON File (Option B - MVP)

```json
{
  "messages": [
    {
      "messageId": "660e8400-...",
      "senderDeviceId": "550e8400-...",
      "type": "text",
      "content": "Hello Windows",
      "createdAt": 1234567890,
      "downloadedAt": 1234567895,
      "isFavorite": false,
      "isLast": true
    }
  ],
  "settings": {
    "uid": "user-123",
    "deviceId": "550e8400-...",
    "lastSyncAt": 1234567895
  }
}
```

**Location:** `%APPDATA%/ScingRemotePaste/db.json` (Windows)

**Encryption:** DPAPI via Tauri plugin (Phase 2)

---

## 5. Tray Menu

### UI (System Tray Icon)

```
┌──────────────────────────────┐
│ 📋 Remote Paste (Connected)  │
├──────────────────────────────┤
│ Paste Last                   │  ← Ctrl+Shift+P
│ Paste From...                │  ← Ctrl+Shift+V
│ ─────────────────────────────│
│ Settings                     │
│ About                        │
│ ─────────────────────────────│
│ Logout                       │
│ Quit                         │
└──────────────────────────────┘
```

### Actions

| Action | Behavior |
|--------|----------|
| **Paste Last** | Get last message from local DB → copy to clipboard → simulate Ctrl+V |
| **Paste From...** | Open history window (see below) |
| **Settings** | Open settings window (stub for Phase 2) |
| **About** | Show version, device ID, Firebase project |
| **Logout** | Clear localStorage, stop listener, show login window |
| **Quit** | Close app gracefully (save state) |

---

## 6. History Window

### UI

```
┌──────────────────────────────────────┐
│ Remote Paste History                 │ [X]
├──────────────────────────────────────┤
│ 📌 1  Hello Windows        2m ago    │  ← "Last"
│ 📌 2  Check status         15m ago   │
│ 📌 3  Project plan         1h ago    │
│ 📌 4  Quick note           3h ago    │
├──────────────────────────────────────┤
│         [Paste] [Copy] [Delete]      │  (on select)
└──────────────────────────────────────┘
```

### Flow

```
[User clicks "Paste From..."]
  ↓
[Load all messages from local DB]
  ├─ Sort by createdAt (newest first)
  ├─ Format timestamp (2m ago, 1h ago, etc.)
  └─ Render list
  ↓
[User selects message]
  ↓
[Enable action buttons]
  ├─ Paste: copy to clipboard → simulate Ctrl+V → close window
  ├─ Copy: copy to clipboard only (don't paste)
  └─ Delete: remove from local DB + Firestore (Phase 2)
```

---

## 7. Hotkey Handling

### Ctrl+Shift+P (Paste Last)

```
[Hotkey triggered]
  ↓
[Invoke Tauri command: get_last_message()]
  ├─ Query local DB for message where is_last = true
  ├─ If found:
  │   1. Copy content to system clipboard
  │   2. Invoke command: simulate_paste()
  │      ├─ Rust: use enigo crate → simulate Ctrl+V
  │      └─ Fallback: just copy (user presses Ctrl+V)
  │   3. Show tray notification: "Pasted!"
  └─ If not found:
      └─ Show tray notification: "No messages yet"
```

### Ctrl+Shift+V (Open History)

```
[Hotkey triggered]
  ↓
[Show history window (bring to foreground)]
```

---

## 8. Logout

```
[User clicks "Logout" in tray]
  ↓
[Confirm dialog: "Logout?"]
  ├─ YES:
  │   1. Firebase Auth.signOut()
  │   2. Clear localStorage (token, uid, deviceId)
  │   3. Stop Firestore listener
  │   4. Close all windows
  │   5. Show login window
  └─ NO: dismiss dialog
```

---

## Code Structure (Tauri + React)

```
apps/windows/
  ├─ src/
  │  ├─ main.tsx
  │  ├─ App.tsx
  │  ├─ components/
  │  │  ├─ LoginWindow.tsx
  │  │  ├─ HistoryWindow.tsx
  │  │  ├─ SettingsWindow.tsx
  │  │  └─ Tray.tsx
  │  ├─ hooks/
  │  │  ├─ useAuth.ts
  │  │  ├─ useFirestore.ts
  │  │  ├─ useLocalDB.ts
  │  │  └─ useClipboard.ts
  │  ├─ services/
  │  │  ├─ firebaseService.ts
  │  │  ├─ storageService.ts
  │  │  ├─ authService.ts
  │  │  └─ deviceService.ts
  │  ├─ store/
  │  │  ├─ authStore.ts
  │  │  └─ messageStore.ts
  │  └─ types/
  │     ├─ message.ts
  │     ├─ device.ts
  │     └─ user.ts
  ├─ src-tauri/
  │  ├─ src/
  │  │  ├─ main.rs
  │  │  ├─ clipboard.rs
  │  │  ├─ hotkey.rs
  │  │  └─ commands.rs
  │  ├─ Cargo.toml
  │  └─ tauri.conf.json
  ├─ package.json
  ├─ tsconfig.json
  └─ vite.config.ts
```

---

## Dependencies

```toml
# src-tauri/Cargo.toml
[dependencies]
tauri = { version = "1.5", features = ["shell-open", "system-tray", "macos-private-api"] }
tokio = { version = "1", features = ["full"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
rusqlite = { version = "0.29", features = ["bundled"] }
enigo = "0.1"  # For keyboard simulation
```

```json
// package.json
{
  "dependencies": {
    "firebase": "^10.5.0",
    "react": "^18.2.0",
    "zustand": "^4.4.1",
    "@tauri-apps/api": "^1.5"
  },
  "devDependencies": {
    "@tauri-apps/cli": "^1.5"
  }
}
```

---

## Firebase Configuration

```typescript
// src/services/firebaseService.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  projectId: 'scing-remote-paste',
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  // ... etc
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

---

## Security (Phase 1)

- ✅ localStorage for tokens (Firebase handles secure storage)
- ✅ Firestore rules enforce user scoping
- ✅ HTTPS for all communication
- 🔄 Phase 2: DPAPI encryption for local DB
- 🔄 Phase 2: E2EE for message payloads

---

## Testing

### Unit Tests (React Components)
```typescript
describe('LoginWindow', () => {
  it('should submit login form', () => {
    // Test login flow
  });
});
```

### Integration Tests (Tauri)
```rust
#[tauri::test]
async fn test_clipboard_paste() {
  // Test clipboard write + paste simulation
}
```

---

## Debugging

**Enable Tauri dev tools:**
```bash
cargo tauri dev
```

**View logs:**
```
%APPDATA%/ScingRemotePaste/logs/app.log
```

---

## Success Criteria

1. ✅ Login window shows and accepts credentials
2. ✅ Device registers in Firestore on login
3. ✅ Firestore listener detects new messages in real-time
4. ✅ Message payloads download successfully from Storage
5. ✅ Local DB stores messages persistently
6. ✅ Tray menu functional (Paste Last, Paste From, Logout)
7. ✅ Hotkeys respond (Ctrl+Shift+P, Ctrl+Shift+V)
8. ✅ Paste operation succeeds in Notepad
9. ✅ History window lists messages correctly
10. ✅ Logout clears state and shows login window again
