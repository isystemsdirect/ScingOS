# Contribution Terms

By submitting any contribution (code, documentation, design, or ideas) to 
this repository, you agree that your contribution:

1. Becomes the exclusive property of Inspection Systems Direct LLC  
2. Transfers all intellectual property rights to Inspection Systems Direct LLC  
3. Is provided without expectation of compensation  
4. Does not violate the rights of any third party  
5. May be modified, redistributed, or commercialized by ISD  

If you do not agree to these terms, do not submit contributions.

Inspection Systems Direct LLC reserves the right to reject any submission 
for any reason.

© 2025 Inspection Systems Direct LLC

---

# Contributing to ScingOS

Thank you for your interest in contributing to ScingOS! This document provides guidelines and instructions for contributing to the project.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing Requirements](#testing-requirements)
8. [Documentation](#documentation)
9. [Questions and Support](#questions-and-support)

---

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md) that all contributors are expected to follow. Please read it before participating.

---

## Getting Started

### Prerequisites

- **Node.js**: v18.x or higher
- **npm** or **pnpm**: Latest stable version
- **Git**: v2.x or higher
- **Firebase CLI**: Install globally via `npm install -g firebase-tools`
- **TypeScript**: Knowledge of TypeScript is required

### Fork and Clone

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/ScingOS.git
   cd ScingOS
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/isystemsdirect/ScingOS.git
   ```

### Install Dependencies

```bash
npm install
# or
pnpm install
```

### Set Up Environment

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase credentials and API keys (contact the team if you need access)

3. Initialize Firebase locally:
   ```bash
   firebase login
   firebase use --add
   ```

### Run Development Server

```bash
npm run dev
# or
pnpm dev
```

The app should now be running at `http://localhost:3000`

---

## Development Workflow

### Branch Naming Convention

Create a new branch for each feature or bugfix:

- **Feature**: `feature/description-of-feature`
- **Bugfix**: `fix/description-of-bug`
- **Documentation**: `docs/description-of-change`
- **Refactor**: `refactor/description-of-refactor`
- **Test**: `test/description-of-test`

Example:
```bash
git checkout -b feature/add-voice-commands
```

### Keep Your Fork Updated

Regularly sync with the upstream repository:

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

---

## Coding Standards

### TypeScript

- Use **TypeScript** for all new code
- Define proper types and interfaces
- Avoid `any` type unless absolutely necessary
- Use `unknown` instead of `any` when type is truly unknown

### Code Style

- Follow **ESLint** rules configured in the project
- Use **Prettier** for code formatting (runs automatically on save)
- Maximum line length: **100 characters**
- Use **2 spaces** for indentation
- Use **single quotes** for strings (Prettier default)

### File Organization

```
client/
├── components/
│   ├── common/        # Reusable UI components
│   ├── voice/         # Voice interface components
│   ├── inspection/    # Inspection-specific components
│   └── layout/        # Layout components
├── lib/
│   ├── firebase/      # Firebase utilities
│   ├── aip/           # AIP protocol client
│   ├── hooks/         # Custom React hooks
│   └── utils/         # Utility functions
├── pages/             # Next.js pages
├── public/            # Static assets
├── styles/            # Global styles
└── types/             # TypeScript type definitions
```

### Naming Conventions

- **Components**: PascalCase (`VoiceInterface.tsx`)
- **Files**: kebab-case (`voice-interface.ts`)
- **Functions**: camelCase (`getUserData`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Interfaces/Types**: PascalCase (`UserProfile`, `SessionData`)

### Comments

- Use **JSDoc** for function and class documentation
- Add inline comments for complex logic
- Explain **why**, not **what** (code should be self-explanatory)

Example:
```typescript
/**
 * Requests capability tokens from BANE for the specified actions
 * @param actions - Array of action identifiers (e.g., ["camera.read", "file.write"])
 * @param context - Request context (user ID, session ID, device info)
 * @returns Promise resolving to capability tokens or rejection if denied
 */
export async function requestCapabilities(
  actions: string[],
  context: RequestContext
): Promise<CapabilityToken[]> {
  // Implementation
}
```

---

## Commit Guidelines

### Commit Message Format

We follow **Conventional Commits** specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

**Scope** (optional): Component or area affected (`voice`, `bane`, `firebase`, `aip`)

**Subject**: Brief description (imperative mood, lowercase, no period)

**Examples**:
```
feat(voice): add wake word detection

fix(bane): resolve capability token expiration issue

docs(readme): update installation instructions

refactor(aip): simplify message serialization

test(voice): add unit tests for ASR module
```

### Commit Best Practices

- **One logical change per commit**
- Write meaningful commit messages
- Reference issue numbers when applicable: `fix(voice): resolve #42`
- Keep commits focused and atomic

---

## Pull Request Process

### Before Submitting

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests**:
   ```bash
   npm run test
   npm run test:e2e
   ```

3. **Lint and format**:
   ```bash
   npm run lint
   npm run format
   ```

4. **Build successfully**:
   ```bash
   npm run build
   ```

### Creating a Pull Request

1. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Open a PR** on GitHub from your fork to `isystemsdirect/ScingOS:main`

3. **Fill out the PR template** completely:
   - **Description**: What changes does this PR introduce?
   - **Related Issues**: Link to related issue(s)
   - **Type of Change**: Feature, bugfix, docs, etc.
   - **Testing**: How was this tested?
   - **Screenshots**: If UI changes, include before/after screenshots
   - **Checklist**: Confirm all items are complete

### PR Review Process

- **Automated checks** must pass (linting, tests, build)
- At least **one approving review** from a maintainer is required
- Address all review comments
- Keep PR scope focused (avoid unrelated changes)
- Be responsive to feedback

### After Approval

- Maintainers will merge your PR using **squash and merge**
- Your contribution will be included in the next release
- Thank you! 🎉

---

## Testing Requirements

### Unit Tests

- Write unit tests for all new functions and components
- Use **Jest** and **React Testing Library**
- Aim for **>80% code coverage**

Example:
```typescript
import { render, screen } from '@testing-library/react';
import { VoiceButton } from './VoiceButton';

describe('VoiceButton', () => {
  it('renders correctly', () => {
    render(<VoiceButton />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<VoiceButton onClick={handleClick} />);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests

- Test interactions between components
- Mock external dependencies (Firebase, API calls)

### End-to-End Tests

- Use **Playwright** for E2E tests
- Test critical user flows (voice interaction, inspection workflow)

### Running Tests

```bash
# Unit tests
npm run test

# Unit tests with coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# Watch mode
npm run test:watch
```

---

## Documentation

### Code Documentation

- Use **JSDoc** for public APIs
- Keep inline comments up-to-date
- Document complex algorithms and business logic

### Project Documentation

- Update relevant `.md` files when making changes
- Add new documentation for new features
- Keep `README.md` and `ARCHITECTURE.md` current

### Documentation Structure

- `/docs` contains detailed technical documentation
- Each major component should have its own doc file
- Use Markdown for all documentation

---

## Questions and Support

### Where to Ask Questions

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For general questions and ideas
- **Email**: isystemsdirect@gmail.com for private inquiries

### Reporting Bugs

When reporting bugs, please include:

1. **Environment**: OS, browser, Node.js version
2. **Steps to reproduce**: Detailed steps to trigger the bug
3. **Expected behavior**: What you expected to happen
4. **Actual behavior**: What actually happened
5. **Screenshots/Logs**: Any relevant visual or log output
6. **Code samples**: Minimal reproducible example

### Suggesting Features

When suggesting new features:

1. **Use case**: Describe the problem you're trying to solve
2. **Proposed solution**: How you envision the feature working
3. **Alternatives**: Other approaches you've considered
4. **Additional context**: Mockups, examples, references

---

## Recognition

Contributors will be recognized in:

- Project `README.md` contributors section
- Release notes
- Project documentation

---

## License

By contributing to ScingOS, you agree that your contributions will be licensed under the project's [Proprietary License](LICENSE).

---

## Thank You!

Your contributions make ScingOS better for everyone. We appreciate your time and effort!

---

*Questions? Contact us at isystemsdirect@gmail.com*

*Powered by SCINGULAR AI | Built with Bona Fide Intelligence*