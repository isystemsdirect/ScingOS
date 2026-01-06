#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::time::{Duration, Instant};

use tauri::Manager;

fn show_main_and_close_splash(app: &tauri::AppHandle) {
  if let Some(main) = app.get_webview_window("main") {
    let _ = main.show();
    let _ = main.set_focus();
  } else {
    eprintln!("ERROR: main window not found");
  }

  if let Some(splash) = app.get_webview_window("splash") {
    let _ = splash.close();
  }
}

fn set_splash_progress(app: &tauri::AppHandle, pct: u8, status: &str, detail: &str) {
  let Some(win) = app.get_webview_window("splash") else {
    return;
  };

  let status_js = serde_json::to_string(status).unwrap_or_else(|_| "\"\"".to_string());
  let detail_js = serde_json::to_string(detail).unwrap_or_else(|_| "\"\"".to_string());
  let js = format!(
    "window.__SCINGR_SPLASH__?.setProgress({}, {}, {});",
    pct, status_js, detail_js
  );

  let _ = win.eval(&js);
}

async fn wait_for_http_200(client: &reqwest::Client, url: &str, timeout: Duration) -> bool {
  let deadline = Instant::now() + timeout;

  loop {
    if Instant::now() > deadline {
      return false;
    }

    match client.get(url).send().await {
      Ok(resp) if resp.status().is_success() => return true,
      _ => {
        tokio::time::sleep(Duration::from_millis(250)).await;
      }
    }
  }
}

async fn wait_for_http_200_with_updates(
  app: &tauri::AppHandle,
  client: &reqwest::Client,
  url: &str,
  status: &str,
  detail_prefix: &str,
  progress_start: u8,
  progress_end: u8,
  deadline: Instant
) -> bool {
  let mut last_tick = Instant::now() - Duration::from_secs(10);
  let started = Instant::now();

  loop {
    if Instant::now() >= deadline {
      return false;
    }

    match client.get(url).send().await {
      Ok(resp) if resp.status().is_success() => return true,
      _ => {
        tokio::time::sleep(Duration::from_millis(250)).await;

        // Update the splash at ~1Hz so it never "looks stuck".
        if Instant::now().duration_since(last_tick) >= Duration::from_secs(1) {
          last_tick = Instant::now();

          let elapsed = Instant::now().duration_since(started);
          let remaining = deadline.saturating_duration_since(Instant::now());
          let total_budget = elapsed + remaining;

          let span = progress_end.saturating_sub(progress_start) as f32;
          let ratio = if total_budget.as_millis() == 0 {
            0.0
          } else {
            (elapsed.as_millis() as f32 / total_budget.as_millis() as f32).min(1.0)
          };
          let pct = (progress_start as f32 + span * ratio).round() as u8;

          set_splash_progress(
            app,
            pct,
            status,
            &format!("{} ({}s elapsed)", detail_prefix, elapsed.as_secs())
          );
        }
      }
    }
  }
}

fn main() {
  tauri::Builder::default()
    .setup(|app| {
      let app_handle = app.handle().clone();

      // Splash is created by config and shown immediately.
      // Main is created hidden; we only show it after deterministic readiness checks.
      tauri::async_runtime::spawn(async move {
        // Let the splash webview load its inline script first.
        tokio::time::sleep(Duration::from_millis(250)).await;

        let overall_timeout = Duration::from_secs(30);
        let overall_deadline = Instant::now() + overall_timeout;

        set_splash_progress(
          &app_handle,
          10,
          "Starting ScingR runtime",
          "Waiting for http://127.0.0.1:3333/health"
        );

        let client = match reqwest::Client::builder()
          .timeout(Duration::from_millis(900))
          .build()
        {
          Ok(c) => c,
          Err(_) => {
            set_splash_progress(&app_handle, 100, "Startup failed", "HTTP client init failed");
            return;
          }
        };

        let ok_health = wait_for_http_200_with_updates(
          &app_handle,
          &client,
          "http://127.0.0.1:3333/health",
          "Waiting for ScingR Runtime Service…",
          "Starting services (port 3333)…",
          10,
          50,
          overall_deadline
        ).await;

        if !ok_health {
          set_splash_progress(
            &app_handle,
            100,
            "Startup failed",
            "Runtime not reachable. Start the ScingEmulatorService and relaunch ScingR."
          );
          return;
        }

        set_splash_progress(&app_handle, 55, "Connecting UI", "Checking http://127.0.0.1:3333/ui");

        let ok_ui = wait_for_http_200_with_updates(
          &app_handle,
          &client,
          "http://127.0.0.1:3333/ui",
          "Connecting UI…",
          "Waiting for /ui…",
          55,
          90,
          overall_deadline
        ).await;

        if !ok_ui {
          set_splash_progress(
            &app_handle,
            100,
            "Startup failed",
            "UI not reachable. Ensure runtime is serving /ui and relaunch ScingR."
          );
          return;
        }

        // Guarantee final transition at 100%.
        set_splash_progress(&app_handle, 100, "Ready", "");

        // Small, intentional pause so users *see* 100% before the handoff.
        std::thread::sleep(std::time::Duration::from_millis(250));

        // In Tauri v2, show/close must run on the main thread.
        let app_for_ui = app_handle.clone();
        app_handle
          .run_on_main_thread(move || {
            show_main_and_close_splash(&app_for_ui);
          })
          .ok();
      });

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
