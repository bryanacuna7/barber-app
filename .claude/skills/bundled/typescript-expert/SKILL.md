---
name: typescript-expert
description: TypeScript type-level programming, utility types, and best practices.
version: 1.0.0
---

# TypeScript Expert Patterns

Advanced TypeScript patterns and type-level programming.

## Basic Types

```typescript
// Primitives
const name: string = 'John';
const age: number = 30;
const active: boolean = true;

// Arrays
const numbers: number[] = [1, 2, 3];
const names: Array<string> = ['a', 'b'];

// Objects
interface User {
  id: number;
  name: string;
  email?: string; // Optional
}

// Union types
type Status = 'pending' | 'active' | 'completed';

// Type aliases
type ID = string | number;
```

## Function Types

```typescript
// Function signatures
function greet(name: string): string {
  return `Hello, ${name}`;
}

// Arrow functions
const add = (a: number, b: number): number => a + b;

// Function type
type Callback = (data: string) => void;

// Generic function
function identity<T>(value: T): T {
  return value;
}

// Overloads
function parse(input: string): object;
function parse(input: object): string;
function parse(input: string | object): string | object {
  return typeof input === 'string' ? JSON.parse(input) : JSON.stringify(input);
}
```

## Utility Types

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  password: string;
}

// Partial - All properties optional
type PartialUser = Partial<User>;
// { id?: number; name?: string; ... }

// Required - All properties required
type RequiredUser = Required<PartialUser>;

// Pick - Select properties
type UserPreview = Pick<User, 'id' | 'name'>;
// { id: number; name: string; }

// Omit - Exclude properties
type PublicUser = Omit<User, 'password'>;
// { id: number; name: string; email: string; }

// Readonly - Immutable
type ImmutableUser = Readonly<User>;

// Record - Object type
type UserRoles = Record<string, 'admin' | 'user'>;
// { [key: string]: 'admin' | 'user' }

// Extract - Extract types from union
type StringOrNumber = Extract<string | number | boolean, string | number>;
// string | number

// Exclude - Remove types from union
type OnlyString = Exclude<string | number | boolean, number | boolean>;
// string

// NonNullable - Remove null/undefined
type SafeString = NonNullable<string | null | undefined>;
// string

// ReturnType - Get function return type
type GetUserReturn = ReturnType<typeof getUser>;

// Parameters - Get function parameters
type GetUserParams = Parameters<typeof getUser>;
```

## Generics

```typescript
// Generic interface
interface Response<T> {
  data: T;
  error: string | null;
}

// Generic constraints
interface HasId {
  id: number;
}

function findById<T extends HasId>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id);
}

// Multiple generics
function merge<T, U>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

// Default generic
interface Container<T = string> {
  value: T;
}
```

## Conditional Types

```typescript
// Basic conditional
type IsString<T> = T extends string ? true : false;

// Infer keyword
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
type Result = UnwrapPromise<Promise<string>>; // string

// Distributive conditional
type ToArray<T> = T extends any ? T[] : never;
type StrOrNumArray = ToArray<string | number>; // string[] | number[]

// Non-distributive
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never;
type Together = ToArrayNonDist<string | number>; // (string | number)[]
```

## Mapped Types

```typescript
// Basic mapped type
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

// With modifiers
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

// Key remapping
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};

interface Person {
  name: string;
  age: number;
}

type PersonGetters = Getters<Person>;
// { getName: () => string; getAge: () => number; }
```

## Template Literal Types

```typescript
type Event = 'click' | 'focus' | 'blur';
type Handler = `on${Capitalize<Event>}`;
// 'onClick' | 'onFocus' | 'onBlur'

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Endpoint = `/${string}`;
type Route = `${HTTPMethod} ${Endpoint}`;
// 'GET /users', 'POST /users', etc.
```

## Type Guards

```typescript
// typeof guard
function process(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase(); // value is string
  }
  return value * 2; // value is number
}

// instanceof guard
function handleError(error: unknown) {
  if (error instanceof Error) {
    console.log(error.message); // error is Error
  }
}

// in guard
interface Dog { bark(): void; }
interface Cat { meow(): void; }

function speak(pet: Dog | Cat) {
  if ('bark' in pet) {
    pet.bark(); // pet is Dog
  } else {
    pet.meow(); // pet is Cat
  }
}

// Custom type guard
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// Assertion function
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Not a string');
  }
}
```

## Discriminated Unions

```typescript
type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };

function handleResult<T>(result: Result<T>) {
  if (result.success) {
    console.log(result.data); // TypeScript knows data exists
  } else {
    console.log(result.error); // TypeScript knows error exists
  }
}
```

## Declaration Files

```typescript
// types/global.d.ts
declare global {
  interface Window {
    myApp: MyApp;
  }
}

// Declare module
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Ambient declaration
declare const ENV: {
  API_URL: string;
  DEBUG: boolean;
};
```

## Best Practices

1. **Enable strict mode** - `"strict": true` in tsconfig
2. **Avoid `any`** - Use `unknown` when type is truly unknown
3. **Use const assertions** - `as const` for literal types
4. **Prefer interfaces** - For object types (better error messages)
5. **Use type inference** - Don't annotate obvious types
6. **Narrow types** - Use type guards instead of assertions
7. **Export types** - Make types reusable across modules
