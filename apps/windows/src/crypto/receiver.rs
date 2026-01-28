/// Phase 2A E2EE Receiver for Windows (Tauri)
/// 
/// Implements full E2EE decryption pipeline:
/// 1. Verify sender device status
/// 2. Verify metaHash integrity
/// 3. Verify Ed25519 signature
/// 4. Decrypt DEK (from sealed box envelope)
/// 5. Download and decrypt blob
/// 6. Return plaintext

use serde_json::Value;
use base64::{Engine, engine::general_purpose};
use super::primitives::CryptoPrimitives;
use super::format::{BlobFormat, CanonicalMetadata};
use super::key_mgmt::KeyManager;
use super::media::ImageValidator;

pub struct E2EEReceiver {
    key_manager: KeyManager,
}

#[derive(Debug)]
pub struct DecryptionResult {
    pub plaintext: Option<String>,  // For text messages (Phase 2A)
    pub image_bytes: Option<Vec<u8>>,  // For image messages (Phase 2B)
    pub message_type: String,  // "text" or "image"
    pub message_id: String,
    pub sender_device_id: String,
}

#[derive(Debug)]
pub struct DecryptionError {
    pub reason: String,
}

impl std::fmt::Display for DecryptionError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Decryption failed: {}", self.reason)
    }
}

impl E2EEReceiver {
    /// Creates receiver with default Windows key storage
    pub fn new() -> Result<Self, DecryptionError> {
        let key_manager = KeyManager::default_windows()
            .map_err(|e| DecryptionError { reason: e })?;

        Ok(E2EEReceiver { key_manager })
    }

    /// Creates receiver with custom key directory
    pub fn with_key_dir(key_dir: &str) -> Result<Self, DecryptionError> {
        let key_manager = KeyManager::new(key_dir)
            .map_err(|e| DecryptionError { reason: e })?;

        Ok(E2EEReceiver { key_manager })
    }

    /// Main decryption pipeline
    /// 
    /// # Arguments
    /// * `message_doc` - Firestore message document (as JSON)
    /// * `this_device_id` - This device's UUID
    /// * `sender_device_doc` - Firestore device document for sender (with pubSignKey, status)
    /// * `blob` - Encrypted blob from Cloud Storage
    /// 
    /// # Returns
    /// DecryptionResult with plaintext, or DecryptionError
    pub fn decrypt_message(
        &self,
        message_doc: &Value,
        this_device_id: &str,
        sender_device_doc: &Value,
        blob: &[u8],
    ) -> Result<DecryptionResult, DecryptionError> {
        // Step 1: Hard checks (schema version, storage format)
        self.hard_checks(message_doc)?;

        // Step 2: Verify sender device
        self.verify_sender_device(sender_device_doc)?;

        // Step 3: Verify metaHash integrity
        let meta_hash = self.verify_meta_hash(message_doc)?;

        // Step 4: Verify signature
        let sender_pub_sign_key = sender_device_doc.get("pubSignKey")
            .and_then(|v| v.as_str())
            .ok_or_else(|| DecryptionError {
                reason: "Missing sender public signing key".to_string(),
            })?;

        self.verify_signature(message_doc, sender_pub_sign_key, &meta_hash)?;

        // Step 5: Obtain envelope for this device
        let dek = self.decrypt_dek(message_doc, this_device_id)?;

        // Step 6: Parse blob
        let (nonce, ciphertext) = BlobFormat::parse_blob(blob)
            .map_err(|e| DecryptionError { reason: e })?;

        // Step 7: Decrypt payload
        let plaintext_bytes = CryptoPrimitives::decrypt_aead(&ciphertext, &nonce, &dek, &meta_hash)
            .ok_or_else(|| DecryptionError {
                reason: "AEAD decryption failed (authentication failed or wrong key)".to_string(),
            })?;

        // Step 8: Determine message type and validate accordingly
        let message_type = message_doc.get("type")
            .and_then(|v| v.as_str())
            .unwrap_or("text")
            .to_string();

        let plaintext_opt = match message_type.as_str() {
            "text" => {
                // Phase 2A: Plain UTF-8 text
                let plaintext = String::from_utf8(plaintext_bytes.clone())
                    .map_err(|e| DecryptionError {
                        reason: format!("Invalid UTF-8 in plaintext: {}", e),
                    })?;
                Some(plaintext)
            },
            "image" => {
                // Phase 2B: Image with magic byte validation
                if !ImageValidator::validate_image_magic(&plaintext_bytes) {
                    return Err(DecryptionError {
                        reason: "Image magic bytes validation failed; payload corrupted or tampered".to_string(),
                    });
                }
                None  // Image bytes will be returned separately
            },
            _ => {
                return Err(DecryptionError {
                    reason: format!("Unsupported message type: {}", message_type),
                });
            }
        };

        let message_id = message_doc.get("messageId")
            .and_then(|v| v.as_str())
            .ok_or_else(|| DecryptionError {
                reason: "Missing messageId".to_string(),
            })?
            .to_string();

        let sender_device_id = message_doc.get("senderDeviceId")
            .and_then(|v| v.as_str())
            .ok_or_else(|| DecryptionError {
                reason: "Missing senderDeviceId".to_string(),
            })?
            .to_string();

        Ok(DecryptionResult {
            plaintext: plaintext_opt,
            image_bytes: if message_type == "image" { Some(plaintext_bytes) } else { None },
            message_type,
            message_id,
            sender_device_id,
        })
    }

