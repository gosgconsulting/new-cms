-- Add copilot_type column to brands table for copilot-specific brand management
ALTER TABLE public.brands 
ADD COLUMN IF NOT EXISTS copilot_type text NULL;

-- Add comment to explain the column
COMMENT ON COLUMN public.brands.copilot_type IS 'Type of copilot this brand belongs to (e.g., seo, assets, tasks). NULL for legacy brands that work across all copilots.';

-- Create index for better performance when filtering by copilot_type
CREATE INDEX IF NOT EXISTS idx_brands_copilot_type ON public.brands(copilot_type);

-- Create index for filtering by user_id and copilot_type together
CREATE INDEX IF NOT EXISTS idx_brands_user_copilot ON public.brands(user_id, copilot_type);