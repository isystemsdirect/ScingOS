# Testing Guide

**Comprehensive testing strategy for ScingOS**

---

## Table of Contents

1. [Overview](#overview)
2. [Testing Philosophy](#testing-philosophy)
3. [Test Types](#test-types)
4. [Running Tests](#running-tests)
5. [Writing Tests](#writing-tests)
6. [Coverage](#coverage)
7. [CI/CD Integration](#cicd-integration)

---

## Overview

ScingOS follows a **comprehensive testing strategy** that balances coverage with development velocity. We prioritize tests that provide the most value and catch real-world issues.

---

## Testing Philosophy

### Principles

1. **Test behavior, not implementation** - Focus on what the code does, not how
2. **Write tests first when fixing bugs** - Prevent regressions
3. **Keep tests simple and readable** - Tests are documentation
4. **Fast feedback loops** - Tests should run quickly
5. **Test at appropriate levels** - Unit for logic, integration for flows, E2E for critical paths

### Testing Pyramid

```
        /\
       /  \        E2E Tests (10%)
      /____\       - Critical user flows
     /      \      - Voice interactions
    /        \     - End-to-end scenarios
   /__________\    
  /            \   Integration Tests (30%)
 /              \  - Component integration
/________________\ - API integration
                   - Firebase integration

     Unit Tests (60%)
     - Pure functions
     - Business logic
     - Utilities
```

---

## Test Types

### 1. Unit Tests

**Purpose**: Test individual functions and components in isolation

**Location**: `client/__tests__/`, `cloud/functions/__tests__/`

**Tools**: Jest, React Testing Library

**Example**:
```typescript
// client/__tests__/lib/utils/formatDate.test.ts
import { formatDate } from '@/lib/utils/formatDate';

describe('formatDate', () => {
  it('formats date correctly', () => {
    const date = new Date('2025-01-15T10:30:00Z');
    expect(formatDate(date)).toBe('Jan 15, 2025');
  });

  it('handles invalid dates', () => {
    expect(formatDate(null)).toBe('Invalid date');
  });
});
```

---

### 2. Component Tests

**Purpose**: Test React components with user interactions

**Location**: `client/__tests__/components/`

**Tools**: Jest, React Testing Library, Testing Library User Event

**Example**:
```typescript
// client/__tests__/components/voice/VoiceButton.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { VoiceButton } from '@/components/voice/VoiceButton';

describe('VoiceButton', () => {
  it('renders correctly', () => {
    render(<VoiceButton isListening={false} onClick={() => {}} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<VoiceButton isListening={false} onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows listening state', () => {
    const { container } = render(
      <VoiceButton isListening={true} onClick={() => {}} />
    );
    expect(container.querySelector('button')).toHaveClass('bg-red-500');
  });
});
```

---

### 3. Integration Tests

**Purpose**: Test multiple components or services working together

**Location**: `client/__tests__/integration/`, `cloud/functions/__tests__/integration/`

**Example**:
```typescript
// client/__tests__/integration/auth-flow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignIn from '@/pages/auth/signin';

describe('Authentication Flow', () => {
  it('signs in user and redirects to dashboard', async () => {
    const user = userEvent.setup();
    render(<SignIn />);

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com');
    await user.type(screen.getByPlaceholderText('Password'), 'password123');
    await user.click(screen.getByText('Sign in'));

    await waitFor(() => {
      expect(window.location.pathname).toBe('/dashboard');
    });
  });
});
```

---

### 4. End-to-End (E2E) Tests

**Purpose**: Test complete user workflows in a browser

**Location**: `e2e/`

**Tools**: Playwright or Cypress

**Example**:
```typescript
// e2e/inspection-workflow.spec.ts
import { test, expect } from '@playwright/test';

test('complete inspection workflow', async ({ page }) => {
  // Sign in
  await page.goto('/auth/signin');
  await page.fill('input[name="email"]', 'inspector@example.com');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Create inspection
  await page.waitForURL('/dashboard');
  await page.click('text=Start New Session');
  await page.fill('input[name="property"]', '123 Main St');
  await page.click('text=Start Inspection');

  // Add finding
  await page.click('text=Add Finding');
  await page.fill('textarea[name="description"]', 'Foundation crack');
  await page.click('text=Save Finding');

  // Generate report
  await page.click('text=Generate Report');
  await expect(page.locator('text=Report generated')).toBeVisible();
});
```

---

## Running Tests

### Client Tests

```bash
cd client

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test VoiceButton

# Run tests matching pattern
npm test -- --testNamePattern="handles click"
```

### Cloud Functions Tests

```bash
cd cloud/functions

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test suite
npm test bane.test.ts
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run in headed mode (see browser)
npm run test:e2e -- --headed

# Run specific test
npm run test:e2e inspection-workflow.spec.ts

# Debug mode
npm run test:e2e -- --debug
```

---

## Writing Tests

### Best Practices

#### 1. Use Descriptive Test Names

```typescript
✅ GOOD:
it('displays error message when email is invalid', () => { ... })

❌ BAD:
it('works', () => { ... })
```

#### 2. Arrange-Act-Assert Pattern

```typescript
it('calculates total correctly', () => {
  // Arrange
  const items = [{ price: 10 }, { price: 20 }];
  
  // Act
  const total = calculateTotal(items);
  
  // Assert
  expect(total).toBe(30);
});
```

#### 3. Test One Thing at a Time

```typescript
✅ GOOD:
it('validates email format', () => { ... })
it('validates email length', () => { ... })

❌ BAD:
it('validates email', () => {
  // Tests format, length, domain, etc.
});
```

#### 4. Use Test Fixtures

```typescript
// __tests__/fixtures/users.ts
export const mockUser = {
  uid: 'user123',
  email: 'test@example.com',
  role: 'inspector',
};

// Use in tests
import { mockUser } from '../fixtures/users';
```

#### 5. Mock External Dependencies

```typescript
// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  auth: { currentUser: { uid: 'user123' } },
  firestore: {},
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ data: 'mock' }),
  })
);
```

---

## Coverage

### Coverage Targets

| Type | Target | Minimum |
|------|--------|----------|
| Statements | 80% | 70% |
| Branches | 75% | 65% |
| Functions | 80% | 70% |
| Lines | 80% | 70% |

### Viewing Coverage Reports

```bash
# Generate coverage report
npm test -- --coverage

# Open HTML report
open coverage/lcov-report/index.html
```

### What to Cover

✅ **Prioritize**:
- Business logic
- Utility functions
- Complex components
- Error handling
- Edge cases

❌ **Don't stress about**:
- Simple presentational components
- Constants and types
- Generated code
- Third-party integrations (mock instead)

---

## CI/CD Integration

### GitHub Actions

Tests run automatically on:
- Every push to `develop` or `main`
- Every pull request
- Before deployments

### Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Debugging Tests

### Jest Debug

```bash
# Run with debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Then open chrome://inspect in Chrome
```

### React Testing Library Debug

```typescript
import { render, screen } from '@testing-library/react';

it('debugs component', () => {
  render(<MyComponent />);
  
  // Print entire component tree
  screen.debug();
  
  // Print specific element
  screen.debug(screen.getByRole('button'));
});
```

---

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

*Built with Bona Fide Intelligence | © 2025 Inspection Systems Direct LLC*