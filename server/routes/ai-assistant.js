import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { authenticateUser } from '../middleware/auth.js';
import { getPageWithLayout } from '../../sparti-cms/db/modules/pages.js';
import { query } from '../../sparti-cms/db/index.js';

const router = express.Router();

// Initialize Anthropic client
const getAnthropicClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
  }
  return new Anthropic({ apiKey });
};

// Build enhanced system prompt with page context and JSON rules
const buildSystemPrompt = (pageContext, activeTool, selectedComponents) => {
  let systemPrompt = `You are an AI Assistant for a CMS (Content Management System) Visual Editor. Help users with content creation, editing, and provide guidance on using the CMS features. Be concise, helpful, and professional.

`;

  // Add page context if available
  if (pageContext && pageContext.slug) {
    const componentCount = pageContext.layout?.components?.length || 0;
    systemPrompt += `CURRENT PAGE CONTEXT:
- Page: ${pageContext.pageName || 'Unknown'} (${pageContext.slug})
- Tenant: ${pageContext.tenantId || 'Unknown'}
- Components: ${componentCount} component(s) in this page

IMPORTANT: You are ONLY working with this specific page. Do NOT reference other pages or the entire website. Focus exclusively on the current page's structure and components.

`;

    // Include current page layout structure
    if (pageContext.layout && pageContext.layout.components && pageContext.layout.components.length > 0) {
      systemPrompt += `CURRENT PAGE STRUCTURE:
The page contains the following components:
${JSON.stringify(pageContext.layout.components.slice(0, 5), null, 2)}
${pageContext.layout.components.length > 5 ? `\n... and ${pageContext.layout.components.length - 5} more components` : ''}

`;
    }
  } else {
    systemPrompt += `NOTE: No page is currently open in the Visual Editor. You can still help with general CMS questions.\n\n`;
  }

  // Add JSON structure rules
  systemPrompt += `JSON STRUCTURE RULES FOR EDITABLE SECTIONS:

1. DATABASE STORAGE:
   - Pages store editable sections in the 'page_layouts' table
   - Field: 'layout_json' (JSONB type in PostgreSQL)
   - Format: { "components": [...] }
   - Each page has a unique layout per language (default language: 'default')
   - Components are tenant-isolated via 'tenant_id' in the 'pages' table

2. COMPONENT JSON FORMAT:
   Each component in the layout_json.components array follows this structure:
   {
     "id": "unique-component-id",
     "type": "component-type-id",  // Must match a component from registry
     "props": {
       "propertyName": "value",
       // All properties defined in component registry
     }
   }

3. COMPONENT REGISTRY:
   - Component definitions stored in: sparti-cms/registry/components/*.json
   - Each component has: id, name, type, category, properties, editor, version, tenant_scope
   - Properties define what can be edited: type, description, editable, required, default
   - Example component structure:
     {
       "id": "hero-main",
       "name": "Hero Section",
       "type": "container",
       "category": "content",
       "properties": {
         "headingLine1": {
           "type": "string",
           "description": "First line of heading",
           "editable": true,
           "required": true
         }
       },
       "editor": "ContainerEditor",
       "version": "1.0.0",
       "tenant_scope": "tenant"
     }

4. TENANT ISOLATION:
   - All pages are scoped to a specific tenant_id
   - Components are tenant-specific when tenant_scope is "tenant"
   - Global components (tenant_scope: "global") can be used across tenants
   - Always respect tenant boundaries when suggesting changes

`;

  // Add Create JSON tool specific instructions
  if (activeTool === 'createJSON') {
    systemPrompt += `CREATE JSON TOOL ACTIVE:
You are now in JSON creation mode. When the user asks you to create component JSON:

1. Generate valid component JSON matching the registry schema
2. Include ALL required properties (marked as "required": true)
3. Include default values for optional properties when appropriate
4. Follow the exact property types defined in the component registry
5. Ensure the component type matches an existing component ID from the registry
6. Format the JSON properly with correct structure:
   {
     "id": "unique-id-for-this-instance",
     "type": "component-type-id",
     "props": {
       // All properties from component definition
     }
   }

7. If creating a new component type, provide the full component definition following the registry format
8. Always validate that the JSON structure matches the expected schema

Example valid component JSON:
{
  "id": "hero-section-1",
  "type": "hero-main",
  "props": {
    "badgeText": "Welcome",
    "showBadge": true,
    "headingLine1": "Your Journey Starts Here",
    "headingLine2": "Building Something Amazing",
    "description": "This is a template landing page. Customize it to match your brand.",
    "ctaButtonText": "Get Started",
    "showClientLogos": true,
    "backgroundType": "gradient",
    "backgroundColor": "#ffffff"
  }
}

`;
  }

  // Add selected components context
  if (selectedComponents && selectedComponents.length > 0) {
    systemPrompt += `SELECTED COMPONENTS:
The user has selected the following components from the page:
${selectedComponents.map((comp, idx) => {
  let info = `${idx + 1}. ${comp.tagName} (selector: ${comp.selector})`;
  if (comp.filePath) {
    info += `\n   File: ${comp.filePath}`;
    if (comp.lineNumber) info += `:${comp.lineNumber}`;
  }
  return info;
}).join('\n')}

When the user asks about modifications or changes, they are referring to these selected components. Focus your responses on these specific elements.

`;
  }

  systemPrompt += `GENERAL GUIDELINES:
- Be specific to the current page when page context is available
- Reference component IDs and types accurately
- When components are selected, focus on those specific elements
- Suggest changes that maintain JSON structure validity
- Explain JSON structure when helping users understand the system
- When creating JSON, always validate against component registry schemas`;

  return systemPrompt;
};

