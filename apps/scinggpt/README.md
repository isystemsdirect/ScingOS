# ScingGPT

> Control node of the SCINGULAR Ecosystem - Voice-first, session-oriented AI interface

ScingGPT is an Electron-based desktop application that serves as the intelligence core behind all SCINGULAR operations and systems. It integrates with LLMs (OpenAI, Anthropic) and the MCP (Model Context Protocol) for seamless tool execution.

## Features

- 🎙️ **Voice-First Interaction** - Native voice input with wake word detection
- 💬 **Session Management** - Persistent sessions across app restarts
- 🔧 **MCP Integration** - Direct communication with scinggpt-mcp server
- 🔥 **Firebase Sync** - Real-time cloud synchronization
- 🤖 **Multi-LLM Support** - OpenAI GPT-4 and Anthropic Claude integration

## Prerequisites

- Node.js >= 20
- npm >= 10
- scinggpt-mcp server (`G:/GIT/isystemsdirect/scinggpt-mcp`)

## Quick Start

```powershell
# Install dependencies
npm install

# Start in development mode
npm run dev:electron

# Or start Vite only (for UI development)
npm run dev
```

## Project Structure

```
scinggpt/
├── src/
│   ├── main/           # Electron main process
│   ├── preload/        # Preload scripts (IPC bridge)
│   ├── renderer/       # React UI
│   ├── services/       # Backend services
│   └── shared/         # Shared types & constants
├── tests/              # Test files
└── resources/          # App icons & assets
```

## Configuration

### Environment Variables

Create a `.env` file in the app root:

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Firebase (optional - uses local storage by default)
FIREBASE_API_KEY=...
FIREBASE_AUTH_DOMAIN=...
FIREBASE_PROJECT_ID=...
```

### MCP Server

The app connects to the ScingGPT MCP server at:
```
G:/GIT/isystemsdirect/scinggpt-mcp/dist/server.js
```

Ensure the server is built:
```powershell
cd G:\GIT\isystemsdirect\scinggpt-mcp
npm run build
```

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run dev:electron` | Start Electron with Vite |
| `npm run build` | Build for production |
| `npm run test` | Run tests |
| `npm run lint` | ESLint check |
| `npm run package` | Create distributable |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Space` | Toggle voice input |
| `Ctrl+N` | New session |
| `Ctrl+,` | Settings |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Electron Shell                        │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ React UI     │  │ Session Mgr  │  │ MCP Bridge   │  │
│  │ (Renderer)   │◄─┤ (Main)       │◄─┤ (Main)       │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                 │                 │           │
│         ▼                 ▼                 ▼           │
│  ┌──────────────────────────────────────────────────┐  │
│  │              IPC Bridge (Preload)                 │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
  │ Firebase    │   │ scinggpt-mcp│   │ OpenAI/     │
  │ (Cloud)     │   │ (stdio)     │   │ Anthropic   │
  └─────────────┘   └─────────────┘   └─────────────┘
```

## License

See [LICENSE](../../LICENSE) in the repository root.

---

*Part of the SCINGULAR Ecosystem*
