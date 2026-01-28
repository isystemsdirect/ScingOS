# SCINGULAR SpectroCAP™ — Phase 2A: Full E2EE + Signatures + Device Trust

**Status:** Phase 2A Foundation (BANE-Ready)  
**Engine:** LARI-CAP  
**Security Governor:** BANE  
**Last Updated:** 2026-01-28

---

## Objective

Implement **full end-to-end encryption (E2EE)** with **digital signatures** and **device trust controls** across Android, Windows, and Firebase transport. No plaintext is ever stored in Cloud Storage or Firestore.

### Done When

- ✅ No plaintext ever stored in Cloud Storage or Firestore
- ✅ Every message is encrypted (XChaCha20-Poly1305)
- ✅ Every message is key-wrapped per recipient device (X25519 sealed boxes)
- ✅ Every message is signed by sender device (Ed25519)
- ✅ Receiver verifies signature + decrypts successfully
- ✅ Device trust enforced (revoked devices cannot receive/decrypt)

---

## A. Cryptographic Standard (LOCK)

### Algorithms

| Purpose | Algorithm | Details |
|---------|-----------|---------|
| **Payload Encryption** | XChaCha20-Poly1305 | AEAD; nonce = 24 bytes |
| **Key Wrapping** | X25519 Sealed Box | Per-recipient device ECDH+ChaCha20Poly1305 |
| **Signatures** | Ed25519 | Over canonical metaHash; fixed 64-byte signature |
| **Key Derivation** | SHA256 | For metaHash computation (canonical JSON) |

### Key Material

- **Ed25519 Keypair**: Signing key (32 bytes) + Public key (32 bytes)
- **X25519 Keypair**: Secret key (32 bytes) + Public key (32 bytes)
- **DEK (Data Encryption Key)**: Random 32 bytes per message
- **Nonce**: Random 24 bytes per message (if required by library)

### Identifiers

| ID | Type | Format | Where |
|----|------|--------|-------|
| `deviceId` | UUID | RFC 4122 | Device doc; Firestore |
| `messageId` | UUID | RFC 4122 | Message doc; Firestore |

### Associated Data (AAD)

AEAD uses **canonical metaHash** as Associated Authenticated Data:

```
metaHash = SHA256(canonicalMetaJson)
canonicalMetaJson = JSON with stable key order (see below)
```

**Canonical Meta Fields (ordered strictly):**

```json
{
  "alg": "xchacha20poly1305+sealedbox-x25519+ed25519",
  "createdAtClient": "2026-01-28T16:45:00Z",
  "messageId": "660e8400-e29b-41d4-a716-446655440111",
  "mime": "application/octet-stream",
  "recipients": ["device-a-uuid", "device-b-uuid"],
  "senderDeviceId": "550e8400-e29b-41d4-a716-446655440000",
  "sizeBytesPlain": 256,
  "storagePath": "users/user-123/messages/660e8400-e29b-41d4-a716-446655440111.bin",
  "type": "text",
  "version": "2A"
}
```

**Key ordering rule:** Alphabetical by field name (JSON-LD context).

---

## B. Firestore Schema Extensions

### Collection: `users/{uid}/devices/{deviceId}` — Add Crypto Fields

| Field | Type | Required | Description | Phase |
|-------|------|----------|-------------|-------|
| `pubSignKey` | string (base64) | ✓ Phase 2A | Ed25519 public key (32 bytes encoded) | 2A |
| `pubBoxKey` | string (base64) | ✓ Phase 2A | X25519 public key (32 bytes encoded) | 2A |
| `status` | string | ✓ (existing) | `"active"` \| `"revoked"` | All |
| `lastSeenAt` | timestamp | ✓ (existing) | Last active timestamp | All |

**Example (Phase 2A):**

```json
{
  "deviceId": "550e8400-e29b-41d4-a716-446655440000",
  "platform": "android",
  "name": "My Pixel 8",
  "createdAt": "2026-01-28T15:30:00Z",
  "lastSeenAt": "2026-01-28T16:45:00Z",
  "status": "active",
  "pubSignKey": "aBcDeFgHiJkLmNoPqRsTuVwXyZaBcDeFgHiJkLmN=",
  "pubBoxKey": "xYzAbCdEfGhIjKlMnOpQrStUvWxYzAbCdEfGhIjK="
}
```

