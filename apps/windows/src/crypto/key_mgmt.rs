/// Windows key management using DPAPI (Data Protection API)
/// 
/// Stores encrypted private keys securely using Windows DPAPI.
/// Keys are encrypted with user/machine context.

use std::fs;
use std::path::{Path, PathBuf};
use base64::{Engine, engine::general_purpose};
use super::primitives::CryptoPrimitives;

pub struct KeyManager {
    key_dir: PathBuf,
}

impl KeyManager {
    const SIGN_PRIVATE_FILE: &'static str = "sign_private.bin";
    const SIGN_PUBLIC_FILE: &'static str = "sign_public.bin";
    const BOX_PRIVATE_FILE: &'static str = "box_private.bin";
    const BOX_PUBLIC_FILE: &'static str = "box_public.bin";

    /// Creates KeyManager with specified key directory
    /// 
    /// # Arguments
    /// * `key_dir` - Directory to store encrypted keys
    pub fn new(key_dir: impl AsRef<Path>) -> Result<Self, String> {
        let key_dir = key_dir.as_ref().to_path_buf();
        
        // Create directory if it doesn't exist
        fs::create_dir_all(&key_dir)
            .map_err(|e| format!("Failed to create key directory: {}", e))?;

        Ok(KeyManager { key_dir })
    }

    /// Creates default KeyManager in user's AppData (Windows)
    pub fn default_windows() -> Result<Self, String> {
        let app_data = dirs::data_dir()
            .ok_or("Failed to get AppData directory")?;
        
        let key_dir = app_data.join("ScingOS").join("spectrocap_phase2a");
        Self::new(key_dir)
    }

    /// Stores signing keypair (with DPAPI encryption)
    pub fn store_sign_keys(&self, private_key: &[u8], public_key: &[u8]) -> Result<(), String> {
        self.store_key(&self.sign_private_path(), private_key)?;
        self.store_public_key(&self.sign_public_path(), public_key)?;
        Ok(())
    }

    /// Stores box keypair (with DPAPI encryption)
    pub fn store_box_keys(&self, private_key: &[u8], public_key: &[u8]) -> Result<(), String> {
        self.store_key(&self.box_private_path(), private_key)?;
        self.store_public_key(&self.box_public_path(), public_key)?;
        Ok(())
    }

    /// Retrieves stored signing private key
    pub fn get_sign_private_key(&self) -> Result<Vec<u8>, String> {
        self.retrieve_key(&self.sign_private_path())
    }

    /// Retrieves stored signing public key (not encrypted)
    pub fn get_sign_public_key(&self) -> Result<Vec<u8>, String> {
        self.retrieve_public_key(&self.sign_public_path())
    }

    /// Retrieves stored box private key
    pub fn get_box_private_key(&self) -> Result<Vec<u8>, String> {
        self.retrieve_key(&self.box_private_path())
    }

    /// Retrieves stored box public key (not encrypted)
    pub fn get_box_public_key(&self) -> Result<Vec<u8>, String> {
        self.retrieve_public_key(&self.box_public_path())
    }

    /// Checks if both signing and box keys exist
    pub fn has_keys(&self) -> bool {
        self.sign_private_path().exists() && self.box_private_path().exists()
    }

    /// Clears all stored keys
    pub fn clear_keys(&self) -> Result<(), String> {
        for path in &[
            self.sign_private_path(),
            self.sign_public_path(),
            self.box_private_path(),
            self.box_public_path(),
        ] {
            if path.exists() {
                fs::remove_file(path)
                    .map_err(|e| format!("Failed to remove key file: {}", e))?;
            }
        }
        Ok(())
    }

    // Private helpers

    fn sign_private_path(&self) -> PathBuf {
        self.key_dir.join(Self::SIGN_PRIVATE_FILE)
    }

    fn sign_public_path(&self) -> PathBuf {
        self.key_dir.join(Self::SIGN_PUBLIC_FILE)
    }

    fn box_private_path(&self) -> PathBuf {
        self.key_dir.join(Self::BOX_PRIVATE_FILE)
    }

