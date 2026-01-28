#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![set_clipboard_text])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
fn set_clipboard_text(text: String) -> Result<String, String> {
  // Phase 1: Just return the text (actual clipboard set via JS)
  Ok(format!("Clipboard set: {} bytes", text.len()))
}