### Collection: `users/{uid}/messages/{messageId}` — Update for Phase 2A

**Phase 2A Required Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `messageId` | string | ✓ | UUID; generated on sender client |
| `type` | string | ✓ | `"text"` (Phase 2A) |
| `createdAt` | timestamp | ✓ | Server timestamp (set on write) |
| `senderDeviceId` | string | ✓ | UUID of originating device |
| `recipients` | array | ✓ | Array of active recipient deviceIds (explicit; expanded from "all" at send time) |
| `storagePath` | string | ✓ | Cloud Storage path: `users/{uid}/messages/{messageId}.bin` |
| `mime` | string | ✓ | `"application/octet-stream"` (encrypted blob) |
| `sizeBytes` | number | ✓ | Encrypted blob size in bytes |
| `nonce` | string (base64) | ✓ | XChaCha20 nonce (24 bytes); stored explicitly for decryption |
| `envelopes` | map<string, string> | ✓ | `{ deviceId: base64(sealedBox(DEK)) }` per recipient |
| `metaHash` | string (base64) | ✓ | SHA256(canonicalMetaJson) |
| `signature` | string (base64) | ✓ | Ed25519(senderPrivSignKey, metaHash) |

**Phase 2A Optional Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `version` | string | `"2A"` (marker for schema version) |
| `alg` | object | Algorithm descriptors (informational) |

**Example (Phase 2A):**

```json
{
  "messageId": "660e8400-e29b-41d4-a716-446655440111",
  "type": "text",
  "createdAt": "2026-01-28T16:45:00Z",
  "senderDeviceId": "550e8400-e29b-41d4-a716-446655440000",
  "recipients": [
    "550e8400-e29b-41d4-a716-446655440000",
    "660e8400-e29b-41d4-a716-446655440222"
  ],
  "storagePath": "users/user-123/messages/660e8400-e29b-41d4-a716-446655440111.bin",
  "mime": "application/octet-stream",
  "sizeBytes": 512,
  "nonce": "abc123...==",
  "envelopes": {
    "550e8400-e29b-41d4-a716-446655440000": "base64(sealedBox_for_device_A)",
    "660e8400-e29b-41d4-a716-446655440222": "base64(sealedBox_for_device_B)"
  },
  "metaHash": "sha256(canonical)==",
  "signature": "ed25519_sig==",
  "version": "2A",
  "alg": {
    "aead": "xchacha20poly1305",
    "wrap": "sealedbox-x25519",
    "sig": "ed25519"
  }
}
```

### Cloud Storage Structure

**Phase 2A:** All messages are encrypted blobs.

| Phase | Path | Format | Content |
|-------|------|--------|---------|
| Phase 1 | `users/{uid}/messages/{messageId}.txt` | Plaintext UTF-8 | Text |
| Phase 2A | `users/{uid}/messages/{messageId}.bin` | Binary (encrypted) | Ciphertext |

**Binary Blob Format (Phase 2A):**

```
[Magic "SCAP2A" (6 bytes)]
[Nonce (24 bytes)]
[Ciphertext (variable)]
```

**Total size = 6 + 24 + len(ciphertext)** → stored in `sizeBytes`.

**Security Note:** Server never decrypts. Storage layer is untrusted.

---

## C. Device Key Generation & Registration

### Lifecycle

**Trigger:** First login on new device

### Step 1: Generate Keypairs

**Android (Kotlin):**

```kotlin
// In crypto/Sodium.kt
val signKeyPair = sodium.cryptoSignSeedKeypair(seed=null) // random seed
val boxKeyPair = sodium.cryptoBoxKeypair()

// Store private keys securely:
// signPrivKey -> EncryptedSharedPreferences or Android Keystore
// boxPrivKey -> EncryptedSharedPreferences or Android Keystore

// Public keys are safe to share:
val pubSignKey = signKeyPair.publicKey.asBase64()
val pubBoxKey = boxKeyPair.publicKey.asBase64()
```

