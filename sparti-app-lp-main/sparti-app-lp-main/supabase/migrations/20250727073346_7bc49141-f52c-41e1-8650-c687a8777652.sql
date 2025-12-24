-- Step 1: Create venues table with geo-spatial indexing for database-first search
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create venues table to cache Google Places data
CREATE TABLE public.venues (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  place_id text NOT NULL UNIQUE,
  name text NOT NULL,
  formatted_address text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  location geography(POINT, 4326) GENERATED ALWAYS AS (ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)) STORED,
  
  -- Business data
  rating numeric(3,2),
  user_ratings_total integer,
  price_level integer,
  types text[],
  primary_type text,
  
  -- Pet-friendly data
  is_pet_friendly boolean DEFAULT false,
  pet_friendly_evidence jsonb,
  pet_friendly_verified_at timestamp with time zone,
  
  -- API and cache metadata
  google_data jsonb, -- Store full Google Places response
  last_updated timestamp with time zone NOT NULL DEFAULT now(),
  cache_expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '30 days'),
  
  -- Search optimization
  search_query_hash text, -- Hash of the original search query that found this venue
  search_location geography(POINT, 4326), -- Location where this venue was found during search
  
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Create policies for venue access
CREATE POLICY "Anyone can view venues" 
ON public.venues 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage venues" 
ON public.venues 
FOR ALL 
USING (auth.role() = 'service_role'::text);

-- Create geo-spatial indexes for fast radius searches
CREATE INDEX idx_venues_location ON public.venues USING GIST(location);
CREATE INDEX idx_venues_place_id ON public.venues (place_id);
CREATE INDEX idx_venues_cache_expires ON public.venues (cache_expires_at);
CREATE INDEX idx_venues_last_updated ON public.venues (last_updated);
CREATE INDEX idx_venues_pet_friendly ON public.venues (is_pet_friendly);
CREATE INDEX idx_venues_types ON public.venues USING GIN(types);

-- Create search query cache table
CREATE TABLE public.search_queries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  query_hash text NOT NULL UNIQUE,
  search_params jsonb NOT NULL,
  result_count integer NOT NULL DEFAULT 0,
  last_searched timestamp with time zone NOT NULL DEFAULT now(),
  api_calls_made integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for search queries
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view search queries" 
ON public.search_queries 
FOR SELECT 
USING (true);

CREATE POLICY "Service role can manage search queries" 
ON public.search_queries 
FOR ALL 
USING (auth.role() = 'service_role'::text);

-- Index for search query optimization
CREATE INDEX idx_search_queries_hash ON public.search_queries (query_hash);
CREATE INDEX idx_search_queries_last_searched ON public.search_queries (last_searched);

-- Create function to update venue timestamps
CREATE OR REPLACE FUNCTION public.update_venue_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_venues_updated_at
BEFORE UPDATE ON public.venues
FOR EACH ROW
EXECUTE FUNCTION public.update_venue_updated_at();

-- Create function for geo-spatial venue search
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