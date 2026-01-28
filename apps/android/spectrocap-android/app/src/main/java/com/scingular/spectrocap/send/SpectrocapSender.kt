package com.scingular.spectrocap.send

import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.serverTimestamp
import com.google.firebase.storage.StorageReference
import com.scingular.spectrocap.firebase.FirebaseClient
import kotlinx.coroutines.tasks.await
import java.util.UUID

/**
 * SpectroCAP Sender
 * 
 * Sends clipboard text to Firebase:
 * - Upload plaintext to Storage: users/{uid}/messages/{messageId}.txt
 * - Create Firestore doc: /users/{uid}/messages/{messageId}
 * SpectroCAP™ Phase 1 — Android Kotlin Client
 */
object SpectrocapSender {
    
    /**
     * Message document structure (matches Lane 3 Firestore schema)
     */
    data class MessageDoc(
        val messageId: String,
        val senderDeviceId: String,
        val type: String = "text",
        val createdAt: FieldValue = serverTimestamp(),
        val recipients: String = "all",
        val storagePath: String,
        val mime: String = "text/plain",
        val sizeBytes: Int
    )
    
    /**
     * Send clipboard text to Firebase
     */
    suspend fun sendClipboardText(
        uid: String,
        senderDeviceId: String,
        text: String
    ): Result<String> = runCatching {
        // Step 1: Generate message ID
        val messageId = UUID.randomUUID().toString()
        
        // Step 2: Convert text to bytes
        val bytes = text.toByteArray(Charsets.UTF_8)
        val sizeBytes = bytes.size
        
        // Step 3: Upload to Storage
        val storagePath = "users/$uid/messages/$messageId.txt"
        val storageRef = FirebaseClient.storage.reference.child(storagePath)
        
        storageRef.putBytes(bytes).await()
        
        // Step 4: Create Firestore message document
        val messageDoc = MessageDoc(
            messageId = messageId,
            senderDeviceId = senderDeviceId,
            type = "text",
            createdAt = serverTimestamp(),
            recipients = "all",
            storagePath = storagePath,
            mime = "text/plain",
            sizeBytes = sizeBytes
        )
        
        FirebaseClient.firestore
            .collection("users")
            .document(uid)
            .collection("messages")
            .document(messageId)
            .set(messageDoc)
            .await()
        
        // Step 5: Return message ID
        messageId
    }
}
