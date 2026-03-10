# Database Rules

## Overview
Database design and query standards for Sparti CMS development.

## Core Database Principles

### Database Platform
- **Use PostgreSQL** as primary database (e.g. via Vercel or local)
- All database operations through Express.js API (server.js)
- Server-side only database access (never client-side)

### Query Safety

#### Parameterized Statements
**ALWAYS** use parameterized statements to prevent SQL injection:

```javascript
// ✅ CORRECT - Parameterized query
const result = await pool.query(
  'SELECT * FROM users WHERE email = $1',
  [userEmail]
);

// ❌ WRONG - String concatenation (SQL injection risk!)
const result = await pool.query(
  `SELECT * FROM users WHERE email = '${userEmail}'`
);
```

#### Input Validation
- Validate all user inputs before database queries
- Sanitize inputs to prevent malicious data
- Use TypeScript types for compile-time safety
- Implement runtime validation with libraries like Zod

### Schema Management

#### Migration Files
- **Keep database schema migrations** in `sparti-cms/db/migrations.sql`
- Never modify the database schema directly in production
- Always create migration files for schema changes
- Test migrations on development environment first

#### Schema Design Best Practices
- Use appropriate data types for each column
- Define proper constraints (NOT NULL, UNIQUE, CHECK)
- Create indexes for frequently queried columns
- Use foreign keys to maintain referential integrity
- Normalize data to reduce redundancy

### Indexing Strategy

#### When to Create Indexes
- Columns used in WHERE clauses frequently
- Columns used in JOIN conditions
- Columns used in ORDER BY clauses
- Foreign key columns

#### Index Examples
```sql
-- Single column index
CREATE INDEX idx_users_email ON users(email);

-- Composite index for common query patterns
CREATE INDEX idx_posts_user_created ON posts(user_id, created_at DESC);

-- Unique index for email uniqueness
CREATE UNIQUE INDEX idx_users_email_unique ON users(email);
```

### Transaction Management

#### Use Transactions for Multi-Step Operations
```javascript
// ✅ CORRECT - Using transactions
const client = await pool.connect();
try {
  await client.query('BEGIN');
  
  // Multiple related operations
  await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2', [amount, fromId]);
  await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2', [amount, toId]);
  await client.query('INSERT INTO transactions (from_id, to_id, amount) VALUES ($1, $2, $3)', [fromId, toId, amount]);
  
  await client.query('COMMIT');
} catch (e) {
  await client.query('ROLLBACK');
  throw e;
} finally {
  client.release();
}
```

#### When to Use Transactions
- Multiple related INSERT/UPDATE/DELETE operations
- Operations that must all succeed or all fail
- Critical data consistency requirements
- Complex business logic spanning multiple tables

### Query Optimization

#### Best Practices
- Select only needed columns (avoid `SELECT *`)
- Use LIMIT for pagination
- Avoid N+1 query problems
- Use JOINs instead of multiple queries when appropriate
- Profile slow queries with EXPLAIN ANALYZE

#### Query Examples
```javascript
// ✅ CORRECT - Select specific columns with limit
const result = await pool.query(
  'SELECT id, title, created_at FROM posts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
  [userId]
);

// ❌ WRONG - Select all columns
const result = await pool.query(
  'SELECT * FROM posts WHERE user_id = $1',
  [userId]
);
```

### Connection Pooling

#### Pool Configuration
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                    // Maximum pool size
  idleTimeoutMillis: 30000,   // Close idle clients after 30s
  connectionTimeoutMillis: 2000, // Timeout for new connections
});
```

#### Best Practices
- Reuse pool connections (don't create new pools)
- Always release clients back to pool
- Handle connection errors gracefully
- Monitor pool metrics in production

### Error Handling

#### Database Error Handling
```javascript
try {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  return res.json(result.rows[0]);
} catch (error) {
  console.error('Database error:', error);
  
  // Don't expose internal errors to client
  return res.status(500).json({ 
    error: 'An error occurred while fetching user' 
  });
}
```

#### Error Categories
- Connection errors (pool, network issues)
- Query errors (syntax, constraint violations)
- Transaction errors (deadlocks, conflicts)
- Timeout errors

### Data Validation

#### Server-Side Validation
```javascript
// Validate before database insert
const createUser = async (req, res) => {
  const { email, name } = req.body;
  
  // Validation
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  
  if (!name || name.length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters' });
  }
  
  // Proceed with database insert
  // ...
};
```

### Backup and Recovery

#### Backup Strategy
- Regular automated backups (daily minimum)
- Test backup restoration periodically
- Keep backups in separate location
- Document recovery procedures

#### Migration Rollback
- Always have rollback scripts for migrations
- Test rollback procedures
- Keep backup before major schema changes

### Performance Monitoring

#### What to Monitor
- Query execution times
- Connection pool usage
- Database size and growth
- Index usage statistics
- Slow query logs

#### Optimization Tools
- PostgreSQL EXPLAIN ANALYZE
- pg_stat_statements extension
- Database/metrics dashboard
- Custom logging for slow queries

## Schema Conventions

### Naming Conventions
- Tables: plural snake_case (e.g., `user_profiles`)
- Columns: snake_case (e.g., `created_at`)
- Primary keys: `id` (SERIAL or UUID)
- Foreign keys: `{table}_id` (e.g., `user_id`)
- Timestamps: `created_at`, `updated_at`

### Standard Columns
Every table should include:
```sql
CREATE TABLE example_table (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Common Data Types
- Text: `VARCHAR(255)` or `TEXT`
- Numbers: `INTEGER`, `BIGINT`, `DECIMAL`
- Dates: `TIMESTAMP WITH TIME ZONE`
- JSON: `JSONB` (not `JSON`)
- Boolean: `BOOLEAN`

## API Integration

### Database API Endpoints
All database operations should go through RESTful API endpoints in `server.js`:

```javascript
// GET - Read data
app.get('/api/resource/:id', async (req, res) => {
  // Query database and return data
});

// POST - Create data
app.post('/api/resource', async (req, res) => {
  // Validate and insert data
});

// PUT/PATCH - Update data
app.put('/api/resource/:id', async (req, res) => {
  // Validate and update data
});

// DELETE - Remove data
app.delete('/api/resource/:id', async (req, res) => {
  // Delete data
});
```

### Response Format
```javascript
// Success response
{
  "data": { /* resource data */ },
  "message": "Success message"
}

// Error response
{
  "error": "Error message",
  "details": "Optional detailed error info"
}
```

## Security Checklist

- [ ] All queries use parameterized statements
- [ ] Input validation implemented
- [ ] Database credentials in environment variables (never hardcoded)
- [ ] Client-side never accesses database directly
- [ ] Error messages don't expose sensitive information
- [ ] Proper indexes created for performance
- [ ] Transactions used for critical operations
- [ ] Connection pooling configured properly
- [ ] Regular backups scheduled
- [ ] Migration files version controlled

---

**Last Updated:** 2025-01-28  
**Version:** 1.0.0