**Windows (Rust + DPAPI):**

```rust
// In src/crypto/mod.rs
use sodiumoxide::crypto::sign;
use sodiumoxide::crypto::box_;

let (sign_pk, sign_sk) = sign::gen_keypair();
let (box_pk, box_sk) = box_::gen_keypair();

// Store private keys with Windows DPAPI:
let encrypted_sign_sk = windows_dpapi_encrypt(&sign_sk.as_ref())?;
let encrypted_box_sk = windows_dpapi_encrypt(&box_sk.as_ref())?;

// Store in local encrypted file or registry
// Public keys sent to Firebase
```

### Step 2: Upload Public Keys

**Target:** `/users/{uid}/devices/{deviceId}`

```firestore
{
  "deviceId": "<device-uuid>",
  "platform": "android" | "windows",
  "name": "<user-friendly-name>",
  "createdAt": serverTimestamp(),
  "lastSeenAt": serverTimestamp(),
  "status": "active",
  "pubSignKey": "<base64-ed25519-pk>",
  "pubBoxKey": "<base64-x25519-pk>"
}
```

### Step 3: Store Private Keys Locally

**Android:**

```kotlin
// EncryptedSharedPreferences (requires androidx.security)
val encryptedSharedPrefs = EncryptedSharedPreferences.create(...)
encryptedSharedPrefs.edit().apply {
    putString("sign_private_key", privSignKeyBase64)
    putString("box_private_key", privBoxKeyBase64)
    apply()
}
```

**Windows:**

```rust
// Use Windows DPAPI (Data Protection API)
use std::io::Write;
use winapi::um::dpapi::CryptProtectData;

fn store_private_key(key_bytes: &[u8]) -> Result<()> {
    let encrypted = windows_dpapi_encrypt(key_bytes)?;
    std::fs::write(
        "~/.scing/keys/box_private.bin.encrypted",
        &encrypted
    )?;
    Ok(())
}
```

### Device Revocation

**Mechanism:**

1. **Revoke**: Set `status: "revoked"` in device doc
2. **Send**: Exclude revoked devices from `recipients` array
3. **Receive**: Skip envelope decryption if recipient device is revoked

**Enforcement:**

```kotlin
// Android: On receive
val recipientDevice = getDeviceDoc(deviceId)
if (recipientDevice.status == "revoked") {
    return // Skip this message
}
```

---

## D. Sending Pipeline (Android)

**Input:** Clipboard text

**Output:** Encrypted `.bin` + Firestore message doc + Cloud Storage blob

### Step 1: Resolve Recipients

```kotlin
// Query active devices for this user
val activeDevices = db.collection("users")
    .document(uid)
    .collection("devices")
    .whereEqualTo("status", "active")
    .get()

val recipients = activeDevices.map { it.data["deviceId"] as String }
```

### Step 2: Create DEK

```kotlin
val dek = ByteArray(32)
SecureRandom().nextBytes(dek)
```

### Step 3: Build Canonical Meta Object

```kotlin
val canonicalMeta = mapOf(
    "alg" to "xchacha20poly1305+sealedbox-x25519+ed25519",
    "createdAtClient" to ISO8601.format(Instant.now()),
    "messageId" to messageId,
    "mime" to "application/octet-stream",
    "recipients" to recipients.sorted(), // stable order
    "senderDeviceId" to deviceId,
    "sizeBytesPlain" to plaintextBytes.size,
    "storagePath" to "users/$uid/messages/$messageId.bin",
    "type" to "text",
    "version" to "2A"
).toSortedMap() // Alphabetical key order

val canonicalJson = Json.encodeToString(canonicalMeta)
```

### Step 4: Compute metaHash

```kotlin
val metaHash = SHA256(canonicalJson.toByteArray(UTF_8))
```

### Step 5: Sign metaHash

```kotlin
val signature = sodium.cryptoSign(
    message = metaHash,
    secretKey = privSignKey
) // Returns signature (64 bytes)
```

### Step 6: Encrypt Payload

