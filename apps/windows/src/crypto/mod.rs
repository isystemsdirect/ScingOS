/// Phase 2A: End-to-End Encryption module for Windows (Tauri)
///
/// Handles all cryptographic operations:
/// - Ed25519 signing/verification
/// - X25519 key wrapping (sealed box)
/// - XChaCha20-Poly1305 AEAD encryption/decryption
/// - DPAPI-based key storage (Windows)
///
/// All crypto operations use sodiumoxide for safe libsodium bindings.

pub mod key_mgmt;
pub mod format;
pub mod primitives;
pub mod receiver;
pub mod media;

pub use key_mgmt::KeyManager;
pub use format::BlobFormat;
pub use primitives::CryptoPrimitives;
pub use receiver::E2EEReceiver;
pub use media::{ImageValidator, ClipboardImage};

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_blob_format_roundtrip() {
        let nonce = vec![0u8; 24];
        let ciphertext = b"test ciphertext".to_vec();
        
        let blob = BlobFormat::create_blob(&nonce, &ciphertext)
            .expect("Failed to create blob");
        
        let (n, c) = BlobFormat::parse_blob(&blob)
            .expect("Failed to parse blob");
        
        assert_eq!(nonce, n);
        assert_eq!(ciphertext, c);
    }
}
