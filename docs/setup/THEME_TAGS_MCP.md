# Theme Tags Management with MCP

This guide explains how to use MCP (Model Context Protocol) with Cursor to manage theme tags in the database.

## Overview

Theme tags allow you to categorize themes as either "custom" or "template". This enables filtering in the ThemesManager UI and helps organize your theme library.

## Prerequisites

- MCP PostgreSQL server configured (see `POSTGRES_MCP_SETUP.md`)
- Database migration run: `npm run sequelize:migrate`
- Access to the database via MCP

## MCP Resources Available

You can access the themes table schema via MCP:

```
db:///themes/schema
```

This provides the current database schema including the `tags` column (after migration).

## Using MCP Scripts

### 1. Verify Tags Column

Check if the tags column exists in the themes table:

```bash
npm run mcp:tags:verify
```

Or directly:
```bash
node scripts/mcp/manage-theme-tags.js verify
```

### 2. Sync Tags from Files

Sync tags from all `theme.json` files to the database:

```bash
npm run mcp:tags:sync
```

Or directly:
```bash
node scripts/mcp/manage-theme-tags.js sync
```

This will:
- Read all `theme.json` files in `sparti-cms/theme/`
- Extract tags from each file
- Update the database with the tags

### 3. List All Themes with Tags

View all themes and their current tags:

```bash
npm run mcp:tags:list
```

Or directly:
```bash
node scripts/mcp/manage-theme-tags.js list
```

### 4. Update Tags for a Theme

Manually update tags for a specific theme:

```bash
node scripts/mcp/manage-theme-tags.js update <theme-slug> <tag1> [tag2] ...
```

Examples:
```bash
# Set master theme as template
node scripts/mcp/manage-theme-tags.js update master template

# Set landingpage theme as custom
node scripts/mcp/manage-theme-tags.js update landingpage custom business

# Update multiple tags
node scripts/mcp/manage-theme-tags.js update storefront custom ecommerce shop
```

## Using MCP in Cursor

### Query Themes via MCP

You can query the themes table directly using MCP resources:

1. **Check Schema**: Access `db:///themes/schema` to see table structure
2. **Query Themes**: Use MCP tools to query themes with tags
3. **Update Tags**: Use MCP to execute UPDATE queries

### Example MCP Queries

**List all themes with tags:**
```
Show me all themes from the themes table with their tags column
```

**Find themes by tag:**
```
Find all themes where the tags array contains 'template'
```

**Update a theme's tags:**
```
Update the themes table to set tags = ['custom', 'business'] for slug = 'landingpage'
```

## Database Schema

After running the migration, the themes table includes:

```sql
CREATE TABLE themes (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  tags TEXT[],  -- Array of tag strings
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Tag Values

Standard tag values:
- **`custom`** - Custom themes created for specific use cases
- **`template`** - Template themes used as starting points for new themes

You can add additional tags as needed (e.g., `business`, `ecommerce`, `blog`, etc.).

## Integration with UI

The ThemesManager UI (`sparti-cms/components/admin/ThemesManager.tsx`) provides:
- **Filter Tabs**: All / Template / Custom
- **Tag Display**: Color-coded badges on theme cards
- **Tag Editing**: Modal dialog to edit tags for any theme

Tags are automatically synced between:
- `theme.json` files (source of truth)
- Database (for filtering and queries)
- UI (for display and editing)

## Workflow

1. **Initial Setup**:
   ```bash
   # Run migration to add tags column
   npm run sequelize:migrate
   
   # Verify column exists
   npm run mcp:tags:verify
   
   # Sync tags from theme.json files
   npm run mcp:tags:sync
   ```

2. **Adding New Theme**:
   - Create theme folder with `theme.json`
   - Add `tags` array to `theme.json`
   - Run sync: `npm run mcp:tags:sync`

3. **Editing Tags**:
   - Use UI: Click "Tags" button on theme card
   - Or use script: `node scripts/mcp/manage-theme-tags.js update <slug> <tags>`

## Troubleshooting

### Tags Column Doesn't Exist

If verification fails:
```bash
# Run migration
npm run sequelize:migrate

# Verify again
npm run mcp:tags:verify
```

### Tags Not Syncing

Check:
1. `theme.json` files exist and have valid JSON
2. Tags are in array format: `"tags": ["custom"]`
3. Database connection is working
4. Migration has been run

### MCP Connection Issues

See `POSTGRES_MCP_SETUP.md` for MCP configuration help.

## Next Steps

- Use MCP to query themes by tags
- Create automated tag assignment rules
- Build reports on theme usage by tag
- Integrate with theme creation workflow

---

**Last Updated**: 2025-01-27  
**Status**: Ready for use with MCP
