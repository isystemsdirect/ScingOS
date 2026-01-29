# HTTPS Android Integration — Immediate Action Items

## ✅ COMPLETED

- [x] MainActivity.kt: Port 8765 → 9443, HTTPS false → true
- [x] Sender.kt: Remove hardcoded HTTP, add buildEndpoint()
- [x] ClipboardSync.kt: Verify no hardcoded values
- [x] Sanity checks: No old HTTP/ports remaining
- [x] Documentation: 3 guides created

---

## ⏳ IN PROGRESS

- [ ] **APK Build** (Started: ~14:00 UTC)
  - Expected: Complete within 10-15 minutes
  - Monitor: Check if `app\build\outputs\apk\debug\app-debug.apk` exists
  - Command to check:
    ```powershell
    cd "g:\GIT\isystemsdirect\ScingOS\apps\android\spectrocap-android"
    Test-Path "app\build\outputs\apk\debug\app-debug.apk"
    ```

---

## ⏭️ NEXT STEPS (Execute When APK Ready)

### Step 1: Verify APK Built
```powershell
$APK = "g:\GIT\isystemsdirect\ScingOS\apps\android\spectrocap-android\app\build\outputs\apk\debug\app-debug.apk"
if(Test-Path $APK) {
    $size = [Math]::Round((Get-Item $APK).Length/1MB, 2)
    Write-Host "✓ APK READY: $size MB"
} else {
    Write-Host "APK not found - build may have failed"
}
```

### Step 2: Check Connected Android Device
```bash
adb devices -l
# Should show device like: emulator-5554 OR 192.168.X.X:5555
```

### Step 3: Install APK
```bash
adb install -r "g:\GIT\isystemsdirect\ScingOS\apps\android\spectrocap-android\app\build\outputs\apk\debug\app-debug.apk"
```

### Step 4: Launch Application
```bash
adb shell monkey -p com.scingular.spectrocap -c android.intent.category.LAUNCHER 1
```

### Step 5: Visual Verification (30 seconds)
On Android device, verify:
- [ ] App shows **SpectroCAP™** title
- [ ] IonMetal branding visible (accent colors)
- [ ] Footer present (Powered by SCINGULAR™)
- [ ] No error dialogs
- [ ] Endpoint field shows HTTPS protocol

### Step 6: Functional Test (60 seconds)
1. In app, type: `HTTPS_TEST_MESSAGE`
2. Tap "Send to Receiver"
3. On Windows, verify clipboard contains: `HTTPS_TEST_MESSAGE`
4. Check for NO HTTP warnings or fallback messages

### Step 7: Verify Endpoint Details (Optional)
On Android, go to Settings → Receiver Configuration:
- Protocol: HTTPS (not HTTP)
- Host: 192.168.0.37
- Port: 9443
- Path: /clip

---

## 📊 Expected Results

### ✓ Success Indicators
- APK builds without errors
- APK installs successfully
- App launches without crashes
- Endpoint displays HTTPS protocol
- Clipboard transfer works over HTTPS
- Windows receives data within 2 seconds
- No SSL/certificate warnings

### ✗ Failure Indicators (If Encountered)
- Build fails with Gradle error → Check Java version, clean cache
- APK won't install → Try `adb uninstall` first
- App crashes → Check logcat for errors
- Endpoint shows HTTP → Verify MainActivity.kt changes applied
- HTTPS fails → Check certificate handling (may need TrustAllCerts)

---

## 🔧 Troubleshooting Commands

### If Build Fails
```bash
cd "g:\GIT\isystemsdirect\ScingOS\apps\android\spectrocap-android"
.\gradlew.bat --stop
rm -Recurse ".gradle"
.\gradlew.bat clean
.\gradlew.bat :app:assembleDebug
```

### If Installation Fails
```bash
adb uninstall com.scingular.spectrocap
adb install -r app\build\outputs\apk\debug\app-debug.apk
```

### If App Crashes
```bash
adb logcat | findstr /i "spectrocap\|error\|exception"
# Look for Java exceptions or Android errors
```

### If Endpoint Shows HTTP Instead of HTTPS
```bash
# Verify the change was applied:
git diff -- "app/src/main/java/com/scingular/spectrocap/MainActivity.kt" | findstr "use_https\|9443"
# Should show: +val useHttps = prefs().getBoolean("use_https", true)
# Should show: +val port = prefs().getString("receiver_port", "9443")
```

### If HTTPS Connection Fails
Add TrustAllCerts to NetworkConfig.kt (see documentation)

---

## 📝 Documentation References

**Quick Start:** [HTTPS_BUILD_STATUS_2026-01-29.md](./HTTPS_BUILD_STATUS_2026-01-29.md)

**Detailed Guide:** [HTTPS_VERIFICATION_CHECKLIST.md](apps/android/spectrocap-android/HTTPS_VERIFICATION_CHECKLIST.md)

**Configuration:** [ENDPOINT_CONFIGURATION_GUIDE.md](apps/android/spectrocap-android/ENDPOINT_CONFIGURATION_GUIDE.md)

**Implementation:** [HTTPS_ANDROID_IMPLEMENTATION_SUMMARY.md](./HTTPS_ANDROID_IMPLEMENTATION_SUMMARY.md)

---

## ⏱️ Timeline

```
2026-01-29 13:35 — Code changes applied ✓
2026-01-29 13:40 — Verification complete ✓
2026-01-29 13:45 — Build started ✓
2026-01-29 14:00 — [Awaiting APK completion]
2026-01-29 14:10 — Expected: APK ready
2026-01-29 14:15 — Expected: Installation
2026-01-29 14:20 — Expected: Functional testing
2026-01-29 14:25 — Expected: Completion
```

---

## ✅ Completion Criteria

All conditions must be met:
- [ ] APK builds successfully
- [ ] APK installs on device
- [ ] App shows HTTPS endpoint
- [ ] Clipboard message transfers over HTTPS
- [ ] Windows receiver accepts connection
- [ ] No HTTP fallback occurs
- [ ] Documentation complete

---

**Status:** Code Implementation Complete | Build In Progress | Testing Ready

Use this checklist to track progress as build completes and testing begins.
