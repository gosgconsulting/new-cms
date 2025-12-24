ALTER TABLE public.campaign_shares
ADD COLUMN campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_campaign_shares_campaign_id ON public.campaign_shares(campaign_id);
