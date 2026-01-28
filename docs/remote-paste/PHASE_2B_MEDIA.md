# SpectroCAP™ Phase 2B — Media Transfer (Images + Binary)

**Status:** Phase 2B Design  
**Extends:** Phase 2A E2EE model (no security changes)  
**Scope:** Images (PNG, JPEG) + general binary blobs  

---

## Overview

Phase 2B extends SpectroCAP™ from **text-only** to **media-capable** while maintaining the **exact same cryptographic model**:

- ✅ Same XChaCha20-Poly1305 AEAD encryption
- ✅ Same X25519 per-device sealed boxes
- ✅ Same Ed25519 signatures over metaHash
- ✅ Same device trust enforcement (revocation)

### Key Difference from Phase 2A

| Aspect | Phase 2A (Text) | Phase 2B (Media) |
|--------|-----------------|-----------------|
| **Payload** | UTF-8 text bytes | PNG/JPEG/binary bytes |
| **Message Type** | `type: "text"` | `type: "image"` or `type: "file"` |
| **MIME Type** | `application/octet-stream` | `image/png`, `image/jpeg`, etc. |
| **Metadata** | No media fields | `media: {width, height, filename, ext}` |
| **Ingest** | Text input → bytes | Image picker / clipboard → bytes |
| **Display** | Text history | Image thumbnails + save/clipboard |

### Canonical Meta Fields (Phase 2B)

When `type == "image"`, canonical metadata JSON includes:

```json
{
  "alg": "XCHACHAPOLY",
  "createdAtClient": "2026-01-28T16:46:00Z",
  "messageId": "770e8400-e29b-41d4-a716-446655440222",
  "media": {
    "ext": "png",
    "filename": "screenshot.png",
    "height": 1080,
    "width": 1920
  },
  "mime": "image/png",
  "recipients": ["550e8400...", "660e8400..."],
  "senderDeviceId": "550e8400-e29b-41d4-a716-446655440000",
  "sizeBytesPlain": 123456,
  "storagePath": "users/user-123/messages/770e8400....bin",
  "type": "image",
  "version": "2A"
}
```

**Critical:** Fields in canonical JSON must be **alphabetically ordered** for deterministic metaHash.

---

## Firestore Schema Extensions

### messages/{messageId} Media Fields

Add to Phase 2A message document:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | ✓ | Message type: `"text"` \| `"image"` \| `"file"` |
| `media` | object | ✗ | Media metadata (for `type: "image"` \| `"file"`) |
| `media.width` | number | ✗ | Image width in pixels (PNG/JPEG only) |
| `media.height` | number | ✗ | Image height in pixels (PNG/JPEG only) |
| `media.filename` | string | ✗ | Original filename (optional) |
| `media.ext` | string | ✗ | File extension: `"png"` \| `"jpg"` \| `"jpeg"` \| `"bin"` |
| `sizeBytesPlain` | number | ✓ Phase 2B | Plaintext payload size before encryption (renamed from `sizeBytes`) |
| `mime` | string | ✓ | MIME type: `"image/png"` \| `"image/jpeg"` \| `"application/octet-stream"` |

### Updated Firestore Example

```json
{
  "messageId": "770e8400-e29b-41d4-a716-446655440222",
  "senderDeviceId": "550e8400-e29b-41d4-a716-446655440000",
  "type": "image",
  "createdAtClient": "2026-01-28T16:46:00Z",
  "recipients": ["550e8400-e29b-41d4-a716-446655440000", "660e8400-e29b-41d4-a716-446655440222"],
  "storagePath": "users/user-123/messages/770e8400-e29b-41d4-a716-446655440222.bin",
  "mime": "image/png",
  "sizeBytesPlain": 123456,
  
  "nonce": "base64(24_byte_nonce)",
  "envelopes": {
    "550e8400-e29b-41d4-a716-446655440000": "base64(sealedBox_A)",
    "660e8400-e29b-41d4-a716-446655440222": "base64(sealedBox_B)"
  },
  "metaHash": "base64(sha256_hash)",
  "signature": "base64(ed25519_signature)",
  "version": "2A",
  
  "media": {
    "width": 1920,
    "height": 1080,
    "filename": "screenshot.png",
    "ext": "png"
  }
}
```

---

## Cloud Storage: Blob Format (Unchanged)

### Phase 2B Blob Format = Phase 2A Blob Format

**No change.** The same SCAP2A container holds image bytes:

