// Rust main entry point for Tauri app
// src/main.rs

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::{
    AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
    SystemTrayMenuItem,
};

mod commands;
mod clipboard;
mod db;
mod hotkey;
mod crypto;

#[tauri::command]
async fn get_last_message(app: AppHandle) -> Result<String, String> {
    // TODO: Query local DB for last message
    Err("Not implemented".to_string())
}

#[tauri::command]
async fn paste_last(app: AppHandle) -> Result<(), String> {
    // TODO: Get last message, set clipboard, simulate paste
    Ok(())
}

#[tauri::command]
async fn get_history(app: AppHandle) -> Result<String, String> {
    // TODO: Query local DB for all messages
    Err("Not implemented".to_string())
}

fn main() {
    // Setup system tray
    let quit = CustomMenuItem::new("quit", "Quit").accelerator("Ctrl+Q");
    let logout = CustomMenuItem::new("logout", "Logout");
    let paste_last = CustomMenuItem::new("paste_last", "Paste Last").accelerator("Ctrl+Shift+P");
    let paste_from = CustomMenuItem::new("paste_from", "Paste From...").accelerator("Ctrl+Shift+V");
    let settings = CustomMenuItem::new("settings", "Settings");

    let tray_menu = SystemTrayMenu::new()
        .add_item(paste_last)
        .add_item(paste_from)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(settings)
        .add_item(logout)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "logout" => {
                    // TODO: Handle logout
                }
                "paste_last" => {
                    // TODO: Handle paste last
                }
                "paste_from" => {
                    // TODO: Handle paste from
                }
                "settings" => {
                    // TODO: Handle settings
                }
                _ => {}
            },
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            get_last_message,
            paste_last,
            get_history,
            commands::copy_image_to_clipboard,
            commands::save_image_to_file,
            commands::detect_image_mime
        ])
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(|_app_handle, event| match event {
            tauri::RunEvent::ExitRequested { api, .. } => {
                api.prevent_exit();
            }
            _ => {}
        });
}
