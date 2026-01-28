package com.scingular.spectrocap.spectrocap

import android.content.Context
import android.util.Base64
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.storage.FirebaseStorage
import com.scingular.spectrocap.crypto.CryptoManager
import com.scingular.spectrocap.crypto.Format
import com.scingular.spectrocap.crypto.CanonicalMetadata
import com.scingular.spectrocap.crypto.SecureKeyStore
import kotlinx.coroutines.tasks.await
import java.time.Instant
import java.util.UUID

/**
 * Phase 2B Media Sender (Images + general binary).
 *
 * Extends E2EE sender to support image and binary payloads.
 * Uses same SCAP2A encryption, sealed boxes, and signatures as Phase 2A text.
 */
class MediaSender(
    private val context: Context,
    private val db: FirebaseFirestore,
    private val storage: FirebaseStorage
) {

    private val keyStore = SecureKeyStore(context)
    private val deviceRegistrar = DeviceRegistrar(context, db)

    /**
     * Sends encrypted image message (Phase 2B).
     *
     * Reuses Phase 2A E2EE pipeline with media-specific metadata.
     *
     * @param uid Firebase user ID
     * @param deviceId This device's UUID
     * @param imageData Image to send (bytes, mime, dimensions, filename)
     * @return Message ID if successful
     * @throws Exception if send fails
     */
    suspend fun sendImage(uid: String, deviceId: String, imageData: ImageData): String {
        val plaintextBytes = imageData.bytes
        val messageId = UUID.randomUUID().toString()

        // Step 1: Resolve active recipients
        val recipients = deviceRegistrar.getActiveDeviceIds(uid)
            .sorted()  // Stable order for canonical meta
        if (recipients.isEmpty()) {
            throw IllegalStateException("No active devices to send to")
        }

        // Step 2: Generate DEK + nonce
        val dek = CryptoManager.generateDEK()
        val nonce = CryptoManager.generateNonce()

        // Step 3: Build canonical meta (with media fields)
        val createdAtClient = Instant.now().toString()
        val storagePath = "users/$uid/messages/$messageId.bin"
        val canonicalJson = CanonicalMetadata.createCanonicalJsonForImage(
            messageId = messageId,
            senderDeviceId = deviceId,
            recipients = recipients,
            storagePath = storagePath,
            sizeBytesPlain = plaintextBytes.size,
            createdAtClient = createdAtClient,
            mime = imageData.mime,
            width = imageData.width,
            height = imageData.height,
            filename = imageData.filename,
            ext = imageData.ext
        )

        // Step 4: Compute metaHash
        val metaHash = CanonicalMetadata.computeMetaHash(canonicalJson)

        // Step 5: Sign metaHash
        val privSignKey = keyStore.getSigningPrivateKey()
            ?: throw IllegalStateException("Signing private key not found")
        val signature = CryptoManager.sign(metaHash, privSignKey)

        // Step 6: Encrypt payload with AEAD
        val ciphertext = CryptoManager.encryptAEAD(plaintextBytes, nonce, dek, metaHash)
            ?: throw IllegalStateException("Encryption failed")

        // Step 7: Build blob (magic + nonce + ciphertext)
        val blob = Format.BlobFormat.createBlob(nonce, ciphertext)

        // Step 8: Build per-recipient envelopes
        val envelopes = mutableMapOf<String, String>()
        for (recipientId in recipients) {
            val recipientDevice = deviceRegistrar.getDevice(uid, recipientId)
            val pubBoxKey = recipientDevice["pubBoxKey"] as? String
                ?: throw IllegalStateException("Recipient $recipientId pubBoxKey not found")
            
            val sealedBox = CryptoManager.sealBox(dek, pubBoxKey)
                ?: throw IllegalStateException("SealBox failed for $recipientId")
            
            envelopes[recipientId] = sealedBox
        }

        // Step 9: Upload encrypted blob to Storage
        val storageRef = storage.reference.child(storagePath)
        storageRef.putBytes(blob).await()

        // Step 10: Write Firestore doc with metadata
        val messageDoc = mapOf(
            "messageId" to messageId,
            "senderDeviceId" to deviceId,
            "type" to "image",  // Phase 2B: image type
            "createdAtClient" to createdAtClient,
            "recipients" to recipients,
            "storagePath" to storagePath,
            "mime" to imageData.mime,
            "sizeBytesPlain" to plaintextBytes.size,
            
            // Phase 2A E2EE fields
            "nonce" to Base64.encodeToString(nonce, Base64.NO_WRAP),
            "envelopes" to envelopes.mapValues { (_, sealedBox) ->
                Base64.encodeToString(android.util.Base64.decode(sealedBox, Base64.NO_WRAP), Base64.NO_WRAP)
            },
            "metaHash" to Base64.encodeToString(metaHash, Base64.NO_WRAP),
            "signature" to Base64.encodeToString(android.util.Base64.decode(signature, Base64.NO_WRAP), Base64.NO_WRAP),
            "version" to "2A",
            
            // Phase 2B media fields
            "media" to mapOf(
                "width" to imageData.width,
                "height" to imageData.height,
                "filename" to (imageData.filename ?: ""),
                "ext" to imageData.ext
            ),
            "alg" to mapOf(
                "aead" to "xchacha20poly1305",
                "wrap" to "sealedbox-x25519",
                "sig" to "ed25519"
            )
        )

        db.collection("users/$uid/messages").document(messageId).set(messageDoc).await()

        return messageId
    }
}