```
┌─────────────────┬──────────────────┬──────────────────────────┐
│ Magic (6 bytes) │ Nonce (24 bytes) │ Ciphertext (variable)    │
│   "SCAP2A"      │ XChaCha20 nonce  │ AEAD(PNG/JPEG/bin bytes) │
└─────────────────┴──────────────────┴──────────────────────────┘
```

**Ciphertext = AEAD_Encrypt(image_bytes, nonce, DEK, AAD=metaHash)**

- Image bytes are first-class plaintext (no encoding, just raw PNG/JPEG)
- AEAD authentication tag ensures integrity
- Per-recipient sealed boxes deliver DEK

---

## Android: Image Ingest & Send

### 1. Image Input Methods (MVP Phase 2B.1)

#### Primary: Share Intent Receiver

**AndroidManifest.xml:**
```xml
<intent-filter>
  <action android:name="android.intent.action.SEND"/>
  <category android:name="android.intent.category.DEFAULT"/>
  <data android:mimeType="image/*"/>
</intent-filter>
```

**Activity onIntent:**
```kotlin
if (intent?.action == Intent.ACTION_SEND) {
    val uri = intent.getParcelableExtra<Uri>(Intent.EXTRA_STREAM)
    if (uri != null && intent.type?.startsWith("image/") == true) {
        handleImageUri(uri)  // Send image flow
    }
}
```

#### Secondary: File Picker (ACTION_OPEN_DOCUMENT)

**Button in UI:**
```kotlin
val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
    addCategory(Intent.CATEGORY_OPENABLE)
    type = "image/*"
}
startActivityForResult(intent, PICK_IMAGE_CODE)
```

#### Optional: Clipboard Image

**Check clipboard:**
```kotlin
val clipboard = getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
val data = clipboard.primaryClip?.getItemAt(0)?.uri  // If available
if (data != null) {
    handleImageUri(data)  // Try to send clipboard image
}
```

### 2. Image Acquisition & Validation

```kotlin
fun acquireImage(contentUri: Uri): ImageData? {
    return try {
        // Read bytes
        val bytes = contentResolver.openInputStream(contentUri)?.use {
            it.readBytes()
        } ?: return null
        
        // Determine MIME type
        val mime = contentResolver.getType(contentUri) ?: "image/octet-stream"
        
        // Validate: PNG or JPEG only
        if (mime !in listOf("image/png", "image/jpeg")) {
            return null  // Reject unsupported formats
        }
        
        // Extract dimensions (optional)
        val (width, height) = extractImageDimensions(bytes)
        
        // Extract filename
        val filename = getFileName(contentUri)
        
        return ImageData(
            bytes = bytes,
            mime = mime,
            width = width,
            height = height,
            filename = filename,
            ext = if (mime == "image/jpeg") "jpg" else "png"
        )
    } catch (e: Exception) {
        null
    }
}

fun extractImageDimensions(bytes: ByteArray): Pair<Int, Int> {
    return try {
        val options = BitmapFactory.Options().apply {
            inJustDecodeBounds = true
        }
        BitmapFactory.decodeByteArray(bytes, 0, bytes.size, options)
        Pair(options.outWidth, options.outHeight)
    } catch (e: Exception) {
        Pair(0, 0)  // Fallback: dimensions unknown
    }
}
```

### 3. Reuse E2EE Pipeline

**E2EESender Extension:**

```kotlin
suspend fun sendImage(
    uid: String,
    deviceId: String,
    imageData: ImageData
): String {
    val plaintextBytes = imageData.bytes
    
    // Build canonical metadata (includes media fields)
    val canonicalMeta = CanonicalMetadata.createCanonicalJson(
        messageId = UUID.randomUUID().toString(),
        senderDeviceId = deviceId,
        recipients = getActiveDeviceIds(uid),
        storagePath = "users/$uid/messages/$messageId.bin",
        createdAtClient = Timestamp.now().toIso8601(),
        sizeBytesPlain = plaintextBytes.size,
        type = "image",
        mime = imageData.mime,
        media = mapOf(
            "width" to imageData.width,
            "height" to imageData.height,
            "filename" to imageData.filename,
            "ext" to imageData.ext
        ),
        version = "2A",
        alg = "XCHACHAPOLY"
    )
    
    // Encrypt (same P2A pipeline)
    return encryptAndSend(uid, deviceId, plaintextBytes, canonicalMeta)
}
```

### 4. UI: Send Image Flow