```kotlin
val plaintextBytes = text.toByteArray(UTF_8)
val nonce = ByteArray(24)
SecureRandom().nextBytes(nonce)

val ciphertext = sodium.cryptoAeadXChaCha20Poly1305IETFEncrypt(
    message = plaintextBytes,
    additionalData = metaHash, // AAD = metaHash
    nonce = nonce,
    key = dek
)
```

### Step 7: Build Blob

```kotlin
val blob = ByteArray(6 + 24 + ciphertext.size)
blob.setString(0, "SCAP2A") // magic
System.arraycopy(nonce, 0, blob, 6, 24)
System.arraycopy(ciphertext, 0, blob, 30, ciphertext.size)
```

### Step 8: Build Envelopes

```kotlin
val envelopes = mutableMapOf<String, String>()

for (recipientDeviceId in recipients) {
    val recipientDevice = db.collection("users")
        .document(uid)
        .collection("devices")
        .document(recipientDeviceId)
        .get()
    
    val pubBoxKey = Base64.decode(recipientDevice["pubBoxKey"])
    
    val sealedEnvelope = sodium.cryptoBoxSealedEncrypt(
        message = dek,
        publicKey = pubBoxKey
    )
    
    envelopes[recipientDeviceId] = Base64.encode(sealedEnvelope)
}
```

### Step 9: Upload Blob to Storage

```kotlin
val storageRef = storage.reference
    .child("users")
    .child(uid)
    .child("messages")
    .child("$messageId.bin")

storageRef.putBytes(blob).await()
```

### Step 10: Write Firestore Document

```kotlin
val messageDoc = mapOf(
    "messageId" to messageId,
    "type" to "text",
    "createdAt" to FieldValue.serverTimestamp(),
    "senderDeviceId" to deviceId,
    "recipients" to recipients,
    "storagePath" to "users/$uid/messages/$messageId.bin",
    "mime" to "application/octet-stream",
    "sizeBytes" to blob.size,
    "nonce" to Base64.encode(nonce),
    "envelopes" to envelopes,
    "metaHash" to Base64.encode(metaHash),
    "signature" to Base64.encode(signature),
    "version" to "2A",
    "alg" to mapOf(
        "aead" to "xchacha20poly1305",
        "wrap" to "sealedbox-x25519",
        "sig" to "ed25519"
    )
)

db.collection("users")
    .document(uid)
    .collection("messages")
    .document(messageId)
    .set(messageDoc)
    .await()
```

---

## E. Receiving Pipeline (Windows/Tauri)

**Input:** Firestore message snapshot

**Output:** Decrypted plaintext (stored locally or displayed)

### Step 1: Hard Checks

```rust
// Check schema version
if let Some(version) = msg.get("version") {
    if version != "2A" {
        return Err("Only Phase 2A supported".into());
    }
}

// Check storage path ends with .bin
let path: String = msg.get("storagePath")?;
if !path.ends_with(".bin") {
    return Err("Expected .bin, got plaintext".into());
}

// Check all required fields exist
require_fields(&msg, &["envelopes", "metaHash", "signature", "nonce"])?;
```

### Step 2: Verify Sender Device

```rust
let sender_device_id: String = msg.get("senderDeviceId")?;
let sender_device = db
    .collection("users")
    .document(uid)
    .collection("devices")
    .document(&sender_device_id)
    .get()
    .await?;

if sender_device.get("status").unwrap_or("revoked") != "active" {
    return Err("Sender device is revoked".into());
}

let sender_pub_sign_key_b64: String = sender_device.get("pubSignKey")?;
let sender_pub_sign_key = decode_base64(&sender_pub_sign_key_b64)?;
```

### Step 3: Verify metaHash Integrity

```rust
// Reconstruct canonical meta JSON (same order as sender)
let canonical_meta = reconstruct_canonical_meta(&msg)?;
let canonical_json = serde_json::to_string(&canonical_meta)?;

// Recompute metaHash
let meta_hash_candidate = Sha256::digest(canonical_json.as_bytes());

// Compare with Firestore metaHash
let meta_hash_firestore = decode_base64(msg.get("metaHash")?)?;
if meta_hash_candidate.to_vec() != meta_hash_firestore {
    return Err("metaHash mismatch; metadata tampered".into());
}
```

