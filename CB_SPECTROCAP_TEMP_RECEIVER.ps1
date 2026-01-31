Param(
  [int]$Port = 9443,
  [string]$OutFile = "$env:TEMP\spectrocap_last_payload.txt"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Get-WifiIPv4 {
  $ips = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue | Where-Object { $_.IPAddress -notmatch '^127\.' -and $_.InterfaceAlias -match 'Wi-Fi|Wireless|WLAN' })
  if ($ips) { return $ips.IPAddress } else { return (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notmatch '^127\.' }).IPAddress }
}

$prefix = "http://+:$Port/ingest/"
Write-Host ("=== PC LAN IPv4 ===") -ForegroundColor Cyan
try { Get-WifiIPv4 | ForEach-Object { Write-Host $_ } } catch { ipconfig | findstr /i "IPv4" }

Write-Host ("\n=== FIREWALL RULE (INBOUND TCP $Port) ===") -ForegroundColor Cyan
try { & netsh advfirewall firewall add rule name="SpectroCAP Temp Receiver $Port" dir=in action=allow protocol=TCP localport=$Port | Out-Null } catch { }

Write-Host ("\n=== URLACL RESERVE ($prefix) ===") -ForegroundColor Cyan
try { & netsh http add urlacl url=$prefix user=$env:USERNAME | Out-Null } catch { }

Write-Host ("\n=== STARTING RECEIVER: $prefix ===") -ForegroundColor Green
Write-Host ("Saving last payload to: $OutFile") -ForegroundColor Green
Write-Host ("Press Ctrl+C to stop.") -ForegroundColor Yellow

Add-Type -AssemblyName System.Net.HttpListener
$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($prefix)
$listener.Start()

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request
  $sr = [System.IO.StreamReader]::new($req.InputStream, $req.ContentEncoding)
  $body = $sr.ReadToEnd()
  $sr.Close()

  $stamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
  $line = "[$stamp] $($req.HttpMethod) $($req.RawUrl) FROM $($req.RemoteEndPoint)" + [Environment]::NewLine + $body + [Environment]::NewLine
  $line | Write-Host
  $body | Set-Content -Encoding UTF8 -Path $OutFile

  $resp = $ctx.Response
  $resp.StatusCode = 200
  $bytes = [Text.Encoding]::UTF8.GetBytes("OK")
  $resp.OutputStream.Write($bytes,0,$bytes.Length)
  $resp.Close()
}
