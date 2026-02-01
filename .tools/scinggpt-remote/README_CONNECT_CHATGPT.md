# ScingGPT Remote (HTTPS) Wrapper — ChatGPT Connector Lane

Goal: make ScingGPT usable as a ChatGPT Connector (MCP over HTTPS).

Status: PREP ONLY (read-only gate enabled).

## Why
ChatGPT Connector flow expects an MCP server reachable over HTTPS.
Once exposed, ChatGPT can call MCP tools directly inside chat.

## Safety baseline (non-negotiable)
- Start READ-ONLY (no file_write, no git_*).
- Add auth (Cloudflare Access / token) before enabling write.
- Allowlist paths (ScingOS only), deny everything else.
- Audit every call (jsonl).

## Next step after prep
Implement an HTTPS MCP transport wrapper that proxies to the local stdio ScingGPT server,
enforcing REMOTE_GATE.json tool allowlist.

## Run (local)
- Option A — HTTP (no TLS, local-only):

```powershell
$env:REMOTE_TOKEN = "your-optional-token"  # optional
node .tools\scinggpt-remote\scinggpt_proxy.js
```

- Option B — HTTPS (self-provided cert):

```powershell
$env:SSL_KEY_PATH = "G:\\path\\to\\key.pem"
$env:SSL_CERT_PATH = "G:\\path\\to\\cert.pem"
$env:REMOTE_TOKEN  = "your-optional-token"  # optional
node .tools\scinggpt-remote\scinggpt_proxy.js
```

Proxy forwards to local MCP stdio server at http://127.0.0.1:8787.

## Cloudflared Tunnel (recommended)
Front the proxy with Cloudflare Access before enabling write mode:

```powershell
cloudflared tunnel --url http://127.0.0.1:8788   # HTTP fallback
# or
cloudflared tunnel --url https://localhost:4443  # if TLS configured
```

## Gate Enforcement
- Mode: read_only (no write or git operations)
- Allowed paths contain: repo_list, git_status, git_diff, file_read, convo_get
- Denied by default; all requests are audited to logs/proxy.audit.jsonl
