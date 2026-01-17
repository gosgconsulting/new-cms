-- Migration: Sync theme tags from theme.json files
-- This script updates themes with tags based on theme.json files
-- Note: This is a template - actual tag values should be updated based on theme.json files

-- Master theme: template tag
UPDATE themes 
SET tags = ARRAY['template'], updated_at = NOW()
WHERE slug = 'master' OR id = 'master';

-- Landingpage theme: custom tag
UPDATE themes 
SET tags = ARRAY['custom', 'business', 'services', 'professional', 'incorporation', 'accounting', 'corporate'], updated_at = NOW()
WHERE slug = 'landingpage' OR id = 'landingpage';

-- Storefront theme: custom tag
UPDATE themes 
SET tags = ARRAY['custom', 'store', 'shop', 'ecommerce', 'products'], updated_at = NOW()
WHERE slug = 'storefront' OR id = 'storefront';

-- Gosgconsulting theme: custom tag
UPDATE themes 
SET tags = ARRAY['custom', 'digital-marketing', 'seo', 'consulting', 'blog', 'dynamic-rendering', 'full-stack'], updated_at = NOW()
WHERE slug = 'gosgconsulting' OR id = 'gosgconsulting';

-- Sissonne theme: custom tag
UPDATE themes 
SET tags = ARRAY['custom', 'dance', 'ballet', 'academy', 'education', 'performing-arts', 'dance-school'], updated_at = NOW()
WHERE slug = 'sissonne' OR id = 'sissonne';

-- STR theme: custom tag
UPDATE themes 
SET tags = ARRAY['custom', 'business', 'services', 'professional', 'incorporation', 'accounting', 'corporate'], updated_at = NOW()
WHERE slug = 'str' OR id = 'str';

-- Sparti SEO Landing theme: custom tag
UPDATE themes 
SET tags = ARRAY['custom', 'ai', 'seo', 'automation', 'saas', 'landing-page', 'conversion'], updated_at = NOW()
WHERE slug = 'sparti-seo-landing' OR id = 'sparti-seo-landing';

-- Optimal Consulting theme: custom tag
UPDATE themes 
SET tags = ARRAY['custom', 'consulting', 'tenant-aware', 'minimal', 'base'], updated_at = NOW()
WHERE slug = 'optimalconsulting' OR id = 'optimalconsulting';

-- Custom theme: custom tag
UPDATE themes 
SET tags = ARRAY['custom', 'hardcoded', 'showcase', 'simple'], updated_at = NOW()
WHERE slug = 'custom' OR id = 'custom';

-- Verify updates
SELECT 
    id,
    name,
    slug,
    tags,
    is_active
FROM themes
ORDER BY name ASC;
