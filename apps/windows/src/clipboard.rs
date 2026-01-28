// Clipboard operations module
// src/clipboard.rs

use thiserror::Error;

#[derive(Debug, Error)]
pub enum ClipboardError {
    #[error("Failed to read clipboard: {0}")]
    ReadError(String),
    #[error("Failed to write clipboard: {0}")]
    WriteError(String),
}

pub fn read_clipboard() -> Result<String, ClipboardError> {
    #[cfg(target_os = "windows")]
    {
        use clipboard_win::{formats, get_clipboard};
        match get_clipboard::<String, _>(formats::Unicode) {
            Ok(text) => Ok(text),
            Err(e) => Err(ClipboardError::ReadError(e.to_string())),
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err(ClipboardError::ReadError("Not supported on this platform".to_string()))
    }
}

pub fn write_clipboard(text: &str) -> Result<(), ClipboardError> {
    #[cfg(target_os = "windows")]
    {
        use clipboard_win::{formats, set_clipboard};
        match set_clipboard(formats::Unicode, text) {
            Ok(()) => Ok(()),
            Err(e) => Err(ClipboardError::WriteError(e.to_string())),
        }
    }
    #[cfg(not(target_os = "windows"))]
    {
        Err(ClipboardError::WriteError("Not supported on this platform".to_string()))
    }
}

pub fn simulate_paste() -> Result<(), ClipboardError> {
    // TODO: Use enigo to simulate Ctrl+V
    Ok(())
}
