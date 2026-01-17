# Theme Tags Database Migration via MCP

This guide explains how to add the tags column to the themes table and sync tags using MCP (Model Context Protocol) with Cursor.

## Quick Start

### Option 1: Run Migration Script (Recommended)

If you have database connection configured:

```bash
npm run mcp:tags:migrate
```

### Option 2: Execute SQL via MCP in Cursor

Use MCP to execute the SQL migration files directly.

## Step-by-Step: Using MCP in Cursor

### Step 1: Add Tags Column

In Cursor, you can use MCP to execute SQL. Ask Cursor:

```
Using MCP with gosg-postgres, execute this SQL to add tags column to themes table:

ALTER TABLE themes ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
```

Or use the provided SQL file:

1. Open `scripts/mcp/migrations/add-theme-tags-column.sql`
2. Copy the SQL
3. Ask Cursor: "Execute this SQL via MCP gosg-postgres: [paste SQL]"

### Step 2: Verify Column Added

Ask Cursor via MCP:

```
Using MCP gosg-postgres, check if the themes table has a tags column by querying:
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'themes' AND column_name = 'tags';
```

### Step 3: Sync Tags from theme.json Files

You can either:

**A. Use the sync script:**
```bash
npm run mcp:tags:sync
```

**B. Execute SQL updates via MCP:**

Ask Cursor to execute the SQL from `scripts/mcp/migrations/sync-theme-tags.sql`:

```
Using MCP gosg-postgres, execute the SQL updates from scripts/mcp/migrations/sync-theme-tags.sql to update theme tags
```

### Step 4: Verify Tags

Ask Cursor via MCP:

```
Using MCP gosg-postgres, show me all themes with their tags:
SELECT id, name, slug, tags FROM themes ORDER BY name;
```

## Direct SQL Execution

If you prefer to execute SQL directly via MCP, here are the key statements:

### Add Column

```sql
ALTER TABLE themes ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
```

### Update Individual Themes

```sql
-- Master theme (template)
UPDATE themes 
SET tags = ARRAY['template'], updated_at = NOW()
WHERE slug = 'master';

-- Custom themes
UPDATE themes 
SET tags = ARRAY['custom'], updated_at = NOW()
WHERE slug IN ('landingpage', 'storefront', 'gosgconsulting', 'sissonne', 'str', 'sparti-seo-landing', 'optimalconsulting', 'custom');
```

### Verify

```sql
SELECT id, name, slug, tags, is_active
FROM themes
ORDER BY name;
```

## MCP Resources Available

You can access the themes table schema via MCP:

- **Schema**: `db:///themes/schema` - Shows current table structure
- **Query Tool**: Use MCP to execute SELECT/UPDATE/INSERT queries

## Troubleshooting

### Column Already Exists

If you get an error that the column already exists, that's fine - the migration is idempotent.

### Connection Issues

Make sure:
1. MCP server is running: `npm run mcp:status`
2. Database credentials are correct in `.env`
3. MCP is configured in Cursor settings

### Tags Not Updating

1. Verify column exists: Check via MCP schema resource
2. Check theme slugs match: Query themes table via MCP
3. Verify SQL syntax: Test with a single UPDATE first

## Next Steps

After migration:
1. ✅ Tags column exists in database
2. ✅ Themes have tags synced from theme.json
3. ✅ UI can filter by tags (All/Template/Custom)
4. ✅ Tags can be edited via ThemesManager UI

## Files Created

- `scripts/mcp/add-theme-tags-column.js` - Migration script
- `scripts/mcp/migrations/add-theme-tags-column.sql` - SQL migration
- `scripts/mcp/migrations/sync-theme-tags.sql` - Tag sync SQL
- `docs/setup/MCP_THEME_TAGS_MIGRATION.md` - This guide

---

**Last Updated**: 2025-01-27  
**Status**: Ready for MCP execution
