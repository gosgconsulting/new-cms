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
const buildSystemPrompt = (pageContext, activeTools, selectedComponents) => {
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
      // Try to extract hierarchy information from the component
      const getComponentHierarchy = (component) => {
        if (component.parentType || component.parent) {
          const parentName = component.parentType || component.parent?.type || component.parent?.name || 'Parent Component';
          const currentName = component.type || component.name || component.key || 'Component';
          return `${parentName} > ${currentName}`;
        }
        return component.type || component.name || component.key || 'Component';
      };

      const componentPath = getComponentHierarchy(pageContext.focusedComponent);
      
      systemPrompt += `FOCUSED COMPONENT (USER SELECTED FROM LEFT PANEL):
The user has specifically selected this component: ${componentPath}
Focus your response on THIS component:

${JSON.stringify(pageContext.focusedComponent, null, 2)}

IMPORTANT: When answering questions or making modifications, prioritize this focused component. The user wants to work specifically with this component's JSON structure and its place in the component hierarchy.

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

  // Add tool-specific instructions based on active tools
  if (activeTools && activeTools.length > 0) {
    systemPrompt += `🛠️ ACTIVE TOOLS: ${activeTools.join(', ')}\n\n`;
    
    activeTools.forEach(tool => {
      switch (tool) {
        case 'searchWeb':
          systemPrompt += `🌐 SEARCH WEB TOOL ACTIVE:
- Provide current, up-to-date information from the web
- Verify facts and provide recent data when possible
- Include relevant links and sources when helpful
- Focus on accurate, real-time information

`;
          break;
          
        case 'editText':
          systemPrompt += `📝 EDIT TEXT TOOL ACTIVE:
- Focus on editing and improving text content, copies, and written material
- Help with schema text properties, component content, and page copy
- Provide suggestions for better wording, clarity, and engagement
- Focus on content optimization and text-based improvements
- When working with JSON schemas, prioritize text-related properties like titles, descriptions, content, etc.

`;
          break;
          
        case 'editImage':
          systemPrompt += `🖼️ EDIT IMAGE TOOL ACTIVE:
- Focus on image-related content and visual elements
- Help with image properties in schemas (src, alt, dimensions, etc.)
- Provide guidance on image optimization and visual content
- Suggest improvements for visual components and image-based elements
- When working with JSON schemas, prioritize image-related properties and visual components

`;
          break;
          
        case 'createImage':
          systemPrompt += `🎨 CREATE IMAGE TOOL ACTIVE:
- Generate and create new images and visual content
- Provide detailed image descriptions and specifications
- Help with visual design concepts and image creation
- Focus on creating new visual elements for the page

`;
          break;
          
        case 'writeCode':
          systemPrompt += `💻 WRITE CODE TOOL ACTIVE:
- Focus on code generation, development, and technical implementation
- Provide code examples, snippets, and technical solutions
- Help with component development and technical aspects
- Generate valid JSON schemas and code structures

`;
          break;
          
        case 'deepResearch':
          systemPrompt += `🔍 DEEP RESEARCH TOOL ACTIVE:
- Perform comprehensive analysis and research
- Provide detailed, well-researched responses
- Include multiple perspectives and thorough explanations
- Focus on in-depth analysis and comprehensive solutions

`;
          break;
          
        case 'thinkLonger':
          systemPrompt += `🤔 THINK LONGER TOOL ACTIVE:
- Take more time for complex reasoning and analysis
- Provide detailed, thoughtful responses
- Consider multiple approaches and solutions
- Focus on comprehensive problem-solving

`;
          break;
      }
    });
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
    
    const { message, conversationHistory = [], pageContext, activeTools, selectedComponents, model } = req.body;
    
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
      systemPrompt = buildSystemPrompt(pageContext, activeTools, selectedComponents);
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
// When themeId is provided, resolves the theme page (same page as Flowbite editor in theme mode).
router.get('/ai-assistant/page-context', authenticateUser, async (req, res) => {
  try {
    // Get slug from query parameter (handles slashes properly)
    const slug = req.query.slug || '';
    const tenantId = req.tenantId || req.query.tenantId || 'tenant-gosg';
    const themeId = req.query.themeId || null;
    
    if (!slug) {
      return res.status(400).json({
        success: false,
        error: 'Slug parameter is required'
      });
    }
    
    // Ensure slug starts with /
    const normalizedSlug = slug.startsWith('/') ? slug : `/${slug}`;
    
    // Resolve page: by theme_id when in theme mode, else by tenant_id (tenant/custom mode)
    let pageResult;
    if (themeId && themeId !== 'custom') {
      pageResult = await query(`
        SELECT 
          id,
          page_name,
          slug,
          tenant_id,
          theme_id,
          page_type,
          status
        FROM pages
        WHERE slug = $1 AND theme_id = $2
        LIMIT 1
      `, [normalizedSlug, themeId]);
    } else {
      pageResult = await query(`
        SELECT 
          id,
          page_name,
          slug,
          tenant_id,
          theme_id,
          page_type,
          status
        FROM pages
        WHERE slug = $1 AND tenant_id = $2
        LIMIT 1
      `, [normalizedSlug, tenantId]);
    }
    
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
    
    // Build page context (include themeId when resolved by theme for consistency)
    const pageContext = {
      slug: page.slug,
      pageName: page.page_name,
      pageId: page.id,
      tenantId: page.tenant_id,
      themeId: page.theme_id || themeId || null,
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
    const { pageSlug, pageName, tenantId, model, analyzePageCode, currentSchema } = req.body;

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

ANALYSIS RULES:
1. **Deep Page Analysis**: Carefully examine the page structure, content, and purpose
2. **Component Matching**: Identify which components from the registry best represent the page content
3. **Schema Validation**: Ensure all generated JSON matches component definitions exactly
4. **Property Completeness**: Include ALL required properties and appropriate optional ones
5. **Unique Identifiers**: Use descriptive, unique IDs (e.g., "hero-section-1", "services-grid-1")
6. **Type Accuracy**: The "type" field must match an existing component ID from the registry
7. **Content Structure**: Generate a logical, hierarchical component structure
8. **Improvement Focus**: When analyzing existing schemas, suggest structural improvements
9. **Registry Compliance**: Only use components that exist in the provided registry
10. **Default Values**: Use sensible default values for optional properties

CURRENT PAGE INFO:
- Page Name: ${pageName || page.page_name}
- Page Slug: ${normalizedSlug}
- Tenant ID: ${tenantId}
- Current Layout: ${JSON.stringify(currentLayout, null, 2)}
- Analysis Mode: ${analyzePageCode ? 'Enhanced Code Analysis' : 'Standard Generation'}

${analyzePageCode ? 'ENHANCED ANALYSIS MODE: Perform deep analysis of the existing page structure and provide comprehensive improvements.' : ''}

Generate a complete, optimized page schema JSON. Return ONLY valid JSON, no explanations or markdown.`;

    // Enhanced user prompt with page analysis capabilities
    let userPrompt = `Analyze the page "${pageName || page.page_name}" (${normalizedSlug}) and generate a complete page schema JSON based on the component registry.`;
    
    if (analyzePageCode && currentSchema) {
      userPrompt += `\n\nCURRENT SCHEMA ANALYSIS:
The page currently has this schema: ${JSON.stringify(currentSchema, null, 2)}

Please analyze this existing schema and:
1. Identify any missing or incomplete components
2. Suggest improvements to the component structure
3. Ensure all components follow the registry definitions
4. Generate an enhanced version that maintains existing content but improves the structure`;
    } else if (currentLayout.components.length > 0) {
      userPrompt += `\n\nThe page currently has a layout - analyze it and generate an improved or complete schema.`;
    } else {
      userPrompt += `\n\nThe page has no layout yet - create a complete schema based on typical page structure.`;
    }

    // Use selected model from AI Assistant or default to most affordable (Haiku)
    const selectedModel = model || 'claude-3-5-haiku-20241022';
    console.log('[testing] Schema generation using model:', selectedModel);
    
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

