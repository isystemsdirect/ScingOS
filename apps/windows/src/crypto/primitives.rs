/// Low-level cryptographic primitives using sodiumoxide
/// 
/// Wraps libsodium calls for:
/// - Ed25519 signing
/// - X25519 key derivation (sealed box)
/// - XChaCha20-Poly1305 AEAD
/// - SHA256 hashing

use sodiumoxide::crypto::{sign, box_, aead};
use sodiumoxide::randombytes;
use sha2::{Sha256, Digest};

pub struct CryptoPrimitives;

impl CryptoPrimitives {
    /// Initialize sodiumoxide (must be called once at startup)
    pub fn init() {
        sodiumoxide::init().expect("Failed to initialize sodiumoxide");
    }

    /// Generates Ed25519 keypair for signing
    /// 
    /// # Returns
    /// Tuple of (secret_key_bytes, public_key_bytes)
    pub fn gen_sign_keypair() -> (Vec<u8>, Vec<u8>) {
        let (pk, sk) = sign::gen_keypair();
        (sk.as_ref().to_vec(), pk.as_ref().to_vec())
    }

    /// Generates X25519 keypair for encryption
    /// 
    /// # Returns
    /// Tuple of (secret_key_bytes, public_key_bytes)
    pub fn gen_box_keypair() -> (Vec<u8>, Vec<u8>) {
        let (pk, sk) = box_::gen_keypair();
        (sk.as_ref().to_vec(), pk.as_ref().to_vec())
    }

    /// Generates random 32-byte DEK (Data Encryption Key)
    pub fn gen_dek() -> Vec<u8> {
        randombytes::randombytes(32)
    }

    /// Generates random 24-byte nonce for XChaCha20-Poly1305
    pub fn gen_nonce() -> Vec<u8> {
        randombytes::randombytes(24)
    }

    /// Signs a message using Ed25519
    /// 
    /// # Arguments
    /// * `message` - Data to sign (typically metaHash)
    /// * `sk_bytes` - Secret key bytes (32 bytes)
    /// 
    /// # Returns
    /// Signature (64 bytes)
    pub fn sign(message: &[u8], sk_bytes: &[u8]) -> Result<Vec<u8>, String> {
        let sk = sign::SecretKey::from_slice(sk_bytes)
            .ok_or_else(|| "Invalid secret key".to_string())?;
        Ok(sign::sign(message, &sk).as_ref().to_vec())
    }

    /// Verifies an Ed25519 signature
    /// 
    /// # Arguments
    /// * `message` - Original message
    /// * `signature` - Signature (64 bytes)
    /// * `pk_bytes` - Public key bytes (32 bytes)
    /// 
    /// # Returns
    /// true if valid, false otherwise
    pub fn verify(message: &[u8], signature: &[u8], pk_bytes: &[u8]) -> bool {
        let pk = match sign::PublicKey::from_slice(pk_bytes) {
            Some(k) => k,
            None => return false,
        };
        let sig = match sign::Signature::from_slice(signature) {
            Some(s) => s,
            None => return false,
        };
        sign::verify(&sig, message, &pk).is_ok()
    }

    /// Encrypts using XChaCha20-Poly1305 AEAD
    /// 
    /// # Arguments
    /// * `plaintext` - Message to encrypt
    /// * `nonce` - 24-byte nonce
    /// * `dek` - 32-byte Data Encryption Key
    /// * `aad` - Additional Authenticated Data (typically metaHash)
    /// 
    /// # Returns
    /// Ciphertext with authentication tag prepended
    pub fn encrypt_aead(
        plaintext: &[u8],
        nonce: &[u8],
        dek: &[u8],
        aad: &[u8],
    ) -> Result<Vec<u8>, String> {
        let key = aead::xchacha20poly1305_ietf::Key::from_slice(dek)
            .ok_or_else(|| "Invalid DEK length".to_string())?;
        
        let nonce_obj = aead::xchacha20poly1305_ietf::Nonce::from_slice(nonce)
            .ok_or_else(|| "Invalid nonce length".to_string())?;

        Ok(aead::xchacha20poly1305_ietf::seal(plaintext, Some(aad), &nonce_obj, &key))
    }

    /// Decrypts using XChaCha20-Poly1305 AEAD
    /// 
    /// # Arguments
    /// * `ciphertext` - Encrypted data with tag
    /// * `nonce` - 24-byte nonce (must match encryption)
    /// * `dek` - 32-byte Data Encryption Key (must match encryption)
    /// * `aad` - Additional Authenticated Data (must match encryption)
    /// 
    /// # Returns
    /// Plaintext if decryption succeeds, None otherwise
    pub fn decrypt_aead(
        ciphertext: &[u8],
        nonce: &[u8],
        dek: &[u8],
        aad: &[u8],
    ) -> Option<Vec<u8>> {
        let key = aead::xchacha20poly1305_ietf::Key::from_slice(dek)?;
        let nonce_obj = aead::xchacha20poly1305_ietf::Nonce::from_slice(nonce)?;
        
        aead::xchacha20poly1305_ietf::open(ciphertext, Some(aad), &nonce_obj, &key).ok()
    }

    /// Encrypts data using X25519 sealed box (for a specific recipient)
    /// 
    /// # Arguments
    /// * `plaintext` - Data to encrypt (typically DEK)
    /// * `pk_bytes` - Recipient's public key (32 bytes)
    /// 
    /// # Returns
    /// Sealed box (48 bytes overhead + plaintext)
    pub fn seal_box(plaintext: &[u8], pk_bytes: &[u8]) -> Result<Vec<u8>, String> {
        let pk = box_::PublicKey::from_slice(pk_bytes)
            .ok_or_else(|| "Invalid public key".to_string())?;
        Ok(box_::seal(plaintext, &pk))
    }

    /// Decrypts data using X25519 sealed box
    /// 
    /// # Arguments
    /// * `ciphertext` - Sealed box
    /// * `pk_bytes` - Recipient's public key (32 bytes)
    /// * `sk_bytes` - Recipient's secret key (32 bytes)
    /// 
    /// # Returns
    /// Plaintext if decryption succeeds, None otherwise
    pub fn open_sealed_box(
        ciphertext: &[u8],
        pk_bytes: &[u8],
        sk_bytes: &[u8],
    ) -> Option<Vec<u8>> {
        let pk = box_::PublicKey::from_slice(pk_bytes)?;
        let sk = box_::SecretKey::from_slice(sk_bytes)?;
        box_::open_sealed(ciphertext, &pk, &sk).ok()
    }

    /// Computes SHA256 hash
    pub fn sha256(data: &[u8]) -> Vec<u8> {
        let mut hasher = Sha256::new();
        hasher.update(data);
        hasher.finalize().to_vec()
    }
}
