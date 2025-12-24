-- Fix security warnings from venue table creation

-- Fix 1 & 2: Add search_path parameter to functions
-- Drop trigger first to avoid dependency error, then recreate function and trigger
DROP TRIGGER IF EXISTS update_venues_updated_at ON public.venues;
DROP FUNCTION IF EXISTS public.update_venue_updated_at();
CREATE OR REPLACE FUNCTION public.update_venue_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate trigger that depends on the function
CREATE TRIGGER update_venues_updated_at
BEFORE UPDATE ON public.venues
FOR EACH ROW
EXECUTE FUNCTION public.update_venue_updated_at();

DROP FUNCTION IF EXISTS public.search_venues_by_location(double precision, double precision, double precision, text[], boolean);
CREATE OR REPLACE FUNCTION public.search_venues_by_location(
  search_lat double precision,
  search_lng double precision,
  search_radius_km double precision DEFAULT 5.0,
  search_types text[] DEFAULT NULL,
  only_pet_friendly boolean DEFAULT false
)
RETURNS TABLE(
  id uuid,
  place_id text,
  name text,
  formatted_address text,
  latitude double precision,
  longitude double precision,
  rating numeric,
  user_ratings_total integer,
  types text[],
  is_pet_friendly boolean,
  distance_km double precision,
  last_updated timestamp with time zone,
  cache_expires_at timestamp with time zone
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    v.id,
    v.place_id,
    v.name,
    v.formatted_address,
    v.latitude,
    v.longitude,
    v.rating,
    v.user_ratings_total,
    v.types,
    v.is_pet_friendly,
    ST_Distance(v.location, ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography) / 1000 as distance_km,
    v.last_updated,
    v.cache_expires_at
  FROM public.venues v
  WHERE 
    ST_DWithin(
      v.location, 
      ST_SetSRID(ST_MakePoint(search_lng, search_lat), 4326)::geography, 
      search_radius_km * 1000
    )
    AND (search_types IS NULL OR v.types && search_types)
    AND (only_pet_friendly = false OR v.is_pet_friendly = true)
    AND v.cache_expires_at > now()
  ORDER BY distance_km ASC
  LIMIT 50;
$$;