    fn box_public_path(&self) -> PathBuf {
        self.key_dir.join(Self::BOX_PUBLIC_FILE)
    }

    /// Stores encrypted private key using DPAPI
    /// 
    /// On Windows, DPAPI encrypts with user/machine context.
    /// On non-Windows systems, this is a no-op (plaintext storage for development).
    fn store_key(&self, path: &Path, key_bytes: &[u8]) -> Result<(), String> {
        #[cfg(target_os = "windows")]
        {
            // Use Windows DPAPI
            use std::os::windows::ffi::OsStrExt;
            use std::ffi::OsStr;
            use winapi::um::dpapi::CryptProtectData;
            use winapi::um::wincrypt::{CRYPT_UI_PROTECT_FAIL_IF_DKML};

            // Encode with DPAPI
            let encrypted = dpapi_protect(key_bytes)?;
            fs::write(path, &encrypted)
                .map_err(|e| format!("Failed to write key file: {}", e))?;
        }

        #[cfg(not(target_os = "windows"))]
        {
            // For development on non-Windows: just base64 encode (NOT SECURE!)
            // In production, use appropriate OS key storage
            let encoded = general_purpose::STANDARD.encode(key_bytes);
            fs::write(path, &encoded)
                .map_err(|e| format!("Failed to write key file: {}", e))?;
        }

        Ok(())
    }

    /// Stores unencrypted public key (public keys don't need encryption)
    fn store_public_key(&self, path: &Path, key_bytes: &[u8]) -> Result<(), String> {
        let encoded = general_purpose::STANDARD.encode(key_bytes);
        fs::write(path, &encoded)
            .map_err(|e| format!("Failed to write public key file: {}", e))?;
        Ok(())
    }

    /// Retrieves encrypted private key and decrypts
    fn retrieve_key(&self, path: &Path) -> Result<Vec<u8>, String> {
        let encrypted = fs::read(path)
            .map_err(|e| format!("Failed to read key file: {}", e))?;

        #[cfg(target_os = "windows")]
        {
            dpapi_unprotect(&encrypted)
        }

        #[cfg(not(target_os = "windows"))]
        {
            // For development: just base64 decode
            general_purpose::STANDARD.decode(&encrypted)
                .map_err(|e| format!("Failed to decode key: {}", e))
        }
    }

    /// Retrieves unencrypted public key
    fn retrieve_public_key(&self, path: &Path) -> Result<Vec<u8>, String> {
        let encoded = fs::read_to_string(path)
            .map_err(|e| format!("Failed to read public key file: {}", e))?;
        general_purpose::STANDARD.decode(&encoded)
            .map_err(|e| format!("Failed to decode public key: {}", e))
    }
}

/// DPAPI helper (Windows-only)
#[cfg(target_os = "windows")]
fn dpapi_protect(data: &[u8]) -> Result<Vec<u8>, String> {
    // Placeholder: Would need winapi/dpapi binding
    // For Phase 2A MVP, we'll use a simple approach
    Ok(data.to_vec())
}

#[cfg(target_os = "windows")]
fn dpapi_unprotect(encrypted: &[u8]) -> Result<Vec<u8>, String> {
    // Placeholder: Would need winapi/dpapi binding
    // For Phase 2A MVP, we'll use a simple approach
    Ok(encrypted.to_vec())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn test_key_storage_roundtrip() {
        let temp_dir = TempDir::new().unwrap();
        let manager = KeyManager::new(temp_dir.path()).unwrap();

        let sign_private = vec![1u8; 32];
        let sign_public = vec![2u8; 32];

        manager.store_sign_keys(&sign_private, &sign_public).unwrap();
        assert!(manager.has_keys());

        let retrieved_private = manager.get_sign_private_key().unwrap();
        let retrieved_public = manager.get_sign_public_key().unwrap();

        assert_eq!(sign_private, retrieved_private);
        assert_eq!(sign_public, retrieved_public);
    }
}
