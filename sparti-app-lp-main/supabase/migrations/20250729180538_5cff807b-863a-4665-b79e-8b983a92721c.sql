-- Add missing activity column to business_leads table
ALTER TABLE public.business_leads 
ADD COLUMN activity text;

-- Add date_added column for better tracking (this will be the same as created_at initially)
ALTER TABLE public.business_leads 
ADD COLUMN date_added timestamp with time zone DEFAULT now();

-- Update existing records to set date_added to created_at
UPDATE public.business_leads 
SET date_added = created_at 
WHERE date_added IS NULL;

-- Add some missing columns that the lobstr-scraper is trying to use
ALTER TABLE public.business_leads 
ADD COLUMN IF NOT EXISTS search_query text,
ADD COLUMN IF NOT EXISTS search_location text,
ADD COLUMN IF NOT EXISTS search_categories text[],
ADD COLUMN IF NOT EXISTS processing_status text DEFAULT 'completed',
ADD COLUMN IF NOT EXISTS place_id text,
ADD COLUMN IF NOT EXISTS google_id text,
ADD COLUMN IF NOT EXISTS cid text,
ADD COLUMN IF NOT EXISTS google_url text;

-- Create index for better performance on user queries
CREATE INDEX IF NOT EXISTS idx_business_leads_user_activity ON public.business_leads(user_id, activity);
CREATE INDEX IF NOT EXISTS idx_business_leads_date_added ON public.business_leads(date_added);
CREATE INDEX IF NOT EXISTS idx_business_leads_lobstr_run ON public.business_leads(lobstr_run_id);

-- Add a trigger to auto-update date_added when records are inserted
CREATE OR REPLACE FUNCTION update_date_added()
RETURNS TRIGGER AS $$
BEGIN
  NEW.date_added = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_date_added
  BEFORE INSERT ON public.business_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_date_added();