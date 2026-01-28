# Phase 2B Android Build - Gradle Wrapper JAR Resolution Guide

**Date:** January 28, 2026  
**Problem:** `gradle-wrapper.jar` missing from `gradle/wrapper/` directory  
**Impact:** `./gradlew assembleDebug` fails with "Could not find or load main class org.gradle.wrapper.GradleWrapperMain"  
**Solution:** Three approaches to resolve and build Android APK

---

## Problem Analysis

### Current State
```
apps/android/spectrocap-android/
├── gradle/
│   └── wrapper/
│       ├── gradle-wrapper.properties ✅ (exists)
│       └── gradle-wrapper.jar ❌ (MISSING - needed!)
├── gradlew ✅ (exists - shell script)
├── gradlew.bat ✅ (exists - batch file)
└── build.gradle
```

### Root Cause
Gradle wrapper scripts are present, but the actual JAR executable (`gradle-wrapper.jar`) that downloads and runs Gradle 8.2.0 is missing or was not committed to git.

### Failure Message
```
Error: Could not find or load main class org.gradle.wrapper.GradleWrapperMain
```

---

## Solution Option A: Android Studio (Recommended)
**Effort:** Low | **Time:** 5-10 minutes | **Success Rate:** ~99%

### Why This is Recommended
- Android Studio automatically downloads and caches the gradle wrapper JAR
- No manual configuration needed
- IDE handles all gradle setup
- Additional benefits: code completion, debugging, native build tools

### Steps

**1. Open Project in Android Studio**
```bash
# Navigate to Android project
cd apps/android/spectrocap-android

# Open in Android Studio (if installed):
# File → Open → Select this folder
# OR from command line:
studio .
```

**2. Wait for Gradle Sync**
- Android Studio will:
  - Detect gradle 8.2.0 requirement from gradle-wrapper.properties
  - Download gradle-8.2.0 distribution (auto-cached)
  - Extract gradle-wrapper.jar into gradle/wrapper/
  - Sync project dependencies
- Progress shown in bottom status bar
- May take 2-5 minutes (first time)

**3. Build APK**
```
Menu: Build → Build Bundle(s)/APK(s) → Build APK(s)
# OR
Menu: Build → Make Project (to verify compilation)
```

**4. Verify APK Created**
```bash
# APK should appear at:
app/build/outputs/apk/debug/app-debug.apk

# Verify size > 1 MB:
ls -lh app/build/outputs/apk/debug/app-debug.apk
# Expected: -rw-r--r-- ... 1.2M app-debug.apk
```

**5. Install & Test**
```bash
# Use Android Studio's Run button or command line:
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

---

## Solution Option B: Manual Gradle Wrapper Regeneration
**Effort:** Medium | **Time:** 10-15 minutes | **Success Rate:** ~90%

### Why Use This
- No IDE required
- Works in CI/CD environments
- Direct control over gradle version

### Prerequisites
- System Gradle installed (gradle 6.0+)
- OR Java 11+ installed (if using gradle wrapper from another gradle installation)

### Steps

**1. Check System Gradle**
```bash
gradle --version

# If installed, output shows:
# Gradle 8.x.x ...
# Build time: ...

# If not installed, see "Installation" section below
```

**2. Navigate to Android Project**
```bash
cd apps/android/spectrocap-android
pwd
# Should show: .../ScingOS/apps/android/spectrocap-android
```

**3. Regenerate Gradle Wrapper (Option B1: Using System Gradle)**
```bash
# Using existing system gradle to generate wrapper for gradle 8.2.0
gradle wrapper --gradle-version 8.2.0

# Output should show:
# Downloading gradle-8.2.0-all.zip
# ... [download progress] ...
# Unzipping gradle-8.2.0-all.zip
# Building gradle wrapper
# ...
# ✓ Gradle wrapper generated
```

**After regeneration, verify:**
```bash
ls -la gradle/wrapper/
# Should now show:
# -rw-r--r-- gradle-wrapper.jar       (NEW - should be present!)
# -rw-r--r-- gradle-wrapper.properties
```

**4. Build APK with Gradle Wrapper**
```bash
./gradlew assembleDebug

