# ScingOS Development Guide

**Complete Developer Reference**

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment](#development-environment)
3. [Project Structure](#project-structure)
4. [Coding Standards](#coding-standards)
5. [Testing](#testing)
6. [Building & Deployment](#building--deployment)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **pnpm**
- **Git**
- **Firebase CLI**: `npm install -g firebase-tools`
- **Firebase account** (free Spark plan for development)

### Quick Setup

```bash
# Clone repository
git clone https://github.com/isystemsdirect/ScingOS.git
cd ScingOS

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure Firebase credentials (see Quick Start guide)
# Edit .env with your Firebase config

# Start development
npm run dev
```

For detailed setup instructions, see the [Quick Start Guide](QUICK-START.md).

---

## Development Environment

### Recommended Tools

- **IDE**: VSCode with recommended extensions
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - Firebase
- **Browser**: Chrome with React DevTools

### Environment Variables

Required environment variables in `client/.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Optional variables:

```bash
# AI Providers (select one or both)
# Default: Claude 3.5 Haiku (Anthropic) is now recommended
ANTHROPIC_API_KEY=your_anthropic_api_key

# Legacy OpenAI support (if needed)
OPENAI_KEY=your_openai_key

# Firebase Neural integration
NEXT_PUBLIC_USE_FIREBASE_NEURAL=true
```

**Getting API Keys:**

- **Anthropic (Claude Haiku - Recommended)**: Visit [console.anthropic.com](https://console.anthropic.com) and create an API key
- **OpenAI (Legacy)**: Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### Running Locally

**Option 1: Using development script (recommended)**

```bash
npm run dev
```

**Option 2: Manual start**

```bash
# Terminal 1: Client
cd client
npm run dev

# Terminal 2: Firebase Functions
cd cloud/functions
npm run serve
```

**Access Points:**

- Client: http://localhost:3000
- Firebase Emulator UI: http://localhost:4000
- Functions: http://localhost:5001

---

## Project Structure

```
ScingOS/
├── client/                    # Next.js frontend application
│   ├── app/                  # Next.js 14+ App Router
│   ├── components/           # React components
│   ├── lib/                  # Client-side libraries
│   │   ├── firebase.ts      # Firebase client initialization
│   │   ├── isdc/            # ISDC Protocol implementation
│   │   └── store/           # State management
│   ├── hooks/               # React hooks
│   ├── public/              # Static assets
│   └── package.json
│
├── cloud/                    # Backend services
│   └── functions/           # Firebase Cloud Functions
│       ├── src/
│       │   ├── index.ts     # Function exports
│       │   ├── isdc/        # ISDC Protocol handlers
│       │   ├── bane/        # BANE security modules
│       │   └── lari/        # LARI AI integration
│       └── package.json
│
├── scing/                    # SCINGULAR core library
│   ├── canon/               # Canonical specifications
│   ├── core/                # Core engine modules
│   ├── engines/             # Intelligence engines
│   ├── orchestrator.ts      # Main orchestrator
│   └── index.ts
│
├── docs/                     # Wiki documentation
├── legal/                    # Legal documents
├── scripts/                  # Automation scripts
│   ├── setup.sh
│   ├── dev.sh
│   ├── test.sh
│   ├── build.sh
│   └── deploy.sh
│
├── .github/                  # GitHub configuration
│   ├── workflows/           # CI/CD workflows
│   └── ISSUE_TEMPLATE/
│
├── firebase.json            # Firebase configuration
├── firestore.rules          # Firestore security rules
├── storage.rules            # Storage security rules
├── package.json             # Root package configuration
└── README.md
```

---

## Coding Standards

### TypeScript

- **Always use TypeScript** for new files
- Enable strict mode
- Define explicit types for function parameters and return values
- Use interfaces for object shapes
- Avoid `any` type; use `unknown` when type is truly unknown

**Example:**

```typescript
// Good
interface User {
  id: string;
  email: string;
  displayName: string | null;
}

async function getUser(userId: string): Promise<User> {
  // implementation
}

// Bad
async function getUser(userId) {
  // implementation
}
```

### Code Style

- **Use Prettier** for consistent formatting
- **Follow ESLint rules** defined in `.eslintrc.json`
- **2 spaces** for indentation
- **Single quotes** for strings
- **Semicolons** required
- **Trailing commas** in multi-line objects/arrays

Run formatting:

```bash
npm run format        # Format all files
npm run format:check  # Check formatting without changes
```

### Naming Conventions

- **Files**: `camelCase.ts` or `PascalCase.tsx` for components
- **Components**: `PascalCase`
- **Functions**: `camelCase`
- **Constants**: `UPPER_SNAKE_CASE`
- **Interfaces**: `PascalCase` (no `I` prefix)
- **Types**: `PascalCase`

**Example:**

```typescript
// Component file: UserProfile.tsx
export function UserProfile({ user }: UserProfileProps) {
  const MAX_RETRY_COUNT = 3;

  function handleSubmit() {
    // ...
  }

  return <div>...</div>;
}

// Type file: types.ts
export interface User {
  id: string;
  email: string;
}

export type UserRole = 'admin' | 'inspector' | 'viewer';
```

### Comments

- **Use comments sparingly** - prefer self-documenting code
- **JSDoc for public APIs** and exported functions
- **Inline comments** only for complex logic
- **TODO comments** should include ticket references

**Example:**

```typescript
/**
 * Creates a new inspection session with the given parameters.
 * @param userId - The ID of the user creating the session
 * @param projectId - The project this inspection belongs to
 * @returns The created inspection session
 */
export async function createInspection(
  userId: string,
  projectId: string
): Promise<InspectionSession> {
  // TODO(#123): Add validation for project permissions
  // ...
}
```

### Git Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(client): add voice wake word detection
fix(bane): resolve capability token expiration issue
docs(wiki): update architecture documentation
test(isdc): add protocol message validation tests
```

---

## Testing

### Test Framework

- **Jest** for unit testing
- **React Testing Library** for component tests
- **Firebase Emulators** for integration tests

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test:coverage

# Run specific test file
npm test -- path/to/test.spec.ts
```

### Writing Tests

**Unit Test Example:**

```typescript
// utils.spec.ts
import { formatInspectionId } from './utils';

describe('formatInspectionId', () => {
  it('should format inspection ID correctly', () => {
    const result = formatInspectionId('abc123');
    expect(result).toBe('INS-ABC123');
  });

  it('should handle empty input', () => {
    const result = formatInspectionId('');
    expect(result).toBe('INS-');
  });
});
```

**Component Test Example:**

```typescript
// UserProfile.spec.tsx
import { render, screen } from '@testing-library/react';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('should render user name', () => {
    const user = { id: '1', name: 'John Doe', email: 'john@example.com' };
    render(<UserProfile user={user} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### Test Coverage

Maintain **>80% code coverage** for critical paths:

- Authentication logic
- BANE security checks
- ISDC protocol handlers
- Data validation functions

---

## Building & Deployment

### Build for Production

```bash
# Build client
cd client
npm run build

# Build Cloud Functions
cd cloud/functions
npm run build
```

### Deploy to Firebase

```bash
# Deploy everything
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore rules
firebase deploy --only firestore:rules
```

### Environment-Specific Deployment

```bash
# Use specific Firebase project
firebase use staging
firebase deploy

firebase use production
firebase deploy
```

---

## Common Tasks

### Adding a New Page

```bash
# Create page in client/app
cd client/app
mkdir new-page
touch new-page/page.tsx
```

**Example page.tsx:**

```typescript
export default function NewPage() {
  return (
    <div>
      <h1>New Page</h1>
      {/* Your content */}
    </div>
  );
}
```

### Adding a Cloud Function

```typescript
// cloud/functions/src/index.ts
import { onCall } from 'firebase-functions/v2/https';

export const myNewFunction = onCall(async (request) => {
  // Validate request
  if (!request.auth) {
    throw new Error('Unauthorized');
  }

  // Your logic here
  return { success: true };
});
```

### Adding a Firestore Collection

1. Define types in `client/lib/types.ts`
2. Create security rules in `firestore.rules`
3. Add indexes if needed in `firestore.indexes.json`
4. Deploy rules: `firebase deploy --only firestore`

### Integrating a New Device Adapter

See [Device Integration Guide](device-integration.md) (coming soon)

---

## Troubleshooting

### Common Issues

**Port Already in Use**

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

**Firebase Auth Errors**

```bash
firebase logout
firebase login
firebase use --add
```

**Dependencies Out of Sync**

```bash
rm -rf node_modules package-lock.json
npm install
```

**Type Errors After Update**

```bash
# Restart TypeScript server in VSCode
# Command Palette → TypeScript: Restart TS Server
```

**Build Failures**

```bash
# Clear Next.js cache
rm -rf client/.next

# Clear Firebase build
rm -rf cloud/functions/lib
```

### Debug Mode

Enable debug logging:

```bash
# Client
DEBUG=* npm run dev

# Firebase Functions
firebase emulators:start --debug
```

### Getting Help

- **GitHub Issues**: https://github.com/isystemsdirect/ScingOS/issues
- **Discussions**: https://github.com/isystemsdirect/ScingOS/discussions
- **Email**: isystemsdirect@gmail.com

---

## Quality Gates

All code must pass:

✅ **TypeScript compilation** (`npm run typecheck`)  
✅ **ESLint rules** (`npm run lint`)  
✅ **Prettier formatting** (`npm run format:check`)  
✅ **Unit tests** (`npm test`)  
✅ **SCING Canon compliance** (`npm run canon:check`)

CI/CD automatically runs these checks on pull requests.

---

## Additional Resources

- [Quick Start Guide](QUICK-START.md)
- [Architecture Overview](ARCHITECTURE.md)
- [API Documentation](API.md)
- [Testing Guide](TESTING.md)
- [Contributing Guidelines](../CONTRIBUTING.md)

---

_Built with Bona Fide Intelligence | © 2025 Inspection Systems Direct LLC_
