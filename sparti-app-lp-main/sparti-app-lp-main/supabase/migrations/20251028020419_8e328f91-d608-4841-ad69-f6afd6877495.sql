-- First, allow NULL for brand_limit to support unlimited brands
ALTER TABLE plans ALTER COLUMN brand_limit DROP NOT NULL;

-- Update Agency plans to have NULL brand_limit for unlimited brands
UPDATE plans
SET brand_limit = NULL
WHERE id IN ('enterprise', 'enterprise-yearly', 'enterprise-launch-promo');

-- Drop and recreate the get_user_brand_limit_info function to handle NULL as unlimited
DROP FUNCTION IF EXISTS get_user_brand_limit_info(UUID);

CREATE OR REPLACE FUNCTION get_user_brand_limit_info(user_uuid UUID)
RETURNS TABLE (
  current_count BIGINT,
  brand_limit INTEGER,
  can_create_brand BOOLEAN,
  plan_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(b.id)::BIGINT as current_count,
    COALESCE(p.brand_limit, 999999) as brand_limit,
    CASE 
      WHEN p.brand_limit IS NULL THEN true  -- Unlimited for Agency plans
      WHEN COUNT(b.id) < p.brand_limit THEN true
      ELSE false
    END as can_create_brand,
    p.name as plan_name
  FROM profiles prof
  LEFT JOIN plans p ON prof.plan_id = p.id
  LEFT JOIN brands b ON b.user_id = user_uuid
  WHERE prof.id = user_uuid
  GROUP BY p.brand_limit, p.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;