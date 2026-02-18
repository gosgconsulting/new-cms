#!/usr/bin/env node
/**
 * Migration Audit: Connect to DB, query SequelizeMeta, compare with migration files.
 * Uses same DATABASE_URL as MCP Postgres. Outputs: pending, orphaned, duplicate timestamps.
 */
import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, '../../sparti-cms/db/sequelize/migrations');

const connString = process.env.DATABASE_URL;
if (!connString) {
  console.error('[audit] DATABASE_URL required');
  process.exit(1);
}

async function main() {
  const client = new pg.Client({
    connectionString: connString,
    ssl: connString.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('[audit] Connected to database\n');

    // 1. Get applied migrations from SequelizeMeta
    const metaResult = await client.query(`
      SELECT name FROM "SequelizeMeta" ORDER BY name
    `).catch((err) => {
      if (err.message.includes('does not exist')) {
        return { rows: [] };
      }
      throw err;
    });

    const appliedInDb = new Set((metaResult.rows || []).map((r) => r.name));
    console.log(`[audit] Applied in DB: ${appliedInDb.size} migrations`);

    // 2. Get migration files on disk
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith('.js'))
      .sort();
    const filesSet = new Set(files);
    console.log(`[audit] Migration files on disk: ${files.length}\n`);

    // 3. Pending: files not in DB
    const pending = files.filter((f) => !appliedInDb.has(f));

    // 4. Orphaned: DB records with no file
    const orphaned = [...appliedInDb].filter((name) => !filesSet.has(name));

    // 5. Duplicate timestamps: files sharing same timestamp prefix
    const byTimestamp = {};
    for (const f of files) {
      const ts = f.split('-')[0];
      if (!byTimestamp[ts]) byTimestamp[ts] = [];
      byTimestamp[ts].push(f);
    }
    const duplicateTimestamps = Object.entries(byTimestamp)
      .filter(([, list]) => list.length > 1)
      .map(([ts, list]) => ({ timestamp: ts, files: list }));

    // --- Report ---
    console.log('=== MIGRATION AUDIT REPORT ===\n');

    if (pending.length > 0) {
      console.log('❌ MISSING (pending - files NOT applied in DB):');
      pending.forEach((f) => console.log(`   - ${f}`));
      console.log('');
    } else {
      console.log('✅ No pending migrations (all files are applied)\n');
    }

    if (orphaned.length > 0) {
      console.log('⚠️  ORPHANED (in DB but no file on disk):');
      orphaned.forEach((f) => console.log(`   - ${f}`));
      console.log('');
    } else {
      console.log('✅ No orphaned DB records\n');
    }

    if (duplicateTimestamps.length > 0) {
      console.log('⚠️  DUPLICATE TIMESTAMPS (can cause ordering issues):');
      duplicateTimestamps.forEach(({ timestamp, files: list }) => {
        console.log(`   ${timestamp}:`);
        list.forEach((f) => console.log(`      - ${f}`));
      });
      console.log('');
    } else {
      console.log('✅ No duplicate migration timestamps\n');
    }

    console.log('=== SUMMARY ===');
    console.log(`Applied in DB: ${appliedInDb.size}`);
    console.log(`Files on disk: ${files.length}`);
    console.log(`Pending: ${pending.length}`);
    console.log(`Orphaned: ${orphaned.length}`);
    console.log(`Duplicate timestamps: ${duplicateTimestamps.length}`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('[audit] Error:', err.message);
  process.exit(1);
});
