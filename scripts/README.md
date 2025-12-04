# ScingOS Automation Scripts

Utility scripts for development, testing, building, and deployment.

---

## Available Scripts

### `setup.sh`

Initial development environment setup.

```bash
./scripts/setup.sh
```

This script:
- Checks Node.js version (requires v18+)
- Installs Firebase CLI if not present
- Installs client dependencies
- Installs cloud functions dependencies
- Creates `.env.local` from template
- Checks Firebase authentication

---

### `dev.sh`

Start local development servers.

```bash
./scripts/dev.sh
```

Starts:
- Next.js dev server (port 3000)
- Firebase emulators (ports 5001, 8080)

If `tmux` is installed, runs both in split panes.  
Otherwise, runs sequentially.

---

### `test.sh`

Run full test suite.

```bash
./scripts/test.sh
```

Runs:
- Client tests with coverage
- Cloud functions tests

Exits with error if any tests fail.

---

### `build.sh`

Build for production.

```bash
./scripts/build.sh
```

Builds:
- Client (Next.js) → `client/.next/`
- Cloud functions (TypeScript) → `cloud/functions/lib/`

---

### `deploy.sh`

Deploy to staging or production.

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production
```

Performs:
1. Run tests
2. Build client and functions
3. Deploy client to Vercel
4. Deploy functions to Firebase
5. Deploy Firestore rules
6. Deploy Storage rules

Production deployments require confirmation.

---

## Prerequisites

### Required

- **Node.js v18+**: `node --version`
- **npm**: `npm --version`
- **Firebase CLI**: `npm install -g firebase-tools`
- **Vercel CLI**: `npm install -g vercel` (for deployment)

### Optional

- **tmux**: For parallel dev servers (`brew install tmux` on macOS)

---

## Making Scripts Executable

```bash
chmod +x scripts/*.sh
```

---

## Troubleshooting

### Permission Denied

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Node Version Error

Install Node.js v18+:  
- macOS: `brew install node@18`
- Ubuntu: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -`

### Firebase Login Required

```bash
firebase login
```

### Vercel Not Configured

```bash
cd client
vercel login
vercel link
```

---

*Built with Bona Fide Intelligence | © 2025 Inspection Systems Direct LLC*