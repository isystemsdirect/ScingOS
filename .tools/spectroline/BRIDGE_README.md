# SpectroLINE™ HTTP Bridge (local)

Start:
  powershell -ExecutionPolicy Bypass -File .tools\spectroline\spectroline_bridge_http.ps1 -Port 8789

Health:
  Invoke-WebRequest http://127.0.0.1:8789/health

Clipboard convenience:
  $body = '{ "content":"HELLO", "mime":"text/plain", "device":"note20u" }'
  Invoke-WebRequest -Method POST -Uri http://127.0.0.1:8789/clipboard -Body $body -ContentType "application/json"

Full packet:
  Invoke-WebRequest -Method POST -Uri http://127.0.0.1:8789/packet -Body (Get-Content .spectroline\templates\clipboard_push.json -Raw) -ContentType "application/json"

Optional auth:
  setx SPECTROLINE_BRIDGE_TOKEN "your-token"
  Then include header: Authorization: Bearer your-token