    // Private helpers

    fn hard_checks(&self, message_doc: &Value) -> Result<(), DecryptionError> {
        // Check version
        let version = message_doc.get("version")
            .and_then(|v| v.as_str())
            .unwrap_or("");

        if !version.is_empty() && version != "2A" {
            return Err(DecryptionError {
                reason: format!("Only Phase 2A supported, got {}", version),
            });
        }

        // Check storage path ends with .bin
        let storage_path = message_doc.get("storagePath")
            .and_then(|v| v.as_str())
            .ok_or_else(|| DecryptionError {
                reason: "Missing storagePath".to_string(),
            })?;

        if !storage_path.ends_with(".bin") {
            return Err(DecryptionError {
                reason: format!("Expected .bin storage, got {}", storage_path),
            });
        }

        // Check required fields
        for field in &["envelopes", "metaHash", "signature", "nonce"] {
            if message_doc.get(field).is_none() {
                return Err(DecryptionError {
                    reason: format!("Missing required field: {}", field),
                });
            }
        }

        Ok(())
    }

    fn verify_sender_device(&self, sender_device_doc: &Value) -> Result<(), DecryptionError> {
        let status = sender_device_doc.get("status")
            .and_then(|v| v.as_str())
            .unwrap_or("active");

        if status == "revoked" {
            return Err(DecryptionError {
                reason: "Sender device is revoked".to_string(),
            });
        }

        Ok(())
    }

    fn verify_meta_hash(&self, message_doc: &Value) -> Result<Vec<u8>, DecryptionError> {
        // Reconstruct canonical metadata
        let canonical_json = CanonicalMetadata::from_firestore_doc(message_doc)
            .map_err(|e| DecryptionError { reason: e })?;

        // Compute candidate metaHash
        let meta_hash_candidate = CanonicalMetadata::compute_meta_hash(&canonical_json);

        // Compare with Firestore metaHash
        let meta_hash_firestore_b64 = message_doc.get("metaHash")
            .and_then(|v| v.as_str())
            .ok_or_else(|| DecryptionError {
                reason: "Missing metaHash".to_string(),
            })?;

        let meta_hash_firestore = general_purpose::STANDARD.decode(meta_hash_firestore_b64)
            .map_err(|e| DecryptionError {
                reason: format!("Failed to decode metaHash: {}", e),
            })?;

        if meta_hash_candidate != meta_hash_firestore {
            return Err(DecryptionError {
                reason: "metaHash mismatch; metadata tampered".to_string(),
            });
        }

        Ok(meta_hash_firestore)
    }

    fn verify_signature(
        &self,
        message_doc: &Value,
        sender_pub_sign_key_b64: &str,
        meta_hash: &[u8],
    ) -> Result<(), DecryptionError> {
        let signature_b64 = message_doc.get("signature")
            .and_then(|v| v.as_str())
            .ok_or_else(|| DecryptionError {
                reason: "Missing signature".to_string(),
            })?;

        let signature = general_purpose::STANDARD.decode(signature_b64)
            .map_err(|e| DecryptionError {
                reason: format!("Failed to decode signature: {}", e),
            })?;

        let pub_key = general_purpose::STANDARD.decode(sender_pub_sign_key_b64)
            .map_err(|e| DecryptionError {
                reason: format!("Failed to decode public key: {}", e),
            })?;

        if !CryptoPrimitives::verify(meta_hash, &signature, &pub_key) {
            return Err(DecryptionError {
                reason: "Signature verification failed".to_string(),
            });
        }

        Ok(())
    }

    fn decrypt_dek(
        &self,
        message_doc: &Value,
        this_device_id: &str,
    ) -> Result<Vec<u8>, DecryptionError> {
        // Get envelope for this device
        let envelopes = message_doc.get("envelopes")
            .and_then(|v| v.as_object())
            .ok_or_else(|| DecryptionError {
                reason: "Missing envelopes".to_string(),
            })?;

        let envelope_b64 = envelopes.get(this_device_id)
            .and_then(|v| v.as_str())
            .ok_or_else(|| DecryptionError {
                reason: format!("No envelope for device {}; not a recipient", this_device_id),
            })?;

        let envelope = general_purpose::STANDARD.decode(envelope_b64)
            .map_err(|e| DecryptionError {
                reason: format!("Failed to decode envelope: {}", e),
            })?;

        // Retrieve this device's box keys
        let box_pk = self.key_manager.get_box_public_key()
            .map_err(|e| DecryptionError { reason: e })?;

        let box_sk = self.key_manager.get_box_private_key()
            .map_err(|e| DecryptionError { reason: e })?;

        // Decrypt DEK from sealed box
        CryptoPrimitives::open_sealed_box(&envelope, &box_pk, &box_sk)
            .ok_or_else(|| DecryptionError {
                reason: "Failed to decrypt DEK (sealed box open failed)".to_string(),
            })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hard_checks_missing_version() {
        let receiver = E2EEReceiver::new().expect("Failed to create receiver");
        
        let mut doc = serde_json::json!({
            "storagePath": "users/uid/messages/msg-123.bin",
            "envelopes": {},
            "metaHash": "test",
            "signature": "test",
            "nonce": "test"
        });

        // Should pass without version (backwards compatible)
        assert!(receiver.hard_checks(&doc).is_ok());

        // Add invalid version
        doc["version"] = Value::String("1.0".to_string());
        assert!(receiver.hard_checks(&doc).is_err());
    }
}
