
-- Enable RLS on seo_campaigns (if not already enabled)
ALTER TABLE public.seo_campaigns ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.seo_campaigns;
DROP POLICY IF EXISTS "Users can insert their own campaigns" ON public.seo_campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.seo_campaigns;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON public.seo_campaigns;

-- Create policy for SELECT - users can view their own campaigns
CREATE POLICY "Users can view their own campaigns"
ON public.seo_campaigns
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy for INSERT - users can create campaigns for themselves
CREATE POLICY "Users can insert their own campaigns"
ON public.seo_campaigns
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy for UPDATE - users can update their own campaigns
CREATE POLICY "Users can update their own campaigns"
ON public.seo_campaigns
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policy for DELETE - users can delete their own campaigns
CREATE POLICY "Users can delete their own campaigns"
ON public.seo_campaigns
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
