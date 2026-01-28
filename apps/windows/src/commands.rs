// Tauri command handlers
// src/commands.rs

use std::path::PathBuf;
use crate::crypto::media::{ClipboardImage, ImageValidator};

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

/// Copy image bytes to Windows clipboard
/// 
/// # Arguments
/// * `image_bytes` - Base64-encoded image data
/// * `temp_dir` - Temporary directory path for staging
/// 
/// # Returns
/// Ok(null) on success; Err(String) with error message on failure
#[tauri::command]
pub fn copy_image_to_clipboard(
    image_bytes: Vec<u8>,
    temp_dir: String,
) -> Result<(), String> {
    let temp_path = PathBuf::from(temp_dir);
    
    // Validate image magic bytes before clipboard operation
    if !ImageValidator::validate_image_magic(&image_bytes) {
        return Err("Invalid image format: magic bytes validation failed".to_string());
    }

    ClipboardImage::set_clipboard_image(&image_bytes, &temp_path)
}

/// Save image bytes to file (for "Save As" dialog)
/// 
/// # Arguments
/// * `image_bytes` - Raw image data
/// * `file_path` - Target file path (from save dialog)
/// 
/// # Returns
/// Ok(null) on success; Err(String) with error message on failure
#[tauri::command]
pub fn save_image_to_file(
    image_bytes: Vec<u8>,
    file_path: String,
) -> Result<(), String> {
    // Validate image magic bytes before writing to disk
    if !ImageValidator::validate_image_magic(&image_bytes) {
        return Err("Invalid image format: magic bytes validation failed".to_string());
    }

    ClipboardImage::save_image_to_file(&image_bytes, &file_path)
}

/// Detect MIME type from image bytes
/// 
/// # Arguments
/// * `image_bytes` - Raw image data
/// 
/// # Returns
/// MIME type string ("image/png", "image/jpeg", or "image/octet-stream")
#[tauri::command]
pub fn detect_image_mime(image_bytes: Vec<u8>) -> String {
    ImageValidator::detect_mime(&image_bytes)
}

