-- Fix security warnings by adding search_path to functions
-- Update cleanup function to have immutable search_path
CREATE OR REPLACE FUNCTION public.cleanup_old_api_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.api_logs 
  WHERE timestamp < now() - interval '30 days';
END;
$$;