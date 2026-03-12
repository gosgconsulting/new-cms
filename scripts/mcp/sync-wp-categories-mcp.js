import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const MCP_CONFIG_PATH = path.join(ROOT_DIR, '.cursor', 'mcp.json');

async function main() {
  const args = process.argv.slice(2);
  const tenantIdIndex = args.indexOf('--tenant');
  const tenantId = tenantIdIndex !== -1 ? args[tenantIdIndex + 1] : null;

  try {
    const configData = await fs.readFile(MCP_CONFIG_PATH, 'utf-8');
    const mcpConfig = JSON.parse(configData);

    const wpConfig = mcpConfig.mcpServers['wordpress-mcp'];
    const cmsConfig = mcpConfig.mcpServers['sparti-cms'];

    if (!wpConfig || !cmsConfig) {
      throw new Error('Both wordpress-mcp and sparti-cms must be defined in mcp.json');
    }

    console.log('Starting WordPress MCP Server...');
    const wpTransport = new StdioClientTransport({
      command: wpConfig.command,
      args: wpConfig.args,
      env: { ...process.env, ...wpConfig.env }
    });

    const wpClient = new Client({
      name: 'wp-sync-client',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    await wpClient.connect(wpTransport);
    console.log('WordPress MCP Connected.');

    console.log('Starting CMS MCP Server...');
    const cmsTransport = new StdioClientTransport({
      command: cmsConfig.command,
      args: cmsConfig.args,
      env: { ...process.env, ...cmsConfig.env }
    });

    const cmsClient = new Client({
      name: 'cms-sync-client',
      version: '1.0.0'
    }, {
      capabilities: {}
    });

    await cmsClient.connect(cmsTransport);
    console.log('CMS MCP Connected.');

    console.log('Fetching categories from WordPress...');
    const wpListResult = await wpClient.callTool({
      name: 'wp_list_categories',
      arguments: {
        per_page: 100
      }
    });

    const wpContent = JSON.parse(wpListResult.content[0].text);
    const wpCategories = wpContent.categories || [];

    console.log(`Found ${wpCategories.length} categories in WP.`);

    let synced = 0;
    let failed = 0;

    for (const cat of wpCategories) {
      console.log(`Syncing category: ${cat.name} (${cat.slug})`);
      
      try {
        await cmsClient.callTool({
          name: 'create_category',
          arguments: {
            name: cat.name,
            slug: cat.slug,
            description: cat.description || '',
            parent_id: null, // Basic implementation, can be extended for hierarchy 
            tenant_id: tenantId || null
          }
        });
        synced++;
        console.log(` => Success!`);
      } catch (err) {
        failed++;
        console.error(` => Failed:`, err.message || err);
      }
    }

    console.log(`\nSync Complete: ${synced} synced, ${failed} failed.`);

    // Gracefully close
    await wpTransport.close();
    await cmsTransport.close();

  } catch (err) {
    console.error('Sync failed:', err);
    process.exit(1);
  }
}

main();
