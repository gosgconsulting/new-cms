-- Create SEM campaigns table
CREATE TABLE IF NOT EXISTS public.sem_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  landing_page_urls TEXT[] NOT NULL DEFAULT '{}',
  objectives TEXT,
  location TEXT NOT NULL,
  language TEXT NOT NULL,
  ad_groups JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'paused', 'draft')),
  budget DECIMAL(10,2) DEFAULT 0,
  spend DECIMAL(10,2) DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr DECIMAL(5,2) DEFAULT 0,
  cpc DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.sem_campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own SEM campaigns"
ON public.sem_campaigns
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own SEM campaigns"
ON public.sem_campaigns
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own SEM campaigns"
ON public.sem_campaigns
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own SEM campaigns"
ON public.sem_campaigns
FOR DELETE
USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER update_sem_campaigns_updated_at
BEFORE UPDATE ON public.sem_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_sem_campaigns_brand_user ON public.sem_campaigns(brand_id, user_id);
CREATE INDEX idx_sem_campaigns_created_at ON public.sem_campaigns(created_at DESC);