# First run will be slow (downloading dependencies)
# Subsequent runs will be faster

# Output:
# > Task :app:assembleDebug
# ...
# BUILD SUCCESSFUL
# .../app/build/outputs/apk/debug/app-debug.apk
```

**5. Verify APK**
```bash
ls -lh app/build/outputs/apk/debug/app-debug.apk
```

### Option B2: If System Gradle Not Installed

```bash
# Check if Java is available
java -version

# If Java 11+ is available, can use gradle from download:

# Download gradle distribution directly (if gradle wrapper not regenerable)
# https://gradle.org/releases/ → gradle-8.2.0

# Option: Install via Chocolatey (Windows)
choco install gradle --version=8.2.0

# Option: Install via Homebrew (Mac)
brew install gradle@8

# Then regenerate wrapper as in step 3
gradle wrapper --gradle-version 8.2.0
```

---

## Solution Option C: Build Directly with Downloaded Gradle
**Effort:** High | **Time:** 15-20 minutes | **Success Rate:** ~80%

### Why Use This
- Maximum control
- Works even without wrapper
- Useful for CI/CD pipelines

### Steps

**1. Download Gradle 8.2.0**
```bash
# Navigate to gradle cache directory
mkdir -p ~/.gradle/wrapper/dists/gradle-8.2.0-bin

# Download gradle distribution (select appropriate for OS):
# Windows: gradle-8.2.0-bin.zip
# Mac/Linux: gradle-8.2.0-bin.tar.gz

# Option A: Use curl
curl -L https://services.gradle.org/distributions/gradle-8.2.0-bin.zip -o gradle-8.2.0-bin.zip

# Option B: Use PowerShell (Windows)
Invoke-WebRequest -Uri "https://services.gradle.org/distributions/gradle-8.2.0-bin.zip" -OutFile "gradle-8.2.0-bin.zip"

# Option C: Manual download from https://gradle.org/releases/
# Then move file to ~/.gradle/wrapper/dists/gradle-8.2.0-bin/
```

**2. Extract Gradle**
```bash
# Windows
Expand-Archive gradle-8.2.0-bin.zip -DestinationPath ~/.gradle/wrapper/dists/

# Mac/Linux
tar -xzf gradle-8.2.0-bin.tar.gz -C ~/.gradle/wrapper/dists/

# Verify extraction
ls -la ~/.gradle/wrapper/dists/gradle-8.2.0/bin/
# Should show: gradle, gradle.bat, etc.
```

**3. Build Android Project**
```bash
# Navigate to Android project
cd apps/android/spectrocap-android

# Build using gradle binary directly
~/.gradle/wrapper/dists/gradle-8.2.0/bin/gradle assembleDebug

# OR on Windows:
& "$env:USERPROFILE\.gradle\wrapper\dists\gradle-8.2.0\bin\gradle.bat" assembleDebug
```

**4. Verify APK**
```bash
ls -lh app/build/outputs/apk/debug/app-debug.apk
```

---

## Verification Checklist

After using any approach above, verify success:

### ✓ JAR File Present
```bash
# After step above, gradle-wrapper.jar MUST exist:
ls -la apps/android/spectrocap-android/gradle/wrapper/gradle-wrapper.jar

# Expected:
# -rw-r--r-- gradle-wrapper.jar (size: 60-70 KB)
```

### ✓ Gradle Wrapper Works
```bash
# Test gradle wrapper directly
cd apps/android/spectrocap-android
./gradlew --version

# Expected output:
# Gradle 8.2.0 ...
```

### ✓ APK Built
```bash
# Verify APK exists and size > 1 MB
ls -lh app/build/outputs/apk/debug/app-debug.apk

