/// Phase 2A blob format and canonical JSON utilities

use serde_json::{json, Value};
use super::primitives::CryptoPrimitives;

pub struct BlobFormat;

impl BlobFormat {
    const MAGIC: &'static [u8] = b"SCAP2A";
    const MAGIC_LEN: usize = 6;
    const NONCE_LEN: usize = 24;

    /// Creates Phase 2A blob from components
    /// 
    /// Format: [Magic (6 bytes)] + [Nonce (24 bytes)] + [Ciphertext (variable)]
    /// 
    /// # Arguments
    /// * `nonce` - 24-byte nonce
    /// * `ciphertext` - Encrypted payload with AEAD tag
    /// 
    /// # Returns
    /// Complete blob
    pub fn create_blob(nonce: &[u8], ciphertext: &[u8]) -> Result<Vec<u8>, String> {
        if nonce.len() != Self::NONCE_LEN {
            return Err(format!("Nonce must be {} bytes", Self::NONCE_LEN));
        }

        let mut blob = Vec::with_capacity(Self::MAGIC_LEN + Self::NONCE_LEN + ciphertext.len());
        blob.extend_from_slice(Self::MAGIC);
        blob.extend_from_slice(nonce);
        blob.extend_from_slice(ciphertext);

        Ok(blob)
    }

    /// Parses Phase 2A blob into components
    /// 
    /// # Returns
    /// Tuple of (nonce, ciphertext), or error if parsing fails
    pub fn parse_blob(blob: &[u8]) -> Result<(Vec<u8>, Vec<u8>), String> {
        if blob.len() < Self::MAGIC_LEN + Self::NONCE_LEN {
            return Err("Blob too short".to_string());
        }

        // Verify magic
        if &blob[0..Self::MAGIC_LEN] != Self::MAGIC {
            return Err("Invalid blob magic".to_string());
        }

        let nonce = blob[Self::MAGIC_LEN..Self::MAGIC_LEN + Self::NONCE_LEN].to_vec();
        let ciphertext = blob[Self::MAGIC_LEN + Self::NONCE_LEN..].to_vec();

        Ok((nonce, ciphertext))
    }
}

/// Canonical metadata for Phase 2A (stable JSON key order)
pub struct CanonicalMetadata;

impl CanonicalMetadata {
    /// Creates canonical metadata JSON (alphabetical key order)
    /// 
    /// Order (ALPHABETICAL):
    /// - alg
    /// - createdAtClient
    /// - messageId
    /// - mime
    /// - recipients (sorted array)
    /// - senderDeviceId
    /// - sizeBytesPlain
    /// - storagePath
    /// - type
    /// - version
    pub fn create_canonical_json(
        message_id: &str,
        sender_device_id: &str,
        recipients: &[String],
        storage_path: &str,
        size_bytes_plain: usize,
        created_at_client: &str,
    ) -> String {
        let mut sorted_recipients = recipients.to_vec();
        sorted_recipients.sort();

        // Build in alphabetical order
        let mut map = serde_json::Map::new();
        map.insert("alg".to_string(), json!("xchacha20poly1305+sealedbox-x25519+ed25519"));
        map.insert("createdAtClient".to_string(), json!(created_at_client));
        map.insert("messageId".to_string(), json!(message_id));
        map.insert("mime".to_string(), json!("application/octet-stream"));
        map.insert("recipients".to_string(), json!(sorted_recipients));
        map.insert("senderDeviceId".to_string(), json!(sender_device_id));
        map.insert("sizeBytesPlain".to_string(), json!(size_bytes_plain));
        map.insert("storagePath".to_string(), json!(storage_path));
        map.insert("type".to_string(), json!("text"));
        map.insert("version".to_string(), json!("2A"));

        serde_json::to_string(&Value::Object(map)).expect("Failed to serialize")
    }

    /// Computes metaHash = SHA256(canonicalJson)
    pub fn compute_meta_hash(canonical_json: &str) -> Vec<u8> {
        CryptoPrimitives::sha256(canonical_json.as_bytes())
    }

    /// Verifies metaHash by recomputing and comparing
    pub fn verify_meta_hash(canonical_json: &str, meta_hash_expected: &[u8]) -> bool {
        let computed = Self::compute_meta_hash(canonical_json);
        computed == meta_hash_expected
    }

    /// Reconstructs canonical JSON from Firestore document
    /// (for verification on receiver side)
    pub fn from_firestore_doc(doc: &Value) -> Result<String, String> {
        let message_id = doc.get("messageId")
            .and_then(|v| v.as_str())
            .ok_or("Missing messageId")?;
        
        let sender_device_id = doc.get("senderDeviceId")
            .and_then(|v| v.as_str())
            .ok_or("Missing senderDeviceId")?;
        
        let recipients = doc.get("recipients")
            .and_then(|v| v.as_array())
            .ok_or("Missing recipients")?
            .iter()
            .filter_map(|v| v.as_str().map(String::from))
            .collect::<Vec<_>>();
        
        let storage_path = doc.get("storagePath")
            .and_then(|v| v.as_str())
            .ok_or("Missing storagePath")?;
        
        let size_bytes_plain = doc.get("sizeBytesPlain")
            .and_then(|v| v.as_u64())
            .ok_or("Missing sizeBytesPlain")? as usize;
        
        let created_at_client = doc.get("createdAtClient")
            .and_then(|v| v.as_str())
            .ok_or("Missing createdAtClient")?;

        Ok(Self::create_canonical_json(
            message_id,
            sender_device_id,
            &recipients,
            storage_path,
            size_bytes_plain,
            created_at_client,
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_canonical_json_alphabetical() {
        let json = CanonicalMetadata::create_canonical_json(
            "msg-123",
            "dev-456",
            &["dev-456".to_string(), "dev-789".to_string()],
            "users/uid/messages/msg-123.bin",
            100,
            "2026-01-28T16:45:00Z",
        );

        // Verify it contains expected fields in order
        assert!(json.contains("\"alg\""));
        assert!(json.contains("\"version\""));
        
        // Alphabetical order check via JSON parsing
        let parsed: serde_json::Map<String, Value> = serde_json::from_str(&json)
            .expect("Valid JSON");
        let keys: Vec<_> = parsed.keys().cloned().collect();
        let mut sorted_keys = keys.clone();
        sorted_keys.sort();
        assert_eq!(keys, sorted_keys, "Keys not in alphabetical order");
    }
}
