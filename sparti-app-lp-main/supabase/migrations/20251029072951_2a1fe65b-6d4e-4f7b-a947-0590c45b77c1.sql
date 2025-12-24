-- Create asset_campaigns table
CREATE TABLE IF NOT EXISTS public.asset_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  campaign_name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  brand_analysis JSONB DEFAULT '{}'::jsonb,
  asset_objective JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  language TEXT DEFAULT 'en',
  total_assets INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create asset_campaign_hooks table
CREATE TABLE IF NOT EXISTS public.asset_campaign_hooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.asset_campaigns(id) ON DELETE CASCADE,
  hook_text TEXT NOT NULL,
  hook_description TEXT,
  is_selected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create asset_campaign_formats table
CREATE TABLE IF NOT EXISTS public.asset_campaign_formats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.asset_campaigns(id) ON DELETE CASCADE,
  format_name TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  aspect_ratio TEXT NOT NULL,
  platform TEXT NOT NULL,
  is_selected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create asset_campaign_assets table
CREATE TABLE IF NOT EXISTS public.asset_campaign_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.asset_campaigns(id) ON DELETE CASCADE,
  hook_id UUID REFERENCES public.asset_campaign_hooks(id) ON DELETE SET NULL,
  format_id UUID REFERENCES public.asset_campaign_formats(id) ON DELETE SET NULL,
  asset_url TEXT,
  asset_type TEXT DEFAULT 'image',
  headline TEXT,
  body_text TEXT,
  cta_text TEXT,
  generation_prompt TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.asset_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_campaign_hooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_campaign_formats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_campaign_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for asset_campaigns
CREATE POLICY "Users can view their own campaigns"
  ON public.asset_campaigns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns"
  ON public.asset_campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
  ON public.asset_campaigns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
  ON public.asset_campaigns FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for asset_campaign_hooks
CREATE POLICY "Users can view hooks for their campaigns"
  ON public.asset_campaign_hooks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.asset_campaigns
      WHERE id = asset_campaign_hooks.campaign_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create hooks for their campaigns"
  ON public.asset_campaign_hooks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.asset_campaigns
      WHERE id = asset_campaign_hooks.campaign_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update hooks for their campaigns"
  ON public.asset_campaign_hooks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.asset_campaigns
      WHERE id = asset_campaign_hooks.campaign_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete hooks for their campaigns"
  ON public.asset_campaign_hooks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.asset_campaigns
      WHERE id = asset_campaign_hooks.campaign_id
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for asset_campaign_formats
CREATE POLICY "Users can view formats for their campaigns"
  ON public.asset_campaign_formats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.asset_campaigns
      WHERE id = asset_campaign_formats.campaign_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create formats for their campaigns"
  ON public.asset_campaign_formats FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.asset_campaigns
      WHERE id = asset_campaign_formats.campaign_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update formats for their campaigns"
  ON public.asset_campaign_formats FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.asset_campaigns
      WHERE id = asset_campaign_formats.campaign_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete formats for their campaigns"
  ON public.asset_campaign_formats FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.asset_campaigns
      WHERE id = asset_campaign_formats.campaign_id
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for asset_campaign_assets
CREATE POLICY "Users can view assets for their campaigns"
  ON public.asset_campaign_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.asset_campaigns
      WHERE id = asset_campaign_assets.campaign_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create assets for their campaigns"
  ON public.asset_campaign_assets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.asset_campaigns
      WHERE id = asset_campaign_assets.campaign_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update assets for their campaigns"
  ON public.asset_campaign_assets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.asset_campaigns
      WHERE id = asset_campaign_assets.campaign_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete assets for their campaigns"
  ON public.asset_campaign_assets FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.asset_campaigns
      WHERE id = asset_campaign_assets.campaign_id
      AND user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_asset_campaigns_user_id ON public.asset_campaigns(user_id);
CREATE INDEX idx_asset_campaigns_brand_id ON public.asset_campaigns(brand_id);
CREATE INDEX idx_asset_campaigns_status ON public.asset_campaigns(status);
CREATE INDEX idx_asset_campaign_hooks_campaign_id ON public.asset_campaign_hooks(campaign_id);
CREATE INDEX idx_asset_campaign_formats_campaign_id ON public.asset_campaign_formats(campaign_id);
CREATE INDEX idx_asset_campaign_assets_campaign_id ON public.asset_campaign_assets(campaign_id);
CREATE INDEX idx_asset_campaign_assets_status ON public.asset_campaign_assets(status);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_asset_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_asset_campaigns_updated_at
  BEFORE UPDATE ON public.asset_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_asset_campaigns_updated_at();

CREATE TRIGGER update_asset_campaign_assets_updated_at
  BEFORE UPDATE ON public.asset_campaign_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_asset_campaigns_updated_at();