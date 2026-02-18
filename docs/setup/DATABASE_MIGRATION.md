# Database Migration Guide

How to export data from the current server and restore it on a new server.

## Prerequisites

- `DATABASE_URL` set (current server for export, new server for import)
- Node.js and project dependencies installed

## Export data (current server)

1. Set env to point at the database you want to export:
   ```bash
   export DATABASE_URL="postgresql://user:password@host:port/database"
   # or use .env with DATABASE_URL
   ```

2. Run export and write to a file:
   ```bash
   npm run db:export -- --out data/export.json
   ```
   Or to stdout:
   ```bash
   npm run db:export > data/export.json
   ```

3. Copy `data/export.json` (and optionally `data/`) to the new server (e.g. SCP, cloud storage).

## Set up new server

1. Create a PostgreSQL database and set `DATABASE_URL` in env.

2. Run migrations to create schema:
   ```bash
   npm run sequelize:migrate:production
   ```

3. Import data:
   ```bash
   npm run db:import -- --file data/export.json
   ```

   Or in one go (migrate then import):
   ```bash
   npm run db:migrate-and-import -- --file data/export.json
   ```
   The `--` passes `--file data/export.json` to the import step.

## What is exported

- Row data for all tables used by the app (tenants, users, pages, posts, forms, media, etc.).
- Tables are exported in dependency order so that import respects foreign keys.
- Export format is JSON; import runs `INSERT` in the same order and resets sequences after.

## What is not included

- **Media files**: Export is database rows only. File paths (e.g. Vercel Blob URLs) are stored in the DB; the actual files must be migrated separately (same storage bucket or copy assets and update env).
- **Secrets**: Passwords and tokens are stored as in the source DB (e.g. hashed). Rotate secrets on the new server if required.
- **Unused tables**: Only tables used by the application are exported (no hotel*, report*, etc.).

## Troubleshooting

- **Duplicate key on import**: If the target DB already has rows, you may see duplicate key errors; those batches are skipped. For a clean restore, use a fresh DB after migrations.
- **Sequence errors after import**: The import script resets `SERIAL` sequences. If you still get sequence-related errors, run migrations first and ensure the export was from a compatible schema.
- **Missing tables**: If a table is missing on the source DB, export skips it and logs. Ensure all migrations have been run on the source before exporting.
