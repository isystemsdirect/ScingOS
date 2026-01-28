package com.scingular.spectrocap.crypto

import android.util.Base64
import com.goterl.lazysodium.LazySodiumAndroid
import com.goterl.lazysodium.SodiumAndroid
import com.goterl.lazysodium.interfaces.Box
import com.goterl.lazysodium.interfaces.Sign
import com.goterl.lazysodium.interfaces.AEAD
import com.goterl.lazysodium.utils.Key
import com.goterl.lazysodium.utils.KeyPair

/**
 * Wrapper around LazySodium for Phase 2A E2EE cryptographic operations.
 *
 * Handles:
 * - Ed25519 key generation (signing)
 * - X25519 key generation (encryption)
 * - XChaCha20-Poly1305 AEAD encryption/decryption
 * - X25519 sealed box encryption/decryption
 *
 * Thread-safe singleton.
 */
object CryptoManager {
    private val lazySodium = LazySodiumAndroid(SodiumAndroid())

    /**
     * Generates Ed25519 keypair for signing.
     *
     * @return Pair of (privateKey base64, publicKey base64)
     */
    fun generateSigningKeypair(): Pair<String, String> {
        val keyPair: KeyPair = lazySodium.cryptoSignKeypair()
        val privKey = Base64.encodeToString(keyPair.secretKey.asBytes, Base64.NO_WRAP)
        val pubKey = Base64.encodeToString(keyPair.publicKey.asBytes, Base64.NO_WRAP)
        return Pair(privKey, pubKey)
    }

    /**
     * Generates X25519 keypair for encryption (sealed box).
     *
     * @return Pair of (privateKey base64, publicKey base64)
     */
    fun generateBoxKeypair(): Pair<String, String> {
        val keyPair: KeyPair = lazySodium.cryptoBoxKeypair()
        val privKey = Base64.encodeToString(keyPair.secretKey.asBytes, Base64.NO_WRAP)
        val pubKey = Base64.encodeToString(keyPair.publicKey.asBytes, Base64.NO_WRAP)
        return Pair(privKey, pubKey)
    }

    /**
     * Generates random 32-byte DEK (Data Encryption Key).
     *
     * @return DEK as base64 string
     */
    fun generateDEK(): ByteArray {
        val dek = ByteArray(32)
        lazySodium.randomBuffer(dek)
        return dek
    }

    /**
     * Generates random 24-byte nonce for XChaCha20-Poly1305.
     *
     * @return Nonce as ByteArray
     */
    fun generateNonce(): ByteArray {
        val nonce = ByteArray(24) // XChaCha20 nonce size
        lazySodium.randomBuffer(nonce)
        return nonce
    }

    /**
     * Signs a message using Ed25519.
     *
     * @param message Message to sign (typically metaHash)
     * @param privateKeyBase64 Ed25519 private key (base64)
     * @return Signature (64 bytes) as base64
     */
    fun sign(message: ByteArray, privateKeyBase64: String): String {
        val privKeyBytes = Base64.decode(privateKeyBase64, Base64.NO_WRAP)
        val privKey = Key.fromBytes(privKeyBytes)
        val signature = lazySodium.cryptoSign(message, privKey)
        return Base64.encodeToString(signature, Base64.NO_WRAP)
    }

    /**
     * Verifies an Ed25519 signature.
     *
     * @param message Original message
     * @param signatureBase64 Signature (base64)
     * @param publicKeyBase64 Ed25519 public key (base64)
     * @return true if valid, false otherwise
     */
    fun verify(message: ByteArray, signatureBase64: String, publicKeyBase64: String): Boolean {
        return try {
            val signatureBytes = Base64.decode(signatureBase64, Base64.NO_WRAP)
            val pubKeyBytes = Base64.decode(publicKeyBase64, Base64.NO_WRAP)
            val pubKey = Key.fromBytes(pubKeyBytes)
            lazySodium.cryptoSignOpen(signatureBytes, pubKey)
            true
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Encrypts plaintext using XChaCha20-Poly1305 AEAD.
     *
     * @param plaintext Message to encrypt
     * @param nonce 24-byte nonce
     * @param dek 32-byte Data Encryption Key
     * @param additionalData AAD (Associated Authenticated Data), typically metaHash
     * @return Ciphertext as ByteArray
     */
    fun encryptAEAD(
        plaintext: ByteArray,
        nonce: ByteArray,
        dek: ByteArray,
        additionalData: ByteArray
    ): ByteArray {
        val dekKey = Key.fromBytes(dek)
        return lazySodium.cryptoAeadXChaCha20Poly1305IETFEncrypt(
            plaintext,
            additionalData,
            dekKey,
            nonce
        )
    }

    /**
     * Decrypts ciphertext using XChaCha20-Poly1305 AEAD.
     *
     * @param ciphertext Encrypted message
     * @param nonce 24-byte nonce (must match encryption)
     * @param dek 32-byte Data Encryption Key (must match encryption)
     * @param additionalData AAD (must match encryption)
     * @return Plaintext as ByteArray, or null if decryption fails
     */
    fun decryptAEAD(
        ciphertext: ByteArray,
        nonce: ByteArray,
        dek: ByteArray,
        additionalData: ByteArray
    ): ByteArray? {
        return try {
            val dekKey = Key.fromBytes(dek)
            lazySodium.cryptoAeadXChaCha20Poly1305IETFDecrypt(
                ciphertext,
                additionalData,
                dekKey,
                nonce
            )
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Encrypts DEK using X25519 sealed box (for a specific recipient).
     *
     * @param dek 32-byte Data Encryption Key to wrap
     * @param recipientPublicKeyBase64 X25519 public key of recipient (base64)
     * @return Sealed box (encrypted DEK) as base64
     */
    fun sealBox(dek: ByteArray, recipientPublicKeyBase64: String): String {
        val pubKeyBytes = Base64.decode(recipientPublicKeyBase64, Base64.NO_WRAP)
        val pubKey = Key.fromBytes(pubKeyBytes)
        val sealedBox = lazySodium.cryptoBoxSealedEncrypt(dek, pubKey)
        return Base64.encodeToString(sealedBox, Base64.NO_WRAP)
    }

    /**
     * Decrypts sealed box to retrieve DEK.
     *
     * @param sealedBoxBase64 Sealed box (base64)
     * @param publicKeyBase64 X25519 public key (base64)
     * @param privateKeyBase64 X25519 private key (base64)
     * @return Decrypted DEK (32 bytes) as ByteArray, or null if decryption fails
     */
    fun unsealBox(
        sealedBoxBase64: String,
        publicKeyBase64: String,
        privateKeyBase64: String
    ): ByteArray? {
        return try {
            val sealedBoxBytes = Base64.decode(sealedBoxBase64, Base64.NO_WRAP)
            val pubKeyBytes = Base64.decode(publicKeyBase64, Base64.NO_WRAP)
            val privKeyBytes = Base64.decode(privateKeyBase64, Base64.NO_WRAP)

            val pubKey = Key.fromBytes(pubKeyBytes)
            val privKey = Key.fromBytes(privKeyBytes)

            lazySodium.cryptoBoxSealedDecrypt(sealedBoxBytes, pubKey, privKey)
        } catch (e: Exception) {
            null
        }
    }

    /**
     * Computes SHA256 hash.
     *
     * @param data Input data
     * @return Hash as ByteArray (32 bytes)
     */
    fun sha256(data: ByteArray): ByteArray {
        val hash = ByteArray(32)
        lazySodium.cryptoHashSha256(hash, data, data.size.toLong())
        return hash
    }
}
