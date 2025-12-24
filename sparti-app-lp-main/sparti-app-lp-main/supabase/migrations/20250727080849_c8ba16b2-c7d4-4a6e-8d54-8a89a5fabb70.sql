-- Drop existing function and recreate with correct signature
DROP FUNCTION IF EXISTS public.search_venues_by_location(double precision,double precision,double precision,text[],boolean);

-- Create RPC function to search venues by location
CREATE OR REPLACE FUNCTION public.search_venues_by_location(
  search_lat DOUBLE PRECISION,
  search_lng DOUBLE PRECISION,
  search_radius_km DOUBLE PRECISION DEFAULT 5,
  search_types TEXT[] DEFAULT NULL,
  only_pet_friendly BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
  id UUID,
  place_id TEXT,
  name TEXT,
  formatted_address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  rating NUMERIC,
  user_ratings_total INTEGER,
  types TEXT[],
  primary_type TEXT,
  is_pet_friendly BOOLEAN,
  pet_friendly_evidence JSONB,
  google_data JSONB,
  distance_km DOUBLE PRECISION,
  last_updated TIMESTAMP WITH TIME ZONE,
  cache_expires_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
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
    v.primary_type,
    v.is_pet_friendly,
    v.pet_friendly_evidence,
    v.google_data,
    -- Calculate distance using Haversine formula (approximation)
    (6371 * acos(
      cos(radians(search_lat)) 
      * cos(radians(v.latitude)) 
      * cos(radians(v.longitude) - radians(search_lng)) 
      + sin(radians(search_lat)) 
      * sin(radians(v.latitude))
    ))::DOUBLE PRECISION as distance_km,
    v.last_updated,
    v.cache_expires_at
  FROM public.venues v
  WHERE 
    -- Distance filter using bounding box for performance, then precise calculation
    v.latitude BETWEEN (search_lat - (search_radius_km / 111.0)) AND (search_lat + (search_radius_km / 111.0))
    AND v.longitude BETWEEN (search_lng - (search_radius_km / (111.0 * cos(radians(search_lat))))) AND (search_lng + (search_radius_km / (111.0 * cos(radians(search_lat)))))
    -- Precise distance check
    AND (6371 * acos(
      cos(radians(search_lat)) 
      * cos(radians(v.latitude)) 
      * cos(radians(v.longitude) - radians(search_lng)) 
      + sin(radians(search_lat)) 
      * sin(radians(v.latitude))
    )) <= search_radius_km
    -- Type filter (if specified)
    AND (search_types IS NULL OR v.types && search_types OR v.primary_type = ANY(search_types))
    -- Pet-friendly filter (if specified)
    AND (NOT only_pet_friendly OR v.is_pet_friendly = true)
    -- Only return non-expired cached data
    AND v.cache_expires_at > now()
  ORDER BY distance_km ASC
  LIMIT 50;
END;
$$;

-- Fix RLS policies for edge functions to store venue data
-- Update venues table RLS policy to allow service role inserts
DROP POLICY IF EXISTS "Service role can manage venues" ON public.venues;
CREATE POLICY "Service role can manage venues" ON public.venues
FOR ALL USING (auth.role() = 'service_role'::text OR auth.role() = 'authenticator'::text);

-- Update search_queries table RLS policy to allow service role inserts  
DROP POLICY IF EXISTS "Service role can manage search queries" ON public.search_queries;
CREATE POLICY "Service role can manage search queries" ON public.search_queries
FOR ALL USING (auth.role() = 'service_role'::text OR auth.role() = 'authenticator'::text);