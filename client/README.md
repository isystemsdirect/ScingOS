# ScingOS Client

**Voice-First Thin Client for SCINGULAR AI Platform**

---

## Overview

This is the Next.js-based frontend for ScingOS, providing a voice-first interface for interacting with SCINGULAR AI services.

## Tech Stack

- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Icons**: Heroicons
- **Animations**: Framer Motion

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or pnpm
- Firebase project configured

### Installation

```bash
cd client
npm install
```

### Environment Setup

Create `.env.local` file:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

### Testing

```bash
npm test
npm run test:coverage
```

### Linting

```bash
npm run lint
npm run format
```

## Project Structure

```
client/
├── components/       # React components
│   ├── layout/      # Layout components (Navbar, Footer)
│   └── voice/       # Voice interface components
├── lib/             # Utilities and hooks
│   ├── firebase.ts  # Firebase configuration
│   └── store/       # Zustand state management
├── pages/           # Next.js pages
│   ├── _app.tsx     # App wrapper
│   ├── _document.tsx # HTML document
│   └── index.tsx    # Home page
├── public/          # Static assets
├── styles/          # Global styles
└── types/           # TypeScript types
```

## Features

- ✅ Voice input button with visual feedback
- ✅ Firebase authentication integration
- ✅ Responsive layout with Tailwind CSS
- ✅ State management with Zustand
- ✅ TypeScript for type safety
- 🚧 Wake word detection (coming soon)
- 🚧 Speech-to-text integration (coming soon)
- 🚧 AIP protocol client (coming soon)

## Development Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Run linter: `npm run lint`
4. Run tests: `npm test`
5. Commit with conventional commits
6. Push and create pull request

## Deployment

See [DEPLOYMENT.md](../docs/DEPLOYMENT.md) for production deployment instructions.

---

*Built with Bona Fide Intelligence | © 2025 Inspection Systems Direct LLC*