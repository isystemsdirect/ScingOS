# Phase 2B Validation Quick Reference Card

**Print this or bookmark for quick reference during testing**

---

## 🚀 Quick Start (Copy & Paste Commands)

### Step 1: Android APK Build (Pick ONE)

```bash
# Option A: Android Studio (Recommended)
# File → Open → apps/android/spectrocap-android
# Wait for Gradle sync → Build → Build APK(s)

# Option B: Gradle Wrapper (if gradle installed)
cd apps/android/spectrocap-android
gradle wrapper --gradle-version 8.2.0
./gradlew assembleDebug

# Option C: Using Android Studio but via command line
cd apps/android/spectrocap-android
# (ensure gradle-wrapper.jar exists in gradle/wrapper/)
./gradlew assembleDebug
```

### Step 2: Verify APK Built
```bash
ls -lh apps/android/spectrocap-android/app/build/outputs/apk/debug/app-debug.apk
# Should show: 1.2MB (size varies)
```

### Step 3: Install APK
```bash
adb install -r apps/android/spectrocap-android/app/build/outputs/apk/debug/app-debug.apk
```

### Step 4: Firebase E2E Test
**Follow [PHASE_2B_E2E_TEST_GUIDE.md](PHASE_2B_E2E_TEST_GUIDE.md)**

- PNG transfer: Android → Firebase → Windows ✓
- JPEG transfer: Android → Firebase → Windows ✓
- Negative: Invalid MIME rejected ✓
- Negative: Bad signature rejected ✓

### Step 5: Final Commit
```bash
# Update validation report with test results
git add PHASE_2B_VALIDATION_REPORT.md
git commit -m "docs(spectrocap): Phase 2B validation PASSED (PNG/JPEG E2E)"
git push origin main
```

---

## 📋 E2E Test Checklist

### Pre-Test
- [ ] Android device registered in Firestore (`/users/{uid}/devices/`)
- [ ] Windows device registered in Firestore (`/users/{uid}/devices/`)
- [ ] Both devices have `pubSignKey` and `pubBoxKey` fields
- [ ] Both devices have status="active"

### PNG Transfer Test
- [ ] Android: Share PNG image to SpectroCAP
- [ ] Firebase Storage: `.bin` blob created
- [ ] Firestore: Document created with mime="image/png"
- [ ] Windows: Receives image notification
- [ ] Windows: Image displays correctly
- [ ] Windows: Magic bytes validated (0x89 0x50 0x4E...)
- [ ] Windows: Signature verified ✓
- [ ] Windows: Save As → PNG opens in Paint
- [ ] Windows: Copy → Paste in Paint works

### JPEG Transfer Test
- [ ] Android: Share JPEG image to SpectroCAP
- [ ] Firebase Storage: `.bin` blob created
- [ ] Firestore: Document created with mime="image/jpeg"
- [ ] Windows: Receives image notification
- [ ] Windows: Image displays correctly
- [ ] Windows: Magic bytes validated (0xFF 0xD8 0xFF)
- [ ] Windows: Signature verified ✓
- [ ] Windows: Save As → JPEG opens in Paint
- [ ] Windows: Copy → Paste in Paint works

### Negative Tests
- [ ] Invalid file (text as .jpg): Rejected at Android send
- [ ] Corrupted signature: Rejected at Windows receive with error message

---

## 🔍 Key Validation Points

| Component | Expected Result |
|-----------|-----------------|
| PNG Magic | `89 50 4E 47 0D 0A 1A 0A` (8 bytes) |
| JPEG Magic | `FF D8 FF` (3 bytes) |
| Signature | Ed25519 verified ✓ |
| Encryption | XChaCha20-Poly1305 (AEAD) |
| File Size | Encrypted ~image_size + 100 bytes |
| Transfer Time | <10 seconds end-to-end |

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| `./gradlew` not found | See ANDROID_GRADLE_JAR_RESOLUTION.md |
| ClassNotFound error | gradle-wrapper.jar missing → Run gradle wrapper command |
| APK not building | Check Java version: `java -version` (need Java 11+) |
| Windows app won't launch | Run: `npm run build` in apps/windows/spectrocap-win/ |
| Firebase connection fails | Check google-services.json, firestore.rules, storage.rules |
| Image won't display | Verify media.ts component, check Chrome DevTools |
| Signature failure | Verify pubSignKey in Firestore matches device |

---

## 📊 Final Report Template

```
Phase 2B E2E Validation Results
================================
Date: [YYYY-MM-DD]
Tester: [Name]
Build: 9130895 (main)

Test Results:
✅ PNG Transfer: [X sec] - PASS
✅ JPEG Transfer: [X sec] - PASS
✅ Negative (Invalid MIME): PASS
✅ Negative (Bad Signature): PASS

Cryptography Verification:
✅ PNG Magic: 89 50 4E 47 0D 0A 1A 0A
✅ JPEG Magic: FF D8 FF
✅ Signature: Ed25519 verified
✅ Encryption: XChaCha20-Poly1305

Status: VALIDATION PASSED ✅
```

---

## 📞 Resources

- **E2E Test Guide:** [PHASE_2B_E2E_TEST_GUIDE.md](PHASE_2B_E2E_TEST_GUIDE.md)
- **Gradle Issues:** [ANDROID_GRADLE_JAR_RESOLUTION.md](ANDROID_GRADLE_JAR_RESOLUTION.md)
- **Validation Report:** [PHASE_2B_VALIDATION_REPORT.md](PHASE_2B_VALIDATION_REPORT.md)
- **Final Status:** [PHASE_2B_VALIDATION_FINAL_STATUS.md](PHASE_2B_VALIDATION_FINAL_STATUS.md)
- **Architecture:** [docs/remote-paste/PHASE_2B_MEDIA.md](docs/remote-paste/PHASE_2B_MEDIA.md)

---

## ✅ Success = Completion

All tests pass → Update validation report → Commit "VALIDATION PASSED" → Push → Done!

