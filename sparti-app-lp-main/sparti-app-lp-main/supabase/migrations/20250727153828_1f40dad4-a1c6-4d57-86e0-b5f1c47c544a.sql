-- Create a table to cache Google Places autocomplete results globally
CREATE TABLE IF NOT EXISTS public.places_autocomplete_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  query_text TEXT NOT NULL,
  country_code TEXT,
  predictions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT now() + INTERVAL '7 days'
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_places_autocomplete_cache_query 
ON public.places_autocomplete_cache(query_text, country_code);

-- Create index for cleanup
CREATE INDEX IF NOT EXISTS idx_places_autocomplete_cache_expires 
ON public.places_autocomplete_cache(expires_at);

-- Enable RLS (but make it publicly readable since it's cached location data)
ALTER TABLE public.places_autocomplete_cache ENABLE ROW LEVEL SECURITY;

-- Allow all users to read cached data (it's just location suggestions)
CREATE POLICY "Allow public read access to autocomplete cache" 
ON public.places_autocomplete_cache 
FOR SELECT 
USING (true);

-- Allow all users to insert cache data
CREATE POLICY "Allow public insert to autocomplete cache" 
ON public.places_autocomplete_cache 
FOR INSERT 
WITH CHECK (true);

-- Cleanup function for expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_autocomplete_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.places_autocomplete_cache 
  WHERE expires_at < now();
END;
$$;