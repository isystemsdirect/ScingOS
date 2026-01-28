# Phase 2B End-to-End Test Guide
## Complete Image Transfer Validation (PNG, JPEG, Negative Cases)

**Version:** 1.0  
**Date:** January 28, 2026  
**Build Baseline:** Commit `0b96a63` - Windows Tauri v2 aligned, Android ready  
**Status:** Ready for execution

---

## Table of Contents
1. [Pre-Test Environment Setup](#pre-test-environment-setup)
2. [Device Prerequisites](#device-prerequisites)
3. [Firebase Setup](#firebase-setup)
4. [Test Case: PNG Transfer](#test-case-1-png-image-transfer)
5. [Test Case: JPEG Transfer](#test-case-2-jpeg-image-transfer)
6. [Negative Test: Invalid MIME](#test-case-3-negative-invalid-mime)
7. [Negative Test: Signature Failure](#test-case-4-negative-signature-failure)
8. [Result Verification Checklist](#result-verification-checklist)
9. [Final Report Template](#final-report-template)

---

## Pre-Test Environment Setup

### 1. Android Build (Prerequisite)
Before running any tests, the Android APK must be built:

```bash
# Navigate to Android project
cd apps/android/spectrocap-android

# Option A: Using Android Studio (Recommended)
# - Open Android Studio
# - File → Open → Select this folder
# - Wait for Gradle sync (Android Studio auto-generates gradle wrapper JAR)
# - Build → Make Project (or Build → Build Bundle(s)/APK(s))
# - Output: app/build/outputs/apk/debug/app-debug.apk

# Option B: Using Gradle Wrapper (if JAR already present)
./gradlew assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk

# Option C: Using System Gradle
gradle assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk
```

**Verification:**
```bash
# Confirm APK exists and is > 1 MB
ls -lh app/build/outputs/apk/debug/app-debug.apk
# Expected: -rw-r--r-- ... 1.2M app-debug.apk (size varies)
```

### 2. Windows Build (Already Complete)
Windows Tauri app is ready:
```bash
cd apps/windows/spectrocap-win

# Verify builds still pass
cargo check                           # ✅ Should pass (5-10 seconds)
npm run build                         # ✅ Should pass (builds dist/)

# Windows executable can now be packaged
npx tauri build                       # ~2 minutes (creates .exe installer)
```

### 3. Firebase Emulator (Optional but Recommended)
Start local Firebase emulator for faster iteration:

```bash
# In workspace root
firebase emulators:start --only firestore,storage

# Output should show:
# ✔ firestore: listening at 127.0.0.1:8080
# ✔ storage: listening at 127.0.0.1:9199
```

**If using emulator:**
- Update Android app to connect to emulator:
  - Settings → Server: `127.0.0.1:8080` (Firestore)
  - Settings → Storage: `127.0.0.1:9199` (Storage)
- Update Windows app similarly
- Emulator data is ephemeral (cleared on restart)

**If using production Firebase:**
- Ensure project is properly configured
- Use real Firebase credentials
- Data persists across runs

---

## Device Prerequisites

### Requirement 1: Two Active Devices Registered
Both Android and Windows devices must be registered with cryptographic keys.

**Check Device Registration in Firestore:**
```bash
# Navigate to Firebase Console
# → Firestore Database → users → {your-uid} → devices

# Required structure per device:
{
  "deviceId": "android-device-1",        # or "windows-device-1"
  "status": "active",
  "pubSignKey": "base64-ed25519-pk...",   # 32 bytes
  "pubBoxKey": "base64-x25519-pk...",     # 32 bytes
  "createdAt": 1234567890000,
  "lastSeen": 1234567890000
}
```

**Missing Device Registration?**
1. Android: First login to SpectroCAP app → triggers device registration
   - App generates Ed25519 keypair + X25519 keypair
   - Uploads public keys to Firestore
   - Creates entry at `/users/{uid}/devices/{deviceId}`
2. Windows: First login to SpectroCAP app → triggers device registration
   - Desktop app does the same registration flow

**Verify Both Devices Present:**
```bash
# Firebase Console → Firestore → users → {uid} → devices
# Should show 2 collections:
# 1. android-device-1 (or similar)
# 2. windows-device-1 (or similar)
```

### Requirement 2: Private Keys Available Locally
Each device must have access to its private keys for decryption.

**Android:**
- Private keys stored in Android KeyStore (encrypted)
- Accessed via `PrivateKeyStore.getPrivateSigningKey()` and `PrivateKeyStore.getPrivateBoxKey()`

**Windows:**
- Private keys stored in Windows Credential Manager (encrypted)
- Accessed via Rust keystore operations

**Verification:**
```bash
# On Android: Logcat should show "Keys loaded from keystore" (no errors)
# On Windows: App startup should show successful key load (no decryption errors)
```

---

## Firebase Setup

### Step 1: Enable Cloud Storage
```bash
cd workspace-root

# Ensure storage.rules and firestore.rules are in place
ls -la storage.rules firestore.rules

# Push rules to Firebase
firebase deploy --only firestore:rules,storage:rules
```

### Step 2: Create Test Images (Local)
```bash
# Create a test PNG image (100x100 pixels)
# Using ImageMagick (if available):
convert -size 100x100 xc:blue test-image.png

# Or create manually in Paint:
# - 100x100 pixels
# - Save as PNG (not JPEG)
# - Save to: apps/android/test-images/test.png

# Create a test JPEG image
convert -size 100x100 xc:red test-image.jpg

# Verify both exist:
ls -la test-image.png test-image.jpg
```

### Step 3: Verify Firebase Credentials
```bash
# Check if Firebase CLI is authenticated
firebase status

# Expected output: Logged in as: user@example.com
# If not logged in: firebase login

# Verify project selection:
firebase use --list
# Should show current project with (current) marker
```

---

## Test Case 1: PNG Image Transfer
### Android → Firebase Storage → Firestore → Windows Decryption → Display/Save

### Step 1.1: Prepare Android Device
```bash
# Device setup:
1. Install APK: adb install -r app/build/outputs/apk/debug/app-debug.apk
2. Open SpectroCAP on Android
3. Login with test account
4. Grant permissions when prompted (Storage, Camera, etc.)
5. Navigate to device settings → verify "status: active" shows in Firestore
```

### Step 1.2: Prepare Windows Device
```bash
# Windows setup:
1. Run Windows app: npx tauri dev (for development) or launch .exe
2. Login with same test account
3. Observe device registration in Firestore
4. Prepare UI to receive messages (should show "Waiting for images..." or similar)
```

### Step 1.3: Send PNG from Android
```bash
# On Android device:
1. Tap "+" or "Share" button
2. Select "Gallery" or "Files"
3. Choose test PNG image (test-image.png)
4. Tap "Send via SpectroCAP"
5. Observe encryption progress (should show "Encrypting..." briefly)
6. Observe "Sent" confirmation message
```

### Step 1.4: Verify Firebase Artifacts
```bash
# In Firebase Console (or emulator):
# Check Cloud Storage
gs://spectrocap-project/users/{uid}/messages/{imageId}.bin
# - Should exist
# - Size should be: image size + ~100 bytes (for encryption overhead)
# - File cannot be opened directly (it's encrypted)

# Check Firestore document
/users/{uid}/messages/{imageId}
# Should contain:
{
  "type": "image",
  "mime": "image/png",
  "fromDevice": "android-device-1",
  "toDevice": "windows-device-1",
  "iv": "base64-encoded-24-byte-nonce",
  "metaHash": "base64-encoded-32-byte-sha256",
  "signature": "base64-encoded-64-byte-ed25519",
  "timestamp": 1234567890000
}
```

### Step 1.5: Windows Receives & Decrypts
```bash
# On Windows:
1. Message notification appears in UI
2. Image preview area shows encrypted placeholder (or "Loading..." spinner)
3. Image decrypts and displays
4. Observe automatic or manual validation:
   - Magic bytes validated (0x89 0x50 0x4E 0x47...)
   - Signature verified (Ed25519 matches metaHash)
   - Image displays in media.ts component
```

### Step 1.6: Windows UI Operations
```bash
# Option A: Save Image
1. Click "Save As" or "Save" button
2. Choose location (Desktop or Downloads)
3. Filename should be: {imageId}.png or user-selected
4. Verify saved file:
   - File exists: ls -la {filename}.png
   - Can open in Paint/Preview
   - Image displays correctly (blue square if using test image)

# Option B: Copy to Clipboard
1. Click "Copy Image to Clipboard"
2. Open Paint or similar
3. Paste (Ctrl+V)
4. Verify image displays correctly
```

### Step 1.7: Verify Cryptography
```bash
# Detailed validation:

# A. Signature Verification
# - Windows reads metaHash from decrypted bytes
# - Windows reads signature from Firestore document
# - Verify: Ed25519Verify(pubSignKey, metaHash, signature) == TRUE
# - If FALSE: reject message and show error

# B. Magic Byte Validation
# - Decrypted bytes start with: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
# - If not: reject and show "Invalid PNG format"

# C. Image Dimensions
# - Should be extractable from PNG format (100x100 from test image)
# - Should not cause decode errors

# Log output should show:
# [crypto] PNG magic validated ✓
# [crypto] Signature verified (Ed25519) ✓
# [media] Image displayed: 100x100 PNG
```

### Step 1.8: Test Result
**Expected Result:**
- ✅ Android sends PNG
- ✅ Firebase Storage contains encrypted blob
- ✅ Firestore document created with correct metadata
- ✅ Windows receives and decrypts
- ✅ Magic bytes validated
- ✅ Signature verified
- ✅ Image displays on Windows
- ✅ Save As → file opens correctly in Paint
- ✅ Copy to Clipboard → paste works in Paint

**If Any Step Fails:**
- Check logs: `adb logcat` (Android) or console (Windows)
- Verify device keys in Firestore
- Verify network connectivity
- Check Firebase permissions (firestore.rules, storage.rules)

---

## Test Case 2: JPEG Image Transfer
### Android → Firebase Storage → Firestore → Windows Decryption → Display/Save

### Identical to Test Case 1, except:
- Use test JPEG image instead of PNG
- Magic bytes validation expects: 0xFF 0xD8 0xFF
- MIME type in Firestore should be: "image/jpeg"
- File extension should be: .jpg or .jpeg

```bash
# Steps (abbreviated):
1. Android: Select test JPEG image
2. Send via SpectroCAP
3. Firebase: Verify .bin blob created, MIME = "image/jpeg"
4. Windows: Receives and displays
5. Validation: JPEG magic bytes (0xFF 0xD8 0xFF) verified
6. Save As: File opens correctly in Paint
7. Copy: Paste into Paint succeeds
```

**JPEG Specific Validation:**
```
Expected JPEG magic: FF D8 FF (3 bytes at start of decrypted data)
If different: reject with "Invalid JPEG format"
```

---

## Test Case 3: Negative Test - Invalid MIME/Magic
### Attempt to send invalid file, verify rejection

### Step 3.1: Create Invalid Test File
```bash
# Create a text file disguised as JPEG
echo "This is not a JPEG" > fake-image.jpg

# Or modify a valid JPEG to have wrong magic bytes:
# (In hex editor: change FF D8 FF to AA BB CC at start)
```

### Step 3.2: Android Send Attempt
```bash
# On Android:
1. Share fake-image.jpg to SpectroCAP
2. Observe magic byte validation in ImageIngest.kt:
   - Read first 8 bytes from file
   - Compare against PNG magic: 0x89 0x50 0x4E 0x47...
   - Compare against JPEG magic: 0xFF 0xD8 0xFF
   - If neither match: REJECT
```

### Step 3.3: Verify Rejection
```bash
# Expected behavior:
1. Toast/Alert displayed: "Invalid image format" or similar
2. File NOT sent to Firebase
3. No entry in Firestore
4. No blob in Cloud Storage
5. Windows receives nothing

# Logcat output should show:
# [ImageIngest] Magic validation failed: invalid format
# [ImageIngest] File rejected: fake-image.jpg
```

### Step 3.4: Test Result
**Expected Result:**
- ✅ Invalid file rejected
- ✅ Error message displayed to user
- ✅ No Firebase entries created
- ❌ File NOT encrypted or transmitted

---

## Test Case 4: Negative Test - Signature Failure
### Manually corrupt signature, verify rejection

### Step 4.1: Prepare Malicious Message
```bash
# Using Firebase Console or programmatically:
1. Create valid image message (e.g., from Test Case 1)
2. Extract the Firestore document at /users/{uid}/messages/{imageId}
3. Corrupt the signature field:
   - Original: "base64-64-byte-ed25519-sig"
   - Corrupted: Change first 10 characters to random base64
   - Example: "ABCDEFGHIJbase64-rest-of-sig"
4. Save modified document back to Firestore
```

### Step 4.2: Windows Receives Message
```bash
# On Windows:
1. New message notification appears
2. Windows downloads blob from Storage (succeeds)
3. Windows decrypts blob (succeeds, signature not needed for decryption)
4. Windows validates magic bytes (succeeds, file format OK)
5. Windows verifies Ed25519 signature:
   - Compute: Ed25519Verify(pubSignKey, metaHash, corrupted_signature)
   - Result: FALSE
6. Message rejected, no display
```

### Step 4.3: Verify Rejection
```bash
# Expected behavior:
1. No image displayed in UI
2. Error message shown: "Message signature invalid" or similar
3. Image NOT saved or copied
4. Logcat/console output shows:
   # [crypto] Signature verification FAILED
   # [receive] Message rejected: invalid signature
```

### Step 4.4: Test Result
**Expected Result:**
- ✅ Message received from Firebase
- ✅ Decryption succeeds
- ✅ Signature verification fails
- ✅ Image NOT displayed
- ✅ Error message shown to user
- ✅ No save/copy operations possible

---

## Result Verification Checklist

### Build Validation
- [ ] Windows Rust build: `cargo check` passes
- [ ] Windows TypeScript build: `npm run build` passes
- [ ] Android build: `./gradlew assembleDebug` produces APK > 1 MB
- [ ] Commit `0b96a63` verified in git history

### Device Setup
- [ ] Android device registered in `/users/{uid}/devices/` with pubSignKey, pubBoxKey
- [ ] Windows device registered in `/users/{uid}/devices/` with pubSignKey, pubBoxKey
- [ ] Both devices show status="active"
- [ ] Both devices can access their private keys (no keystore errors)

### Test Case 1: PNG Transfer
- [ ] Android sends PNG successfully
- [ ] Firebase Storage blob created (encrypted)
- [ ] Firestore document created with mime="image/png"
- [ ] Windows receives message notification
- [ ] Windows decrypts and displays PNG
- [ ] PNG magic bytes validated (0x89 0x50 0x4E 0x47...)
- [ ] Ed25519 signature verified
- [ ] Save As → file opens in Paint correctly
- [ ] Copy to Clipboard → paste in Paint works

### Test Case 2: JPEG Transfer
- [ ] Android sends JPEG successfully
- [ ] Firebase Storage blob created (encrypted)
- [ ] Firestore document created with mime="image/jpeg"
- [ ] Windows receives message notification
- [ ] Windows decrypts and displays JPEG
- [ ] JPEG magic bytes validated (0xFF 0xD8 0xFF)
- [ ] Ed25519 signature verified
- [ ] Save As → file opens in Paint correctly
- [ ] Copy to Clipboard → paste in Paint works

### Negative Test 1: Invalid MIME/Magic
- [ ] Invalid file selected on Android
- [ ] Rejection message displayed: "Invalid image format"
- [ ] File NOT sent to Firebase
- [ ] No Firestore entry created
- [ ] No Storage blob created

### Negative Test 2: Signature Failure
- [ ] Message received from Firebase with corrupted signature
- [ ] Decryption succeeds (test continues)
- [ ] Signature verification fails
- [ ] Error message displayed: "Message signature invalid"
- [ ] Image NOT displayed in UI
- [ ] Save/Copy buttons not functional

---

## Final Report Template

```markdown
# Phase 2B E2E Test Results

**Test Date:** [YYYY-MM-DD]
**Tester:** [Your name/GitHub username]
**Build Commit:** 0b96a63 (Windows Tauri v2 aligned, Android ready)
**Environment:** [Android device model], [Windows OS version]
**Firebase:** [Production / Emulator]

## Test Summary

| Test Case | Status | Duration | Notes |
|-----------|--------|----------|-------|
| PNG Transfer (A→F→W) | ✅ PASS | ~5 sec | Magic + sig verified |
| JPEG Transfer (A→F→W) | ✅ PASS | ~5 sec | Magic + sig verified |
| Negative: Invalid MIME | ✅ PASS | <1 sec | Rejected, no FB entry |
| Negative: Bad Signature | ✅ PASS | ~2 sec | Decrypted, sig failed |

## Detailed Results

### Test 1: PNG Transfer
- Android send time: [X seconds]
- Firebase sync time: [X seconds]
- Windows decryption time: [X seconds]
- Image dimensions: 100x100 (or actual)
- File size (encrypted): [X bytes]
- File size (decrypted): [X bytes]
- Magic bytes: ✅ 89 50 4E 47 0D 0A 1A 0A
- Signature: ✅ Ed25519 verified
- Display: ✅ Image shows correctly
- Save As: ✅ PNG opens in Paint
- Copy to Clipboard: ✅ Paste works

### Test 2: JPEG Transfer
- Android send time: [X seconds]
- Firebase sync time: [X seconds]
- Windows decryption time: [X seconds]
- Image dimensions: [X x X]
- File size (encrypted): [X bytes]
- File size (decrypted): [X bytes]
- Magic bytes: ✅ FF D8 FF
- Signature: ✅ Ed25519 verified
- Display: ✅ Image shows correctly
- Save As: ✅ JPEG opens in Paint
- Copy to Clipboard: ✅ Paste works

### Test 3: Negative (Invalid MIME)
- Invalid file: fake-image.jpg (text content)
- Android validation: ✅ Rejected (magic validation failed)
- Error message: ✅ "Invalid image format" displayed
- Firebase entries: ❌ None created (as expected)
- Conclusion: ✅ PASS - Invalid files blocked at send

### Test 4: Negative (Bad Signature)
- Corrupted signature: Changed first 10 base64 chars
- Firestore document: Created with bad signature
- Windows decryption: ✅ Succeeded (sig not needed for decrypt)
- Signature verification: ✅ Failed (Ed25519Verify returned FALSE)
- Error message: ✅ "Message signature invalid" displayed
- Image displayed: ❌ No (as expected)
- Conclusion: ✅ PASS - Bad signatures rejected at receive

## Cryptographic Verification

### Encryption (Android Sender)
- Algorithm: XChaCha20-Poly1305 (AEAD)
- Key Derivation: None (sealed box per device)
- Nonce: 24 random bytes (XChaCha20)
- AAD: SHA256 metaHash (32 bytes)
- Signature: Ed25519 over metaHash

### Decryption (Windows Receiver)
- Algorithm: XChaCha20-Poly1305 (AEAD)
- Key Unwrap: X25519 sealed box + recipient private key
- Nonce: From IV field in Firestore
- AAD: metaHash (recomputed from decrypted bytes)
- Signature Verification: Ed25519 with pubSignKey from Firestore

### Magic Byte Validation
- PNG: First 8 bytes = 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A ✅
- JPEG: First 3 bytes = 0xFF 0xD8 0xFF ✅
- Post-decryption validation confirms image format

## Conclusion

**Phase 2B END-TO-END VALIDATION: ✅ PASSED**

All image transfer scenarios (PNG, JPEG) validated successfully:
- ✅ Encryption working (images transferred securely)
- ✅ Decryption working (Windows receives and decrypts correctly)
- ✅ Signature verification working (authentication confirmed)
- ✅ Magic byte validation working (format validation confirmed)
- ✅ Negative tests working (invalid formats and signatures rejected)

**Status:** Phase 2B is production-ready for image transfer in SpectroCAP.

Signed: [Your name]
Date: [YYYY-MM-DD]
```

---

## Troubleshooting

### Common Issues

**Issue: Android doesn't send message**
```bash
# Check:
1. adb logcat | grep -i "image"
2. Verify device registered: Firebase Console → users → {uid} → devices
3. Verify network: ping 8.8.8.8
4. Verify Firebase credentials in android/app/google-services.json
```

**Issue: Windows doesn't receive message**
```bash
# Check:
1. Console logs (Windows app): Look for "Message received" logs
2. Firebase: Verify Firestore rules allow read/write
3. Device keys: Verify pubSignKey and pubBoxKey in Firestore
4. Network: Ensure Windows has internet connectivity
```

**Issue: Signature verification fails**
```bash
# Check:
1. Verify Ed25519 public key matches device registration
2. Verify metaHash computation (alphabetical JSON field order)
3. Verify signature encoding (base64 vs raw bytes)
4. Check logs: [crypto] Signature verification FAILED
```

**Issue: Magic byte validation fails**
```bash
# Check:
1. File actually PNG/JPEG (not renamed text file)
2. Image corruption: Open original PNG/JPEG in Paint
3. Encryption round-trip: Is decrypted data matching original bytes?
4. Check logs: [crypto] PNG magic validation FAILED
```

---

## Success Criteria (Final)

For Phase 2B validation to be marked **COMPLETE**, all of the following must pass:

✅ **Build:**
- Windows Tauri v2 app builds without errors
- Android APK builds without errors

✅ **PNG Transfer:**
- Android sends PNG
- Firebase receives encrypted blob
- Windows decrypts, validates, displays PNG
- Magic bytes: 0x89 0x50 0x4E 0x47... ✓
- Signature verified ✓
- Save/Copy operations work ✓

✅ **JPEG Transfer:**
- Android sends JPEG
- Firebase receives encrypted blob
- Windows decrypts, validates, displays JPEG
- Magic bytes: 0xFF 0xD8 0xFF ✓
- Signature verified ✓
- Save/Copy operations work ✓

✅ **Negative Tests:**
- Invalid MIME rejected at Android send ✓
- Corrupted signature rejected at Windows receive ✓

✅ **Documentation:**
- PHASE_2B_VALIDATION_REPORT.md updated with results
- E2E test results committed to git
- Final commit: "docs(spectrocap): Phase 2B validation PASSED..."

**All criteria met = Phase 2B VALIDATION COMPLETE**

