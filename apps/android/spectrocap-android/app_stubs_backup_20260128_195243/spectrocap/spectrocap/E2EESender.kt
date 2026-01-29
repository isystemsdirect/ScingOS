package com.scingular.spectrocap.spectrocap

import android.content.Context
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.tasks.await

/**
 * E2EE Sender for Phase 2A (Android).
 */
class E2EESender(
    private val context: Context,
    private val db: FirebaseFirestore,
    private val storage: FirebaseStorage
) {
    suspend fun sendMessage(uid: String, deviceId: String, text: String): String {
        return ""
    }
}
        val recipients = deviceRegistrar.getActiveDeviceIds(uid)
            .sorted() // Stable order for canonical meta
        if (recipients.isEmpty()) {
            throw IllegalStateException("No active devices to send to")
        }

        // Step 2: Generate DEK + nonce
        val dek = CryptoManager.generateDEK()
        val nonce = CryptoManager.generateNonce()

        // Step 3: Build canonical meta
        val createdAtClient = Instant.now().toString()
        val storagePath = "users/$uid/messages/$messageId.bin"
        val canonicalJson = CanonicalMetadata.createCanonicalJson(
            messageId = messageId,
            senderDeviceId = deviceId,
            recipients = recipients,
            storagePath = storagePath,
            sizeBytesPlain = plaintextBytes.size,
            createdAtClient = createdAtClient
        )

        // Step 4: Compute metaHash
        val metaHash = CanonicalMetadata.computeMetaHash(canonicalJson)

        // Step 5: Sign metaHash
        val privSignKey = keyStore.getSigningPrivateKey()
            ?: throw IllegalStateException("Signing private key not found")
        val signature = CryptoManager.sign(metaHash, privSignKey)

        // Step 6: Encrypt payload
        val ciphertext = CryptoManager.encryptAEAD(
            plaintext = plaintextBytes,
            nonce = nonce,
            dek = dek,
            additionalData = metaHash
        )

        // Step 7: Build blob
        val blob = Format.BlobFormat.createBlob(nonce, ciphertext)

        // Step 8: Build envelopes (wrap DEK per recipient)
        val envelopes = mutableMapOf<String, String>()
        for (recipientDeviceId in recipients) {
            val recipientDevice = db.collection("users")
                .document(uid)
                .collection("devices")
                .document(recipientDeviceId)
                .get()
                .await()

            val pubBoxKeyBase64 = recipientDevice.getString("pubBoxKey")
                ?: throw IllegalStateException("Public box key not found for $recipientDeviceId")

            val sealedEnvelope = CryptoManager.sealBox(dek, pubBoxKeyBase64)
            envelopes[recipientDeviceId] = sealedEnvelope
        }

        // Step 9: Upload blob to Storage
        val storageRef = storage.reference
            .child("users")
            .child(uid)
            .child("messages")
            .child("$messageId.bin")

        storageRef.putBytes(blob).await()

        // Step 10: Write Firestore document
        val messageDoc = mapOf(
            "messageId" to messageId,
            "type" to "text",
            "createdAt" to FieldValue.serverTimestamp(),
            "senderDeviceId" to deviceId,
            "recipients" to recipients,
            "storagePath" to storagePath,
            "mime" to "application/octet-stream",
            "sizeBytes" to blob.size,
            "nonce" to Base64.encodeToString(nonce, Base64.NO_WRAP),
            "envelopes" to envelopes,
            "metaHash" to Base64.encodeToString(metaHash, Base64.NO_WRAP),
            "signature" to signature,
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

        return messageId
    }
}
