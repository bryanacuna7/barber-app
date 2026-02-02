# SEO Fundamentals

Search engine optimization patterns for web applications.

## Meta Tags

```html
<head>
  <!-- Essential -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title | Brand Name</title>
  <meta name="description" content="Compelling 150-160 char description with keywords">

  <!-- Canonical URL -->
  <link rel="canonical" href="https://example.com/page">

  <!-- Open Graph (Facebook, LinkedIn) -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://example.com/page">
  <meta property="og:title" content="Page Title">
  <meta property="og:description" content="Description for social sharing">
  <meta property="og:image" content="https://example.com/og-image.jpg">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@username">
  <meta name="twitter:title" content="Page Title">
  <meta name="twitter:description" content="Description">
  <meta name="twitter:image" content="https://example.com/twitter-image.jpg">

  <!-- Robots -->
  <meta name="robots" content="index, follow">

  <!-- Language -->
  <link rel="alternate" hreflang="en" href="https://example.com/en/page">
  <link rel="alternate" hreflang="es" href="https://example.com/es/page">
  <link rel="alternate" hreflang="x-default" href="https://example.com/page">
</head>
```

## Next.js Metadata

```typescript
// app/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Title | Brand',
  description: 'Page description here',
  openGraph: {
    title: 'Page Title',
    description: 'Description',
    url: 'https://example.com/page',
    siteName: 'Brand Name',
    images: [
      {
        url: 'https://example.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Description of image',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Page Title',
    description: 'Description',
    images: ['https://example.com/twitter-image.jpg'],
  },
  alternates: {
    canonical: 'https://example.com/page',
    languages: {
      'en': 'https://example.com/en/page',
      'es': 'https://example.com/es/page',
    },
  },
};

// Dynamic metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await getProduct(params.id);

  return {
    title: `${product.name} | Store`,
    description: product.description,
    openGraph: {
      images: [product.image],
    },
  };
}
```

## Structured Data (JSON-LD)

```typescript
// components/JsonLd.tsx
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Organization
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Company Name',
  url: 'https://example.com',
  logo: 'https://example.com/logo.png',
  sameAs: [
    'https://twitter.com/company',
    'https://linkedin.com/company/company',
  ],
};

// Product
const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'Product Name',
  image: 'https://example.com/product.jpg',
  description: 'Product description',
  brand: {
    '@type': 'Brand',
    name: 'Brand Name',
  },
  offers: {
    '@type': 'Offer',
    price: '99.99',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
    url: 'https://example.com/product',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.5',
    reviewCount: '123',
  },
};

// Article/Blog Post
const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Article Title',
  image: 'https://example.com/article-image.jpg',
  datePublished: '2024-01-15T08:00:00+00:00',
  dateModified: '2024-01-16T10:00:00+00:00',
  author: {
    '@type': 'Person',
    name: 'Author Name',
    url: 'https://example.com/author',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Publisher Name',
    logo: {
      '@type': 'ImageObject',
      url: 'https://example.com/logo.png',
    },
  },
};

// FAQ
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is your return policy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer 30-day returns on all products.',
      },
    },
  ],
};

// Breadcrumb
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://example.com',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Products',
      item: 'https://example.com/products',
    },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'Product Name',
    },
  ],
};
```

## Sitemap

```typescript
// app/sitemap.ts (Next.js)
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://example.com';

  // Static pages
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), priority: 0.5 },
  ];

  // Dynamic pages (from database)
  const products = await getProducts();
  const productPages = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages];
}
```

## Robots.txt

```typescript
// app/robots.ts (Next.js)
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/private/'],
      },
    ],
    sitemap: 'https://example.com/sitemap.xml',
  };
}
```

## Performance for SEO

### Core Web Vitals

```typescript
// Optimize LCP (Largest Contentful Paint)
import Image from 'next/image';

// Priority loading for above-the-fold images
<Image
  src="/hero.jpg"
  alt="Hero"
  priority
  width={1200}
  height={600}
/>

// Optimize CLS (Cumulative Layout Shift)
// Always specify dimensions
<Image width={400} height={300} ... />

// Reserve space for dynamic content
<div className="min-h-[200px]">
  {loading ? <Skeleton /> : <Content />}
</div>

// Optimize FID/INP (First Input Delay / Interaction to Next Paint)
// Defer non-critical JavaScript
<script src="analytics.js" defer />

// Use dynamic imports
const HeavyComponent = dynamic(() => import('./Heavy'), {
  loading: () => <Skeleton />,
});
```

### Image Optimization

```typescript
// next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },
};
```

## URL Best Practices

```
Good URLs:
✓ /products/blue-running-shoes
✓ /blog/seo-tips-2024
✓ /category/electronics

Bad URLs:
✗ /products?id=12345
✗ /page.php?category=1&sort=date
✗ /p/123
```

## Semantic HTML

```html
<body>
  <header>
    <nav aria-label="Main navigation">
      <!-- Navigation -->
    </nav>
  </header>

  <main>
    <article>
      <h1>Main Title (only one per page)</h1>

      <section>
        <h2>Section Title</h2>
        <p>Content...</p>

        <h3>Subsection</h3>
        <p>More content...</p>
      </section>
    </article>

    <aside>
      <!-- Related content -->
    </aside>
  </main>

  <footer>
    <!-- Footer content -->
  </footer>
</body>
```

## SEO Checklist

| Item | Priority |
|------|----------|
| Unique title per page (50-60 chars) | High |
| Meta description (150-160 chars) | High |
| H1 tag (one per page) | High |
| Canonical URL | High |
| Mobile-friendly | High |
| HTTPS | High |
| Fast loading (<3s) | High |
| Structured data | Medium |
| Alt text on images | Medium |
| Internal linking | Medium |
| Sitemap.xml | Medium |
| Robots.txt | Medium |
| Open Graph tags | Medium |
| Breadcrumbs | Low |
| Hreflang (multilingual) | Low |

## Tools

| Tool | Purpose |
|------|---------|
| Google Search Console | Monitor indexing |
| PageSpeed Insights | Core Web Vitals |
| Schema Validator | Test structured data |
| Mobile-Friendly Test | Mobile compatibility |
| Screaming Frog | Site audit |
| Ahrefs/SEMrush | Keyword research |
