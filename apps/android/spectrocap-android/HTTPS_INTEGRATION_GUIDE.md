# SpectroCAP™ Android — HTTPS Integration Checklist

**Status:** Ready for integration  
**Date:** January 29, 2026  
**Required Changes:** Android app URL + Network Security Config (optional)  

---

## 🔧 CHANGES NEEDED IN ANDROID APP

### 1. Update Endpoint URL (CRITICAL)

**File:** `app/src/main/java/com/scingular/spectrocap/MainActivity.kt` (or wherever endpoint is configured)

**Before:**
```kotlin
val RECEIVER_URL = "http://192.168.0.37:8765/clip/push"
```

**After:**
```kotlin
val RECEIVER_URL = "https://192.168.0.37:9443/clip/push"
```

**Also Update Settings/Preferences:**
If there's a settings activity for entering the receiver URL:
- Default value: `https://192.168.0.37:9443/clip`
- Validation: Must start with `https://`

### 2. Update Retrofit/OkHttp Client (Recommended)

**File:** `app/src/main/java/com/scingular/spectrocap/network/NetworkClient.kt` (or similar)

**Before:**
```kotlin
val client = OkHttpClient.Builder()
    .build()
```

**After:**
```kotlin
val client = OkHttpClient.Builder()
    // For self-signed cert (only on LAN):
    .hostnameVerifier { hostname, session -> true }
    .sslSocketFactory(
        SSLContext.getInstance("TLS").apply {
            init(null, arrayOf(TrustAllCerts()), SecureRandom())
        }.socketFactory,
        TrustAllCerts()
    )
    .build()

// TrustAllCerts helper class
class TrustAllCerts : X509TrustManager {
    override fun getAcceptedIssuers(): Array<X509Certificate> = arrayOf()
    override fun checkClientTrusted(certs: Array<X509Certificate>, authType: String) {}
    override fun checkServerTrusted(certs: Array<X509Certificate>, authType: String) {}
}
```

**OR (Better for Production):**

Use the imported certificate instead of trusting all:
```kotlin
val certInputStream = context.resources.openRawResource(R.raw.spectrocap_ca)
val cf = CertificateFactory.getInstance("X.509")
val ca = cf.generateCertificate(certInputStream) as X509Certificate
certInputStream.close()

val keyStore = KeyStore.getInstance(KeyStore.getDefaultType()).apply {
    load(null, null)
    setCertificateEntry("ca", ca)
}

val tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm()).apply {
    init(keyStore)
}

val sslContext = SSLContext.getInstance("TLS").apply {
    init(null, tmf.trustManagers, SecureRandom())
}

val client = OkHttpClient.Builder()
    .sslSocketFactory(sslContext.socketFactory, tmf.trustManagers[0] as X509TrustManager)
    .build()
```

### 3. Import Certificate to App (Optional but Recommended)

**File:** Add certificate resource

1. Get certificate from Windows:
   - File: `g:\GIT\isystemsdirect\ScingOS\tools\spectrocap-receiver\certs\server.crt`

2. Add to Android app resources:
   - Create: `app/src/main/res/raw/spectrocap_ca.cer`
   - Copy `server.crt` content into this file

3. Use in OkHttp (see section above)

### 4. Update Network Security Config (Optional)

**File:** `app/src/main/res/xml/network_security_config.xml`

**Before:**
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">192.168.0.37</domain>
    </domain-config>
</network-security-config>
```

**After (HTTPS Only):**
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">192.168.0.37</domain>
        <pin-set expiration="2031-12-31">
            <pin digest="SHA-256"><!-- openssl x509 -in server.crt -noout -pubkey | openssl pkey -pubin -outform DER | openssl dgst -sha256 -binary | base64 --></pin>
        </pin-set>
    </domain-config>
</network-security-config>
```

**Or (Trust Imported Certificate):**
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">192.168.0.37</domain>
        <trust-anchors>
            <certificates src="@raw/spectrocap_ca"/>
        </trust-anchors>
    </domain-config>
</network-security-config>
```

### 5. Add AndroidManifest Permission

**File:** `app/src/main/AndroidManifest.xml`

Ensure already present:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

---

## 🔄 STEP-BY-STEP INTEGRATION

### Step 1: Update Endpoint URL (5 minutes)
```kotlin
// In MainActivity or settings
val RECEIVER_URL = "https://192.168.0.37:9443/clip/push"
```

### Step 2: Update HTTP Client (10 minutes)
```kotlin
// In NetworkClient or OkHttp setup
val client = OkHttpClient.Builder()
    .hostnameVerifier { _, _ -> true }  // Trust self-signed
    .build()
```

### Step 3: Test (5 minutes)
```
1. Android: Update app settings to https://192.168.0.37:9443/clip
2. Android: Send "TEST_ANDROID_HTTPS"
3. Windows: Run clipboard puller
4. Verify clipboard updated
```

### Step 4: Add Certificate Import (Optional, 10 minutes)
```
1. Add server.crt to app/src/main/res/raw/spectrocap_ca.cer
2. Update Network Security Config to reference it
3. Update OkHttp client to use certificate
```

### Step 5: Test Production Setup (5 minutes)
```
1. Rebuild app
2. Reinstall on device
3. Test HTTPS endpoint with certificate validation
```

---

## ✅ VERIFICATION CHECKLIST

### Android Side
- [ ] App points to `https://192.168.0.37:9443/clip`
- [ ] Network requests use HTTPS (no cleartext)
- [ ] Certificate validation works (no certificate warnings)
- [ ] Clipboard send succeeds

### Windows Side
- [ ] Receiver running on HTTPS
- [ ] Certificate in `certs/server.crt`
- [ ] Puller receives clipboard updates
- [ ] Windows clipboard updates on send

### End-to-End
- [ ] Android sends "TEST_MSG" → Windows clipboard has "TEST_MSG"
- [ ] No connection errors
- [ ] No certificate warnings

---

## 🚨 COMMON MISTAKES

| Mistake | Fix |
|---------|-----|
| Forgetting to update port 8765 → 9443 | Double-check all endpoint URLs |
| Not handling certificate exception | Add `hostnameVerifier` or import cert |
| Cleartext still enabled in config | Set `cleartextTrafficPermitted="false"` |
| Wrong IP address | Run `ipconfig` on Windows to confirm |
| Using `http://` instead of `https://` | All URLs must start with `https://` |

---

## 🔗 REFERENCE

**Windows Receiver:** `g:\GIT\isystemsdirect\ScingOS\tools\spectrocap-receiver\server.js`  
**Certificate Location:** `g:\GIT\isystemsdirect\ScingOS\tools\spectrocap-receiver\certs/server.crt`  
**Setup Guide:** `g:\GIT\isystemsdirect\ScingOS\tools\spectrocap-receiver\HTTPS_SETUP_GUIDE.md`  
**Quick Start:** `g:\GIT\isystemsdirect\ScingOS\tools\spectrocap-receiver\HTTPS_QUICK_START.md`  

---

## 📝 MINIMAL VIABLE UPDATE

**If you just want HTTPS working quickly:**

1. Change one line in MainActivity:
```kotlin
val RECEIVER_URL = "https://192.168.0.37:9443/clip/push"
```

2. Update OkHttp client to trust self-signed:
```kotlin
.hostnameVerifier { _, _ -> true }
.sslSocketFactory(...)  // See section 2 above
```

3. Build, install, test ✅

**That's it.** App will use HTTPS.

---

**Powered by SCINGULAR™**  
© 2026 Inspection Systems Direct Inc.  
**Created:** January 29, 2026
