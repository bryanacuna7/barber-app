---
name: nextjs-best-practices
description: Next.js App Router, Server Components, and best practices for production applications.
version: 1.0.0
---

# Next.js Best Practices

Modern Next.js patterns with App Router.

## App Router Structure

```
app/
├── layout.tsx          # Root layout
├── page.tsx            # Home page
├── loading.tsx         # Loading UI
├── error.tsx           # Error UI
├── not-found.tsx       # 404 page
├── globals.css         # Global styles
├── (auth)/             # Route group (no URL segment)
│   ├── login/
│   │   └── page.tsx
│   └── register/
│       └── page.tsx
├── dashboard/
│   ├── layout.tsx      # Dashboard layout
│   ├── page.tsx        # /dashboard
│   └── [id]/           # Dynamic route
│       └── page.tsx    # /dashboard/123
└── api/
    └── users/
        └── route.ts    # API route
```

## Server Components (Default)

```tsx
// ✅ Server Component - fetches data on server
async function ProductList() {
  const products = await db.products.findMany();

  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

## Client Components

```tsx
'use client';

// ✅ Client Component - for interactivity
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

## Data Fetching

### Server-side Fetching

```tsx
// ✅ Fetch in Server Components
async function Page() {
  const data = await fetch('https://api.example.com/data', {
    cache: 'force-cache',      // Default - static
    // cache: 'no-store',      // Dynamic - always fresh
    // next: { revalidate: 60 } // ISR - revalidate every 60s
  }).then(res => res.json());

  return <div>{data.title}</div>;
}
```

### Server Actions

```tsx
// ✅ Server Actions for mutations
async function createPost(formData: FormData) {
  'use server';

  const title = formData.get('title') as string;

  await db.posts.create({ data: { title } });
  revalidatePath('/posts');
}

export function CreatePostForm() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <button type="submit">Create</button>
    </form>
  );
}
```

## Layouts

```tsx
// app/layout.tsx - Root Layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

## Loading & Error States

```tsx
// loading.tsx - Automatic loading UI
export default function Loading() {
  return <div className="animate-pulse">Loading...</div>;
}

// error.tsx - Error boundary
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## API Routes

```tsx
// app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await db.users.findMany();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const body = await request.json();
  const user = await db.users.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
```

## Metadata

```tsx
// Static metadata
export const metadata = {
  title: 'My App',
  description: 'Description',
};

// Dynamic metadata
export async function generateMetadata({ params }: Props) {
  const product = await getProduct(params.id);

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [product.image],
    },
  };
}
```

## Image Optimization

```tsx
import Image from 'next/image';

// ✅ Optimized image
<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority // Load immediately for LCP
/>

// ✅ Fill container
<div className="relative h-64">
  <Image
    src="/background.jpg"
    alt="Background"
    fill
    className="object-cover"
  />
</div>
```

## Middleware

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');

  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

## Environment Variables

```env
# .env.local
DATABASE_URL=postgresql://...

# Public (accessible in browser)
NEXT_PUBLIC_API_URL=https://api.example.com
```

```tsx
// Server-only
const dbUrl = process.env.DATABASE_URL;

// Client-accessible
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```
