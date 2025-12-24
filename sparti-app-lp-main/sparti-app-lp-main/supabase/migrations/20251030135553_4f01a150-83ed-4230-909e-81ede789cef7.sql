-- Add comprehensive fields to google_maps_leads table for enhanced data capture
ALTER TABLE google_maps_leads 
  ADD COLUMN IF NOT EXISTS website_emails JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS social_media_links JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS website_technologies JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS ad_pixels JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS booking_links JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS order_links JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS menu_link TEXT,
  ADD COLUMN IF NOT EXISTS price_level TEXT,
  ADD COLUMN IF NOT EXISTS additional_info JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS popular_times JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS temporarily_closed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS permanently_closed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS people_also_search JSONB DEFAULT '[]'::jsonb;

-- Add comment to document the enhanced fields
COMMENT ON COLUMN google_maps_leads.website_emails IS 'Array of email addresses found on website';
COMMENT ON COLUMN google_maps_leads.social_media_links IS 'Object with social media platform URLs (facebook, instagram, twitter, linkedin, youtube)';
COMMENT ON COLUMN google_maps_leads.website_technologies IS 'Array of detected website technologies (WordPress, Shopify, etc.)';
COMMENT ON COLUMN google_maps_leads.ad_pixels IS 'Array of ad tracking pixels detected (Facebook Pixel, Google Analytics, etc.)';
COMMENT ON COLUMN google_maps_leads.booking_links IS 'Object with booking/reservation URLs';
COMMENT ON COLUMN google_maps_leads.order_links IS 'Array of order/e-commerce links';
COMMENT ON COLUMN google_maps_leads.menu_link IS 'Link to menu (for restaurants)';
COMMENT ON COLUMN google_maps_leads.price_level IS 'Price bracket ($, $$, $$$, $$$$)';
COMMENT ON COLUMN google_maps_leads.additional_info IS 'Business characteristics, amenities, features';
COMMENT ON COLUMN google_maps_leads.popular_times IS 'Histogram data for popular times';
COMMENT ON COLUMN google_maps_leads.temporarily_closed IS 'Whether business is temporarily closed';
COMMENT ON COLUMN google_maps_leads.permanently_closed IS 'Whether business is permanently closed';
COMMENT ON COLUMN google_maps_leads.images IS 'Array of business image URLs';
COMMENT ON COLUMN google_maps_leads.people_also_search IS 'Related search suggestions';