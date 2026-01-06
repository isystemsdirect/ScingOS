#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, WindowBuilder, WindowUrl};

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // ---- FORCE MAIN WINDOW CREATION ----
            let main = WindowBuilder::new(
                app,
                "main",
                WindowUrl::App("index.html".into()),
            )
            .title("ScingR")
            .visible(false)
            .build()
            .expect("FAILED TO CREATE MAIN WINDOW");

            let splash = app.get_window("splash").expect("NO SPLASH WINDOW");

            // Show main, close splash
            main.show().unwrap();
            main.set_focus().unwrap();
            splash.close().unwrap();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
