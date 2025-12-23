import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { authenticateUser } from '../middleware/auth.js';
import { getPageWithLayout } from '../../sparti-cms/db/modules/pages.js';
import { query } from '../../sparti-cms/db/index.js';
// Import component registry - using dynamic import for TypeScript module
let componentRegistry;
async function getComponentRegistry() {
  if (!componentRegistry) {
    try {
      const registryModule = await import('../../sparti-cms/registry/index.ts');
      componentRegistry = registryModule.componentRegistry || registryModule.ComponentRegistry?.getInstance();
    } catch (error) {
      console.error('[testing] Error importing component registry:', error);
      // Fallback: return empty registry
      return { getAll: () => [] };
    }
  }
  return componentRegistry;
}

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

IMPORTANT: Even if page context is not available or there are errors with JSON data, you should still provide helpful responses as a general AI assistant. You can help with general questions, content creation, and CMS guidance.

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

    // Include current page layout structure - FULL JSON (handle errors gracefully)
    try {
      if (pageContext.layout && pageContext.layout.components && pageContext.layout.components.length > 0) {
        systemPrompt += `CURRENT PAGE STRUCTURE (COMPLETE JSON):
The page contains the following complete component structure:
${JSON.stringify(pageContext.layout.components, null, 2)}

This is the FULL page layout JSON. All components are included above. Use this complete structure when:
- Answering questions about the page content
- Modifying or updating components
- Creating new components that should match the existing structure
- Understanding the page's complete structure

`;
      } else if (pageContext.layout) {
        // Include the full layout object even if components array is empty
        systemPrompt += `CURRENT PAGE STRUCTURE (COMPLETE JSON):
The page layout structure:
${JSON.stringify(pageContext.layout, null, 2)}

`;
      }
    } catch (jsonError) {
      console.warn('[testing] Error stringifying page layout in system prompt:', jsonError);
      // Continue without layout JSON if it fails
    }

    // If a specific component is focused (selected from left panel), highlight it
    if (pageContext.focusedComponent) {
      systemPrompt += `FOCUSED COMPONENT (USER SELECTED FROM LEFT PANEL):
The user has specifically selected this component from the page components list. Focus your response on THIS component:

${JSON.stringify(pageContext.focusedComponent, null, 2)}

IMPORTANT: When answering questions or making modifications, prioritize this focused component. The user wants to work specifically with this component's JSON structure.

`;
    }
  } else {
    systemPrompt += `🏠 **Current Context**: No specific page is selected in the Visual Editor.

This means I can help you with:
- General CMS questions and guidance
- Content creation and strategy
- Technical questions about web development
- Any other topics or questions you have

Feel free to ask me anything! I'm here to help whether it's CMS-related or any other topic.

`;
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

// Optional authentication middleware - works for both logged-in and anonymous users
const optionalAuth = (req, res, next) => {
  // Check if user is already authenticated via access key
  if (req.user) {
    if (req.user.is_super_admin) {
      req.tenantId = req.query.tenantId || req.headers['x-tenant-id'] || req.user.tenant_id;
    } else {
      req.tenantId = req.user.tenant_id;
    }
    return next();
  }

  // Check for Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const jwt = require('jsonwebtoken');
      const { JWT_SECRET } = require('../config/constants.js');
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      
      if (req.user.is_super_admin) {
        req.tenantId = req.query.tenantId || req.headers['x-tenant-id'] || req.user.tenant_id;
      } else {
        req.tenantId = req.user.tenant_id;
      }
    } catch (error) {
      // Invalid token, but continue as anonymous user
      console.log('[testing] Invalid token provided, continuing as anonymous user');
    }
  }
  
  // Continue without authentication - anonymous user
  next();
};

