# Test Database Setup

This guide explains how to set up and use a local PostgreSQL database for running unit tests.

## Quick Start

1. **Start the test database:**
   ```bash
   npm run test:db:start
   ```

2. **Set the test database URL:**
   ```bash
   export TEST_DATABASE_URL=postgresql://test_user:test_password@localhost:5433/cms_test
   ```

3. **Run tests:**
   ```bash
   npm run test:unit
   ```

## Docker Compose Setup

The test database runs in a Docker container using `docker-compose.test.yml`.

### Available Commands

- `npm run test:db:start` - Start the test database container
- `npm run test:db:stop` - Stop the test database container
- `npm run test:db:reset` - Reset the database (removes all data and recreates)
- `npm run test:db:logs` - View database logs

### Database Configuration

- **Host:** localhost
- **Port:** 5433 (to avoid conflict with main database on 5432)
- **Database:** cms_test
- **User:** test_user
- **Password:** test_password
- **Connection String:** `postgresql://test_user:test_password@localhost:5433/cms_test`

## Environment Variables

Create a `.env.test` file (or set environment variables):

```bash
TEST_DATABASE_URL=postgresql://test_user:test_password@localhost:5433/cms_test
NODE_ENV=test
```

The test setup (`server/tests/setup.js`) will automatically use `TEST_DATABASE_URL` if it's set, otherwise it will fall back to mock database mode.

## Using a Different Local Database

If you prefer to use a different PostgreSQL instance:

1. Create a test database:
   ```bash
   createdb cms_test
   ```

2. Set the connection string:
   ```bash
   export TEST_DATABASE_URL=postgresql://your_user:your_password@localhost:5432/cms_test
   ```

## Mock Database Mode

If you don't want to use a real database, you can use mock mode:

```bash
export USE_MOCK_DB=true
npm run test:unit
```

This will skip database operations and use mocks instead.

## Troubleshooting

### Database Connection Errors

If you see connection errors:

1. **Check if the container is running:**
   ```bash
   docker-compose -f docker-compose.test.yml ps
   ```

2. **Check database logs:**
   ```bash
   npm run test:db:logs
   ```

3. **Restart the database:**
   ```bash
   npm run test:db:reset
   ```

### Port Already in Use

If port 5433 is already in use, you can change it in `docker-compose.test.yml`:

```yaml
ports:
  - "5434:5432"  # Change 5433 to any available port
```

Then update your `TEST_DATABASE_URL` accordingly.

### Database Schema

The test database needs to have the same schema as your production database. Make sure to run migrations:

```bash
# Connect to test database
psql postgresql://test_user:test_password@localhost:5433/cms_test

# Run migrations (adjust command based on your migration setup)
npm run sequelize:migrate
```

## Best Practices

1. **Always use a separate test database** - Never use your production or development database for tests
2. **Reset between test runs** - Use `npm run test:db:reset` to ensure a clean state
3. **Use environment variables** - Store test database credentials in `.env.test` (not committed to git)
4. **Clean up after tests** - The test setup should clean up test data, but you can also reset the database manually

## CI/CD Integration

For CI/CD pipelines, you can start the database as part of your test script:

```yaml
# Example GitHub Actions
- name: Start test database
  run: npm run test:db:start
  
- name: Wait for database
  run: sleep 5
  
- name: Run tests
  run: TEST_DATABASE_URL=postgresql://test_user:test_password@localhost:5433/cms_test npm run test:unit
  
- name: Stop test database
  run: npm run test:db:stop
```
