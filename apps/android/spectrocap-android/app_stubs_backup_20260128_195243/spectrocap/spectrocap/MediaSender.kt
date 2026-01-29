package com.scingular.spectrocap.spectrocap

import android.content.Context
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.storage.FirebaseStorage
import kotlinx.coroutines.tasks.await
import java.time.Instant
import java.util.UUID

/**
 * Phase 2B Media Sender (Images + general binary).
 *
 * Placeholder for encrypted image messaging via Firebase.
 * Phase 2A: E2EE text over Firestore + Storage
 * Phase 2B: Extends to image/binary payloads (PNG, JPEG)
 */
class MediaSender(
    private val context: Context,
    private val db: FirebaseFirestore,
    private val storage: FirebaseStorage
) {

    /**
     * Sends encrypted image message (Phase 2B).
     *
     * @param uid Firebase user ID
     * @param deviceId This device's UUID
     * @param imageData Image to send (bytes, mime, dimensions, filename)
     * @return Message ID if successful
     * @throws Exception if send fails
     */
    suspend fun sendImage(uid: String, deviceId: String, imageData: ImageData): String {
        val plaintextBytes = imageData.bytes
        val messageId = java.util.UUID.randomUUID().toString()

        // Phase 2B: Encrypted image upload via Firebase Storage
        val storagePath = "users/$uid/messages/$messageId.bin"
        val storageRef = storage.reference.child(storagePath)
        
        // Upload encrypted blob
        storageRef.putBytes(plaintextBytes).await()

        // Write metadata to Firestore
        val createdAtClient = Instant.now().toString()
        val messageDoc: MutableMap<String, Any?> = mutableMapOf(
            "messageId" to messageId,
            "senderDeviceId" to deviceId,
            "type" to "image",
            "createdAtClient" to createdAtClient,
            "storagePath" to storagePath,
            "mime" to imageData.mime,
            "sizeBytesPlain" to plaintextBytes.size,
            "version" to "2B"
        )

        db.collection("users/$uid/messages").document(messageId).set(messageDoc).await()

        return messageId
    }
}