// AI Assistant chat endpoint - works for both authenticated and anonymous users
router.post('/ai-assistant/chat', optionalAuth, async (req, res) => {
  try {
    
    const { message, conversationHistory = [], pageContext, activeTool, selectedComponents, model } = req.body;
    
    // Log page context info for debugging
    if (pageContext) {
      const componentCount = pageContext.layout?.components?.length || 0;
      console.log(`[testing] AI Assistant chat - Page: ${pageContext.slug}, Tenant: ${pageContext.tenantId}, Components: ${componentCount}`);
    }

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

    // Build enhanced system prompt (handle errors gracefully)
    let systemPrompt;
    try {
      systemPrompt = buildSystemPrompt(pageContext, activeTool, selectedComponents);
    } catch (promptError) {
      console.warn('[testing] Error building system prompt, using fallback:', promptError);
      // Fallback to enhanced general chat prompt
      systemPrompt = `You are Claude, an AI Assistant integrated into a CMS (Content Management System) Visual Editor. You're designed to be helpful, harmless, and honest.

🎯 **Primary Functions:**
- **General AI Assistant**: Answer questions on any topic with accuracy and depth
- **CMS & Web Development**: Provide expert guidance on content management, web development, and digital marketing
- **Content Creation**: Help write, edit, and improve content of all types
- **Technical Support**: Assist with coding, troubleshooting, and best practices

💡 **Capabilities:**
- Answer questions across all domains of knowledge
- Help with writing, editing, and content strategy
- Provide coding assistance and technical guidance
- Offer creative ideas and problem-solving approaches
- Explain complex concepts in simple terms

🔧 **CMS-Specific Help:**
- Page structure and component organization
- SEO optimization and best practices  
- Content strategy and user experience
- Technical implementation guidance
- Troubleshooting and debugging

**Communication Style:**
- Be conversational yet professional
- Provide clear, actionable advice
- Ask clarifying questions when needed
- Offer multiple approaches when appropriate
- Always be helpful and encouraging

Whether you need help with the CMS, general questions, or creative tasks, I'm here to assist! What can I help you with today?`;
    }

    // Use selected model or default to most affordable (Haiku)
    const selectedModel = model || 'claude-3-5-haiku-20241022';
    
    // Validate model is in allowed list (updated with latest Claude 4.x models)
    const allowedModels = [
      // Claude 4.x models (latest)
      'claude-3-5-haiku-20241022',    // Claude Haiku 4.x
      'claude-3-5-sonnet-20241022',   // Claude Sonnet 4
      'claude-3-5-sonnet-20250115',   // Claude Sonnet 4.5 (if available)
      'claude-3-5-opus-20241022',     // Claude Opus 4
      'claude-3-5-opus-20250115',     // Claude Opus 4.1/4.5 (if available)
      
      // Claude 3.x models (legacy support)
      'claude-3-7-sonnet-20250219',   // Claude Sonnet 3.7
      'claude-3-haiku-20240307',      // Claude Haiku 3
      'claude-3-opus-20240229',       // Claude Opus 3
    ];
    const modelToUse = allowedModels.includes(selectedModel) ? selectedModel : 'claude-3-5-haiku-20241022';

    // Call Claude API
    const response = await anthropic.messages.create({
      model: modelToUse,
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

// Generate schema from AI analysis
router.post('/ai-assistant/generate-schema', authenticateUser, async (req, res) => {
  try {
    const { pageSlug, pageName, tenantId } = req.body;

    if (!pageSlug || !tenantId) {
      return res.status(400).json({
        success: false,
        error: 'pageSlug and tenantId are required'
      });
    }

    // Get page context
    const normalizedSlug = pageSlug.startsWith('/') ? pageSlug : `/${pageSlug}`;
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

    // Get current layout if exists
    const layoutResult = await query(`
      SELECT layout_json, version, updated_at
      FROM page_layouts
      WHERE page_id = $1 AND language = 'default'
      ORDER BY version DESC
      LIMIT 1
    `, [pageId]);

    const currentLayout = layoutResult.rows[0]?.layout_json || { components: [] };

    // Get component registry
    const registry = await getComponentRegistry();
    const allComponents = registry.getAll();

    // Build AI prompt for schema generation
    const anthropic = getAnthropicClient();
    
    const systemPrompt = `You are an AI Assistant specialized in analyzing web pages and generating JSON schemas for a CMS (Content Management System).

Your task is to analyze the page structure and generate a valid page schema JSON that follows this exact format:
{
  "components": [
    {
      "id": "unique-component-id",
      "type": "component-type-id",
      "props": {
        // All properties matching the component definition
      }
    }
  ]
}

COMPONENT REGISTRY (Available Components):
${JSON.stringify(allComponents.map(c => ({
  id: c.id,
  name: c.name,
  type: c.type,
  category: c.category,
  description: c.description,
  properties: c.properties,
  tenant_scope: c.tenant_scope
})), null, 2)}

RULES:
1. Analyze the page structure and identify which components from the registry should be used
2. Generate component JSON that matches the component definitions in the registry
3. Include ALL required properties (marked as "required": true in component definitions)
4. Use appropriate default values for optional properties
5. Each component must have a unique "id" (use descriptive IDs like "hero-section-1", "services-grid-1", etc.)
6. The "type" must match an existing component ID from the registry
7. Generate a complete schema that represents the page structure
8. If the page already has a layout, analyze it and suggest improvements or create a new one based on the page content

CURRENT PAGE INFO:
- Page Name: ${pageName || page.page_name}
- Page Slug: ${normalizedSlug}
- Tenant ID: ${tenantId}
- Current Layout: ${JSON.stringify(currentLayout, null, 2)}

Generate a complete page schema JSON that represents this page's structure. Return ONLY valid JSON, no explanations or markdown.`;

    const userPrompt = `Analyze the page "${pageName || page.page_name}" (${normalizedSlug}) and generate a complete page schema JSON based on the component registry. 
${currentLayout.components.length > 0 ? 'The page currently has a layout - analyze it and generate an improved or complete schema.' : 'The page has no layout yet - create a complete schema based on typical page structure.'}`;

    // Use selected model or default to most affordable (Haiku)
    const selectedModel = model || 'claude-3-5-haiku-20241022';
    
    // Validate model is in allowed list (updated with latest Claude 4.x models)
    const allowedModels = [
      // Claude 4.x models (latest)
      'claude-3-5-haiku-20241022',    // Claude Haiku 4.x
      'claude-3-5-sonnet-20241022',   // Claude Sonnet 4
      'claude-3-5-sonnet-20250115',   // Claude Sonnet 4.5 (if available)
      'claude-3-5-opus-20241022',     // Claude Opus 4
      'claude-3-5-opus-20250115',     // Claude Opus 4.1/4.5 (if available)
      
      // Claude 3.x models (legacy support)
      'claude-3-7-sonnet-20250219',   // Claude Sonnet 3.7
      'claude-3-haiku-20240307',      // Claude Haiku 3
      'claude-3-opus-20240229',       // Claude Opus 3
    ];
    const modelToUse = allowedModels.includes(selectedModel) ? selectedModel : 'claude-3-5-haiku-20241022';

    // Call Claude API
    const response = await anthropic.messages.create({
      model: modelToUse,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: userPrompt
        }
      ],
      system: systemPrompt
    });

    // Extract the assistant's response
    let assistantResponse = response.content[0].text;

    // Try to extract JSON from the response (handle markdown code blocks)
    let schemaJson = assistantResponse;
    const jsonMatch = assistantResponse.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      schemaJson = jsonMatch[1];
    } else {
      // Try to find JSON object directly
      const directJsonMatch = assistantResponse.match(/\{[\s\S]*\}/);
      if (directJsonMatch) {
        schemaJson = directJsonMatch[0];
      }
    }

    // Parse and validate the JSON
    let schema;
    try {
      schema = JSON.parse(schemaJson);
      
      // Ensure it has components array
      if (!schema.components || !Array.isArray(schema.components)) {
        schema = { components: schema.components || [] };
      }
    } catch (parseError) {
      console.error('[testing] Error parsing AI-generated schema:', parseError);
      return res.status(500).json({
        success: false,
        error: 'Failed to parse AI-generated schema',
        message: parseError.message,
        rawResponse: assistantResponse
      });
    }

    res.json({
      success: true,
      schema: schema,
      usage: response.usage
    });

  } catch (error) {
    console.error('[testing] Error generating schema:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate schema',
      message: error.message || 'An unexpected error occurred'
    });
  }
});

export default router;

