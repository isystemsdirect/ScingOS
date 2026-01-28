#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Setup system tray
      let quit = tauri::menu::MenuItem::new(app.handle(), "Quit", true, None::<&str>)?;
      let show = tauri::menu::MenuItem::new(app.handle(), "Show", true, None::<&str>)?;
      let paste_last = tauri::menu::MenuItem::new(app.handle(), "Paste Last", true, None::<&str>)?;
      let menu = tauri::menu::Menu::with_items(
        app.handle(),
        vec![
          &show,
          &paste_last,
          &quit,
        ],
      )?;

      let tray = tauri::TrayIconBuilder::new()
        .menu(&menu)
        .build(app)?;

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![set_clipboard_text, paste_last_message])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

/// Set clipboard text via native command (Tauri API is preferred for JS calls)
#[tauri::command]
async fn set_clipboard_text(text: String) -> Result<(), String> {
  use std::process::Command;

  // Use PowerShell to set clipboard (works on Windows)
  let output = Command::new("powershell")
    .args(&["-Command", &format!("Set-Clipboard -Value @'\n{}\n'@", text)])
    .output()
    .map_err(|e| e.to_string())?;

  if output.status.success() {
    Ok(())
  } else {
    Err(String::from_utf8_lossy(&output.stderr).to_string())
  }
}

/// Paste last message from history (clipboard was already set)
#[tauri::command]
async fn paste_last_message() -> Result<(), String> {
  // Phase 1: Just set clipboard; Phase 2 can simulate Ctrl+V
  Ok(())
}

