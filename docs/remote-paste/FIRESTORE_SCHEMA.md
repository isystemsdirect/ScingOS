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

Stores per-device metadata and public keys.

| Field | Type | Description |
|-------|------|-------------|
| `deviceId` | string | UUID; locally generated on client, immutable |
| `platform` | string | `"android"` \| `"windows"` |
| `name` | string | User-friendly name (e.g., "Work Phone", "Laptop") |
| `createdAt` | timestamp | Device registration time |
| `lastSeenAt` | timestamp | Last active timestamp |
| `status` | string | `"active"` \| `"inactive"` (for future use) |

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

Stores message metadata and references to encrypted payloads.

| Field | Type | Description |
|-------|------|-------------|
| `messageId` | string | UUID; generated on sender client |
| `senderDeviceId` | string | UUID of originating device |
| `type` | string | `"text"` (MVP), later: `"image"`, `"file"` |
| `createdAt` | timestamp | Sent timestamp |
| `payloadRef` | string | Cloud Storage path: `gs://bucket/users/{uid}/messages/{messageId}.bin` |
| `recipients` | array \| string | `"all"` (all user's devices) or `[deviceId1, deviceId2, ...]` |
| `size` | number | Payload size in bytes |

**Example:**
```json
{
  "messageId": "660e8400-e29b-41d4-a716-446655440111",
  "senderDeviceId": "550e8400-e29b-41d4-a716-446655440000",
  "type": "text",
  "createdAt": "2026-01-28T16:45:00Z",
  "payloadRef": "gs://scing-remote-paste.appspot.com/users/user-123/messages/660e8400-e29b-41d4-a716-446655440111.bin",
  "recipients": "all",
  "size": 256
}
```

---

## Cloud Storage Structure

### Path: `users/{uid}/messages/{messageId}.bin`

Encrypted (or plaintext in Phase 1) payload binary:
- **Phase 1 MVP**: Plain UTF-8 text file (`.txt`)
- **Phase 2+**: XChaCha20-Poly1305 encrypted blob

**Example:**
```
gs://scing-remote-paste.appspot.com/
  users/
    user-123/
      messages/
        660e8400-e29b-41d4-a716-446655440111.bin
```

---

## Firestore Indexes (Auto-Created)

| Collection | Fields | Type |
|-----------|--------|------|
| `users/{uid}/messages` | `createdAt (Descending)` | Single-field |

**Why:** Enable efficient "newest first" ordering for history UI.

---

## Security Rules (Firestore)

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Authenticated user access only
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
      
      // Devices subcollection
      match /devices/{deviceId} {
        allow read, write: if request.auth.uid == uid;
      }
      
      // Messages subcollection
      match /messages/{messageId} {
        allow read, write: if request.auth.uid == uid;
      }
    }
  }
}
```

---

## Security Rules (Cloud Storage)

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Only authenticated user can access their own messages
    match /users/{uid}/messages/{allPaths=**} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

---

## Phase 1 Constraints

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
