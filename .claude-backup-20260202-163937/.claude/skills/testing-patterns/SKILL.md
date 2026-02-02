---
name: testing-patterns
description: Unit testing, integration testing, and E2E testing patterns with Jest, Vitest, and Playwright.
version: 1.0.0
---

# Testing Patterns

Comprehensive testing strategies and patterns.

## Testing Pyramid

```
        /\
       /  \
      / E2E \        <- Few, slow, expensive
     /--------\
    /  Integration  <- Some, medium speed
   /--------------\
  /     Unit       <- Many, fast, cheap
 /------------------\
```

## Unit Testing

### Jest/Vitest Basics

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Calculator', () => {
  let calculator: Calculator;

  beforeEach(() => {
    calculator = new Calculator();
  });

  it('should add two numbers', () => {
    expect(calculator.add(2, 3)).toBe(5);
  });

  it('should throw on division by zero', () => {
    expect(() => calculator.divide(10, 0)).toThrow('Division by zero');
  });
});
```

### Mocking

```typescript
// Mock module
vi.mock('./api', () => ({
  fetchUser: vi.fn(),
}));

// Mock function
const mockFn = vi.fn();
mockFn.mockReturnValue(42);
mockFn.mockResolvedValue({ id: 1 });

// Spy on method
const spy = vi.spyOn(object, 'method');

// Mock implementation
vi.mocked(fetchUser).mockResolvedValue({ id: 1, name: 'John' });
```

### Testing Async Code

```typescript
it('should fetch user data', async () => {
  const user = await fetchUser(1);
  expect(user).toEqual({ id: 1, name: 'John' });
});

it('should handle errors', async () => {
  vi.mocked(fetchUser).mockRejectedValue(new Error('Network error'));

  await expect(fetchUser(1)).rejects.toThrow('Network error');
});
```

## React Component Testing

### React Testing Library

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('LoginForm', () => {
  it('should submit form with valid data', async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();

    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('should show validation error', async () => {
    const user = userEvent.setup();

    render(<LoginForm onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
  });
});
```

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react';

describe('useCounter', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });
});
```

## API Testing

### Testing Express Routes

```typescript
import request from 'supertest';
import { app } from './app';

describe('POST /api/users', () => {
  it('should create a new user', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'test@example.com', name: 'Test User' })
      .expect(201);

    expect(response.body.data).toMatchObject({
      email: 'test@example.com',
      name: 'Test User',
    });
  });

  it('should return 422 for invalid email', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({ email: 'invalid', name: 'Test' })
      .expect(422);

    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});
```

## E2E Testing with Playwright

### Basic Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error-message')).toBeVisible();
  });
});
```

### Page Object Model

```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email);
    await this.page.fill('[name="password"]', password);
    await this.page.click('button[type="submit"]');
  }
}

// tests/login.spec.ts
test('should login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('test@example.com', 'password123');
  await expect(page).toHaveURL('/dashboard');
});
```

## Test Patterns

### AAA Pattern

```typescript
it('should calculate total', () => {
  // Arrange
  const cart = new Cart();
  cart.addItem({ price: 10, quantity: 2 });
  cart.addItem({ price: 5, quantity: 1 });

  // Act
  const total = cart.getTotal();

  // Assert
  expect(total).toBe(25);
});
```

### Test Doubles

```typescript
// Stub - Returns fixed data
const userStub = { id: 1, name: 'Test' };

// Mock - Verifies interactions
const mockSend = vi.fn();
emailService.send = mockSend;
// ... do something ...
expect(mockSend).toHaveBeenCalledWith('test@example.com', 'Welcome!');

// Spy - Observes real implementation
const spy = vi.spyOn(console, 'log');
```

## Best Practices

1. **Test behavior, not implementation** - Focus on what, not how
2. **One assertion per test** - Or closely related assertions
3. **Use descriptive names** - `it('should return error when email invalid')`
4. **Isolate tests** - No dependencies between tests
5. **Keep tests fast** - Mock external services
6. **Test edge cases** - Empty arrays, null values, boundaries
7. **Don't test framework code** - Focus on your logic
8. **Use factories** - For consistent test data creation

## Coverage

```bash
# Run with coverage
npm test -- --coverage

# Coverage thresholds (vitest.config.ts)
coverage: {
  statements: 80,
  branches: 75,
  functions: 80,
  lines: 80,
}
```
