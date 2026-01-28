package com.scingular.spectrocap.crypto

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * Secure local key storage for Phase 2A cryptographic keys.
 *
 * Uses Android's EncryptedSharedPreferences (backed by Keystore) to store:
 * - Ed25519 private key (signing)
 * - X25519 private key (encryption)
 *
 * Public keys are stored unencrypted (they're public).
 */
class SecureKeyStore(context: Context) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val encryptedPrefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        PREFS_NAME,
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    companion object {
        private const val PREFS_NAME = "spectrocap_phase2a_keys"
        private const val KEY_SIGN_PRIVATE = "sign_private_key"
        private const val KEY_SIGN_PUBLIC = "sign_public_key"
        private const val KEY_BOX_PRIVATE = "box_private_key"
        private const val KEY_BOX_PUBLIC = "box_public_key"
    }

    /**
     * Stores signing keypair.
     *
     * @param privateKeyBase64 Ed25519 private key (base64)
     * @param publicKeyBase64 Ed25519 public key (base64)
     */
    fun storeSigningKeys(privateKeyBase64: String, publicKeyBase64: String) {
        encryptedPrefs.edit().apply {
            putString(KEY_SIGN_PRIVATE, privateKeyBase64)
            putString(KEY_SIGN_PUBLIC, publicKeyBase64)
            apply()
        }
    }

    /**
     * Retrieves stored signing private key.
     *
     * @return Ed25519 private key (base64), or null if not found
     */
    fun getSigningPrivateKey(): String? {
        return encryptedPrefs.getString(KEY_SIGN_PRIVATE, null)
    }

    /**
     * Retrieves stored signing public key.
     *
     * @return Ed25519 public key (base64), or null if not found
     */
    fun getSigningPublicKey(): String? {
        return encryptedPrefs.getString(KEY_SIGN_PUBLIC, null)
    }

    /**
     * Stores box keypair (X25519 for encryption).
     *
     * @param privateKeyBase64 X25519 private key (base64)
     * @param publicKeyBase64 X25519 public key (base64)
     */
    fun storeBoxKeys(privateKeyBase64: String, publicKeyBase64: String) {
        encryptedPrefs.edit().apply {
            putString(KEY_BOX_PRIVATE, privateKeyBase64)
            putString(KEY_BOX_PUBLIC, publicKeyBase64)
            apply()
        }
    }

    /**
     * Retrieves stored box private key.
     *
     * @return X25519 private key (base64), or null if not found
     */
    fun getBoxPrivateKey(): String? {
        return encryptedPrefs.getString(KEY_BOX_PRIVATE, null)
    }

    /**
     * Retrieves stored box public key.
     *
     * @return X25519 public key (base64), or null if not found
     */
    fun getBoxPublicKey(): String? {
        return encryptedPrefs.getString(KEY_BOX_PUBLIC, null)
    }

    /**
     * Checks if keys have been generated and stored locally.
     *
     * @return true if both signing and box keys exist
     */
    fun hasKeys(): Boolean {
        return getSigningPrivateKey() != null && getBoxPrivateKey() != null
    }

    /**
     * Clears all stored keys (useful for device reset).
     */
    fun clearKeys() {
        encryptedPrefs.edit().apply {
            remove(KEY_SIGN_PRIVATE)
            remove(KEY_SIGN_PUBLIC)
            remove(KEY_BOX_PRIVATE)
            remove(KEY_BOX_PUBLIC)
            apply()
        }
    }
}
