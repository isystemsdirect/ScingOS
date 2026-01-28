/// Phase 2B: Image Validation and Windows Clipboard Support
/// 
/// Handles image magic byte validation for:
/// - PNG (0x89 0x50 0x4E 0x47...)
/// - JPEG (0xFF 0xD8 0xFF...)
/// 
/// Provides Windows clipboard integration for image display.

use std::path::{Path, PathBuf};
use std::fs::File;
use std::io::Write;
use std::process::Command;

/// Image validator for magic byte detection
pub struct ImageValidator;

/// Windows clipboard image handler
pub struct ClipboardImage;

impl ImageValidator {
    /// PNG magic bytes: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
    const PNG_MAGIC: &'static [u8] = &[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    
    /// JPEG magic bytes: 0xFF 0xD8 0xFF
    const JPEG_MAGIC: &'static [u8] = &[0xFF, 0xD8, 0xFF];

    /// Validate image magic bytes
    /// 
    /// # Arguments
    /// * `bytes` - Raw image bytes (post-decryption)
    /// 
    /// # Returns
    /// true if bytes match PNG or JPEG magic; false otherwise
    pub fn validate_image_magic(bytes: &[u8]) -> bool {
        if bytes.is_empty() {
            return false;
        }

        // Check PNG magic (8 bytes)
        if bytes.len() >= 8 && bytes.starts_with(Self::PNG_MAGIC) {
            return true;
        }

        // Check JPEG magic (3 bytes)
        if bytes.len() >= 3 && bytes.starts_with(Self::JPEG_MAGIC) {
            return true;
        }

        false
    }

    /// Detect MIME type from image magic bytes
    /// 
    /// # Arguments
    /// * `bytes` - Raw image bytes
    /// 
    /// # Returns
    /// MIME type string: "image/png", "image/jpeg", or "image/octet-stream"
    pub fn detect_mime(bytes: &[u8]) -> String {
        if bytes.len() >= 8 && bytes.starts_with(Self::PNG_MAGIC) {
            "image/png".to_string()
        } else if bytes.len() >= 3 && bytes.starts_with(Self::JPEG_MAGIC) {
            "image/jpeg".to_string()
        } else {
            "image/octet-stream".to_string()
        }
    }
}

impl ClipboardImage {
    /// Set image to Windows clipboard
    /// 
    /// Uses PowerShell with System.Drawing.Image API to copy image to clipboard.
    /// Writes image to temp file, executes PowerShell command, then cleans up temp file.
    /// 
    /// # Arguments
    /// * `image_bytes` - Raw image bytes (PNG or JPEG)
    /// * `temp_dir` - Temporary directory for temp file
    /// 
    /// # Returns
    /// Ok(()) on success; Err(String) with error message on failure
    pub fn set_clipboard_image(image_bytes: &[u8], temp_dir: &PathBuf) -> Result<(), String> {
        // Create temp file
        let temp_file = temp_dir.join("spectrocap_image.tmp");
        
        // Write image bytes to temp file
        let mut file = File::create(&temp_file)
            .map_err(|e| format!("Failed to create temp file: {}", e))?;
        
        file.write_all(image_bytes)
            .map_err(|e| format!("Failed to write temp file: {}", e))?;
        
        drop(file);  // Ensure file is closed before PowerShell reads it

        // Build PowerShell command
        let ps_command = format!(
            "try {{ \
                $img = [System.Drawing.Image]::FromFile('{}'); \
                [System.Windows.Forms.Clipboard]::SetImage($img); \
                $img.Dispose(); \
            }} catch {{ \
                Write-Error $_; exit 1; \
            }}",
            temp_file.display()
        );

        // Execute PowerShell
        let output = Command::new("powershell")
            .arg("-NoProfile")
            .arg("-Command")
            .arg(&ps_command)
            .output()
            .map_err(|e| format!("Failed to execute PowerShell: {}", e))?;

        // Check PowerShell success
        if !output.status.success() {
            let stderr = String::from_utf8_lossy(&output.stderr);
            let _ = std::fs::remove_file(&temp_file);  // Best effort cleanup
            return Err(format!("PowerShell failed: {}", stderr));
        }

        // Clean up temp file
        std::fs::remove_file(&temp_file)
            .map_err(|e| format!("Failed to clean up temp file: {}", e))?;

        Ok(())
    }

    /// Save image to file (for "Save As" dialog)
    /// 
    /// # Arguments
    /// * `image_bytes` - Raw image bytes
    /// * `path` - Target file path (from dialog)
    /// 
    /// # Returns
    /// Ok(()) on success; Err(String) with error message on failure
    pub fn save_image_to_file(image_bytes: &[u8], path: &str) -> Result<(), String> {
        let mut file = File::create(path)
            .map_err(|e| format!("Failed to create file: {}", e))?;
        
        file.write_all(image_bytes)
            .map_err(|e| format!("Failed to write to file: {}", e))?;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_png_magic_validation() {
        let png_bytes = vec![
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0xFF, 0xFF, 0xFF, 0xFF,  // Dummy PNG data
        ];
        assert!(ImageValidator::validate_image_magic(&png_bytes));
    }

    #[test]
    fn test_jpeg_magic_validation() {
        let jpeg_bytes = vec![
            0xFF, 0xD8, 0xFF, 0xE0,  // JPEG JFIF header
            0x00, 0x10, 0x4A, 0x46,  // Dummy JPEG data
        ];
        assert!(ImageValidator::validate_image_magic(&jpeg_bytes));
    }

    #[test]
    fn test_invalid_magic() {
        let invalid_bytes = vec![0x00, 0x01, 0x02, 0x03];
        assert!(!ImageValidator::validate_image_magic(&invalid_bytes));
    }

    #[test]
    fn test_empty_bytes() {
        assert!(!ImageValidator::validate_image_magic(&[]));
    }

    #[test]
    fn test_short_bytes() {
        let short_bytes = vec![0xFF, 0xD8];  // Only 2 bytes, JPEG needs 3
        assert!(!ImageValidator::validate_image_magic(&short_bytes));
    }

    #[test]
    fn test_detect_png_mime() {
        let png_bytes = vec![
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        ];
        assert_eq!(ImageValidator::detect_mime(&png_bytes), "image/png");
    }

    #[test]
    fn test_detect_jpeg_mime() {
        let jpeg_bytes = vec![0xFF, 0xD8, 0xFF, 0xE0];
        assert_eq!(ImageValidator::detect_mime(&jpeg_bytes), "image/jpeg");
    }

    #[test]
    fn test_detect_unknown_mime() {
        let unknown_bytes = vec![0x00, 0x01, 0x02, 0x03];
        assert_eq!(ImageValidator::detect_mime(&unknown_bytes), "image/octet-stream");
    }
}
