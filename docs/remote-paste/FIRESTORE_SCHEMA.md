# SCINGULAR Remote Paste — Firestore Schema (Phase 1)

## Database Structure

### Collection: `users/{uid}`

Root document for each authenticated user (auto-created on first login).

```
users/
  {uid}/
    devices/
      {deviceId}/
        └─ device registration document
    messages/
      {messageId}/
        └─ message metadata document
```

---

## Collection: `users/{uid}/devices/{deviceId}`

Stores per-device metadata and registration status.

### Phase 1 Fields (MVP)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `deviceId` | string | ✓ | UUID; locally generated on client, immutable |
| `name` | string | ✓ | User-friendly name (e.g., "Work Phone", "Laptop") |
| `platform` | string | ✓ | `"android"` \| `"windows"` |
| `createdAt` | timestamp | ✓ | Device registration time |
| `lastSeenAt` | timestamp | ✓ | Last active timestamp |
| `status` | string | ✓ | `"active"` \| `"revoked"` (Phase 1: default `"active"`) |

### Phase 2A Fields (E2EE + Signatures)

| Field | Type | Required | Description | Phase |
|-------|------|----------|-------------|-------|
| `pubSignKey` | string (base64) | ✓ Phase 2A | Ed25519 public key (32 bytes, base64 encoded) | 2A+ |
| `pubBoxKey` | string (base64) | ✓ Phase 2A | X25519 public key (32 bytes, base64 encoded) | 2A+ |

**Example (Phase 1):**
```json
{
  "deviceId": "550e8400-e29b-41d4-a716-446655440000",
  "platform": "android",
  "name": "My Pixel 8",
  "createdAt": "2026-01-28T15:30:00Z",
  "lastSeenAt": "2026-01-28T16:45:00Z",
  "status": "active"
}
```

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

---

## Collection: `users/{uid}/messages/{messageId}`

Stores message metadata and references to payloads in Cloud Storage.

