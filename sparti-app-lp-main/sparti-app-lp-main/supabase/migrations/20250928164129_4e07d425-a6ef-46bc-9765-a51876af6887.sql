-- Fix the INSERT policy for seo_tracked_keywords to ensure proper permissions
DROP POLICY IF EXISTS "Tracked keywords: users can insert for their brands" ON public.seo_tracked_keywords;

CREATE POLICY "Tracked keywords: users can insert for their brands" 
ON public.seo_tracked_keywords 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND 
  (
    -- User owns the brand directly
    EXISTS (
      SELECT 1 FROM public.brands 
      WHERE id = brand_id AND user_id = auth.uid()
    ) 
    OR 
    -- User is a workspace member with access to the brand
    EXISTS (
      SELECT 1 FROM public.brands b
      JOIN public.workspace_members wm ON b.workspace_id = wm.workspace_id
      WHERE b.id = brand_id 
        AND wm.user_id = auth.uid() 
        AND wm.status = 'active'
    )
  )
);