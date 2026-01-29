# SpectroCAP™ Android — Endpoint URL Configuration Guide

**Date:** January 29, 2026  
**Status:** Ready for HTTPS Update  
**Protocol Migration:** HTTP → HTTPS  

---

## 📍 WHERE ENDPOINTS ARE STORED

### 1. **MainActivity.kt** (Primary Configuration)
**Location:** `app/src/main/java/com/scingular/spectrocap/MainActivity.kt`  
**Line:** 65-69

```kotlin
private fun getReceiverConfig(): String {
    val host = prefs().getString("receiver_host", "192.168.0.37") ?: "192.168.0.37"
    val port = prefs().getString("receiver_port", "8765") ?: "8765"
    val path = prefs().getString("endpoint_path", "/clip") ?: "/clip"
    val useHttps = prefs().getBoolean("use_https", false)
    val protocol = if (useHttps) "https" else "http"
    return "$protocol://$host:$port$path"
}
```

**Current Defaults:**
- Host: `192.168.0.37`
- Port: `8765`
- Path: `/clip`
- Protocol: `http` (but has `use_https` preference!)

**User can override via SharedPreferences:**
- `receiver_host` (default: "192.168.0.37")
- `receiver_port` (default: "8765")
- `endpoint_path` (default: "/clip")
- `use_https` (default: false)

---

### 2. **Sender.kt** (Image/Media Upload Default)
**Location:** `app/src/main/java/com/scingular/spectrocap/spectrocap/Sender.kt`  
**Line:** 14

```kotlin
fun defaultEndpoint(): String = "http://192.168.0.100:8088/ingest"
```

**Current Default:**
- Full endpoint: `http://192.168.0.100:8088/ingest`
- Note: Different IP (192.168.0.100) and port (8088)

---

### 3. **ClipboardSync.kt** (Clipboard Push)
**Location:** `app/src/main/java/com/scingular/spectrocap/spectrocap/ClipboardSync.kt`  
**Line:** 13

```kotlin
fun push(endpointBase: String, text: String, from: String = "android"): Pair<Boolean, String> {
    try {
      val base = endpointBase.trim().trimEnd('/')
      val url = URL("$base/clip/push")  // ← Appends /clip/push
```

**Usage:**
- Uses `endpointBase` passed from caller (MainActivity)
- Appends `/clip/push` to base URL

---

## 🔄 UPDATE STRATEGY

### Option 1: Update Default (Simplest)
**Change default port and protocol in MainActivity.kt:**

```kotlin
// BEFORE:
val port = prefs().getString("receiver_port", "8765") ?: "8765"
val useHttps = prefs().getBoolean("use_https", false)
val protocol = if (useHttps) "https" else "http"

// AFTER:
val port = prefs().getString("receiver_port", "9443") ?: "9443"  // ← Changed default
val useHttps = prefs().getBoolean("use_https", true)             // ← Now true by default
val protocol = if (useHttps) "https" else "http"
```

**Impact:**
- ✅ Users who don't customize settings get HTTPS automatically
- ✅ Users with custom settings can still override
- ✅ No API changes needed

---

### Option 2: Force HTTPS (Most Secure)
**Remove HTTP option, always use HTTPS:**

```kotlin
// BEFORE:
val useHttps = prefs().getBoolean("use_https", false)
val protocol = if (useHttps) "https" else "http"

// AFTER:
val protocol = "https"  // Always HTTPS
```

**Impact:**
- ✅ Guaranteed encryption
- ⚠️ Can't fall back to HTTP if needed
- ✅ Simpler code

---

### Option 3: Separate Endpoints (Most Flexible)
**Keep HTTP/HTTPS separate:**

```kotlin
// BEFORE:
val useHttps = prefs().getBoolean("use_https", false)
val protocol = if (useHttps) "https" else "http"

// AFTER:
val protocol = prefs().getString("protocol", "https") ?: "https"
```

**Impact:**
- ✅ User can choose HTTP or HTTPS explicitly
- ✅ Flexible for different networks
- ⚠️ More UI complexity

---

## 📋 REQUIRED CHANGES BY FILE

### 1. MainActivity.kt
**Lines to update:** 65-69

**Before:**
```kotlin
private fun getReceiverConfig(): String {
    val host = prefs().getString("receiver_host", "192.168.0.37") ?: "192.168.0.37"
    val port = prefs().getString("receiver_port", "8765") ?: "8765"
    val path = prefs().getString("endpoint_path", "/clip") ?: "/clip"
    val useHttps = prefs().getBoolean("use_https", false)
    val protocol = if (useHttps) "https" else "http"
    return "$protocol://$host:$port$path"
}
```

**After:**
```kotlin
private fun getReceiverConfig(): String {
    val host = prefs().getString("receiver_host", "192.168.0.37") ?: "192.168.0.37"
    val port = prefs().getString("receiver_port", "9443") ?: "9443"  // 8765 → 9443
    val path = prefs().getString("endpoint_path", "/clip") ?: "/clip"
    val useHttps = prefs().getBoolean("use_https", true)  // false → true
    val protocol = if (useHttps) "https" else "http"
    return "$protocol://$host:$port$path"
}
```

---

### 2. Sender.kt (Optional)
**Line to update:** 14

**Before:**
```kotlin
fun defaultEndpoint(): String = "http://192.168.0.100:8088/ingest"
```