// AI Assistant chat endpoint
router.post('/ai-assistant/chat', authenticateUser, async (req, res) => {
  try {
    const { message, conversationHistory = [], pageContext, activeTool, selectedComponents } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Message is required and must be a non-empty string'
      });
    }

    const anthropic = getAnthropicClient();

    // Build messages array for Claude API
    // Claude expects messages in a specific format: [{ role: 'user'|'assistant', content: string }]
    const messages = conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    // Add the current user message
    messages.push({
      role: 'user',
      content: message
    });

    // Build enhanced system prompt
    const systemPrompt = buildSystemPrompt(pageContext, activeTool, selectedComponents);

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', // Using latest Claude 3.5 Sonnet
      max_tokens: 2048, // Increased for JSON generation
      messages: messages,
      system: systemPrompt
    });

    // Extract the assistant's response
    const assistantMessage = response.content[0].text;

    res.json({
      success: true,
      message: assistantMessage,
      usage: response.usage
    });

  } catch (error) {
    console.error('[testing] AI Assistant API Error:', error);
    
    // Handle specific Anthropic API errors
    if (error.status === 401) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Anthropic API key'
      });
    }
    
    if (error.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to get AI response',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

// Get page context endpoint - returns page metadata and layout JSON
router.get('/ai-assistant/page-context', authenticateUser, async (req, res) => {
  try {
    // Get slug from query parameter (handles slashes properly)
    const slug = req.query.slug || '';
    const tenantId = req.tenantId || req.query.tenantId || 'tenant-gosg';
    
    if (!slug) {
      return res.status(400).json({
        success: false,
        error: 'Slug parameter is required'
      });
    }
    
    // Ensure slug starts with /
    const normalizedSlug = slug.startsWith('/') ? slug : `/${slug}`;
    
    // First, get the page by slug
    const pageResult = await query(`
      SELECT 
        id,
        page_name,
        slug,
        tenant_id,
        page_type,
        status
      FROM pages
      WHERE slug = $1 AND tenant_id = $2
      LIMIT 1
    `, [normalizedSlug, tenantId]);
    
    if (pageResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Page not found'
      });
    }
    
    const page = pageResult.rows[0];
    const pageId = page.id;
    
    // Get the layout JSON for this page
    const layoutResult = await query(`
      SELECT layout_json, version, updated_at
      FROM page_layouts
      WHERE page_id = $1 AND language = 'default'
      ORDER BY version DESC
      LIMIT 1
    `, [pageId]);
    
    const layout = layoutResult.rows[0]?.layout_json || { components: [] };
    
    // Build page context
    const pageContext = {
      slug: page.slug,
      pageName: page.page_name,
      pageId: page.id,
      tenantId: page.tenant_id,
      layout: layout
    };
    
    res.json({
      success: true,
      pageContext: pageContext
    });
    
  } catch (error) {
    console.error('[testing] Error fetching page context:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch page context',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

export default router;

