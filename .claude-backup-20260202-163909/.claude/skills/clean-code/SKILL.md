---
name: clean-code
description: Clean code principles, naming conventions, and code organization patterns.
version: 1.0.0
---

# Clean Code Principles

Writing readable, maintainable, and professional code.

## Naming Conventions

### Variables

```typescript
// ✅ Good - Descriptive, clear intent
const userEmail = 'test@example.com';
const isAuthenticated = true;
const maxRetryCount = 3;
const orderItems = [];

// ❌ Bad - Unclear, abbreviated
const e = 'test@example.com';
const flag = true;
const n = 3;
const arr = [];
```

### Functions

```typescript
// ✅ Good - Verb + noun, describes action
function getUserById(id: number) { }
function calculateTotalPrice(items: Item[]) { }
function validateEmail(email: string) { }
function sendWelcomeEmail(user: User) { }

// ❌ Bad - Unclear purpose
function process(data: any) { }
function doStuff() { }
function handle(x: any) { }
```

### Booleans

```typescript
// ✅ Good - Question form
const isActive = true;
const hasPermission = false;
const canDelete = true;
const shouldRefresh = false;

// ❌ Bad - Not obvious it's boolean
const active = true;
const permission = false;
const delete = true;
```

### Constants

```typescript
// ✅ Good - SCREAMING_SNAKE_CASE for true constants
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';
const DEFAULT_PAGE_SIZE = 20;

// Regular const (not really a constant)
const config = loadConfig();
```

## Functions

### Single Responsibility

```typescript
// ✅ Good - One function, one job
function validateUser(user: User): ValidationResult {
  return validateFields(user);
}

function saveUser(user: User): Promise<void> {
  return db.users.save(user);
}

function notifyUser(user: User): Promise<void> {
  return emailService.send(user.email, 'Welcome!');
}

// ❌ Bad - Too many responsibilities
function processUser(user: User) {
  // Validates
  // Saves to database
  // Sends email
  // Logs analytics
  // Updates cache
}
```

### Keep Functions Small

```typescript
// ✅ Good - Small, focused functions
function calculateOrderTotal(order: Order): number {
  const subtotal = calculateSubtotal(order.items);
  const tax = calculateTax(subtotal, order.taxRate);
  const discount = calculateDiscount(subtotal, order.coupon);
  return subtotal + tax - discount;
}

function calculateSubtotal(items: OrderItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}
```

### Limit Parameters

```typescript
// ✅ Good - Use object for many parameters
interface CreateUserOptions {
  name: string;
  email: string;
  role?: 'admin' | 'user';
  department?: string;
}

function createUser(options: CreateUserOptions) { }

// ❌ Bad - Too many parameters
function createUser(
  name: string,
  email: string,
  role: string,
  department: string,
  managerId: number,
  startDate: Date
) { }
```

## Error Handling

### Use Exceptions for Exceptional Cases

```typescript
// ✅ Good - Clear error handling
async function getUser(id: number): Promise<User> {
  const user = await db.users.findById(id);

  if (!user) {
    throw new NotFoundError(`User ${id} not found`);
  }

  return user;
}

// Usage
try {
  const user = await getUser(123);
} catch (error) {
  if (error instanceof NotFoundError) {
    // Handle not found
  }
  throw error; // Re-throw unexpected errors
}
```

### Custom Error Classes

```typescript
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 'NOT_FOUND', 404);
  }
}

class ValidationError extends AppError {
  constructor(message: string, public fields: string[]) {
    super(message, 'VALIDATION_ERROR', 422);
  }
}
```

## Comments

### When to Comment

```typescript
// ✅ Good - Explain WHY, not WHAT
// Using exponential backoff because the API has rate limits
const delay = Math.pow(2, attempt) * 1000;

// ✅ Good - Document complex business logic
// Tax is calculated at 8% for orders over $100,
// per state regulation ABC-123
const taxRate = subtotal > 100 ? 0.08 : 0;

// ❌ Bad - States the obvious
// Increment counter
counter++;

// ❌ Bad - Outdated comment
// Returns user name
function getUserEmail() { } // Actually returns email!
```

### Self-Documenting Code

```typescript
// ✅ Good - Code explains itself
const isEligibleForDiscount = orderTotal > MINIMUM_ORDER_FOR_DISCOUNT
  && customer.membershipLevel === 'gold'
  && !hasUsedDiscountThisMonth(customer);

// ❌ Bad - Needs comment to understand
// Check if customer can get discount
const x = t > 100 && c.l === 'g' && !f(c);
```

## Code Organization

### File Structure

```
src/
├── components/          # UI components
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx
│   │   └── index.ts
│   └── ...
├── hooks/               # Custom hooks
├── services/            # API/business logic
├── utils/               # Pure utility functions
├── types/               # TypeScript types
└── constants/           # App constants
```

### Import Order

```typescript
// 1. External libraries
import React from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal modules (absolute imports)
import { Button } from '@/components';
import { useAuth } from '@/hooks';

// 3. Relative imports
import { UserCard } from './UserCard';
import { formatDate } from './utils';

// 4. Types (if separate)
import type { User } from '@/types';

// 5. Styles
import styles from './Dashboard.module.css';
```

## SOLID Principles

### Single Responsibility
One class/module = one reason to change

### Open/Closed
Open for extension, closed for modification

### Liskov Substitution
Subtypes must be substitutable for base types

### Interface Segregation
Many specific interfaces > one general interface

### Dependency Inversion
Depend on abstractions, not concretions

```typescript
// ✅ Good - Dependency injection
class UserService {
  constructor(private repository: UserRepository) {}

  async getUser(id: number) {
    return this.repository.findById(id);
  }
}

// Can inject any implementation
const service = new UserService(new PostgresUserRepository());
const testService = new UserService(new MockUserRepository());
```

## Best Practices Summary

1. **Meaningful names** - Clear, descriptive, consistent
2. **Small functions** - Do one thing well
3. **DRY** - Don't Repeat Yourself (but don't over-abstract)
4. **YAGNI** - You Aren't Gonna Need It
5. **KISS** - Keep It Simple, Stupid
6. **Fail fast** - Validate early, error immediately
7. **Consistent formatting** - Use linter/formatter
8. **Test your code** - If it's not tested, it's broken