**Option A: Share Intent Auto-Confirm**
```
User opens SpectroCAP
  ↓
Android Share → "Send image to SpectroCAP"
  ↓
App shows: [Preview] "Send this image?" [Cancel] [Send]
  ↓
User confirms
  ↓
Image encrypted + uploaded
  ↓
"Sent ✓"
```

**Option B: File Picker Button**
```
User taps "Send Image" button
  ↓
Android file picker opens (image/*)
  ↓
User selects image
  ↓
App shows: [Preview] "Send?" [Cancel] [Send]
  ↓
User confirms → encrypt + upload
```

---

## Windows: Image Decrypt & Display

### 1. Extend Receiver (Rust crypto/receiver.rs)

**Current P2A receiver handles decryption.**  
**Phase 2B addition: Validate payload magic bytes**

```rust
impl E2EEReceiver {
    pub fn decrypt_message(&self, ...) -> Result<DecryptionResult, DecryptionError> {
        // ... existing P2A verification steps ...
        
        // [NEW] Validate image magic if type == "image"
        if let Some(msg_type) = message_doc.get_str("type") {
            if msg_type == "image" {
                if !Self::validate_image_magic(&plaintext) {
                    return Err(DecryptionError {
                        reason: "Invalid image format (magic bytes)".to_string()
                    });
                }
            }
        }
        
        Ok(DecryptionResult {
            plaintext: String::from_utf8_lossy(&plaintext).to_string(),  // Base64 encode for JSON
            message_id: message_doc.get_str("messageId").unwrap().to_string(),
            sender_device_id: message_doc.get_str("senderDeviceId").unwrap().to_string(),
        })
    }
    
    fn validate_image_magic(bytes: &[u8]) -> bool {
        if bytes.len() < 8 {
            return false;
        }
        
        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if bytes[0..8] == [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A] {
            return true;
        }
        
        // JPEG: FF D8 FF
        if bytes.len() >= 3 && bytes[0..3] == [0xFF, 0xD8, 0xFF] {
            return true;
        }
        
        false
    }
}
```

### 2. Clipboard Image Support (Windows)

**Rust command:**

```rust
#[tauri::command]
fn set_clipboard_image(image_bytes: Vec<u8>, mime: String) -> Result<(), String> {
    use std::io::Write;
    use std::path::PathBuf;
    
    // Write to temp file
    let temp_path = PathBuf::from(std::env::temp_dir()).join("spectrocap_image.tmp");
    
    let mut file = std::fs::File::create(&temp_path)
        .map_err(|e| e.to_string())?;
    
    file.write_all(&image_bytes)
        .map_err(|e| e.to_string())?;
    
    // Copy file to Windows clipboard
    // Option 1: Use Windows clipboard APIs (PowerShell wrapper)
    let output = std::process::Command::new("powershell")
        .arg("-NoProfile")
        .arg("-Command")
        .arg(format!(
            "[Windows.ApplicationModel.DataTransfer.Clipboard]::SetContent((New-Object System.IO.FileInfo '{}')).ItemType",
            temp_path.display()
        ))
        .output()
        .map_err(|e| e.to_string())?;
    
    if !output.status.success() {
        return Err("Failed to copy to clipboard".to_string());
    }
    
    Ok(())
}
```

**TypeScript Frontend:**

```typescript
async function copyImageToClipboard(messageId: string): Promise<void> {
    // Download blob + decrypt + write to clipboard
    const imageBytes = await invoke('decrypt_and_get_image', { messageId });
    const result = await invoke('set_clipboard_image', {
        imageBytes,
        mime: 'image/png'  // Get from Firestore doc
    });
    
    if (result.ok) {
        showNotification('Image copied to clipboard ✓');
    }
}
```

### 3. Save As Dialog (TypeScript/Tauri)

**UI Button:**
```typescript
async function saveImageAs(messageId: string, filename: string): Promise<void> {
    // 1. Show save dialog
    const path = await save({
        defaultPath: filename || `spectrocap_${Date.now()}.png`,
        filters: [
            { name: 'Images', extensions: ['png', 'jpg', 'jpeg'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });
    
    if (!path) return;  // User cancelled
    
    // 2. Decrypt + write to disk
    const imageBytes = await invoke('decrypt_and_get_image', { messageId });
    await fs.writeFile(path, imageBytes);
    
    showNotification(`Saved to ${path} ✓`);
}
```

### 4. Message History UI

**Text vs Image Display:**