**After (Option A - Update defaults):**
```kotlin
fun defaultEndpoint(): String = "https://192.168.0.37:9443/ingest"
```

**Or (Option B - Keep as-is):**
```kotlin
fun defaultEndpoint(): String = "http://192.168.0.100:8088/ingest"  // Unchanged
```

**Recommendation:** Update to match HTTPS setup (Option A)

---

### 3. ClipboardSync.kt
**No changes needed** — It uses passed `endpointBase`, which comes from MainActivity

---

## 🔒 CERTIFICATE HANDLING

### Current Code (Uses HttpURLConnection)
The app currently uses Java's `HttpURLConnection` class:
```kotlin
val url = URL(endpoint)
val con = (url.openConnection() as HttpURLConnection)
```

**Good news:** HttpURLConnection supports HTTPS natively!
- ✅ No changes needed for basic HTTPS
- ✅ Will work with any valid certificate

### For Self-Signed Certificate

If app gets "certificate not trusted" error, add this to handle self-signed certs:

```kotlin
// In a new NetworkConfig.kt file:
import javax.net.ssl.*
import java.security.cert.X509Certificate

object NetworkConfig {
    fun trustAllCerts() {
        val trustAllCerts = arrayOf<TrustManager>(
            object : X509TrustManager {
                override fun getAcceptedIssuers(): Array<X509Certificate>? = null
                override fun checkClientTrusted(certs: Array<X509Certificate>, authType: String) {}
                override fun checkServerTrusted(certs: Array<X509Certificate>, authType: String) {}
            }
        )
        
        val sc = SSLContext.getInstance("SSL")
        sc.init(null, trustAllCerts, java.security.SecureRandom())
        HttpsURLConnection.setDefaultSSLSocketFactory(sc.socketFactory)
        
        HttpsURLConnection.setDefaultHostnameVerifier { _, _ -> true }
    }
}
```

**Then call in MainActivity.onCreate():**
```kotlin
override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    NetworkConfig.trustAllCerts()  // Trust self-signed certs
    // ... rest of onCreate
}
```

---

## 📱 USER SETTINGS

### Current Settings Flow
Users can configure endpoints via SharedPreferences:
- `receiver_host` — IP address
- `receiver_port` — Port number
- `endpoint_path` — URL path
- `use_https` — Boolean (HTTP vs HTTPS)

### Settings UI Location
Likely in `SettingsActivity.kt` with preference definitions in XML:
- Check: `app/src/main/res/xml/root_preferences.xml`

---

## 🧪 TESTING CHANGES

### Test 1: Verify Endpoint Construction
```kotlin
// After updating MainActivity defaults:
val config = getReceiverConfig()
// Expected: https://192.168.0.37:9443/clip
Assert.assertEquals("https://192.168.0.37:9443/clip", config)
```

### Test 2: Send Test Message
```
1. Open SpectroCAP app
2. Note current endpoint in status or log
3. Send clipboard message: "TEST_HTTPS_WORKS"
4. Verify Windows receiver accepts it
```

### Test 3: Override via Settings
```
1. Open Settings → Receiver Configuration
2. Change port to 8765, protocol to HTTP
3. Send message
4. Verify it still works (for backward compatibility)
```

---

## 📊 CONFIGURATION MATRIX

| Scenario | Host | Port | Protocol | use_https |
|----------|------|------|----------|-----------|
| **Default (NEW)** | 192.168.0.37 | 9443 | HTTPS | true |
| **User Override HTTP** | Custom | Custom | HTTP | false |
| **User Override HTTPS** | Custom | Custom | HTTPS | true |
| **Legacy (OLD)** | 192.168.0.37 | 8765 | HTTP | false |

---

## 🎯 IMPLEMENTATION STEPS

### Step 1: Update MainActivity.kt Defaults
- Port: `8765` → `9443`
- useHttps: `false` → `true`

### Step 2: Update Sender.kt Default (Optional)
- Endpoint: `http://192.168.0.100:8088/ingest` → `https://192.168.0.37:9443/ingest`

### Step 3: Test
- Build app
- Test with HTTPS receiver on Windows
- Verify certificate handling (if self-signed)

### Step 4: Deploy
- Commit changes
- Build APK
- Install on device
- Test end-to-end with Windows receiver

---

## ✅ VERIFICATION CHECKLIST

- [ ] MainActivity.kt updated with HTTPS defaults
- [ ] Sender.kt updated (if applicable)
- [ ] App builds without errors
- [ ] HTTPS receiver running on Windows (port 9443)
- [ ] Certificate imported on Android
- [ ] App sends clipboard message successfully
- [ ] Windows receives message without errors
- [ ] No certificate warnings in logcat

---

## 📖 REFERENCE

**Files to modify:**
1. `app/src/main/java/com/scingular/spectrocap/MainActivity.kt` (CRITICAL)
2. `app/src/main/java/com/scingular/spectrocap/spectrocap/Sender.kt` (OPTIONAL)

**No changes needed:**
- ClipboardSync.kt
- Any other files

**Dependencies:**
- `HttpURLConnection` — Already supports HTTPS
- No new imports needed (unless handling self-signed certs)

---

**Powered by SCINGULAR™**  
© 2026 Inspection Systems Direct Inc.  
**Created:** January 29, 2026
