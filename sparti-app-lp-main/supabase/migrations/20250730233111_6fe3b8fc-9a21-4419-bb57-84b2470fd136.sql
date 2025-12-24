-- Add missing foreign key constraints and indexes for seo_campaigns table if not exists
DO $$ 
BEGIN
    -- Add foreign key constraints if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'seo_campaigns_user_id_fkey' 
        AND table_name = 'seo_campaigns'
    ) THEN
        ALTER TABLE public.seo_campaigns 
        ADD CONSTRAINT seo_campaigns_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'seo_campaigns_brand_id_fkey' 
        AND table_name = 'seo_campaigns'
    ) THEN
        ALTER TABLE public.seo_campaigns 
        ADD CONSTRAINT seo_campaigns_brand_id_fkey 
        FOREIGN KEY (brand_id) REFERENCES public.brands(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add indexes for performance if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_seo_campaigns_user_id') THEN
        CREATE INDEX idx_seo_campaigns_user_id ON public.seo_campaigns(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_seo_campaigns_brand_id') THEN
        CREATE INDEX idx_seo_campaigns_brand_id ON public.seo_campaigns(brand_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_seo_campaigns_status') THEN
        CREATE INDEX idx_seo_campaigns_status ON public.seo_campaigns(status);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_seo_campaigns_created_at') THEN
        CREATE INDEX idx_seo_campaigns_created_at ON public.seo_campaigns(created_at DESC);
    END IF;
END $$;