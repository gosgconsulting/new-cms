/**
 * Branding Settings JSON Schema
 * Defines the structure and validation rules for all branding-related settings
 * Used across all tenants for consistency
 */

export const brandingSettingsSchema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Branding Settings",
  description: "Site branding configuration including identity, colors, and typography",
  type: "object",
  properties: {
    // Site Identity
    site_name: {
      type: "string",
      title: "Site Name",
      description: "The name of your website",
      minLength: 1,
      maxLength: 100,
      default: ""
    },
    site_tagline: {
      type: "string",
      title: "Site Tagline",
      description: "A short description or slogan",
      maxLength: 200,
      default: ""
    },
    site_description: {
      type: "string",
      title: "Site Description",
      description: "A detailed description of your site",
      maxLength: 500,
      default: ""
    },
    site_logo: {
      type: "string",
      title: "Site Logo",
      description: "URL or path to your site logo",
      format: "uri-reference",
      default: ""
    },
    site_favicon: {
      type: "string",
      title: "Site Favicon",
      description: "URL or path to your site favicon",
      format: "uri-reference",
      default: "/favicon.png"
    },
    site_domain: {
      type: "string",
      title: "Site Domain",
      description: "Your site's domain name",
      format: "hostname",
      default: ""
    },
    site_language: {
      type: "string",
      title: "Site Language",
      description: "Default language code (ISO 639-1)",
      pattern: "^[a-z]{2}$",
      default: "en"
    },
    site_country: {
      type: "string",
      title: "Site Country",
      description: "Country where the site operates",
      default: ""
    },
    site_timezone: {
      type: "string",
      title: "Site Timezone",
      description: "Timezone for the site (IANA format)",
      default: "UTC"
    },

    // Brand Colors
    color_primary: {
      type: "string",
      title: "Primary Color",
      description: "Main brand color",
      pattern: "^#[0-9A-Fa-f]{6}$",
      default: "#3B82F6"
    },
    color_secondary: {
      type: "string",
      title: "Secondary Color",
      description: "Secondary brand color",
      pattern: "^#[0-9A-Fa-f]{6}$",
      default: "#8B5CF6"
    },
    color_accent: {
      type: "string",
      title: "Accent Color",
      description: "Accent color for highlights",
      pattern: "^#[0-9A-Fa-f]{6}$",
      default: "#F59E0B"
    },
    color_text: {
      type: "string",
      title: "Text Color",
      description: "Default text color",
      pattern: "^#[0-9A-Fa-f]{6}$",
      default: "#1F2937"
    },
    color_background: {
      type: "string",
      title: "Background Color",
      description: "Default background color",
      pattern: "^#[0-9A-Fa-f]{6}$",
      default: "#FFFFFF"
    },
    color_gradient_start: {
      type: "string",
      title: "Gradient Start Color",
      description: "Starting color for gradients",
      pattern: "^#[0-9A-Fa-f]{6}$",
      default: "#3B82F6"
    },
    color_gradient_end: {
      type: "string",
      title: "Gradient End Color",
      description: "Ending color for gradients",
      pattern: "^#[0-9A-Fa-f]{6}$",
      default: "#8B5CF6"
    },
    color_brand_blue: {
      type: "string",
      title: "Brand Blue",
      pattern: "^#[0-9A-Fa-f]{6}$",
      default: "#3B82F6"
    },
    color_brand_purple: {
      type: "string",
      title: "Brand Purple",
      pattern: "^#[0-9A-Fa-f]{6}$",
      default: "#8B5CF6"
    },
    color_brand_teal: {
      type: "string",
      title: "Brand Teal",
      pattern: "^#[0-9A-Fa-f]{6}$",
      default: "#14B8A6"
    },
    color_brand_gold: {
      type: "string",
      title: "Brand Gold",
      pattern: "^#[0-9A-Fa-f]{6}$",
      default: "#F59E0B"
    },
    color_coral: {
      type: "string",
      title: "Coral Color",
      pattern: "^#[0-9A-Fa-f]{6}$",
      default: "#FF6B6B"
    },

    // Typography
    typography_heading_font: {
      type: "string",
      title: "Heading Font",
      description: "Font family for headings",
      default: "Inter, system-ui, sans-serif"
    },
    typography_body_font: {
      type: "string",
      title: "Body Font",
      description: "Font family for body text",
      default: "Inter, system-ui, sans-serif"
    },
    typography_heading_weight: {
      type: "string",
      title: "Heading Font Weight",
      enum: ["300", "400", "500", "600", "700", "800", "900"],
      default: "700"
    },
    typography_body_weight: {
      type: "string",
      title: "Body Font Weight",
      enum: ["300", "400", "500", "600", "700"],
      default: "400"
    },
    typography_base_font_size: {
      type: "string",
      title: "Base Font Size",
      pattern: "^[0-9]+(px|rem|em)$",
      default: "16px"
    },
    typography_line_height: {
      type: "string",
      title: "Line Height",
      pattern: "^[0-9]+(\\.[0-9]+)?$",
      default: "1.5"
    }
  },
  required: []
};

/**
 * Get default branding settings based on schema
 */
export function getDefaultBrandingSettings() {
  const defaults = {};
  for (const [key, value] of Object.entries(brandingSettingsSchema.properties)) {
    if (value.default !== undefined) {
      defaults[key] = value.default;
    }
  }
  return defaults;
}

/**
 * Validate branding settings against schema
 */
export function validateBrandingSettings(settings) {
  const errors = [];
  
  for (const [key, value] of Object.entries(settings)) {
    const schema = brandingSettingsSchema.properties[key];
    
    if (!schema) {
      errors.push(`Unknown setting key: ${key}`);
      continue;
    }
    
    // Type validation
    if (schema.type && typeof value !== schema.type) {
      errors.push(`${key}: Expected ${schema.type}, got ${typeof value}`);
    }
    
    // String validations
    if (schema.type === 'string' && typeof value === 'string') {
      if (schema.minLength && value.length < schema.minLength) {
        errors.push(`${key}: Minimum length is ${schema.minLength}`);
      }
      if (schema.maxLength && value.length > schema.maxLength) {
        errors.push(`${key}: Maximum length is ${schema.maxLength}`);
      }
      if (schema.pattern && !new RegExp(schema.pattern).test(value)) {
        errors.push(`${key}: Does not match required pattern`);
      }
      if (schema.enum && !schema.enum.includes(value)) {
        errors.push(`${key}: Must be one of ${schema.enum.join(', ')}`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}