-- Update activity field to use category when activity is null (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'business_leads') THEN
        -- Update activity field to use category when activity is null
        UPDATE business_leads 
        SET activity = category 
        WHERE activity IS NULL AND category IS NOT NULL;

        -- Update activity to use search_query when both activity and category are null
        UPDATE business_leads 
        SET activity = CASE 
          WHEN search_query = '' OR search_query IS NULL THEN 'Unknown Business'
          ELSE search_query
        END
        WHERE activity IS NULL;
    END IF;
END $$;