# Expected:
# -rw-r--r-- ... 1.2M app-debug.apk (size may vary)

# Verify it's a valid ZIP (APK is ZIP format)
file app/build/outputs/apk/debug/app-debug.apk
# Expected: Zip archive data, at least v2.0 to extract
```

### ✓ Install APK
```bash
# Connect Android device/emulator, then:
adb install -r app/build/outputs/apk/debug/app-debug.apk

# Expected output:
# Success
```

---

## Troubleshooting

### Issue: Download Timeout
**Problem:** Gradle download times out (network slow or blocked)  
**Solution:**
1. Check network: `ping 8.8.8.8`
2. Try alternate gradle mirror:
   ```bash
   # Gradle has CDN, usually works globally
   # If services.gradle.org blocked, use:
   # https://gradle-mirror.example.com (alternative mirrors exist)
   ```
3. Increase timeout in gradle-wrapper.properties:
   ```properties
   org.gradle.jvmargs=-Xmx1024m -Dorg.gradle.internal.http.socketTimeout=120000
   ```

### Issue: Insufficient Disk Space
**Problem:** Gradle download + extraction + build requires ~2-3 GB  
**Solution:**
1. Check available space: `df -h` (Mac/Linux) or `Get-Volume` (Windows)
2. Free up space or use external drive
3. Gradle cache location can be customized:
   ```bash
   export GRADLE_USER_HOME=/path/to/larger/disk/.gradle
   ```

### Issue: Java Version Mismatch
**Problem:** Gradle 8.2.0 requires Java 11+, system has Java 8  
**Solution:**
1. Check Java version: `java -version`
2. Install Java 11+:
   ```bash
   # Windows Chocolatey
   choco install openjdk11
   
   # Mac Homebrew
   brew install openjdk@11
   
   # Linux
   sudo apt-get install openjdk-11-jdk
   ```
3. Set JAVA_HOME:
   ```bash
   export JAVA_HOME=/path/to/java11
   # Then retry gradle build
   ```

### Issue: Corrupted gradle-wrapper.jar After Download
**Problem:** JAR file exists but `./gradlew` still fails  
**Solution:**
1. Delete cached gradle:
   ```bash
   rm -rf ~/.gradle/wrapper/dists/gradle-8.2.0-*
   rm -rf apps/android/spectrocap-android/gradle/wrapper/gradle-wrapper.jar
   ```
2. Regenerate wrapper:
   ```bash
   cd apps/android/spectrocap-android
   gradle wrapper --gradle-version 8.2.0
   ```
3. Retry build: `./gradlew assembleDebug`

### Issue: Permission Denied on gradlew
**Problem:** `./gradlew: Permission denied` on Mac/Linux  
**Solution:**
```bash
chmod +x apps/android/spectrocap-android/gradlew
./gradlew assembleDebug
```

---

## Success Confirmation

After successful build:

```bash
# 1. APK file exists
ls -lh apps/android/spectrocap-android/app/build/outputs/apk/debug/app-debug.apk
# → Output: -rw-r--r-- ... 1.2M app-debug.apk

# 2. APK is valid ZIP
unzip -t app/build/outputs/apk/debug/app-debug.apk | head -20
# → Output: testing: AndroidManifest.xml ... OK (or similar)

# 3. Can install on device
adb install -r app/build/outputs/apk/debug/app-debug.apk
# → Output: Success

# 4. App can launch on device
adb shell am start -n com.spectrocap.android/.MainActivity
# → App starts (may take 5-10 seconds first launch)
```

---

## Automated Resolution Script (Windows PowerShell)

For rapid resolution, save this script as `resolve-gradle.ps1`:

```powershell
# resolve-gradle.ps1 - Automated gradle wrapper jar resolution

param(
    [ValidateSet("Android Studio", "Wrapper", "Direct")]
    [string]$Method = "Wrapper"
)

