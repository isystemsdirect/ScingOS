#!/bin/bash
# SpectroCAP™ Windows Client — Smoke Test Guide
# 
# Run this checklist after setup to verify Phase 1 MVP works

echo "=== SpectroCAP™ Phase 1 Smoke Test ===" 
echo

# Step 1: Verify environment
echo "[1/6] Verifying environment..."
if ! command -v node &> /dev/null; then
  echo "ERROR: Node.js not found"
  exit 1
fi
if ! command -v npm &> /dev/null; then
  echo "ERROR: npm not found"
  exit 1
fi
if ! command -v rustc &> /dev/null; then
  echo "ERROR: Rust not found"
  exit 1
fi
echo "✓ Node, npm, Rust found"
echo

# Step 2: Verify Firebase config
echo "[2/6] Checking Firebase config..."
if [ ! -f ".env.local" ]; then
  echo "ERROR: .env.local not found"
  echo "  → Copy .env.example to .env.local"
  echo "  → Fill in your Firebase credentials from Console"
  exit 1
fi
echo "✓ .env.local exists"
echo

# Step 3: Dependencies installed
echo "[3/6] Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo "ERROR: node_modules not found. Run: npm install"
  exit 1
fi
if [ ! -d "node_modules/firebase" ]; then
  echo "ERROR: Firebase not installed. Run: npm install firebase"
  exit 1
fi
echo "✓ Dependencies installed"
echo

# Step 4: Tauri initialized
echo "[4/6] Checking Tauri config..."
if [ ! -f "src-tauri/tauri.conf.json" ]; then
  echo "ERROR: Tauri not initialized. Run: npx tauri init"
  exit 1
fi
echo "✓ Tauri configured"
echo

# Step 5: Firebase verification (manual)
echo "[5/6] Manual Firebase verification:"
echo "  1. Open Firebase Console → Your SpectroCAP project"
echo "  2. Verify Authentication → Email/Password is ENABLED"
echo "  3. Verify Firestore Database → Created (Production mode)"
echo "  4. Verify Storage → Enabled (Production mode)"
echo "  5. Deploy Firestore rules (from cloud/firebase/firestore.rules)"
echo "  6. Deploy Storage rules (from cloud/firebase/storage.rules)"
echo "  7. Create test user: Email='test@example.com', Password='Test1234'"
echo

# Step 6: Run dev
echo "[6/6] Running dev server..."
echo "  → Terminal 1: npm run dev        (Vite server on :5173)"
echo "  → Terminal 2: npm run tauri:dev  (Tauri app window)"
echo
echo "  Then:"
echo "  1. Login with test@example.com / Test1234"
echo "  2. Verify device doc created in Firestore: /users/{uid}/devices/{deviceId}"
echo "  3. Create test message in Firestore (see README.md Step 5b)"
echo "  4. Upload message text to Storage (see README.md Step 5c)"
echo "  5. Verify message appears in app"
echo "  6. Click 'Copy to Clipboard'"
echo "  7. Paste in Notepad → Should see message text"
echo

echo "=== Smoke Test Ready ==="
