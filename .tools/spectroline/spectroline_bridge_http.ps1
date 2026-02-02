param(
  [int]$Port = 8789
)

$ErrorActionPreference="Stop"
Set-StrictMode -Version Latest

$SCINGOS_ROOT = "G:\GIT\isystemsdirect\ScingOS"
$INBOX = Join-Path $SCINGOS_ROOT ".spectroline\inbox"
$LOGS  = Join-Path $SCINGOS_ROOT ".spectroline\logs"

New-Item -ItemType Directory -Force -Path $INBOX,$LOGS | Out-Null

function New-Id { ([guid]::NewGuid().ToString("N")).Substring(0,12) }
function Stamp { (Get-Date).ToUniversalTime().ToString("yyyyMMdd_HHmmssZ") }
function IsoUtc { (Get-Date).ToUniversalTime().ToString("o") }
function Write-Audit($line) {
  $audit = Join-Path $LOGS "bridge.audit.jsonl"
  $line | Add-Content -Path $audit -Encoding UTF8
}

$token = $env:SPECTROLINE_BRIDGE_TOKEN

Add-Type -AssemblyName System.Net.HttpListener

$listener = New-Object System.Net.HttpListener
$prefix = "http://127.0.0.1:$Port/"
$listener.Prefixes.Add($prefix)
$listener.Start()

Write-Host "SpectroLINE™ Bridge listening: $prefix" -ForegroundColor Cyan
Write-Host "Endpoints: GET /health | POST /packet | POST /clipboard" -ForegroundColor Cyan
if ($token) { Write-Host "Auth: Bearer token REQUIRED" -ForegroundColor Yellow } else { Write-Host "Auth: OFF (local only)" -ForegroundColor Yellow }

while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request
  $res = $ctx.Response

  try {
    # Auth (optional)
    if ($token) {
      $auth = $req.Headers["Authorization"]
      if (-not $auth -or $auth -notmatch "^Bearer\s+") {
        $res.StatusCode = 401
        $bytes = [Text.Encoding]::UTF8.GetBytes("Missing Authorization: Bearer")
        $res.OutputStream.Write($bytes,0,$bytes.Length)
        $res.Close()
        continue
      }
      $got = $auth -replace "^Bearer\s+",""
      if ($got -ne $token) {
        $res.StatusCode = 403
        $bytes = [Text.Encoding]::UTF8.GetBytes("Forbidden")
        $res.OutputStream.Write($bytes,0,$bytes.Length)
        $res.Close()
        continue
      }
    }

    $path = $req.Url.AbsolutePath.ToLowerInvariant()

    if ($req.HttpMethod -eq "GET" -and $path -eq "/health") {
      $res.StatusCode = 200
      $bytes = [Text.Encoding]::UTF8.GetBytes("{\"ok\":true}")
      $res.ContentType = "application/json"
      $res.OutputStream.Write($bytes,0,$bytes.Length)
      $res.Close()
      continue
    }

    if ($req.HttpMethod -ne "POST") {
      $res.StatusCode = 405
      $bytes = [Text.Encoding]::UTF8.GetBytes("Method Not Allowed")
      $res.OutputStream.Write($bytes,0,$bytes.Length)
      $res.Close()
      continue
    }

    # Read body
    $sr = New-Object IO.StreamReader($req.InputStream, $req.ContentEncoding)
    $body = $sr.ReadToEnd()
    if ([string]::IsNullOrWhiteSpace($body)) { $body = "{}" }

    if ($path -eq "/clipboard") {
      # payload-only convenience -> clipboard_push packet
      $p = $body | ConvertFrom-Json
      $pktId = New-Id
      $pkt = [ordered]@{
        v=1
        ts=(IsoUtc)
        app="spectrocap"
        kind="intent"
        id=$pktId
        ref=$null
        topic="clipboard_push"
        payload=@{
          content = [string]$p.content
          mime    = if ($p.mime) { [string]$p.mime } else { "text/plain" }
          device  = if ($p.device) { [string]$p.device } else { "unknown" }
        }
        policy=@{ plan_ack=$true }
      }
      $file = Join-Path $INBOX ("{0}__spectrocap__intent__{1}.json" -f (Stamp), $pktId)
      ($pkt | ConvertTo-Json -Depth 50) | Set-Content -Path $file -Encoding UTF8

      Write-Audit ("{0}`tclipboard`twrote`t{1}" -f (IsoUtc), $file)

      $res.StatusCode = 200
      $res.ContentType = "application/json"
      $bytes = [Text.Encoding]::UTF8.GetBytes("{\"ok\":true,\"path\":\"$file\"}")
      $res.OutputStream.Write($bytes,0,$bytes.Length)
      $res.Close()
      continue
    }

    if ($path -eq "/packet") {
      # Accept full packet JSON -> write to inbox
      $pkt = $body | ConvertFrom-Json

      # Minimal required keys check; if missing, reject
      $reqKeys = @("v","ts","app","kind","id","ref","topic","payload","policy")
      $missing = @()
      foreach ($k in $reqKeys) { if ($null -eq $pkt.$k) { $missing += $k } }
      if ($missing.Count -gt 0) {
        $res.StatusCode = 400
        $bytes = [Text.Encoding]::UTF8.GetBytes("Missing keys: " + ($missing -join ","))
        $res.OutputStream.Write($bytes,0,$bytes.Length)
        $res.Close()
        continue
      }

      $file = Join-Path $INBOX ("{0}__{1}__{2}__{3}.json" -f (Stamp), $pkt.app, $pkt.kind, $pkt.id)
      ($pkt | ConvertTo-Json -Depth 50) | Set-Content -Path $file -Encoding UTF8

      Write-Audit ("{0}`tpacket`twrote`t{1}" -f (IsoUtc), $file)

      $res.StatusCode = 200
      $res.ContentType = "application/json"
      $bytes = [Text.Encoding]::UTF8.GetBytes("{\"ok\":true,\"path\":\"$file\"}")
      $res.OutputStream.Write($bytes,0,$bytes.Length)
      $res.Close()
      continue
    }

    $res.StatusCode = 404
    $bytes = [Text.Encoding]::UTF8.GetBytes("Not Found")
    $res.OutputStream.Write($bytes,0,$bytes.Length)
    $res.Close()
  } catch {
    try {
      Write-Audit ("{0}`terror`t{1}" -f ((Get-Date).ToUniversalTime().ToString("o")), $_.Exception.Message)
    } catch {}
    $res.StatusCode = 500
    $bytes = [Text.Encoding]::UTF8.GetBytes("Server Error")
    $res.OutputStream.Write($bytes,0,$bytes.Length)
    $res.Close()
  }
}
