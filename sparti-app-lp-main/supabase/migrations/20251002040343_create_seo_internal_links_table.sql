-- Create seo_internal_links table
CREATE TABLE IF NOT EXISTS public.seo_internal_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    type TEXT NOT NULL DEFAULT 'Internal' CHECK (type IN ('Internal', 'External')),
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seo_internal_links_brand_id ON public.seo_internal_links(brand_id);
CREATE INDEX IF NOT EXISTS idx_seo_internal_links_user_id ON public.seo_internal_links(user_id);
CREATE INDEX IF NOT EXISTS idx_seo_internal_links_type ON public.seo_internal_links(type);
CREATE INDEX IF NOT EXISTS idx_seo_internal_links_url ON public.seo_internal_links(url);

-- Enable Row Level Security
ALTER TABLE public.seo_internal_links ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own seo_internal_links" ON public.seo_internal_links
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own seo_internal_links" ON public.seo_internal_links
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own seo_internal_links" ON public.seo_internal_links
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own seo_internal_links" ON public.seo_internal_links
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_seo_internal_links_updated_at
    BEFORE UPDATE ON public.seo_internal_links
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.seo_internal_links IS 'Stores internal and external links for SEO purposes';
COMMENT ON COLUMN public.seo_internal_links.url IS 'The URL of the link';
COMMENT ON COLUMN public.seo_internal_links.title IS 'Optional title for the link';
COMMENT ON COLUMN public.seo_internal_links.description IS 'Optional description for the link';
COMMENT ON COLUMN public.seo_internal_links.type IS 'Type of link: Internal or External';
COMMENT ON COLUMN public.seo_internal_links.brand_id IS 'Associated brand ID';
COMMENT ON COLUMN public.seo_internal_links.user_id IS 'User who created the link';
