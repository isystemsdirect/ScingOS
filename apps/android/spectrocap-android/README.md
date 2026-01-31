# SpectroCAP Android Client — Phase 1 (Lane 1 Sender)

**Product**: SpectroCAP™ (SCINGULAR Remote Paste)  
**Engine**: LARI-CAP (Lane 1 orchestration)  
**Phase**: 1 (Text MVP)  
**Role**: Clipboard Text Sender  
**Platform**: Android 8.0+ (API 26+)  
**Language**: Kotlin  
**Build System**: Gradle

---

## Overview

The Android client for SpectroCAP™ Phase 1 enables users to send clipboard text to a Firebase backend, where it is received by Windows Tauri clients (Lane 2). This implementation demonstrates:

- **Firebase Integration**: Auth, Firestore, Cloud Storage
- **Device Registration**: Persistent device ID with Firestore registration
- **Clipboard Access**: System clipboard read (Android foreground requirement)
- **Message Sending**: Text upload to Cloud Storage + Firestore doc creation
- **LARI-CAP Adapter**: Phase 1 pass-through for orchestration engine
- **Coroutine Error Handling**: Suspend functions with Result<T> pattern

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ MainActivity (Login + Send UI)                              │
├─────────────────────────────────────────────────────────────┤
│ • Email/password login (Firebase Auth)                      │
│ • Device registration (DeviceRegistrar)                     │
│ • Send Clipboard Text button                                │
│ • Activity log (ScrollView)                                 │
└──────────────┬──────────────────────────────────────────────┘
               │
      ┌────────┴────────┐
      │                 │
      ▼                 ▼
┌──────────────┐  ┌──────────────────┐
│ Firebase     │  │ LARI-CAP         │
│ Client       │  │ Adapter          │
│ (singleton)  │  │ (finalizeCopy)   │
└──────┬───────┘  └──────┬───────────┘
       │                 │
       │ Auth            ├─► finalizeCopy(text) → returns text (Phase 1)
       │ Firestore       └─► authorizeIntent() → returns true (Phase 1)
       │ Storage
       │
    ┌──┴──────────────────────────┬──────────────────┐
    │                              │                  │
    ▼                              ▼                  ▼
┌─────────────────┐    ┌──────────────────┐  ┌──────────────┐
│ Device Manager  │    │ Clipboard Reader │  │ Message      │
│ (UUID + Store)  │    │ (system API)     │  │ Sender       │
└────────┬────────┘    └────────┬─────────┘  │ (Storage +   │
         │                      │            │  Firestore)  │
         ▼                      ▼            └──────┬────────┘
    SharedPrefs            ClipboardManager         │
  (device ID)                                      ▼
                                          Firebase Backend
                                          ┌─────────────────┐
                                          │ Cloud Storage   │
                                          │ Firestore       │
                                          │ Auth            │
                                          └─────────────────┘
```

---

## Prerequisites

### System Requirements
- **Android Studio** 2023.1.1 or later
- **Android SDK 34** (Platform, Build Tools 34.0.0+)
- **Android NDK** (optional; not required for Phase 1)
- **Gradle 8.2.0** or later (included with Android Studio)
- **JDK 17** (Bundled with Android Studio)

### JDK Configuration
The project is configured to use the JDK 17 bundled with Android Studio. To ensure you are using the correct version:

1.  **Check for Android Studio Updates**: Go to `Help → Check for Updates`. Update to the latest stable version if available.
2.  **Verify Gradle JDK Settings**: Go to `File → Settings → Build, Execution, Deployment → Gradle`. Ensure **Gradle JDK** is set to the version bundled with Android Studio (e.g., `jbr-17`).
3.  **Confirm JDK Version in Terminal**: Open the Terminal in Android Studio and run `./gradlew -v`. The output should show `JVM: 17.x.x`.

### Development Environment
- Windows 10/11 or macOS/Linux
- At least 4GB RAM available for Android Studio
- USB debugger cable for physical device testing (optional)

### Firebase Project Setup
1. Create a Firebase project in [Firebase Console](https://console.firebase.google.com)
2. Add an Android app to the project (package: `com.scingular.spectrocap`)
3. Download `google-services.json` and place in `app/` directory
4. Enable Authentication (Email/Password)
5. Enable Firestore Database
6. Enable Cloud Storage

---

## Setup & Installation

### 1. Clone and Navigate

```bash
cd apps/android/spectrocap-android
```

### 2. Download Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (SCINGULAR Remote Paste)
3. Project Settings → Service Accounts → Google Services (JSON)
4. Download `google-services.json`
5. Place it in: `apps/android/spectrocap-android/app/`

**⚠️ Important**: `app/google-services.json` is gitignored; do not commit

### 3. Open in Android Studio

```bash
# If using command line:
./gradlew build

