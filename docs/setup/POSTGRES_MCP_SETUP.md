# PostgreSQL MCP Setup Guide

This guide explains how to set up and use the MCP Database Server for connecting Claude to your PostgreSQL database (e.g. Vercel Postgres, Neon, or self-hosted).

## 1. Prerequisites

- Node.js 18+ installed
- Access to your PostgreSQL database credentials
- Claude Desktop application installed

## 2. Installation and Setup

### 2.1. Clone the MCP Database Server

```bash
git clone https://github.com/executeautomation/mcp-database-server.git
cd mcp-database-server
npm install
npm run build
```

### 2.2. Configure MCP for PostgreSQL

The MCP configuration file is located at:
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

Set `DATABASE_URL` (or `DATABASE_PUBLIC_URL`) in your environment or `.env`, then add the MCP server to your config. Use the path to your `mcp-database-server/dist/src/index.js` and pass connection details from your URL, or use the project script that reads from `DATABASE_URL`:

```bash
# From project root, with DATABASE_URL in .env
node scripts/mcp/start-mcp-postgres.js
```

Or add a custom command in your MCP config that runs that script. For cloud Postgres with self-signed certs, use `--ssl '{"rejectUnauthorized":false}'`.

```bash
node start-mcp-postgres.js
```

## 3. Using MCP with Claude

Once configured, you can use Claude to interact with your PostgreSQL database. Here are some example operations:

### 3.1. List Tables

Claude can list all tables in your database:

```
Please list all tables in my PostgreSQL database.
```

### 3.2. Query Data

Claude can execute SELECT queries:

```
Please show me the first 10 records from the site_settings table.
```

### 3.3. Describe Table Structure

Claude can describe the structure of a table:

```
What is the schema of the form_submissions table?
```

### 3.4. Update Data

Claude can execute INSERT, UPDATE, or DELETE queries:

```
Please update the site_name in the site_settings table to "GO SG Consulting".
```

## 4. Database Schema

Your GO SG website uses the following tables:

- `site_settings`: Stores site configuration in key-value format
- `form_submissions`: Stores contact form submissions
- `contacts`: Stores contact information for CRM
- `projects`: Stores project management data
- `project_steps`: Stores project tasks/steps

## 5. Migration and Setup

To initialize or migrate your database schema:

```bash
# For local development
npm run migrate

# For production (requires DATABASE_URL)
npm run migrate:production
```

## 6. Troubleshooting

### 6.1. Connection Issues

If you encounter connection problems:

1. Verify that your PostgreSQL credentials are correct
2. Check if the database server is accessible from your network
3. Ensure SSL settings are properly configured
4. Check firewall settings that might block the connection

### 6.2. Query Errors

If your queries fail:

1. Check the syntax against PostgreSQL's SQL dialect
2. Verify table and column names
3. Check that the user has proper permissions for the operations

## 7. Security Considerations

- Keep your database credentials secure
- Consider using environment variables for sensitive information
- Regularly rotate database passwords
- Use a read-only user for Claude when possible to prevent accidental data modification

## 8. Next Steps

- Set up regular database backups
- Configure monitoring for your database
- Implement connection pooling for better performance
- Consider adding indexes to frequently queried columns

---

**Last Updated:** October 17, 2025  
**Status:** Ready for use
