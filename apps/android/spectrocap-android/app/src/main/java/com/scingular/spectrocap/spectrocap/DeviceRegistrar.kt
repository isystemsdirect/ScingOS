package com.scingular.spectrocap.spectrocap

import android.content.Context
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.FieldValue
import com.scingular.spectrocap.crypto.CryptoManager
import com.scingular.spectrocap.crypto.SecureKeyStore
import kotlinx.coroutines.tasks.await
import java.util.UUID
import java.util.Date

/**
 * Manages device key generation and registration (Phase 2A).
 *
 * On first login per device:
 * 1. Generate Ed25519 and X25519 keypairs
 * 2. Store private keys locally (encrypted)
 * 3. Upload public keys to Firestore
 */
class DeviceRegistrar(private val context: Context, private val db: FirebaseFirestore) {

    private val keyStore = SecureKeyStore(context)

    /**
     * Registers device with crypto keys (Phase 2A).
     *
     * If keys already exist locally, uploads public keys to Firestore.
     * If keys don't exist, generates them first.
     *
     * @param uid Firebase user ID
     * @param deviceName User-friendly device name (e.g., "My Phone")
     * @param platform Device platform ("android" or "windows")
     * @return Device ID (UUID)
     * @throws Exception if registration fails
     */
    suspend fun registerDevice(uid: String, deviceName: String, platform: String = "android"): String {
        // Generate or retrieve device ID
        val deviceId = UUID.randomUUID().toString()

        // Check if keys already exist locally
        if (!keyStore.hasKeys()) {
            // Generate new keypairs
            val (signPriv, signPub) = CryptoManager.generateSigningKeypair()
            val (boxPriv, boxPub) = CryptoManager.generateBoxKeypair()

            // Store private keys locally (encrypted)
            keyStore.storeSigningKeys(signPriv, signPub)
            keyStore.storeBoxKeys(boxPriv, boxPub)
        }

        // Retrieve public keys
        val pubSignKey = keyStore.getSigningPublicKey()
            ?: throw IllegalStateException("Signing public key not found")
        val pubBoxKey = keyStore.getBoxPublicKey()
            ?: throw IllegalStateException("Box public key not found")

        // Upload device doc to Firestore
        val deviceDoc = mapOf(
            "deviceId" to deviceId,
            "platform" to platform,
            "name" to deviceName,
            "createdAt" to FieldValue.serverTimestamp(),
            "lastSeenAt" to FieldValue.serverTimestamp(),
            "status" to "active",
            "pubSignKey" to pubSignKey,
            "pubBoxKey" to pubBoxKey
        )

        db.collection("users")
            .document(uid)
            .collection("devices")
            .document(deviceId)
            .set(deviceDoc)
            .await()

        return deviceId
    }

    /**
     * Updates lastSeenAt timestamp for this device.
     *
     * Call this periodically (e.g., on app resume) to keep device active.
     *
     * @param uid Firebase user ID
     * @param deviceId Device ID (UUID)
     */
    suspend fun updateLastSeen(uid: String, deviceId: String) {
        db.collection("users")
            .document(uid)
            .collection("devices")
            .document(deviceId)
            .update("lastSeenAt", FieldValue.serverTimestamp())
            .await()
    }

    /**
     * Revokes this device (sets status to "revoked").
     *
     * After revocation:
     * - No new messages will be sent to this device
     * - Existing messages cannot be decrypted by this device
     *
     * @param uid Firebase user ID
     * @param deviceId Device ID (UUID)
     */
    suspend fun revokeDevice(uid: String, deviceId: String) {
        db.collection("users")
            .document(uid)
            .collection("devices")
            .document(deviceId)
            .update("status", "revoked")
            .await()
    }

    /**
     * Retrieves device list for a user (all devices).
     *
     * @param uid Firebase user ID
     * @return List of device maps from Firestore
     */
    suspend fun getDevices(uid: String): List<Map<String, Any>> {
        val snapshot = db.collection("users")
            .document(uid)
            .collection("devices")
            .get()
            .await()

        return snapshot.documents.map { doc -> doc.data ?: mapOf() }
    }

    /**
     * Retrieves active devices for a user (for recipient list).
     *
     * @param uid Firebase user ID
     * @return List of active device UUIDs
     */
    suspend fun getActiveDeviceIds(uid: String): List<String> {
        val snapshot = db.collection("users")
            .document(uid)
            .collection("devices")
            .whereEqualTo("status", "active")
            .get()
            .await()

        return snapshot.documents.mapNotNull { doc ->
            doc.getString("deviceId")
        }
    }

    /**
     * Retrieves this device's ID (if registered).
     *
     * @param uid Firebase user ID
     * @return Device ID (UUID) if found, null otherwise
     */
    suspend fun getThisDeviceId(uid: String): String? {
        // In a real app, this would be stored locally or passed from login flow
        // For now, we'll return the first device registered (assumes single device per user in Phase 2A)
        val devices = getDevices(uid)
        return devices.firstOrNull()?.get("deviceId") as? String
    }

    /**
     * Clears local keys (use only for device reset/uninstall).
     */
    fun clearLocalKeys() {
        keyStore.clearKeys()
    }
}