# Or open the entire directory in Android Studio:
# File → Open → apps/android/spectrocap-android
```

### 4. Configure Gradle Properties (Optional)

Edit `gradle.properties` to adjust JVM heap:

```properties
org.gradle.jvmargs=-Xmx2048m
```

### 5. Run on Device or Emulator

```bash
# List connected devices
./gradlew devices

# Run on default device
./gradlew installDebug

# Or use Android Studio: Run → Run 'app'
```

---

## Firebase Authentication Setup

### Email/Password Configuration

1. In [Firebase Console](https://console.firebase.google.com)
2. Authentication → Sign-in method → Email/Password
3. Enable "Email/Password"
4. Create test user(s) or use automated testing

### Example Test Credentials

```
Email: sender@spectrocap.test
Password: Phase1Testing123!
```

---

## File Structure

```
apps/android/spectrocap-android/
├── build.gradle                          # Project-level Gradle config
├── settings.gradle                       # Module definitions
├── gradle.properties                     # Gradle properties
├── .env.example                          # Firebase config template
├── .gitignore                            # Platform-specific excludes
├── README.md                             # This file
├── app/
│   ├── build.gradle                      # Module-level Gradle config
│   ├── google-services.json              # Firebase config (GITIGNORED)
│   └── src/
│       ├── main/
│       │   ├── kotlin/com/scingular/spectrocap/
│       │   │   ├── firebase/
│       │   │   │   └── FirebaseClient.kt          # Singleton Firebase service
│       │   │   ├── device/
│       │   │   │   ├── DeviceIdentity.kt         # UUID + SharedPreferences
│       │   │   │   └── DeviceRegistrar.kt        # Firestore registration
│       │   │   ├── clipboard/
│       │   │   │   └── ClipboardReader.kt        # System clipboard access
│       │   │   ├── send/
│       │   │   │   └── SpectrocapSender.kt       # Storage + Firestore send
│       │   │   ├── lariCap/
│       │   │   │   └── LariCapAdapter.kt         # Phase 1 pass-through
│       │   │   └── MainActivity.kt                # UI layer (login + send)
│       │   ├── res/
│       │   │   ├── layout/
│       │   │   │   └── activity_main.xml         # LinearLayout UI definition
│       │   │   └── values/
│       │   │       ├── strings.xml               # App name + version
│       │   │       └── themes.xml                # Material theme
│       │   └── AndroidManifest.xml               # App manifest
│       └── test/
│           └── java/...                          # Unit tests (Phase 2)
```

---

## Module Documentation

### FirebaseClient.kt (Singleton)

Provides centralized Firebase service access:

```kotlin
// Usage in any Activity:
val auth = FirebaseClient.auth
val firestore = FirebaseClient.firestore
val storage = FirebaseClient.storage
```

- **Auth**: Email/password authentication
- **Firestore**: Device registration + message metadata
- **Storage**: Message text payload storage

---

### DeviceIdentity.kt

Manages persistent device identification:

```kotlin
// Get or create device ID (first-run generates UUID)
val deviceId = DeviceIdentity.getOrCreateDeviceId(context)

// Returns: "550e8400-e29b-41d4-a716-446655440000" (format)
```

Stored in `SharedPreferences` with key `spectrocap.deviceId`.

---

### DeviceRegistrar.kt

Registers device with Firestore:

```kotlin
val registrar = DeviceRegistrar()
val result = registrar.registerDevice(
    uid = "user-123",
    deviceId = "device-uuid",
    name = "Samsung Galaxy S21"
)

