# SpectroCAP™ HTTPS — Quick Start Checklist

## 🚀 5-Minute Setup

### Windows Side
- [ ] **1. Install OpenSSL** (if not already)
  ```powershell
  choco install openssl
  # OR via winget, or use Git Bash (comes with OpenSSL)
  ```

- [ ] **2. Start HTTPS Receiver**
  ```powershell
  cd "g:\GIT\isystemsdirect\ScingOS\tools\spectrocap-receiver"
  npm start
  ```
  - Watch for: `✅ HTTPS ready. Import certificate on Android devices.`

- [ ] **3. Get Your Windows IP**
  ```powershell
  ipconfig | findstr IPv4
  # Note the IP (e.g., 192.168.0.37)
  ```

- [ ] **4. Find Certificate File**
  - Location: `g:\GIT\isystemsdirect\ScingOS\tools\spectrocap-receiver\certs\server.crt`
  - Transfer to Android phone (USB, email, cloud storage)

### Android Side
- [ ] **5. Trust Certificate**
  - Settings → Security → Encryption & Credentials
  - Install a certificate → CA certificate
  - Select `server.crt` from Downloads

- [ ] **6. Update App URL**
  - Open SpectroCAP app settings
  - Change endpoint from `http://192.168.0.37:8765/clip`
  - To: `https://192.168.0.37:9443/clip`

- [ ] **7. Test**
  - Send: `TEST_HTTPS_WORKS`
  - Check Windows Puller output
  - Paste (Ctrl+V) on Windows → Should see message

### Windows Puller (Optional)
- [ ] **8. Run Windows Puller**
  ```powershell
  .\windows-clipboard-puller.ps1
  ```
  - Should show: `✓ CLIPBOARD UPDATED`

---

## ✅ Verification Tests

### Quick Verification
```powershell
# Test HTTPS health endpoint
$resp = Invoke-RestMethod "https://localhost:9443/health" -SkipCertificateCheck
$resp.ok  # Should be: True
```

### Android Browser Test
- On phone browser: `https://192.168.0.37:9443/health`
- Should load without certificate warning (after importing cert)

### Full End-to-End
1. Android: Send "ANDROID_TEST"
2. Windows Puller: Should log clipboard update
3. Windows: Paste (Ctrl+V) → "ANDROID_TEST"

---

## 🔍 Troubleshooting

| Problem | Solution |
|---------|----------|
| OpenSSL not found | `choco install openssl` then restart terminal |
| Certificate warning on Android | Import via Settings → Security |
| Port 9443 in use | `netstat -ano \| findstr :9443` then kill process |
| Connection refused | Check receiver is running, check firewall |
| App can't connect | Verify IP address, check firewall allows 9443 |

---

## 📄 Files Modified

| File | Change |
|------|--------|
| `server.js` | Updated to HTTPS (port 9443, auto-cert generation) |
| `windows-clipboard-puller.ps1` | Updated to HTTPS endpoint |
| `certs/server.crt` | NEW - Self-signed certificate (import on Android) |
| `certs/server.key` | NEW - Private key (keep secure) |

---

## 🎯 What's Next?

- ✅ HTTPS working
- ⏳ Update Android Network Security Config (optional)
- ⏳ Add Authentication (JWT tokens)
- ⏳ Cloud integration (Google Drive, OneDrive)

**Current State:** Fully functional HTTPS with self-signed certificate. Same architecture as enterprise deployments.

---

**Need help?** Check `HTTPS_SETUP_GUIDE.md` for detailed instructions.

**Powered by SCINGULAR™**  
© 2026 Inspection Systems Direct Inc.
