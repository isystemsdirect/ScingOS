package com.scingular.spectrocap.device

import com.google.firebase.firestore.FieldValue
import com.google.firebase.firestore.serverTimestamp
import com.scingular.spectrocap.firebase.FirebaseClient
import kotlinx.coroutines.tasks.await

/**
 * Device Registrar
 * 
 * Registers device in Firestore at /users/{uid}/devices/{deviceId}
 * SpectroCAP™ Phase 1 — Android Kotlin Client
 */
object DeviceRegistrar {
    
    /**
     * Device document structure (matches Lane 3 Firestore schema)
     */
    data class DeviceDoc(
        val deviceId: String,
        val name: String,
        val platform: String = "android",
        val createdAt: FieldValue = serverTimestamp(),
        val lastSeenAt: FieldValue = serverTimestamp(),
        val status: String = "active"
    )
    
    /**
     * Register or update device in Firestore
     */
    suspend fun registerDevice(
        uid: String,
        deviceId: String,
        name: String = "Android Client"
    ): Result<Unit> = runCatching {
        val deviceDoc = DeviceDoc(
            deviceId = deviceId,
            name = name,
            platform = "android",
            createdAt = serverTimestamp(),
            lastSeenAt = serverTimestamp(),
            status = "active"
        )
        
        FirebaseClient.firestore
            .collection("users")
            .document(uid)
            .collection("devices")
            .document(deviceId)
            .set(deviceDoc)
            .await()
    }
    
    /**
     * Update device lastSeenAt timestamp
     */
    suspend fun updateLastSeen(uid: String, deviceId: String): Result<Unit> = runCatching {
        FirebaseClient.firestore
            .collection("users")
            .document(uid)
            .collection("devices")
            .document(deviceId)
            .update("lastSeenAt", serverTimestamp())
            .await()
    }
}