// Creates Firestore doc at:
// /users/{uid}/devices/{deviceId}
```

**Document Fields**:
- `deviceId`: UUID string
- `name`: "Android Device" (default)
- `platform`: "android"
- `createdAt`: server timestamp
- `lastSeenAt`: server timestamp
- `status`: "active"

---

### ClipboardReader.kt

Reads system clipboard:

```kotlin
val text = ClipboardReader.readClipboardText(context)
// Returns: String? (null if clipboard empty)
```

**Note**: Android requires app to be in foreground for clipboard access.

---

### SpectrocapSender.kt

Sends clipboard text via Firebase:

```kotlin
val result = SpectrocapSender.sendClipboardText(
    uid = "user-123",
    senderDeviceId = "device-uuid",
    text = "Hello from Android!"
)

result.onSuccess { messageId ->
    Log.d("SEND", "Message sent: $messageId")
}
result.onFailure { error ->
    Log.e("SEND", "Error: ${error.message}")
}
```

**Flow**:
1. Generate `messageId` (UUID)
2. Convert text to UTF-8 bytes
3. Upload to Cloud Storage: `users/{uid}/messages/{messageId}.txt`
4. Create Firestore doc: `/users/{uid}/messages/{messageId}`

**Firestore Message Document**:
```json
{
  "messageId": "uuid",
  "senderDeviceId": "sender-uuid",
  "type": "text",
  "createdAt": "2024-01-15T10:30:00Z",
  "recipients": "all",
  "storagePath": "users/user-123/messages/uuid.txt",
  "mime": "text/plain",
  "sizeBytes": 1024
}
```

---

### LariCapAdapter.kt

Orchestration engine hooks (Phase 1 pass-through):

```kotlin
// Finalize text before sending (Phase 1: returns unchanged)
val finalText = LariCapAdapter.finalizeCopy(text)

// Authorize send intent (Phase 1: returns true)
val authorized = LariCapAdapter.authorizeIntent()
```

**Phase 2 Planning**: Replace stubs with:
- AI model integration (Claude Haiku for summarization)
- Device-to-device matching (recipient selection)
- Encryption key derivation

---

### MainActivity.kt

User interface layer:

```kotlin
// Login flow:
// 1. User enters email + password
// 2. Tap "Sign In"
// 3. FirebaseAuth validates credentials
// 4. DeviceRegistrar registers device
// 5. Send button enabled

