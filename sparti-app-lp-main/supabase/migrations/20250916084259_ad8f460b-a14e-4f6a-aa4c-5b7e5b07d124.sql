-- Add brand_id column to connected_websites table
ALTER TABLE public.connected_websites 
ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE;

-- Create index for brand_id
CREATE INDEX IF NOT EXISTS idx_connected_websites_brand_id 
ON public.connected_websites(brand_id);

-- Update RLS policies to include brand access
CREATE POLICY IF NOT EXISTS "Users can access websites through brands" 
ON public.connected_websites 
FOR ALL 
USING (
  brand_id IS NOT NULL AND 
  EXISTS (
    SELECT 1 FROM public.brands b 
    WHERE b.id = connected_websites.brand_id 
    AND (
      b.user_id = auth.uid() OR 
      is_brand_in_user_workspace(b.id, auth.uid())
    )
  )
);

-- Update unique constraint to include brand_id
DO $$
BEGIN
  -- Drop old constraint
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'connected_websites_user_id_domain_key'
  ) THEN
    ALTER TABLE public.connected_websites 
    DROP CONSTRAINT connected_websites_user_id_domain_key;
  END IF;
  
  -- Add new constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'connected_websites_brand_id_domain_key'
  ) THEN
    ALTER TABLE public.connected_websites 
    ADD CONSTRAINT connected_websites_brand_id_domain_key UNIQUE(brand_id, domain);
  END IF;
END $$;