### Step 4: Verify Signature

```rust
use sodiumoxide::crypto::sign;

let signature_b64: String = msg.get("signature")?;
let signature_bytes = decode_base64(&signature_b64)?;

let sig = sign::Signature::from_slice(&signature_bytes)
    .ok_or("Invalid signature")?;

let pk = sign::PublicKey::from_slice(&sender_pub_sign_key)
    .ok_or("Invalid public key")?;

match sign::verify(&sig, &meta_hash_firestore, &pk) {
    Ok(_) => { /* Signature valid */ },
    Err(_) => return Err("Signature verification failed".into()),
}
```

### Step 5: Obtain Envelope for This Device

```rust
let envelopes: Map<String, String> = msg.get("envelopes")?;
let this_device_id: String = get_device_id()?;

let envelope_b64 = match envelopes.get(&this_device_id) {
    Some(env) => env,
    None => return Err("No envelope for this device; not a recipient".into()),
};

let envelope = decode_base64(envelope_b64)?;
```

### Step 6: Decrypt DEK

```rust
use sodiumoxide::crypto::box_;

let box_sk_encrypted = load_private_key("box_secret.bin.encrypted")?;
let box_sk_bytes = windows_dpapi_decrypt(&box_sk_encrypted)?;
let box_sk = box_::SecretKey::from_slice(&box_sk_bytes)
    .ok_or("Invalid box secret key")?;

let dek = box_::open_sealed(&envelope, &box_sk)
    .map_err(|_| "DEK unsealing failed")?;
```

### Step 7: Download Blob from Storage

```rust
let storage_path: String = msg.get("storagePath")?;
let blob = storage
    .reference()
    .child(&storage_path)
    .get_bytes(100 * 1024 * 1024) // 100 MB max
    .await?;

// Parse header
let magic = &blob[0..6];
if magic != b"SCAP2A" {
    return Err("Invalid blob magic".into());
}

let nonce = &blob[6..30];
let ciphertext = &blob[30..];
```

### Step 8: Decrypt Payload

```rust
use sodiumoxide::crypto::aead::xchacha20poly1305_ietf as aead;

let nonce_array: [u8; 24] = nonce.try_into()?;
let nonce_obj = aead::Nonce::from_slice(&nonce_array)
    .ok_or("Invalid nonce")?;

let dek_array: [u8; 32] = dek.try_into()?;
let dek_key = aead::Key::from_slice(&dek_array)
    .ok_or("Invalid DEK")?;

let plaintext_bytes = aead::open(
    &ciphertext,
    Some(&meta_hash_firestore), // AAD = metaHash
    &nonce_obj,
    &dek_key,
).map_err(|_| "AEAD decryption failed")?;

let plaintext = String::from_utf8(plaintext_bytes)?;
```

### Step 9: Store Locally

```rust
// Store in local history (plaintext in Phase 2A; Phase 2B encrypt at rest)
let history_entry = HistoryEntry {
    messageId,
    senderDeviceId,
    timestamp: Instant::now(),
    content: plaintext.clone(),
};

HISTORY_STORE.insert(messageId, history_entry);
```

### Step 10: Display/Copy

```rust
// Copy to clipboard (same as Phase 1)
copy_to_clipboard(&plaintext)?;
notify_user("Message decrypted and copied to clipboard");
```

---

## F. Device Trust Controls (BANE-Ready)

### Device Manager UI (Minimal Phase 2A)

**Location:** Windows or Android (start with Windows for Tauri convenience)

**Features:**

1. **List Devices**
   - Device name
   - Platform (Android / Windows)
   - Status (Active / Revoked)
   - Last Seen At
   - Public key fingerprint (SHA256 of pubSignKey, truncated)

2. **Actions**
   - **Revoke**: Set status to "revoked" (send_request)
   - **View Details**: Show full public key (for manual verification)

3. **Revocation Behavior**
   - Revoked device stops receiving **new** messages immediately
   - Revoked device **cannot decrypt** if already received (no envelope + nonce)
   - Optional future: Sender explicitly excludes revoked devices from recipients

### Implementation (TypeScript/Tauri)