```typescript
function renderMessageItem(msg: Message): HTMLElement {
    const container = document.createElement('div');
    
    if (msg.type === 'text') {
        // Existing text display
        container.textContent = msg.plaintext;
    } else if (msg.type === 'image') {
        // Image display
        const img = document.createElement('img');
        img.src = `data:${msg.mime};base64,${msg.plaintext}`;  // Stored as base64
        img.style.maxWidth = '400px';
        img.style.maxHeight = '300px';
        container.appendChild(img);
        
        // Buttons
        const buttons = document.createElement('div');
        buttons.innerHTML = `
            <button onclick="copyImageToClipboard('${msg.messageId}')">
                📋 Copy to Clipboard
            </button>
            <button onclick="saveImageAs('${msg.messageId}', '${msg.media?.filename}')">
                💾 Save As…
            </button>
        `;
        container.appendChild(buttons);
    }
    
    return container;
}
```

---

## Security Considerations (Phase 2B)

### Image Validation

- ✅ **Magic Byte Validation**: Reject tampered image data (PNG/JPEG headers verified)
- ✅ **AEAD Authentication**: Image bytes covered by Poly1305 tag
- ✅ **Signature Verification**: Metadata (including mime type) signed
- ✅ **Device Trust**: Revoked devices cannot decrypt

### Temporary Files

- ⚠️ **Windows Temp Directory**: Images temporarily written to disk
  - **Mitigation**: Overwrite with zeros before deletion (Phase 2C+)
  - **Best Practice**: Use Windows Temporary Files API with secure deletion

### Clipboard Security

- ⚠️ **Clipboard Access**: Any app can read clipboard after copy
  - **User Awareness**: Warn user "Image now in clipboard (any app can access)"
  - **Phase 2C**: Option to auto-clear clipboard after timeout

---

## Test Cases (Phase 2B)

### 1. Happy Path: Android Send PNG → Windows Receive

**Scenario:**
1. Android shares PNG (2 MB, 1920×1080)
2. App encrypts with E2EE
3. Windows receives Firestore notification
4. Verifies signature + decrypts
5. Validates PNG magic bytes
6. Displays image + buttons

**Expected:**
- ✅ PNG displays correctly
- ✅ Dimensions shown (1920×1080)
- ✅ "Copy to Clipboard" works
- ✅ "Save As" produces valid PNG

### 2. Happy Path: Android Send JPEG → Windows Receive

**Same as above, but JPEG format**

### 3. Negative: Tampered Image Bytes

**Scenario:**
1. Attacker modifies ciphertext in Storage
2. Windows attempts decryption
3. AEAD authentication fails

**Expected:** ✅ Decryption error; image rejected

### 4. Negative: Wrong MIME Type

**Scenario:**
1. Android tries to send BMP (unsupported in 2B.1)
2. App rejects with "Unsupported format"

**Expected:** ✅ Error message shown

### 5. Negative: Invalid Image Magic

**Scenario:**
1. Attacker replaces JPEG bytes with random data
2. AEAD passes (DEK is correct)
3. Magic byte validation fails (not PNG/JPEG header)

**Expected:** ✅ Image rejected; error shown

### 6. Revocation: Excluded Device Cannot Decrypt

**Scenario:**
1. Android sends PNG to Device A + Device B
2. Device B is revoked before Windows receives
3. Windows attempts to decrypt

**Expected:** ✅ No envelope for Windows; image skipped gracefully

---

## Phase 2B Success Criteria

- ✅ Images (PNG, JPEG) transferred end-to-end with full E2EE
- ✅ No plaintext stored in Firebase
- ✅ Signature verification enforced
- ✅ Windows can "Save As" decrypted image
- ✅ Windows can copy image to clipboard
- ✅ Device revocation prevents decryption
- ✅ All 6+ test cases pass

---

## Phase 2B Known Limitations

1. **Unidirectional**: Android sender only (Phase 2D: Windows sender)
2. **File Types**: PNG/JPEG only (Phase 2B.2: general binary)
3. **Thumbnails**: Not generated (Phase 2C: lazy-load thumbnails)
4. **Compression**: No client-side image optimization (Phase 2C+)
5. **Temp Files**: Not securely wiped (Phase 2C: zero-write on delete)

---

## Migration from Phase 2A

**No breaking changes.** Phase 2A text messages continue to work:

- Message documents with `type: "text"` are unchanged
- No new required fields
- Canonical JSON field order preserved
- Device trust model unchanged
- Firestore rules unchanged

---

## Next: Phase 2C

After Phase 2B:
- Bidirectional messaging (Windows → Android)
- General binary blob support (`.zip`, `.pdf`, etc.)
- Image thumbnail generation
- Clipboard timeout (auto-clear)

