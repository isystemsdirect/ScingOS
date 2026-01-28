# Android Flow — SCINGULAR Remote Paste Phase 1

## Architecture

```
UI (Jetpack Compose or Material Design)
  ↓
ViewModel (Android Architecture Components)
  ↓
Repository (data access abstraction)
  ↓
Firebase SDK (Auth, Firestore, Storage)
  ↓
Backend (Firebase Cloud)
```

---

## 1. Login & Setup (First Launch)

```
[Login Screen]
  ↓ User enters email + password
[Firebase Auth.signInWithEmailAndPassword()]
  ↓
[Success] → Device Registration
  ↓
1. Generate deviceId = UUID.randomUUID().toString()
2. Read device name = Build.MODEL (e.g., "Pixel 8")
3. Write to Firestore:
     users/{uid}/devices/{deviceId}:
       {
         deviceId,
         platform: "android",
         name,
         createdAt: now(),
         lastSeenAt: now(),
         status: "active"
       }
4. Save deviceId + uid locally (SharedPreferences or EncryptedSharedPreferences)
5. Navigate to Main screen
```

---

## 2. Main Screen (Home/Dashboard)

**UI Components:**
- Title: "Remote Paste"
- Subtitle: "Logged in as {email}"
- Device info: "Registered device: {deviceName} (ID: {shortened})"
- **Button: "Send Clipboard Text"** (primary)
- Button: "Settings" (opens settings)
- Button: "Logout"

**On Screen Load:**
```
1. Check if user is authenticated (Auth.currentUser != null)
   ├─ YES → Load device info from SharedPreferences
   │         Show main screen
   └─ NO → Redirect to Login
2. Subscribe to onAuthStateChanged()
   ├─ If logged out → Redirect to Login
```

---

## 3. Send Clipboard Text (Main Action)

### Trigger

User taps **"Send Clipboard Text"** button.

### Flow

```
[Button Press]
  ↓
[Check Foreground Permission]
  ├─ Permission granted: continue
  └─ Permission denied: show toast + return
  ↓
[Read Clipboard]
  ├─ val clipboard = context.getSystemService(ClipboardManager::class.java)
  ├─ val text = clipboard.primaryClip?.getItemAt(0)?.text?.toString()
  └─ if text == null → show "Clipboard empty" + return
  ↓
[Validate Text]
  ├─ if text.isEmpty() → show "Clipboard is empty"
  ├─ if text.length > 1MB → show "Text too large (max 1MB)"
  └─ continue
  ↓
[Create Message ID]
  ├─ val messageId = UUID.randomUUID().toString()
  └─ val timestamp = System.currentTimeMillis()
  ↓
[Upload Text to Storage]
  ├─ val path = "users/{uid}/messages/{messageId}.bin"
  ├─ val ref = FirebaseStorage.instance.getReference(path)
  ├─ ref.putBytes(text.toByteArray(Charsets.UTF_8))
  └─ await response → handle success/error
  ↓
[Create Firestore Message Doc]
  ├─ val docData = {
  │    messageId,
  │    senderDeviceId: deviceId,
  │    type: "text",
  │    createdAt: Timestamp.now(),
  │    payloadRef: "gs://.../{messageId}.bin",
  │    recipients: "all",
  │    size: text.length
  │  }
  ├─ db.collection("users")
  │    .document(uid)
  │    .collection("messages")
  │    .document(messageId)
  │    .set(docData)
  └─ await response
  ↓
[Success Notification]
  └─ Show toast: "Sent! ({size} bytes)"
     OR snackbar with undo (Phase 2)
```

### Error Handling

| Error | Action |
|-------|--------|
| Clipboard is empty | Toast: "Clipboard is empty" |
| Text > 1MB | Toast: "Text too large (max 1MB)" |
| Not authenticated | Toast: "Session expired. Please log in again." → Redirect to Login |
| Storage upload fails | Toast: "Failed to upload. Check internet and retry." + Retry button |
| Firestore write fails | Toast: "Message created but metadata not saved. Retry?" |

---

## 4. Settings Screen (Future Use)

**Not implemented in Phase 1, but scaffold for Phase 2:**

```
[Settings Screen]
  ├─ Device Name (edit)
  ├─ Last Sync: {timestamp}
  ├─ Storage Used: {size}
  ├─ About
  │  ├─ App Version: 1.0.0-alpha
  │  ├─ Device ID: {ID}
  │  └─ Firebase Project: scing-remote-paste
  └─ Logout Button
```

---

## 5. Logout

```
[User taps "Logout"]
  ↓
[Confirm Dialog: "Logout?"]
  ├─ YES:
  │   1. FirebaseAuth.instance.signOut()
  │   2. Clear SharedPreferences (deviceId, uid)
  │   3. Redirect to Login screen
  └─ NO: dismiss dialog
```

---

## Code Structure (Kotlin)

