// Phase 2B: Media receiver and clipboard support for Windows
// Extends crypto/receiver.rs to handle image payloads

use std::path::PathBuf;
use std::fs::File;
use std::io::Write;

/// Image magic byte validation
pub struct ImageValidator;

impl ImageValidator {
    /// PNG magic: 89 50 4E 47 0D 0A 1A 0A
    const PNG_MAGIC: &'static [u8] = &[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    
    /// JPEG magic: FF D8 FF
    const JPEG_MAGIC: &'static [u8] = &[0xFF, 0xD8, 0xFF];

    /// Validates image payload magic bytes
    ///
    /// # Arguments
    /// * `bytes` - Image payload bytes
    ///
    /// # Returns
    /// true if valid PNG or JPEG header, false otherwise
    pub fn validate_image_magic(bytes: &[u8]) -> bool {
        if bytes.len() < 3 {
            return false;
        }

        // Check PNG
        if bytes.len() >= 8 && bytes.starts_with(Self::PNG_MAGIC) {
            return true;
        }

        // Check JPEG
        if bytes.starts_with(Self::JPEG_MAGIC) {
            return true;
        }

        false
    }

    /// Determines MIME type from image bytes
    ///
    /// # Arguments
    /// * `bytes` - Image payload bytes
    ///
    /// # Returns
    /// MIME type string ("image/png", "image/jpeg", or "image/octet-stream" if unknown)
    pub fn detect_mime(bytes: &[u8]) -> String {
        if bytes.len() >= 8 && bytes.starts_with(Self::PNG_MAGIC) {
            return "image/png".to_string();
        }

        if bytes.len() >= 3 && bytes.starts_with(Self::JPEG_MAGIC) {
            return "image/jpeg".to_string();
        }

        "image/octet-stream".to_string()
    }
}

/// Windows clipboard image support
pub struct ClipboardImage;

impl ClipboardImage {
    /// Writes image bytes to Windows clipboard using PowerShell
    ///
    /// # Arguments
    /// * `image_bytes` - Raw image bytes (PNG or JPEG)
    /// * `temp_dir` - Temporary directory for scratch file
    ///
    /// # Returns
    /// Ok(()) if successful, Err with description otherwise
    pub fn set_clipboard_image(image_bytes: &[u8], temp_dir: &PathBuf) -> Result<(), String> {
        // Write to temp file
        let temp_file = temp_dir.join("spectrocap_image.tmp");
        
        let mut file = File::create(&temp_file)
            .map_err(|e| format!("Failed to create temp file: {}", e))?;
        
        file.write_all(image_bytes)
            .map_err(|e| format!("Failed to write temp file: {}", e))?;
        
        drop(file);  // Ensure file is closed before clipboard operation
        
        // Copy file to Windows clipboard using PowerShell
        // This uses SetContent on Windows clipboard object
        let ps_command = format!(
            "try {{ $img = [System.Drawing.Image]::FromFile('{}'); \
             [System.Windows.Forms.Clipboard]::SetImage($img); \
             $img.Dispose(); \
             }} catch {{ exit 1 }}",
            temp_file.display()
        );
        
        let output = std::process::Command::new("powershell")
            .arg("-NoProfile")
            .arg("-Command")
            .arg(&ps_command)
            .output()
            .map_err(|e| format!("PowerShell failed: {}", e))?;
        
        if !output.status.success() {
            return Err("Failed to copy image to clipboard".to_string());
        }
        
        // Clean up temp file (non-fatal if fails)
        let _ = std::fs::remove_file(&temp_file);
        
        Ok(())
    }

    /// Writes image to file for "Save As" dialog
    ///
    /// # Arguments
    /// * `image_bytes` - Raw image bytes
    /// * `path` - File path to write to
    ///
    /// # Returns
    /// Ok(()) if successful, Err with description otherwise
    pub fn save_image_to_file(image_bytes: &[u8], path: &PathBuf) -> Result<(), String> {
        let mut file = File::create(path)
            .map_err(|e| format!("Failed to create file: {}", e))?;
        
        file.write_all(image_bytes)
            .map_err(|e| format!("Failed to write file: {}", e))?;
        
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_png_magic_validation() {
        let mut png_bytes = vec![0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
        png_bytes.extend_from_slice(&[0x00; 100]);  // Padding
        
        assert!(ImageValidator::validate_image_magic(&png_bytes));
    }

    #[test]
    fn test_jpeg_magic_validation() {
        let mut jpeg_bytes = vec![0xFF, 0xD8, 0xFF];
        jpeg_bytes.extend_from_slice(&[0x00; 100]);  // Padding
        
        assert!(ImageValidator::validate_image_magic(&jpeg_bytes));
    }

    #[test]
    fn test_invalid_magic() {
        let invalid_bytes = vec![0x00, 0x00, 0x00];
        
        assert!(!ImageValidator::validate_image_magic(&invalid_bytes));
    }

    #[test]
    fn test_detect_png_mime() {
        let mut png_bytes = vec![0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
        png_bytes.extend_from_slice(&[0x00; 100]);
        
        assert_eq!(ImageValidator::detect_mime(&png_bytes), "image/png");
    }

    #[test]
    fn test_detect_jpeg_mime() {
        let mut jpeg_bytes = vec![0xFF, 0xD8, 0xFF];
        jpeg_bytes.extend_from_slice(&[0x00; 100]);
        
        assert_eq!(ImageValidator::detect_mime(&jpeg_bytes), "image/jpeg");
    }
}
