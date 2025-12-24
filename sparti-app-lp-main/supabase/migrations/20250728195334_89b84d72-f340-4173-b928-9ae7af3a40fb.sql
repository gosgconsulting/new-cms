-- Add policy to allow users to view leads with null user_id (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'business_leads') THEN
        -- Add policy to allow users to view leads with null user_id (public leads)
        DROP POLICY IF EXISTS "Anyone can view public leads" ON business_leads;
        CREATE POLICY "Anyone can view public leads" 
        ON business_leads 
        FOR SELECT 
        USING (user_id IS NULL);

        -- Update existing policy name for clarity
        DROP POLICY IF EXISTS "Users can view their own leads" ON business_leads;
        CREATE POLICY "Users can view their own assigned leads" 
        ON business_leads 
        FOR SELECT 
        USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
    END IF;
END $$;