```typescript
// Windows: apps/windows/spectrocap-win/src/deviceManager.ts

import { invoke } from "@tauri-apps/api/core";
import { db } from "./firebase";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

interface Device {
  deviceId: string;
  name: string;
  platform: "android" | "windows";
  status: "active" | "revoked";
  lastSeenAt: Date;
  pubSignKeyFingerprint: string;
}

export async function listDevices(uid: string): Promise<Device[]> {
  const devicesRef = collection(db, `users/${uid}/devices`);
  const q = query(devicesRef);
  const snap = await getDocs(q);
  
  return snap.docs.map(d => {
    const pubSignKey = d.data().pubSignKey;
    const fingerprint = sha256(pubSignKey).substring(0, 16);
    
    return {
      deviceId: d.id,
      name: d.data().name,
      platform: d.data().platform,
      status: d.data().status,
      lastSeenAt: d.data().lastSeenAt.toDate(),
      pubSignKeyFingerprint: fingerprint,
    };
  });
}

export async function revokeDevice(uid: string, deviceId: string): Promise<void> {
  const deviceRef = doc(db, `users/${uid}/devices/${deviceId}`);
  await updateDoc(deviceRef, { status: "revoked" });
}
```

---

## G. Migration & Compatibility

### Phase 2A Behavior

**Sender (Android):**
- Writes only `.bin` (encrypted) + version 2A Firestore docs
- No plaintext storage

**Receiver (Windows):**
- **Required:** Decrypt Phase 2A messages (v2A with envelopes/signature)
- **Optional (with toggle):** Support legacy Phase 1 `.txt` (plain text)
  - Toggle: "Allow legacy (unencrypted) messages"
  - If enabled: download `.txt` files; store plaintext locally
  - If disabled: reject `.txt` messages with warning

**Backward Compatibility Code (Phase 1 fallback):**

```rust
// In receive.rs: legacy branch (optional)
if storage_path.ends_with(".txt") && ALLOW_LEGACY {
    // Download plaintext (Phase 1 style)
    let plaintext = storage
        .reference()
        .child(&storage_path)
        .get_bytes(...)
        .await?;
    
    // No verification; plaintext trust model
    return Ok(String::from_utf8(plaintext)?);
} else if storage_path.ends_with(".txt") && !ALLOW_LEGACY {
    return Err("Legacy plaintext disabled; use Phase 2A".into());
}
```

---

## H. Test Matrix (MUST PASS)

### 1. E2EE Correctness

- [ ] **Happy Path**: Android sends text → Windows receives & decrypts → plaintext matches
- [ ] **Multi-device**: Android sends to self + Windows → both decrypt successfully
- [ ] **Wrong Device ID**: Missing envelope for device → graceful skip (not a recipient)
- [ ] **Tampered Blob**: Ciphertext modified → AEAD decrypt fails
- [ ] **Tampered Metadata**: metaHash changed → integrity check fails
- [ ] **Tampered Signature**: Signature modified → Ed25519 verify fails
- [ ] **Wrong Recipient Key**: DEK unwrap with wrong private key → fails

### 2. Revocation

- [ ] **Revoke Recipient**: Android excludes revoked Windows device from recipients → Windows receives no envelope
- [ ] **Revoke Sender**: Windows rejects messages from revoked sender device → no decryption attempted
- [ ] **Revoke & Re-activate**: Revoked device set back to active → future messages include envelope

### 3. Replay

- [ ] **Same messageId**: Receiver processes same message twice → only first stored (idempotent)
- [ ] **Signature Verification**: Replay signature without modification → detected as duplicate (same messageId)

### 4. Cross-Platform

- [ ] **Android → Windows**: Full E2EE flow
- [ ] **Windows → Android**: (Phase 2B) Sender support for Android

---

## I. File Structure & Work Items

### Android Implementation

**New Files:**

```
apps/android/spectrocap-android/app/src/main/kotlin/
  crypto/
    Sodium.kt          # Libsodium wrapper + key generation
    Format.kt          # Blob format + canonical JSON
  spectrocap/
    DeviceRegistrar.kt # Upload public keys
    Sender.kt          # E2EE send (replace plaintext)
```