### Phase 1 Fields (MVP)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `messageId` | string | ✓ | UUID; generated on sender client |
| `senderDeviceId` | string | ✓ | UUID of originating device |
| `type` | string | ✓ | `"text"` (Phase 1), later: `"image"`, `"file"` |
| `createdAt` | timestamp | ✓ | Message sent timestamp |
| `recipients` | string \| array | ✓ | `"all"` (all user's devices) or array of deviceIds |
| `storagePath` | string | ✓ | Cloud Storage path: `users/{uid}/messages/{messageId}.txt` (Phase 1) or `.bin` (Phase 2A+) |
| `mime` | string | ✓ | MIME type: `"text/plain"` (Phase 1) or `"application/octet-stream"` (Phase 2A+) |
| `sizeBytes` | number | ✓ | Payload size in bytes |

### Phase 2A Fields (E2EE + Signatures)

| Field | Type | Required | Description | Phase |
|-------|------|----------|-------------|-------|
| `nonce` | string (base64) | ✓ Phase 2A | XChaCha20 nonce (24 bytes, base64 encoded) | 2A+ |
| `envelopes` | map<string, string> | ✓ Phase 2A | `{ deviceId: base64(sealedBox(DEK)) }` per recipient | 2A+ |
| `metaHash` | string (base64) | ✓ Phase 2A | SHA256(canonicalMetaJson) for integrity verification | 2A+ |
| `signature` | string (base64) | ✓ Phase 2A | Ed25519 signature over metaHash (64 bytes, base64 encoded) | 2A+ |
| `version` | string | ✓ Phase 2A | Schema version marker: `"2A"` | 2A+ |
| `alg` | object | ✗ (optional) | Algorithm descriptors (informational) | 2A+ |

### Phase 2B Fields (Media Support)

| Field | Type | Required | Description | Phase |
|-------|------|----------|-------------|-------|
| `media` | object | ✗ Phase 2B | Media metadata (images, files) | 2B+ |
| `media.width` | number | ✗ Phase 2B | Image width in pixels (if applicable) | 2B+ |
| `media.height` | number | ✗ Phase 2B | Image height in pixels (if applicable) | 2B+ |
| `media.filename` | string | ✗ Phase 2B | Original filename (optional) | 2B+ |
| `media.ext` | string | ✗ Phase 2B | File extension: `"png"` \| `"jpg"` \| `"jpeg"` \| `"bin"` | 2B+ |
| `sizeBytesPlain` | number | ✗ Phase 2B | Plaintext payload size before encryption | 2B+ |

**Example (Phase 1):**
```json
{
  "messageId": "660e8400-e29b-41d4-a716-446655440111",
  "senderDeviceId": "550e8400-e29b-41d4-a716-446655440000",
  "type": "text",
  "createdAt": "2026-01-28T16:45:00Z",
  "recipients": "all",
  "storagePath": "users/user-123/messages/660e8400-e29b-41d4-a716-446655440111.txt",
  "mime": "text/plain",
  "sizeBytes": 256
}
```

**Example (Phase 2A - Text):**
```json
{
  "messageId": "660e8400-e29b-41d4-a716-446655440111",
  "senderDeviceId": "550e8400-e29b-41d4-a716-446655440000",
  "type": "text",
  "createdAt": "2026-01-28T16:45:00Z",
  "recipients": ["550e8400-e29b-41d4-a716-446655440000", "660e8400-e29b-41d4-a716-446655440222"],
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

**Example (Phase 2B - Image PNG):**
```json
{
  "messageId": "770e8400-e29b-41d4-a716-446655440222",
  "senderDeviceId": "550e8400-e29b-41d4-a716-446655440000",
  "type": "image",
  "createdAt": "2026-01-28T16:46:00Z",
  "recipients": ["550e8400-e29b-41d4-a716-446655440000", "660e8400-e29b-41d4-a716-446655440222"],
  "storagePath": "users/user-123/messages/770e8400-e29b-41d4-a716-446655440222.bin",
  "mime": "image/png",
  "sizeBytesPlain": 123456,
  "nonce": "def456...==",
  "envelopes": {
    "550e8400-e29b-41d4-a716-446655440000": "base64(sealedBox_for_device_A)",
    "660e8400-e29b-41d4-a716-446655440222": "base64(sealedBox_for_device_B)"
  },
  "metaHash": "sha256(canonical)==",
  "signature": "ed25519_sig==",
  "version": "2A",
  "media": {
    "width": 1920,
    "height": 1080,
    "filename": "screenshot.png",
    "ext": "png"
  },
  "alg": {
    "aead": "xchacha20poly1305",
    "wrap": "sealedbox-x25519",
    "sig": "ed25519"
  }
}
```

---

## Cloud Storage Structure

### Phase 1 Path: `users/{uid}/messages/{messageId}.txt`

Message payload stored in Cloud Storage (plaintext, MVP):
- Format: Plain UTF-8 text file
- Readable as plaintext
- No encryption

**Example:**
```
gs://spectrocap.appspot.com/
  users/
    user-123/
      messages/
        660e8400-e29b-41d4-a716-446655440111.txt   (plaintext in Phase 1)
```

### Phase 2A Path: `users/{uid}/messages/{messageId}.bin`

Message payload stored as encrypted blob (Phase 2A+):
- Format: Binary encrypted blob (XChaCha20-Poly1305)
- Structure: Magic (6 bytes) + Nonce (24 bytes) + Ciphertext (variable)
- Not readable without decryption key (DEK)

**Phase 2A Blob Format:**

```
┌─────────────────┬──────────────────┬─────────────────────┐
│ Magic (6 bytes) │ Nonce (24 bytes) │ Ciphertext (var)    │
│   "SCAP2A"      │ XChaCha20 nonce  │ AEAD encrypted data │
└─────────────────┴──────────────────┴─────────────────────┘
```

**Total size:** 6 + 24 + len(ciphertext) → stored in Firestore `sizeBytes`

**Example:**
```
gs://spectrocap.appspot.com/
  users/
    user-123/
      messages/
        660e8400-e29b-41d4-a716-446655440111.bin   (encrypted in Phase 2A+)
```

**Security Note:** Server never decrypts. Storage layer is untrusted.

### Storage Permissions

- Only authenticated user owning the `{uid}` can read/write under `users/{uid}/messages/...`
- See [storage.rules](../../cloud/firebase/storage.rules) for complete access control

---

## Firestore Indexes (Auto-Created)

| Collection | Fields | Type |
|-----------|--------|------|
| `users/{uid}/messages` | `createdAt (Descending)` | Single-field |

**Why:** Enable efficient "newest first" ordering for history UI.

---

## Security Rules

### Firestore Rules

Complete rules available at: [cloud/firebase/firestore.rules](../../cloud/firebase/firestore.rules)

**Summary:**
- Only authenticated users can access `/users/{uid}/...` where `{uid}` matches their own user ID
- All subcollections (devices, messages) inherit parent user-scoped access control
- Cross-user access is blocked
- Default: deny all other paths

**Key Functions:**
```firestore
function isSignedIn() {
  return request.auth != null;
}

function isOwner(uid) {
  return isSignedIn() && request.auth.uid == uid;
}
```

### Cloud Storage Rules

Complete rules available at: [cloud/firebase/storage.rules](../../cloud/firebase/storage.rules)

**Summary:**
- Only authenticated user can read/write objects under `users/{uid}/messages/...`
- User ID in path must match authenticated user ID
- Default: deny all other paths

**Key Protection:**
```
match /users/{uid}/messages/{fileName} {
  allow read, write: if isOwner(uid);
}
```

---

## Firestore Indexes

### Single-Field Indexes (Auto-Created)

Firestore automatically creates these for efficient querying:
- `users/{uid}/messages` → `createdAt` (Descending)

**Why:** Enable efficient "newest first" ordering (`order by createdAt desc`) for message history UI.

### Composite Indexes (Manual Creation)

Create the following composite index via Firebase Console or Terraform:

**Index 1: Type + CreatedAt**
- Collection: `users/{uid}/messages`
- Fields:
  - `type` (Ascending)
  - `createdAt` (Descending)
- Scope: Collection

**Why:** When Phase 2+ filters by `type == "text" order by createdAt desc`, this composite index accelerates the query.

#### How to Create via Firebase Console:

1. Navigate: **Firestore Database** → **Indexes** → **Composite**
2. Click **Create Index**
3. Collection: `messages` (under `users/{uid}`)
4. Add fields in order:
   - `type` (Ascending)
   - `createdAt` (Descending)
5. Click **Create Index**
6. Wait for index to build (usually < 1 minute for new databases)

---

## Smoke Test Checklist

After deploying rules and creating indexes, validate:

### 1. Rule Enforcement (Signed-Out)

- [ ] Attempt to read `/users/test-uid/devices/...` without authentication → **Denied**
- [ ] Attempt to write to `/users/test-uid/messages/...` without authentication → **Denied**
- [ ] Attempt to read `users/test-uid/messages/.../payload.txt` from Storage without authentication → **Denied**

### 2. Rule Enforcement (Signed-In, Wrong User)

- [ ] Sign in as User A
- [ ] Attempt to read `/users/user-b-uid/devices/...` → **Denied** (cross-user access blocked)
- [ ] Attempt to write to `/users/user-b-uid/messages/...` → **Denied**
- [ ] Attempt to read `users/user-b-uid/messages/.../payload.txt` from Storage → **Denied**

### 3. Rule Enforcement (Signed-In, Own User)

- [ ] Sign in as User A
- [ ] Create document: `/users/{user-a-uid}/devices/{device-id}` with required fields → **Success**
- [ ] Read `/users/{user-a-uid}/devices/{device-id}` → **Success**
- [ ] Create document: `/users/{user-a-uid}/messages/{message-id}` → **Success**
- [ ] Upload file to `users/{user-a-uid}/messages/{message-id}.txt` → **Success**
- [ ] Download file from Storage → **Success**

### 4. Index Verification

- [ ] Query `/users/{uid}/messages` with `order by createdAt desc` → Returns results quickly
- [ ] Query `/users/{uid}/messages` with `where type == "text" order by createdAt desc` → Uses composite index

### 5. Data Consistency

- [ ] Create message document with all required fields
- [ ] Verify `storagePath` correctly references the uploaded file
- [ ] Verify `sizeBytes` matches actual file size
- [ ] Delete message document and confirm Storage file cleanup (manual for Phase 1)

---

## Data Retention

- **Messages**: Keep indefinitely (users can delete manually)
- **Devices**: Keep while active; mark inactive after 30 days no contact
- **Storage**: Delete message payload 90 days after creation (configurable)

---

## Phase 2A: End-to-End Encryption + Signatures

### Overview

**Phase 2A** introduces full E2EE with message signatures and device trust controls:

- **No plaintext** stored in Cloud Storage (all `.bin` encrypted)
- **Per-device key envelopes**: DEK encrypted per recipient using X25519 sealed box
- **Message signatures**: Ed25519 over canonical metadata hash
- **Device trust**: Status enforcement (revoked devices cannot decrypt)

### Key Changes from Phase 1

| Aspect | Phase 1 | Phase 2A |
|--------|---------|---------|
| **Storage** | `.txt` (plaintext) | `.bin` (encrypted) |
| **Device Keypairs** | None | Ed25519 + X25519 |
| **Message Field** | Recipients: `"all"` | Recipients: array of active deviceIds |
| **Firestore** | Minimal (metadata) | Full E2EE fields (envelopes, signature, metaHash) |
| **Verification** | None (plaintext trust) | Full (signature + metaHash integrity) |

### Phase 2A Security Guarantees

- ✅ **Confidentiality**: Only designated recipients can decrypt (X25519 sealed box per device)
- ✅ **Authenticity**: Message signed by sender device (Ed25519)
- ✅ **Integrity**: Metadata hash verified (SHA256 + canonical JSON)
- ✅ **Device Trust**: Revoked devices excluded from recipients + cannot decrypt existing messages

### For Complete Phase 2A Specification

See: [PHASE_2A_E2EE.md](./PHASE_2A_E2EE.md)
