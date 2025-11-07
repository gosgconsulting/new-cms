# Railway PostgreSQL Setup for MCP Database Server

This guide explains how to set up the MCP Database Server to connect to a Railway PostgreSQL database for your GO SG website.

## Railway PostgreSQL Connection Issue

When connecting to Railway PostgreSQL databases, you may encounter an SSL certificate validation error:

```
[ERROR] PostgreSQL connection error: self-signed certificate in certificate chain
```

This happens because Railway uses self-signed certificates for its PostgreSQL databases.

## Solution: Configure SSL with rejectUnauthorized: false

To connect to Railway PostgreSQL, you need to configure the SSL option to not reject unauthorized (self-signed) certificates:

```bash
node mcp-database-server/dist/src/index.js --postgresql \
  --host trolley.proxy.rlwy.net \
  --database railway \
  --user postgres \
  --password your_password \
  --port 58867 \
  --ssl "{ \"rejectUnauthorized\": false }" \
  --connection-timeout 30000
```

## MCP Configuration File Update

Update your MCP configuration file (`C:\Users\Oliver\.cursor\mcp.json` on Windows) with:

```json
{
  "mcpServers": {
    "gosg-postgres": {
      "command": "node",
      "args": [
        "C:\\Oliver-dev\\gosgwebsite\\mcp-database-server\\dist\\src\\index.js",
        "--postgresql",
        "--host", "trolley.proxy.rlwy.net",
        "--port", "58867",
        "--database", "railway",
        "--user", "postgres",
        "--password", "your_password",
        "--ssl", "{ \"rejectUnauthorized\": false }",
        "--connection-timeout", "30000"
      ]
    }
  }
}
```

## Security Note

Setting `rejectUnauthorized: false` means that the client will not verify the identity of the server. This is generally not recommended for production environments but is necessary for Railway PostgreSQL connections.

In your application code, you would typically use:

```javascript
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
};
```

## Testing the Connection

After starting the MCP server with the correct SSL configuration, Claude should be able to connect to your Railway PostgreSQL database. Test with:

```
Please list all tables in my PostgreSQL database.
```

## Troubleshooting

If you still encounter connection issues:

1. Verify your Railway database is active and accessible
2. Check that your credentials are correct
3. Ensure your network allows outbound connections to Railway
4. Try connecting with another PostgreSQL client to confirm the database is accessible

## Additional Resources

- [Railway PostgreSQL Documentation](https://docs.railway.app/databases/postgresql)
- [Node.js pg module SSL configuration](https://node-postgres.com/features/ssl)
- [MCP Database Server Documentation](https://github.com/executeautomation/mcp-database-server)
