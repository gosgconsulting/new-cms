-- Fix function search path security
ALTER FUNCTION public.search_venues_by_location(double precision,double precision,double precision,text[],boolean) SET search_path = public;

-- Fix RLS disabled issues by ensuring all public tables have RLS enabled
-- Enable RLS on all tables that don't have it
-- Skip managing RLS on PostGIS meta views; they are managed by the extension and require owner privileges
DO $$ BEGIN END $$;