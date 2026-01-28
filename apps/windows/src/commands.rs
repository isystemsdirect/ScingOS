// Tauri command handlers
// src/commands.rs

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}
