# ScingOS Quick Start Guide

**Get up and running with ScingOS in 10 minutes**

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** or **pnpm**
- **Git**
- **Firebase account** (free Spark plan works for development)
- **Vercel account** (optional, for deployment)

---

## Step 1: Clone Repository

```bash
git clone https://github.com/isystemsdirect/ScingOS.git
cd ScingOS
```

---

## Step 2: Run Setup Script

```bash
chmod +x scripts/*.sh
./scripts/setup.sh
```

This will:
- Check Node.js version
- Install Firebase CLI
- Install all dependencies
- Create `.env.local` template

---

## Step 3: Configure Firebase

### 3a. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it (e.g., `scingos-dev`)
4. Enable Google Analytics (optional)
5. Create project

### 3b. Enable Services

In your Firebase project:

1. **Authentication**
   - Go to Authentication > Sign-in method
   - Enable Email/Password
   - Enable Google (optional)

2. **Firestore Database**
   - Go to Firestore Database
   - Click "Create database"
   - Start in **test mode** (for development)
   - Choose location closest to you

3. **Cloud Storage**
   - Go to Storage
   - Click "Get started"
   - Start in **test mode**

4. **Cloud Functions**
   - Go to Functions
   - Upgrade to Blaze plan (required for external API calls)
   - You'll only pay for what you use

### 3c. Get Firebase Config

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click "Web" icon (</>)
4. Register app (name: `ScingOS Client`)
5. Copy the firebaseConfig object

### 3d. Update Environment Variables

Edit `client/.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## Step 4: Link Firebase CLI

```bash
firebase login
firebase use --add
# Select your project from the list
# Give it an alias (e.g., 'dev')
```

---

## Step 5: Deploy Firebase Rules

```bash
firebase deploy --only firestore:rules,storage:rules
```

---

## Step 6: Start Development Servers

### Option A: Using the dev script (recommended)

```bash
./scripts/dev.sh
```

This starts both client and Firebase emulators in parallel.

### Option B: Manual start

Terminal 1 - Client:
```bash
cd client
npm run dev
```

Terminal 2 - Firebase Emulators:
```bash
cd cloud/functions
npm run serve
```

---

## Step 7: Access the Application

- **Client**: http://localhost:3000
- **Firebase Emulator UI**: http://localhost:4000
- **Firestore Emulator**: http://localhost:8080
- **Functions Emulator**: http://localhost:5001

---

## Step 8: Create Test User

1. Go to http://localhost:3000
2. Click "Sign In"
3. Create account with email/password
4. Check Firebase Emulator UI to see the user

---

## Next Steps

### Deploy Cloud Functions (Optional)

```bash
cd cloud/functions
npm run build
firebase deploy --only functions
```

### Deploy Client to Vercel (Optional)

```bash
cd client
npm install -g vercel
vercel login
vercel
```

### Run Tests

```bash
./scripts/test.sh
```

### Build for Production

```bash
./scripts/build.sh
```

---

## Troubleshooting

### Port Already in Use

Kill process:
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Firebase Auth Error

```bash
firebase logout
firebase login
```

### Dependencies Out of Date

```bash
cd client && npm install
cd ../cloud/functions && npm install
```

### Emulators Not Starting

```bash
firebase emulators:start --debug
```

---

## Common Commands

```bash
# Start development
./scripts/dev.sh

# Run tests
./scripts/test.sh

# Build for production
./scripts/build.sh

# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production

# View Firebase logs
firebase functions:log

# View Firestore data
firebase firestore:data
```

---

## Resources

- [Full Documentation](../README.md)
- [Architecture Guide](ARCHITECTURE.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

---

## Need Help?

- GitHub Issues: https://github.com/isystemsdirect/ScingOS/issues
- Email: isystemsdirect@gmail.com

---

*Built with Bona Fide Intelligence | © 2025 Inspection Systems Direct LLC*