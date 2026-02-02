# Internationalization (i18n) & Localization

Patterns for building multilingual applications.

## Next.js App Router i18n

### Project Structure

```
app/
├── [locale]/
│   ├── layout.tsx
│   ├── page.tsx
│   └── about/
│       └── page.tsx
├── i18n/
│   ├── config.ts
│   ├── dictionaries.ts
│   └── dictionaries/
│       ├── en.json
│       └── es.json
└── middleware.ts
```

### Configuration

```typescript
// i18n/config.ts
export const locales = ['en', 'es', 'fr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
};
```

### Middleware for Locale Detection

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n/config';

function getLocale(request: NextRequest): string {
  // Check cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale as any)) {
    return cookieLocale;
  }

  // Check Accept-Language header
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    const preferred = acceptLanguage
      .split(',')
      .map((lang) => lang.split(';')[0].trim().substring(0, 2))
      .find((lang) => locales.includes(lang as any));
    if (preferred) return preferred;
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if pathname already has locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return;

  // Redirect to locale-prefixed path
  const locale = getLocale(request);
  return NextResponse.redirect(
    new URL(`/${locale}${pathname}`, request.url)
  );
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

### Dictionary Loading

```typescript
// i18n/dictionaries.ts
import type { Locale } from './config';

const dictionaries = {
  en: () => import('./dictionaries/en.json').then((m) => m.default),
  es: () => import('./dictionaries/es.json').then((m) => m.default),
  fr: () => import('./dictionaries/fr.json').then((m) => m.default),
};

export const getDictionary = async (locale: Locale) => {
  return dictionaries[locale]();
};
```

### Dictionary Files

```json
// i18n/dictionaries/en.json
{
  "common": {
    "home": "Home",
    "about": "About",
    "contact": "Contact",
    "signIn": "Sign In",
    "signOut": "Sign Out"
  },
  "home": {
    "title": "Welcome to Our App",
    "description": "Build amazing things",
    "cta": "Get Started"
  },
  "errors": {
    "notFound": "Page not found",
    "serverError": "Something went wrong"
  }
}

// i18n/dictionaries/es.json
{
  "common": {
    "home": "Inicio",
    "about": "Acerca de",
    "contact": "Contacto",
    "signIn": "Iniciar sesión",
    "signOut": "Cerrar sesión"
  },
  "home": {
    "title": "Bienvenido a Nuestra App",
    "description": "Construye cosas increíbles",
    "cta": "Comenzar"
  },
  "errors": {
    "notFound": "Página no encontrada",
    "serverError": "Algo salió mal"
  }
}
```

### Page Components

```typescript
// app/[locale]/page.tsx
import { getDictionary } from '@/i18n/dictionaries';
import type { Locale } from '@/i18n/config';

export default async function Home({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  const dict = await getDictionary(locale);

  return (
    <main>
      <h1>{dict.home.title}</h1>
      <p>{dict.home.description}</p>
      <button>{dict.home.cta}</button>
    </main>
  );
}
```

### Layout with Language Switcher

```typescript
// app/[locale]/layout.tsx
import { locales, localeNames, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import Link from 'next/link';

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const dict = await getDictionary(locale);

  return (
    <html lang={locale}>
      <body>
        <header>
          <nav>
            <Link href={`/${locale}`}>{dict.common.home}</Link>
            <Link href={`/${locale}/about`}>{dict.common.about}</Link>
          </nav>

          <LanguageSwitcher currentLocale={locale} />
        </header>

        {children}
      </body>
    </html>
  );
}

function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  return (
    <div>
      {locales.map((locale) => (
        <Link
          key={locale}
          href={`/${locale}`}
          className={locale === currentLocale ? 'active' : ''}
        >
          {localeNames[locale]}
        </Link>
      ))}
    </div>
  );
}
```

## Interpolation & Pluralization

### With Variables

```json
// en.json
{
  "greeting": "Hello, {name}!",
  "items": "You have {count} items in your cart"
}
```

```typescript
// utils/interpolate.ts
export function t(
  template: string,
  variables: Record<string, string | number>
): string {
  return template.replace(/{(\w+)}/g, (_, key) =>
    String(variables[key] ?? `{${key}}`)
  );
}

// Usage
t(dict.greeting, { name: 'John' }); // "Hello, John!"
```

### Pluralization

```json
// en.json
{
  "items": {
    "zero": "No items",
    "one": "1 item",
    "other": "{count} items"
  }
}
```

```typescript
// utils/pluralize.ts
type PluralRules = {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
};

export function plural(
  rules: PluralRules,
  count: number,
  locale: string
): string {
  const pluralRules = new Intl.PluralRules(locale);
  const rule = pluralRules.select(count);

  const template = rules[rule] ?? rules.other;
  return template.replace('{count}', String(count));
}

// Usage
plural(dict.items, 0, 'en');  // "No items"
plural(dict.items, 1, 'en');  // "1 item"
plural(dict.items, 5, 'en');  // "5 items"
```

## Date & Number Formatting

```typescript
// utils/formatters.ts
export function formatDate(
  date: Date,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'long',
    ...options,
  }).format(date);
}

export function formatNumber(
  value: number,
  locale: string,
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatCurrency(
  value: number,
  locale: string,
  currency: string
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

export function formatRelativeTime(
  date: Date,
  locale: string
): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diff = date.getTime() - Date.now();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  if (Math.abs(days) < 1) {
    const hours = Math.round(diff / (1000 * 60 * 60));
    return rtf.format(hours, 'hour');
  }
  return rtf.format(days, 'day');
}

// Usage
formatDate(new Date(), 'es');           // "23 de enero de 2024"
formatNumber(1234.56, 'de');            // "1.234,56"
formatCurrency(99.99, 'ja', 'JPY');     // "￥100"
formatRelativeTime(tomorrow, 'en');      // "tomorrow"
```

## RTL Support

```typescript
// i18n/config.ts
export const rtlLocales = ['ar', 'he', 'fa'] as const;

export function isRTL(locale: string): boolean {
  return rtlLocales.includes(locale as any);
}

// app/[locale]/layout.tsx
export default function Layout({ params: { locale } }) {
  const dir = isRTL(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir}>
      <body className={dir === 'rtl' ? 'font-arabic' : ''}>
        {children}
      </body>
    </html>
  );
}
```

```css
/* RTL-aware CSS */
.sidebar {
  margin-inline-start: 1rem;  /* Works for both LTR and RTL */
  padding-inline-end: 1rem;
}

/* Or use Tailwind */
<div className="ms-4 pe-4">  {/* margin-start, padding-end */}
```

## SEO for Multilingual Sites

```typescript
// app/[locale]/layout.tsx
import { locales, type Locale } from '@/i18n/config';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  const dict = await getDictionary(locale);

  return {
    title: dict.home.title,
    alternates: {
      canonical: `https://example.com/${locale}`,
      languages: Object.fromEntries(
        locales.map((l) => [l, `https://example.com/${l}`])
      ),
    },
  };
}
```

## Translation Management Tips

| Practice | Description |
|----------|-------------|
| Use keys, not text | `"nav.home"` not `"Home"` |
| Namespace by feature | `auth.signIn`, `cart.checkout` |
| Keep strings short | Break long text into components |
| Avoid concatenation | Use interpolation `{name}` |
| Context for translators | Add comments for ambiguous terms |
| Extract early | Start with i18n from day one |

## Tools

| Tool | Purpose |
|------|---------|
| Crowdin | Translation management |
| Lokalise | Collaborative translation |
| i18next | Full-featured i18n library |
| FormatJS | React-focused i18n |
| Intl API | Native browser formatting |
