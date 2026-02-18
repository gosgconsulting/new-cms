#!/usr/bin/env node
/**
 * Compare current DB structure with migration-defined schema.
 * Queries information_schema for actual structure, parses migrations for expected structure.
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
  console.error('[compare] DATABASE_URL required');
  process.exit(1);
}

// Extract table + columns from migration files (createTable + addColumn + raw ADD COLUMN)
function parseMigrationsForSchema() {
  const tables = {}; // tableName -> Set of column names
  const rawSqlColumns = []; // { table, column } from raw ALTER TABLE ADD COLUMN

  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.js'))
    .sort();

  for (const file of files) {
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');

    // createTable('table_name', { col1: {...}, col2: {...} })
    const createMatch = content.matchAll(
      /createTable\s*\(\s*['"]([^'"]+)['"]\s*,\s*\{([\s\S]*?)\}\s*\)/gi
    );
    const skipKeys = new Set(['references', 'defaultValue', 'onUpdate', 'onDelete', 'primaryKey', 'autoIncrement', 'unique']);
    for (const m of createMatch) {
      const tableName = m[1];
      const colsBlock = m[2];
      if (!tables[tableName]) tables[tableName] = new Set();
      // Extract top-level column names (exclude Sequelize option keys)
      const colMatches = colsBlock.matchAll(/(\w+)\s*:\s*\{/g);
      for (const cm of colMatches) {
        if (!skipKeys.has(cm[1])) tables[tableName].add(cm[1]);
      }
    }

    // addColumn('table', 'column', ...)
    const addMatch = content.matchAll(
      /addColumn\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/gi
    );
    for (const m of addMatch) {
      const [, tableName, colName] = m;
      if (!tables[tableName]) tables[tableName] = new Set();
      tables[tableName].add(colName);
    }

    // Raw: ALTER TABLE table_name ADD COLUMN [IF NOT EXISTS] col_name
    const alterMatch = content.matchAll(
      /ALTER\s+TABLE\s+(\w+)\s+ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/gi
    );
    for (const m of alterMatch) {
      const tableName = m[1].toLowerCase();
      const colName = m[2].toLowerCase();
      rawSqlColumns.push({ table: tableName, column: colName });
    }
  }

  // Merge raw SQL columns
  for (const { table, column } of rawSqlColumns) {
    if (!tables[table]) tables[table] = new Set();
    tables[table].add(column);
  }

  return tables;
}

async function getDbSchema(client) {
  const res = await client.query(`
    SELECT 
      t.table_schema,
      t.table_name,
      c.column_name,
      c.data_type,
      c.udt_name,
      c.is_nullable,
      c.column_default
    FROM information_schema.tables t
    JOIN information_schema.columns c 
      ON t.table_schema = c.table_schema AND t.table_name = c.table_name
    WHERE t.table_schema = 'public'
      AND t.table_type = 'BASE TABLE'
      AND t.table_name NOT IN ('SequelizeMeta')
    ORDER BY t.table_name, c.ordinal_position
  `);

  const byTable = {};
  for (const row of res.rows) {
    const t = row.table_name;
    if (!byTable[t]) byTable[t] = [];
    byTable[t].push({
      column: row.column_name,
      type: row.udt_name,
      nullable: row.is_nullable === 'YES',
      default: row.column_default,
    });
  }
  return byTable;
}

async function main() {
  const client = new pg.Client({
    connectionString: connString,
    ssl: connString.includes('localhost') ? false : { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('[compare] Connected to database\n');

    // 1. Parse migrations for expected schema
    const expectedTables = parseMigrationsForSchema();
    console.log(`[compare] Parsed ${Object.keys(expectedTables).length} tables from migrations\n`);

    // 2. Get actual DB schema
    const dbSchema = await getDbSchema(client);
    const dbTableNames = new Set(Object.keys(dbSchema));
    const expectedTableNames = new Set(Object.keys(expectedTables));
    console.log(`[compare] Found ${dbTableNames.size} tables in database\n`);

    console.log('=== DB vs MIGRATIONS COMPARISON ===\n');

    // 3. Tables in DB but not in migrations
    const tablesOnlyInDb = [...dbTableNames].filter((t) => !expectedTableNames.has(t)).sort();
    if (tablesOnlyInDb.length > 0) {
      console.log('⚠️  TABLES IN DB BUT NOT IN MIGRATIONS (may be from raw SQL or manual):');
      tablesOnlyInDb.forEach((t) => console.log(`   - ${t}`));
      console.log('');
    }

    // 4. Tables in migrations but not in DB
    const tablesOnlyInMigrations = [...expectedTableNames].filter((t) => !dbTableNames.has(t)).sort();
    if (tablesOnlyInMigrations.length > 0) {
      console.log('❌ TABLES IN MIGRATIONS BUT NOT IN DB (missing):');
      tablesOnlyInMigrations.forEach((t) => console.log(`   - ${t}`));
      console.log('');
    }

    // 5. Per-table column comparison (for tables that exist in both)
    const allTables = new Set([...dbTableNames, ...expectedTableNames]);
    const columnDiscrepancies = [];

    for (const table of [...allTables].sort()) {
      const dbCols = new Set((dbSchema[table] || []).map((c) => c.column));
      const expCols = expectedTables[table] || new Set();

      const inDbNotMigration = [...dbCols].filter((c) => !expCols.has(c)).sort();
      const inMigrationNotDb = [...expCols].filter((c) => !dbCols.has(c)).sort();

      if (inDbNotMigration.length > 0 || inMigrationNotDb.length > 0) {
        columnDiscrepancies.push({
          table,
          inDbNotMigration,
          inMigrationNotDb,
        });
      }
    }

    if (columnDiscrepancies.length > 0) {
      console.log('⚠️  COLUMN DISCREPANCIES (by table):');
      for (const { table, inDbNotMigration, inMigrationNotDb } of columnDiscrepancies) {
        console.log(`\n   Table: ${table}`);
        if (inMigrationNotDb.length > 0) {
          console.log(`     ❌ In migrations but NOT in DB: ${inMigrationNotDb.join(', ')}`);
        }
        if (inDbNotMigration.length > 0) {
          console.log(`     ⚠️  In DB but NOT in migrations: ${inDbNotMigration.join(', ')}`);
        }
      }
      console.log('');
    }

    // 6. Summary: full table listing with column counts
    console.log('\n=== SCHEMA SUMMARY ===\n');
    console.log('Table                                  | DB Cols | Migration Cols | Match');
    console.log('-'.repeat(70));

    for (const table of [...allTables].sort()) {
      const dbCount = dbSchema[table]?.length ?? 0;
      const expCount = expectedTables[table]?.size ?? 0;
      const match = dbCount === expCount && columnDiscrepancies.every(
        (d) => d.table !== table || (d.inMigrationNotDb.length === 0 && d.inDbNotMigration.length === 0)
      );
      const status = match ? '✓' : '✗';
      console.log(
        `${table.padEnd(39)} | ${String(dbCount).padStart(7)} | ${String(expCount).padStart(14)} | ${status}`
      );
    }

    // Final summary
    const missingTables = tablesOnlyInMigrations.length;
    const extraTables = tablesOnlyInDb.length;
    const colIssues = columnDiscrepancies.length;
    console.log('\n' + '='.repeat(50));
    console.log(`Tables missing from DB: ${missingTables}`);
    console.log(`Tables in DB only (not in migrations): ${extraTables}`);
    console.log(`Tables with column mismatches: ${colIssues}`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('[compare] Error:', err.message);
  process.exit(1);
});