```
app/
  ├─ src/
  │  ├─ main/
  │  │  ├─ java/com/isystemsdirect/scingremotepaste/
  │  │  │  ├─ MainActivity.kt
  │  │  │  ├─ ui/
  │  │  │  │  ├─ screens/
  │  │  │  │  │  ├─ LoginScreen.kt
  │  │  │  │  │  ├─ MainScreen.kt
  │  │  │  │  │  └─ SettingsScreen.kt
  │  │  │  │  ├─ components/
  │  │  │  │  │  ├─ SendButton.kt
  │  │  │  │  │  └─ DeviceInfo.kt
  │  │  │  │  └─ theme/
  │  │  │  │     └─ Theme.kt
  │  │  │  ├─ viewmodel/
  │  │  │  │  ├─ AuthViewModel.kt
  │  │  │  │  ├─ MainViewModel.kt
  │  │  │  │  └─ SendViewModel.kt
  │  │  │  ├─ repository/
  │  │  │  │  ├─ AuthRepository.kt
  │  │  │  │  ├─ MessageRepository.kt
  │  │  │  │  └─ DeviceRepository.kt
  │  │  │  ├─ model/
  │  │  │  │  ├─ Device.kt
  │  │  │  │  ├─ Message.kt
  │  │  │  │  └─ User.kt
  │  │  │  ├─ util/
  │  │  │  │  ├─ ClipboardHelper.kt
  │  │  │  │  ├─ FirebaseHelper.kt
  │  │  │  │  └─ PreferencesHelper.kt
  │  │  │  └─ di/
  │  │  │     └─ FirebaseModule.kt
  │  │  └─ AndroidManifest.xml
  │  └─ test/ (unit tests)
  ├─ build.gradle (app-level)
  └─ proguard-rules.pro
```

---

## Dependencies

```gradle
dependencies {
  // Firebase
  implementation platform('com.google.firebase:firebase-bom:32.4.0')
  implementation 'com.google.firebase:firebase-auth'
  implementation 'com.google.firebase:firebase-firestore'
  implementation 'com.google.firebase:firebase-storage'
  
  // Jetpack Compose
  implementation 'androidx.compose.ui:ui:1.5.4'
  implementation 'androidx.compose.material3:material3:1.1.2'
  implementation 'androidx.lifecycle:lifecycle-runtime-ktx:2.6.2'
  implementation 'androidx.activity:activity-compose:1.8.1'
  
  // ViewModel & LiveData
  implementation 'androidx.lifecycle:lifecycle-viewmodel-compose:2.6.2'
  
  // Coroutines
  implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
  implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.7.3'
  
  // DI (Hilt)
  implementation 'com.google.dagger:hilt-android:2.48'
  kapt 'com.google.dagger:hilt-compiler:2.48'
  implementation 'androidx.hilt:hilt-navigation-compose:1.1.0'
  
  // Testing
  testImplementation 'junit:junit:4.13.2'
  androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
}
```

---

## Permissions

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Clipboard access (auto-granted on Android 12+) -->
<!-- No explicit permission required for clipboard read -->
```

---

## Firebase Configuration

```json
{
  "projectId": "scing-remote-paste",
  "appId": "1:XXXXX:android:XXXXX",
  "databaseURL": "https://scing-remote-paste.firebaseio.com",
  "storageBucket": "scing-remote-paste.appspot.com",
  "apiKey": "AIzaSyXXXXXXXXXXXXXX",
  "authDomain": "scing-remote-paste.firebaseapp.com",
  "messagingSenderId": "XXXXX"
}
```

Store in `google-services.json` in `app/` directory.

---

## Security (Phase 1)

- ✅ SharedPreferences for deviceId/uid (plaintext, acceptable for MVP)
- ✅ Firebase rules enforce user scoping
- ✅ HTTPS for all Firebase communication
- 🔄 Phase 2: EncryptedSharedPreferences for sensitive data
- 🔄 Phase 2: E2EE for message payloads

---

## Testing

### Unit Tests (ViewModel)
```kotlin
@Test
fun testSendClipboardSuccess() {
  // Mock clipboard, Firebase, and verify flow
}

@Test
fun testSendClipboardEmpty() {
  // Verify error toast when clipboard empty
}
```

### Integration Tests (Firebase)
```kotlin
@Test
fun testDeviceRegistration() {
  // Create device, verify Firestore doc written
}

@Test
fun testMessageCreation() {
  // Send message, verify Storage + Firestore consistency
}
```

---

## Debugging

**Enable Firebase emulator (local development):**
```kotlin
val settings = FirebaseFirestoreSettings.Builder()
  .setHost("10.0.2.2:8080") // Android emulator localhost
  .setSslEnabled(false)
  .build()
firestore.firestoreSettings = settings
```

**View logs:**
```bash
adb logcat | grep "RemotePaste"
```

---

## LARI-CAP Checkpoints (Future Phase 3+)

When Remote Paste integrates with **LARI-CAP** orchestration:

- **LARI-CAP.prepareCopy** → Validate clipboard context before sending
- **LARI-CAP.authorizeIntent** → Check user intent and policy compliance
- **LARI-CAP.finalize** → Record audit trail via BANE

Phase 1 MVP: These are stubs; full integration Phase 3+.

---

## Success Criteria

1. ✅ Login works; device registered in Firestore
2. ✅ Clipboard read succeeds on foreground app
3. ✅ Text uploaded to Storage within 2 seconds
4. ✅ Firestore message doc created with correct metadata
5. ✅ Error handling shows appropriate user feedback
6. ✅ Logout clears local state
