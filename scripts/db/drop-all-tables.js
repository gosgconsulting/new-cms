#!/usr/bin/env node
/**
 * Drop all tables in the public schema. Uses DATABASE_URL.
 * Use when you want a clean DB before re-running migrations and import.
 *
 * Usage: node scripts/db/drop-all-tables.js --confirm
 */
import 'dotenv/config';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '../..');

const connString = process.env.DATABASE_URL;
if (!connString) {
  console.error('[drop-all-tables] DATABASE_URL required');
  process.exit(1);
}

const hasConfirm = process.argv.includes('--confirm');
if (!hasConfirm) {
  console.error('[drop-all-tables] This will delete ALL tables in the public schema.');
  console.error('[drop-all-tables] Run with --confirm to proceed:');
  console.error('  node scripts/db/drop-all-tables.js --confirm');
  process.exit(1);
}

async function main() {
  const client = new pg.Client({
    connectionString: connString,
    ssl: connString.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    const r = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);
    const tables = r.rows.map((row) => row.tablename);
    if (tables.length === 0) {
      console.log('[drop-all-tables] No tables in public schema.');
      return;
    }
    console.log('[drop-all-tables] Dropping', tables.length, 'tables:', tables.join(', '));
    await client.query('BEGIN');
    for (const table of tables) {
      await client.query(`DROP TABLE IF EXISTS public."${table}" CASCADE`);
    }
    await client.query('COMMIT');
    console.log('[drop-all-tables] Done. Run migrations then import:');
    console.log('  npm run db:migrate-and-import -- --file data/export.json');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('[drop-all-tables] Error:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
