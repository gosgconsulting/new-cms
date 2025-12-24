-- Fix function search path security issue
ALTER FUNCTION public.update_updated_at_column() SET search_path TO '';

-- Also fix the existing handle_new_user function if needed
-- (It already has the search_path set correctly according to the logs)