// Send flow:
// 1. User has clipboard text (e.g., "Sample text")
// 2. Tap "Send Clipboard Text"
// 3. ClipboardReader extracts text
// 4. LariCapAdapter.finalizeCopy() runs
// 5. SpectrocapSender uploads to Firebase
// 6. Activity log displays: "✓ Sent: message-uuid"
```

**UI Elements**:
- Email TextField
- Password TextField (input type hidden)
- Sign In Button
- Send Clipboard Text Button (disabled until login)
- Activity Log (ScrollView with monospace text)

---

## Running & Testing

### Local Testing (Emulator)

1. Open Android Studio
2. Tools → Device Manager
3. Create AVD (Android 12+ recommended)
4. Start emulator
5. Run app: Shift+F10 or Run menu

### Physical Device Testing

1. Enable Developer Mode: Settings → About phone → tap Build Number 7 times
2. Enable USB Debugging: Settings → Developer Options → USB Debugging
3. Connect via USB
4. Authorize device when prompted
5. Run app: Shift+F10

---

## Smoke Test (Lane 1)

### Test Scenario 1: Authentication
**Objective**: Verify Firebase Auth login

```
1. Launch app
2. Enter valid email: sender@spectrocap.test
3. Enter valid password: Phase1Testing123!
4. Tap "Sign In"
5. Expected: Send button enabled, activity log shows "✓ Authenticated"
```

**Validation**:
- ✅ No auth errors in logcat
- ✅ Send button is enabled
- ✅ Device appears in Firestore at `/users/{uid}/devices/{deviceId}`

---

### Test Scenario 2: Device Registration
**Objective**: Verify device registration with Firestore

```
1. Complete Test Scenario 1 (Auth)
2. Check Firestore Console
3. Navigate to: users → {uid} → devices
4. Verify device document exists
```

**Validation**:
- ✅ Device doc has: deviceId, name, platform:"android", createdAt, status:"active"
- ✅ Device UUID is consistent across app restarts
- ✅ lastSeenAt updates after authentication

---

### Test Scenario 3: Clipboard Read
**Objective**: Verify clipboard text extraction

```
1. Complete Test Scenario 1 (Auth)
2. Copy text to Android clipboard: "Test message from clipboard"
3. Tap "Send Clipboard Text"
4. Check activity log
```

**Validation**:
- ✅ ClipboardReader extracts text without errors
- ✅ Activity log shows message ID (UUID format)
- ✅ No "Clipboard empty" errors

---

### Test Scenario 4: Message Storage Upload
**Objective**: Verify text uploaded to Cloud Storage

```
1. Complete Test Scenario 3 (Send)
2. Open Firebase Console → Storage
3. Navigate to: users/{uid}/messages/
4. Verify .txt file exists with message ID as filename
```

**Validation**:
- ✅ File exists: `users/{uid}/messages/{messageId}.txt`
- ✅ File content matches clipboard text (UTF-8 encoded)
- ✅ File size > 0 bytes
- ✅ Created timestamp is recent

---

### Test Scenario 5: Message Metadata (Firestore)
**Objective**: Verify message doc created in Firestore

```
1. Complete Test Scenario 3 (Send)
2. Open Firebase Console → Firestore
3. Navigate to: users → {uid} → messages
4. Verify message document exists
```

**Validation**:
- ✅ Document ID matches message UUID
- ✅ Fields present:
  - messageId: UUID string
  - senderDeviceId: device UUID
  - type: "text"
  - createdAt: server timestamp
  - recipients: "all"
  - storagePath: "users/{uid}/messages/{messageId}.txt"
  - mime: "text/plain"
  - sizeBytes: >0

---

## Troubleshooting

### Build Issues

**Error**: `google-services.json` not found
```
Solution: Download from Firebase Console and place in app/ directory
Verify: file exists at apps/android/spectrocap-android/app/google-services.json
```

**Error**: Gradle sync fails
```
Solution: 
1. File → Invalidate Caches
2. Run Gradle sync again
3. Ensure JDK 11+ is configured in Project Structure
```

### Runtime Issues

**Error**: "PERMISSION_DENIED: Missing or insufficient permissions"
```
Solution: 
1. Check Firestore rules: `/users/{uid}/...` must match authenticated user
2. Verify user is authenticated before any Firestore operations
3. Check Cloud Storage rules: allow write if uid matches
```

**Error**: "Clipboard empty"
```
Solution:
1. Copy text to clipboard before tapping Send
2. Note: Android requires app in foreground for clipboard access
3. Verify permissions in AndroidManifest.xml include READ_CLIPBOARD
```

**Error**: Device registration fails silently
```
Solution:
1. Check Firebase Auth status: Log.d("AUTH", FirebaseAuth.getInstance().currentUser)
2. Verify /users/{uid}/ document exists in Firestore
3. Check device registration in logcat: grep "Device registered"
```

---

## Phase 2 Planning (Future)

### Encryption
- E2E encryption for message payloads (TweetNaCl.js adapted for Kotlin)
- Key exchange via Firestore signed documents

### LARI-CAP Enhancement
- Claude Haiku integration for text summarization
- Device-to-device recipient matching
- Context-aware authorization

### UI Improvements
- Material 3 design system (Material You)
- Dark mode support
- Message history UI

### Testing
- Unit tests for DeviceIdentity, ClipboardReader, SpectrocapSender
- Instrumentation tests for Firebase integration
- E2E tests with Windows Lane 2 client

---

## Contributing

All code follows Kotlin style guidelines. Before submitting PRs:

```bash
./gradlew lint
./gradlew ktlintCheck
```

---

## License

SCINGULAR ENGINEERING GUIDE — Part of SpectroCAP™ Phase 1  
See [LICENSE](../../LICENSE) for details.

---

**Last Updated**: 2024-01-15  
**Maintainer**: SCINGULAR Engineering Team  
**Status**: Phase 1 (Text MVP)
