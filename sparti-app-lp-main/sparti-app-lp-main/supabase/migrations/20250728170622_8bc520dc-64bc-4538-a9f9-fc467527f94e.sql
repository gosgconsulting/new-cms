-- Add support for multi-search campaigns and pagination tracking
-- This enables handling large quantities (1000+ leads) by running multiple searches

-- Add columns to lobstr_runs table for multi-search support
ALTER TABLE public.lobstr_runs 
ADD COLUMN IF NOT EXISTS target_leads integer NOT NULL DEFAULT 50,
ADD COLUMN IF NOT EXISTS searches_total integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS searches_completed integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS search_batch_size integer NOT NULL DEFAULT 200,
ADD COLUMN IF NOT EXISTS parent_campaign_id uuid,
ADD COLUMN IF NOT EXISTS search_index integer NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS geographic_segment jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS deduplication_keys text[] DEFAULT '{}';

-- Create index for efficient querying of campaign runs
CREATE INDEX IF NOT EXISTS idx_lobstr_runs_parent_campaign ON public.lobstr_runs(parent_campaign_id);
CREATE INDEX IF NOT EXISTS idx_lobstr_runs_user_status ON public.lobstr_runs(user_id, status);

-- Add table for tracking duplicate business leads across searches
CREATE TABLE IF NOT EXISTS public.business_lead_deduplication (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id uuid NOT NULL,
    place_id text,
    google_id text,
    cid text,
    business_name text NOT NULL,
    address text,
    phone text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    
    -- Create unique constraint to prevent duplicates
    CONSTRAINT unique_business_per_campaign UNIQUE(campaign_id, place_id, google_id, cid)
);

-- Enable RLS on deduplication table
ALTER TABLE public.business_lead_deduplication ENABLE ROW LEVEL SECURITY;

-- RLS policies for deduplication table
CREATE POLICY "Users can view their campaign deduplication data" 
ON public.business_lead_deduplication 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.lobstr_runs 
    WHERE id = campaign_id 
    AND (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Service role can manage deduplication data" 
ON public.business_lead_deduplication 
FOR ALL 
USING (current_setting('role'::text) = 'service_role'::text)
WITH CHECK (current_setting('role'::text) = 'service_role'::text);

-- Update business_leads table to support campaign tracking (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'business_leads') THEN
        ALTER TABLE public.business_leads 
        ADD COLUMN IF NOT EXISTS campaign_run_id uuid,
        ADD COLUMN IF NOT EXISTS is_duplicate boolean DEFAULT false,
        ADD COLUMN IF NOT EXISTS duplicate_of uuid;

        -- Create index for efficient duplicate checking
        CREATE INDEX IF NOT EXISTS idx_business_leads_campaign_run ON public.business_leads(campaign_run_id);
        CREATE INDEX IF NOT EXISTS idx_business_leads_place_identifiers ON public.business_leads(place_id, google_id, cid) WHERE place_id IS NOT NULL OR google_id IS NOT NULL OR cid IS NOT NULL;
    END IF;
END $$;

-- Add trigger to automatically update updated_at for lobstr_runs
DROP TRIGGER IF EXISTS update_lobstr_runs_updated_at ON public.lobstr_runs;
CREATE TRIGGER update_lobstr_runs_updated_at
    BEFORE UPDATE ON public.lobstr_runs
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();