Write-Host "Phase 2B: Resolving Gradle Wrapper JAR" -ForegroundColor Cyan
Write-Host "Method: $Method" -ForegroundColor Cyan

$androidPath = "apps/android/spectrocap-android"
$jarPath = "$androidPath/gradle/wrapper/gradle-wrapper.jar"

if (Test-Path $jarPath) {
    Write-Host "✓ gradle-wrapper.jar already exists!" -ForegroundColor Green
    Exit 0
}

switch ($Method) {
    "Android Studio" {
        Write-Host "Opening project in Android Studio..." -ForegroundColor Yellow
        & "studio" $androidPath
        Write-Host "Wait for Gradle sync to complete, then Build → Build APK(s)" -ForegroundColor Yellow
    }
    
    "Wrapper" {
        Write-Host "Regenerating gradle wrapper..." -ForegroundColor Yellow
        Push-Location $androidPath
        & gradle wrapper --gradle-version 8.2.0
        Pop-Location
        
        if (Test-Path $jarPath) {
            Write-Host "✓ gradle-wrapper.jar created successfully!" -ForegroundColor Green
            Write-Host "Building APK with gradlew..." -ForegroundColor Yellow
            Push-Location $androidPath
            & .\gradlew assembleDebug
            Pop-Location
        } else {
            Write-Host "✗ Failed to create gradle-wrapper.jar" -ForegroundColor Red
            Exit 1
        }
    }
    
    "Direct" {
        Write-Host "Downloading Gradle 8.2.0..." -ForegroundColor Yellow
        $url = "https://services.gradle.org/distributions/gradle-8.2.0-bin.zip"
        $zipFile = "gradle-8.2.0-bin.zip"
        
        Invoke-WebRequest -Uri $url -OutFile $zipFile
        
        Write-Host "Extracting Gradle..." -ForegroundColor Yellow
        Expand-Archive $zipFile -DestinationPath "$env:USERPROFILE\.gradle\wrapper\dists\"
        Remove-Item $zipFile
        
        Write-Host "Building APK with gradle..." -ForegroundColor Yellow
        Push-Location $androidPath
        & "$env:USERPROFILE\.gradle\wrapper\dists\gradle-8.2.0\bin\gradle.bat" assembleDebug
        Pop-Location
    }
}

# Verify result
if (Test-Path "$androidPath/app/build/outputs/apk/debug/app-debug.apk") {
    Write-Host "✓ APK build SUCCESSFUL!" -ForegroundColor Green
    Write-Host "APK: $androidPath/app/build/outputs/apk/debug/app-debug.apk" -ForegroundColor Green
} else {
    Write-Host "✗ APK build FAILED" -ForegroundColor Red
    Exit 1
}
```

**Usage:**
```bash
# Run script with default (Wrapper) method
.\resolve-gradle.ps1

# Or specify method:
.\resolve-gradle.ps1 -Method "Android Studio"
.\resolve-gradle.ps1 -Method "Direct"
```

---

## Recommendation Summary

| Scenario | Method | Time | Effort |
|----------|--------|------|--------|
| First time, have IDE | Android Studio | 5-10 min | Low |
| CI/CD environment | Wrapper regeneration | 10-15 min | Medium |
| Network issues | Direct gradle download | 15-20 min | High |
| Mac/Linux/WSL | Wrapper regeneration | 10-15 min | Medium |
| Windows PowerShell | Direct or Wrapper | 10-15 min | Medium |

**Best Practice:** Use Android Studio if available → provides IDE benefits + automatic build tooling

---

## Next Steps After APK Build

1. **Verify APK:** `adb install -r app/build/outputs/apk/debug/app-debug.apk`
2. **Test App:** Launch SpectroCAP Android app, verify device registration
3. **Run E2E Tests:** Follow [PHASE_2B_E2E_TEST_GUIDE.md](PHASE_2B_E2E_TEST_GUIDE.md)
4. **Complete Validation:** Execute PNG/JPEG transfer tests with Windows client

