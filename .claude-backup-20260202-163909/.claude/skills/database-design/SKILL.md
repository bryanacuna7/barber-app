---
name: database-design
description: Database schema design, SQL optimization, and ORM patterns for relational databases.
version: 1.0.0
---

# Database Design Patterns

Best practices for database schema design and optimization.

## Schema Design Principles

### Normalization

```sql
-- ✅ Good - Normalized (3NF)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

-- ❌ Bad - Denormalized with redundant data
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255),  -- Redundant
  user_name VARCHAR(255),   -- Redundant
  product_name VARCHAR(255) -- Redundant
);
```

### Indexing Strategy

```sql
-- Primary keys (automatic index)
CREATE TABLE users (
  id SERIAL PRIMARY KEY
);

-- Unique constraints (automatic index)
ALTER TABLE users ADD CONSTRAINT unique_email UNIQUE (email);

-- Foreign keys (add index manually)
CREATE INDEX idx_orders_user_id ON orders(user_id);

-- Frequently queried columns
CREATE INDEX idx_users_email ON users(email);

-- Composite index for common queries
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at DESC);

-- Partial index for specific conditions
CREATE INDEX idx_active_users ON users(email) WHERE status = 'active';
```

## Common Patterns

### Soft Deletes

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  deleted_at TIMESTAMP DEFAULT NULL
);

-- Query active users only
SELECT * FROM users WHERE deleted_at IS NULL;

-- Soft delete
UPDATE users SET deleted_at = NOW() WHERE id = 1;
```

### Timestamps

```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Auto-update updated_at (PostgreSQL)
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### UUIDs vs Auto-increment

```sql
-- UUID (better for distributed systems)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL
);

-- Auto-increment (simpler, sequential)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL
);
```

## Relationships

### One-to-Many

```sql
-- User has many posts
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255)
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255)
);
```

### Many-to-Many

```sql
-- Users and roles
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255)
);

CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE
);

CREATE TABLE user_roles (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);
```

### Self-Referential

```sql
-- Categories with parent
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  parent_id INTEGER REFERENCES categories(id)
);
```

## Query Optimization

### EXPLAIN ANALYZE

```sql
-- Check query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'test@example.com';

-- Look for:
-- - Sequential scans on large tables (add index)
-- - High cost estimates
-- - Slow execution time
```

### Avoiding N+1 Queries

```sql
-- ❌ N+1 Problem (1 query + N queries)
SELECT * FROM users;
-- Then for each user:
SELECT * FROM posts WHERE user_id = ?;

-- ✅ Solution: JOIN
SELECT u.*, p.*
FROM users u
LEFT JOIN posts p ON p.user_id = u.id;

-- ✅ Or: IN clause
SELECT * FROM posts WHERE user_id IN (1, 2, 3, ...);
```

### Pagination

```sql
-- Offset pagination (simple but slow for large offsets)
SELECT * FROM posts
ORDER BY created_at DESC
LIMIT 20 OFFSET 40;

-- Cursor pagination (better for large datasets)
SELECT * FROM posts
WHERE created_at < '2024-01-01'
ORDER BY created_at DESC
LIMIT 20;
```

## Prisma ORM Patterns

### Schema

```prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

### Queries

```typescript
// Find with relations
const user = await prisma.user.findUnique({
  where: { id: 1 },
  include: { posts: true },
});

// Create with relation
const post = await prisma.post.create({
  data: {
    title: 'Hello',
    author: { connect: { id: 1 } },
  },
});

// Transaction
const [user, post] = await prisma.$transaction([
  prisma.user.create({ data: { email: 'test@example.com' } }),
  prisma.post.create({ data: { title: 'Hello', authorId: 1 } }),
]);
```

## Best Practices

1. **Always add indexes** on foreign keys and frequently queried columns
2. **Use appropriate data types** - Don't use VARCHAR(255) for everything
3. **Add constraints** - NOT NULL, UNIQUE, CHECK where appropriate
4. **Plan for scale** - Consider partitioning for large tables
5. **Backup strategy** - Regular backups, point-in-time recovery
6. **Use migrations** - Never modify production schema manually