**Dependencies:**

```gradle
// build.gradle
dependencies {
    implementation 'com.goterl:lazysodium-android:6.0.2'
}
```

### Windows Implementation

**New Files:**

```
apps/windows/src/
  crypto/
    mod.rs              # Crypto primitives (sodiumoxide)
    key_mgmt.rs         # Key generation + storage (DPAPI)
    format.rs           # Blob format + canonical JSON
    receiver.rs         # Full E2EE receive pipeline
```

**Dependencies:**

```toml
# Cargo.toml
[dependencies]
sodiumoxide = "0.2.7"
winapi = { version = "0.3", features = ["dpapi"] }
base64 = "0.21"
sha2 = "0.10"
```

### TypeScript/Web

**New Files:**

```
apps/windows/spectrocap-win/src/
  deviceManager.ts    # Device list + revocation UI
```

### Documentation

**New Files:**

```
docs/remote-paste/
  PHASE_2A_E2EE.md      # This file (crypto spec + pipelines)
  FIRESTORE_SCHEMA.md   # Updated with Phase 2A fields
```

**Updated Files:**

```
docs/remote-paste/
  FIRESTORE_SCHEMA.md   # Add Phase 2A schema section
  ANDROID_FLOW.md       # Add Phase 2A sender steps
  WINDOWS_FLOW.md       # Add Phase 2A receiver steps
```

---

## J. Phased Commits

### Commit 1: Documentation

```
commit: "docs(spectrocap): specify Phase 2A E2EE schema and blob format"

Changes:
- Add PHASE_2A_E2EE.md (full spec)
- Update FIRESTORE_SCHEMA.md with Phase 2A fields
- Add Phase 2A sections to ANDROID_FLOW.md and WINDOWS_FLOW.md

Scope: Documentation only; no code changes.
```

### Commit 2: Android E2EE

```
commit: "feat(spectrocap): add Android device keys and E2EE sender (Phase 2A)"

Changes:
- Add libsodium dependency
- Implement Sodium.kt (key gen + AEAD)
- Implement Format.kt (blob format + canonical JSON)
- Implement DeviceRegistrar.kt (pub key upload)
- Replace plaintext Sender with E2EE Sender
- Add Phase 2A sender tests

Scope: Android only; Windows unchanged.
```

### Commit 3: Windows E2EE

```
commit: "feat(spectrocap): add Windows device keys and E2EE receiver (Phase 2A)"

Changes:
- Add sodiumoxide dependency (Cargo.toml)
- Implement src/crypto/mod.rs (primitives)
- Implement src/crypto/key_mgmt.rs (DPAPI + storage)
- Implement src/crypto/format.rs (blob parsing)
- Implement src/crypto/receiver.rs (full E2EE receive)
- Replace TS receive.ts with Rust command (or thin wrapper)
- Add Phase 2A receiver tests

Scope: Windows only; Android unchanged.
```

### Commit 4: Device Trust Controls

```
commit: "feat(spectrocap): add device revocation controls (BANE-ready)"

Changes:
- Add deviceManager.ts (device list + revoke UI)
- Add device revocation logic (exclude from recipients)
- Add revocation enforcement in receiver
- Add Phase 2A revocation tests

Scope: Device management; refactor both platforms.
```

---

## K. Success Criteria (Phase 2A Complete)

- ✅ All tests pass (E2EE correctness + revocation + replay)
- ✅ Android sends → Windows receives (full E2EE flow)
- ✅ Revoked devices are excluded + cannot decrypt
- ✅ No plaintext stored in Cloud Storage or Firestore
- ✅ Device trust UI functional (list + revoke)
- ✅ All 4 commits pushed to main branch
- ✅ Documentation complete (spec + schema + flows)

---

## L. Future Phases

**Phase 2B:** At-rest encryption (local DB + secure storage)

**Phase 3:** Cross-platform sender (Windows → Android)

**Phase 4:** Image/File support (same E2EE pipelines)

**Phase 5:** Audit logging + forensics (signature verification trails)

---

**Approved by:** BANE Security Governor  
**Status:** Phase 2A Ready for Implementation  
**Revision:** 1.0
