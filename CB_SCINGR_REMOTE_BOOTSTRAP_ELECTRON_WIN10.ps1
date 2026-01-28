# CB_SCINGR_REMOTE_BOOTSTRAP_ELECTRON
# Creates ScingR Remote UI + local WebSocket link server (Fake ScingOS)

Set-Location "G:\GIT\isystemsdirect\ScingOS"
$ErrorActionPreference = "Stop"

# 1) Ensure scingr-visual exists
if (!(Test-Path ".\scingr-visual")) { throw "Missing folder: scingr-visual. (We created it last night.)" }
Set-Location ".\scingr-visual"

# 2) Ensure deps
if (!(Test-Path ".\package.json")) { npm.cmd init -y | Out-Null }

# Electron + ws
npm.cmd install electron --save-dev
npm.cmd install ws

# 3) main.js (Electron host)
@'
const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 760,
    backgroundColor: "#000000",
    title: "ScingR Remote",
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadFile("index.html");
}

app.whenReady().then(createWindow);
'@ | Set-Content -Encoding UTF8 -Path ".\main.js"

# 4) preload.js (safe bridge)
@'
const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("scingr", {
  now: () => new Date().toISOString()
});
'@ | Set-Content -Encoding UTF8 -Path ".\preload.js"

# 5) index.html (UI)
@'
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>ScingR Remote</title>
  <style>
    :root { --c:#00ffff; --bg:#000; --muted:#8aa; --err:#ff4d6d; --ok:#7CFC00; --warn:#ffd166; }
    html,body{margin:0;height:100%;background:var(--bg);font-family:Arial, sans-serif;color:var(--c);}
    .wrap{display:grid;grid-template-columns: 420px 1fr; height:100%;}
    .left{padding:22px;border-right:1px solid #0b2b2b;}
    .right{padding:22px;}
    .title{font-size:22px;letter-spacing:1px;margin:0 0 10px 0;}
    .sub{color:var(--muted);font-size:12px;margin-bottom:18px;}
    .pill{display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border:1px solid #0b2b2b;border-radius:999px;font-size:12px;}
    .dot{width:10px;height:10px;border-radius:50%;background:#2b3a3a;}
    .row{display:flex;gap:10px;align-items:center;margin:12px 0;}
    input{flex:1;background:#020b0b;border:1px solid #0b2b2b;color:var(--c);padding:10px;border-radius:10px;outline:none;}
    button{background:#021515;border:1px solid #0b2b2b;color:var(--c);padding:10px 12px;border-radius:10px;cursor:pointer;}
    button:disabled{opacity:.4;cursor:not-allowed;}
    .avatar{
      width:320px;height:320px;border-radius:50%;
      border:2px solid var(--c);
      display:flex;align-items:center;justify-content:center;
      font-size:24px;opacity:.95;
      box-shadow: 0 0 28px rgba(0,255,255,.15);
      margin-top:16px;
      position:relative;
    }
    .pulse{animation:pulse 2.2s infinite ease-in-out;}
    @keyframes pulse{
      0%{transform:scale(1); box-shadow:0 0 22px rgba(0,255,255,.10);}
      50%{transform:scale(1.02); box-shadow:0 0 40px rgba(0,255,255,.22);}
      100%{transform:scale(1); box-shadow:0 0 22px rgba(0,255,255,.10);}
    }
    .panel{border:1px solid #0b2b2b;border-radius:14px;padding:14px;background:#010909;}
    .log{height:560px;overflow:auto;font-family:Consolas, monospace;font-size:12px;color:#c9ffff;white-space:pre-wrap;}
    .hint{color:var(--muted);font-size:12px;margin-top:10px;}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="left">
      <h1 class="title">ScingR Remote</h1>
      <div class="sub">Native remote host shell (not ScingOS). Visual-first link layer.</div>

      <div class="pill" id="statusPill">
        <span class="dot" id="statusDot"></span>
        <span id="statusText">DISCONNECTED</span>
      </div>

      <div class="row">
        <input id="endpoint" value="ws://127.0.0.1:8787" />
      </div>

      <div class="row">
        <button id="btnConnect">Connect</button>
        <button id="btnDisconnect" disabled>Disconnect</button>
      </div>

      <div class="avatar" id="avatar">SCINGR</div>
      <div class="hint">Tip: Start the local link server in another terminal to see LINKED instantly.</div>
    </div>

    <div class="right">
      <div class="panel">
        <div class="sub">Link Events</div>
        <div class="log" id="log"></div>
      </div>
    </div>
  </div>

<script>
  const logEl = document.getElementById("log");
  const statusText = document.getElementById("statusText");
  const statusDot = document.getElementById("statusDot");
  const avatar = document.getElementById("avatar");
  const btnConnect = document.getElementById("btnConnect");
  const btnDisconnect = document.getElementById("btnDisconnect");
  const endpointEl = document.getElementById("endpoint");

  let ws = null;

  function log(msg){
    const line = `[${new Date().toLocaleTimeString()}] ${msg}\n`;
    logEl.textContent += line;
    logEl.scrollTop = logEl.scrollHeight;
  }

  function setStatus(state){
    statusText.textContent = state;
    avatar.classList.remove("pulse");
    statusDot.style.background = "#2b3a3a";

    if(state === "CONNECTING"){ statusDot.style.background = "var(--warn)"; }
    if(state === "LINKED"){ statusDot.style.background = "var(--ok)"; avatar.classList.add("pulse"); }
    if(state === "ERROR"){ statusDot.style.background = "var(--err)"; }
    if(state === "DISCONNECTED"){ statusDot.style.background = "#2b3a3a"; }
  }

  btnConnect.onclick = () => {
    const url = endpointEl.value.trim();
    if(!url) return;

    if(ws){ try{ ws.close(); }catch(e){} ws=null; }

    setStatus("CONNECTING");
    btnConnect.disabled = true;
    btnDisconnect.disabled = false;

    log(`Connecting to ${url} ...`);
    ws = new WebSocket(url);

    ws.onopen = () => {
      setStatus("LINKED");
      log("LINKED. (ScingR Remote is connected)");
      ws.send(JSON.stringify({ type:"hello", agent:"ScingR-Remote", ts: Date.now() }));
    };

    ws.onmessage = (ev) => {
      log(`RX: ${ev.data}`);
    };

    ws.onerror = () => {
      setStatus("ERROR");
      log("ERROR: WebSocket error");
    };

    ws.onclose = () => {
      setStatus("DISCONNECTED");
      log("DISCONNECTED");
      btnConnect.disabled = false;
      btnDisconnect.disabled = true;
      ws = null;
    };
  };

  btnDisconnect.onclick = () => {
    if(ws){ log("Disconnect requested."); ws.close(); }
  };

  setStatus("DISCONNECTED");
  log(`Boot: ${window.scingr?.now?.() || "ready"}`);
</script>
</body>
</html>
'@ | Set-Content -Encoding UTF8 -Path ".\index.html"

# 6) link-server.js (Fake ScingOS)
@'
const WebSocket = require("ws");

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8787;
const wss = new WebSocket.Server({ port });

console.log(`Fake ScingOS Link Server listening on ws://127.0.0.1:${port}`);

wss.on("connection", (socket) => {
  console.log("Client connected.");

  socket.send(JSON.stringify({ type:"status", state:"linked", ts: Date.now() }));

  const timer = setInterval(() => {
    socket.send(JSON.stringify({ type:"heartbeat", ts: Date.now() }));
  }, 1500);

  socket.on("message", (msg) => {
    console.log("RX:", msg.toString());
    socket.send(JSON.stringify({ type:"echo", data: msg.toString(), ts: Date.now() }));
  });

  socket.on("close", () => {
    clearInterval(timer);
    console.log("Client disconnected.");
  });
});
'@ | Set-Content -Encoding UTF8 -Path ".\link-server.js"

# 7) package.json scripts
$pkg = Get-Content -Raw .\package.json | ConvertFrom-Json
$pkg.name = "scingr-remote"
$pkg.main = "main.js"
if ($null -eq $pkg.scripts) { $pkg | Add-Member -NotePropertyName scripts -NotePropertyValue (@{}) -Force }
$pkg.scripts.start = "electron ."
$pkg.scripts.link = "node link-server.js"
$pkg | ConvertTo-Json -Depth 10 | Set-Content -Encoding UTF8 .\package.json

Write-Host ""
Write-Host "============================================================"
Write-Host "NEXT (2 TERMINALS):"
Write-Host "  Terminal A (server):  cd scingr-visual ; npm.cmd run link"
Write-Host "  Terminal B (app):     cd scingr-visual ; npm.cmd start"
Write-Host "============================================================"
Write-Host ""
