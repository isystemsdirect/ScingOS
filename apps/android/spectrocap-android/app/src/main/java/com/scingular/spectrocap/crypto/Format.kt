package com.scingular.spectrocap.crypto

import android.util.Base64
import com.google.gson.Gson
import com.google.gson.JsonObject
import java.nio.ByteBuffer
import java.nio.ByteOrder

/**
 * Utilities for Phase 2A blob format and canonical metadata JSON.
 *
 * Phase 2A Blob Format:
 * [Magic (6 bytes: "SCAP2A")] + [Nonce (24 bytes)] + [Ciphertext (variable)]
 */
object BlobFormat {
    private const val MAGIC_STRING = "SCAP2A"
    private const val MAGIC_BYTES = 6
    private const val NONCE_SIZE = 24
    private val gson = Gson()

    /**
     * Creates Phase 2A blob from components.
     *
     * @param nonce 24-byte nonce
     * @param ciphertext Encrypted payload
     * @return Complete blob (magic + nonce + ciphertext)
     */
    fun createBlob(nonce: ByteArray, ciphertext: ByteArray): ByteArray {
        require(nonce.size == NONCE_SIZE) { "Nonce must be 24 bytes" }

        val totalSize = MAGIC_BYTES + NONCE_SIZE + ciphertext.size
        val blob = ByteArray(totalSize)

        // Write magic
        System.arraycopy(MAGIC_STRING.toByteArray(Charsets.UTF_8), 0, blob, 0, MAGIC_BYTES)

        // Write nonce
        System.arraycopy(nonce, 0, blob, MAGIC_BYTES, NONCE_SIZE)

        // Write ciphertext
        System.arraycopy(ciphertext, 0, blob, MAGIC_BYTES + NONCE_SIZE, ciphertext.size)

        return blob
    }

    /**
     * Parses Phase 2A blob into components.
     *
     * @param blob Complete Phase 2A blob
     * @return Pair of (nonce, ciphertext), or null if parsing fails
     */
    fun parseBlob(blob: ByteArray): Pair<ByteArray, ByteArray>? {
        return try {
            require(blob.size >= MAGIC_BYTES + NONCE_SIZE) { "Blob too short" }

            // Verify magic
            val magic = blob.sliceArray(0 until MAGIC_BYTES).toString(Charsets.UTF_8)
            require(magic == MAGIC_STRING) { "Invalid magic: $magic" }

            // Extract nonce
            val nonce = blob.sliceArray(MAGIC_BYTES until MAGIC_BYTES + NONCE_SIZE)

            // Extract ciphertext
            val ciphertext = blob.sliceArray(MAGIC_BYTES + NONCE_SIZE until blob.size)

            Pair(nonce, ciphertext)
        } catch (e: Exception) {
            null
        }
    }
}

/**
 * Utilities for canonical metadata JSON (Phase 2A).
 *
 * Canonical format ensures stable hash computation by maintaining alphabetical key order.
 */
object CanonicalMetadata {

    private val gson = Gson()

    /**
     * Creates canonical metadata JSON object with fields in alphabetical order.
     *
     * Order (MUST be alphabetical):
     * - alg
     * - createdAtClient
     * - messageId
     * - mime
     * - recipients (sorted array)
     * - senderDeviceId
     * - sizeBytesPlain
     * - storagePath
     * - type
     * - version
     *
     * @param messageId Message UUID
     * @param senderDeviceId Sender device UUID
     * @param recipients List of recipient device UUIDs (will be sorted)
     * @param storagePath Cloud Storage path (users/{uid}/messages/{messageId}.bin)
     * @param sizeBytesPlain Size of plaintext in bytes
     * @param createdAtClient ISO8601 timestamp of client creation
     * @param mimeType MIME type (typically "application/octet-stream" for Phase 2A)
     * @return Canonical JSON string (deterministic)
     */
    fun createCanonicalJson(
        messageId: String,
        senderDeviceId: String,
        recipients: List<String>,
        storagePath: String,
        sizeBytesPlain: Int,
        createdAtClient: String,
        mimeType: String = "application/octet-stream"
    ): String {
        // Create ordered map manually to ensure alphabetical key order
        val metadata = linkedMapOf<String, Any?>()

        metadata["alg"] = "xchacha20poly1305+sealedbox-x25519+ed25519"
        metadata["createdAtClient"] = createdAtClient
        metadata["messageId"] = messageId
        metadata["mime"] = mimeType
        metadata["recipients"] = recipients.sorted() // Sorted for stability
        metadata["senderDeviceId"] = senderDeviceId
        metadata["sizeBytesPlain"] = sizeBytesPlain
        metadata["storagePath"] = storagePath
        metadata["type"] = "text"
        metadata["version"] = "2A"

        return gson.toJson(metadata)
    }

    /**
     * Parses canonical metadata JSON (for verification on receiver side).
     *
     * @param jsonString Canonical metadata JSON
     * @return Map of metadata fields, or null if parsing fails
     */
    fun parseCanonical(jsonString: String): Map<String, Any?>? {
        return try {
            gson.fromJson(jsonString, Map::class.java) as Map<String, Any?>
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Computes metaHash = SHA256(canonicalJson).
     *
     * @param canonicalJson Canonical metadata JSON string
     * @return metaHash as ByteArray (32 bytes)
     */
    fun computeMetaHash(canonicalJson: String): ByteArray {
        return CryptoManager.sha256(canonicalJson.toByteArray(Charsets.UTF_8))
    }

    /**
     * Verifies metaHash by recomputing and comparing.
     *
     * @param canonicalJson Canonical metadata JSON string
     * @param metaHashBase64 Expected metaHash (base64)
     * @return true if hashes match
     */
    fun verifyMetaHash(canonicalJson: String, metaHashBase64: String): Boolean {
        val computed = computeMetaHash(canonicalJson)
        val expected = Base64.decode(metaHashBase64, Base64.NO_WRAP)
        return computed.contentEquals(expected)
    }
}
