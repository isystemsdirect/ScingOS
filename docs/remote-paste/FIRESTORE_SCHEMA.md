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

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `deviceId` | string | ✓ | UUID; locally generated on client, immutable |
| `name` | string | ✓ | User-friendly name (e.g., "Work Phone", "Laptop") |
| `platform` | string | ✓ | `"android"` \| `"windows"` |
| `createdAt` | timestamp | ✓ | Device registration time |
| `lastSeenAt` | timestamp | ✓ | Last active timestamp |
| `status` | string | ✓ | `"active"` \| `"revoked"` (Phase 1: default `"active"`) |

**Example:**
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

---

## Collection: `users/{uid}/messages/{messageId}`

Stores message metadata and references to payloads in Cloud Storage.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `messageId` | string | ✓ | UUID; generated on sender client |
| `senderDeviceId` | string | ✓ | UUID of originating device |
| `type` | string | ✓ | `"text"` (Phase 1), later: `"image"`, `"file"` |
| `createdAt` | timestamp | ✓ | Message sent timestamp |
| `recipients` | string \| array | ✓ | `"all"` (all user's devices) or array of deviceIds |
| `storagePath` | string | ✓ | Cloud Storage path: `users/{uid}/messages/{messageId}.txt` |
| `mime` | string | ✓ | MIME type: `"text/plain"` (Phase 1) |
| `sizeBytes` | number | ✓ | Payload size in bytes |

**Future Fields (Phase 2+, Encryption)**:
| Field | Type | Description |
|-------|------|-------------|
| `envelopes` | map | Per-device encrypted symmetric key envelopes (ECDH) |
| `nonce` | string | Base64-encoded nonce for AEAD |
| `signature` | string | Ed25519 message signature (base64) |
| `metaHash` | string | BLAKE3 hash of plaintext for verification |

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

---

## Cloud Storage Structure

### Path: `users/{uid}/messages/{messageId}.txt`

Message payload stored in Cloud Storage:
- **Phase 1 MVP**: Plain UTF-8 text file (`.txt`), readable as plaintext
- **Phase 2+**: XChaCha20-Poly1305 encrypted blob (`.bin`), with encryption envelope in Firestore

**Example:**
```
gs://spectrocap.appspot.com/
  users/
    user-123/
      messages/
        660e8400-e29b-41d4-a716-446655440111.txt   (plaintext in Phase 1)
```

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
- **Storage**: Delete message payload 90 days after creation (configurable via Cloud Storage lifecycle policies)

```

- **No encryption** in Phase 1 (plaintext in Storage)
- **No signatures** (trust Firestore rules + Auth)
- **All devices receive all messages** (`"recipients": "all"`)
- **Single device per user** (Android OR Windows, for MVP simplicity)

---

## Phase 2+ Enhancements

- E2EE: XChaCha20-Poly1305 symmetric encryption
- Per-device key envelopes (ECDH encryption of symmetric key)
- Message signatures (Ed25519)
- Selective recipient lists
- Image/media support
- Resumable uploads
- Message expiration (TTL)

---

## Data Retention

- **Messages**: Keep indefinitely (users can delete manually)
- **Devices**: Keep while active; mark inactive after 30 days no contact
- **Storage**: Delete message payload 90 days after creation (configurable)
