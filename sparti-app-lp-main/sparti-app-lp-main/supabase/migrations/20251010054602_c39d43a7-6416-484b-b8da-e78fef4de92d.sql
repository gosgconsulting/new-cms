-- Create table to store analyzed source content
CREATE TABLE public.analyzed_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  content TEXT,
  analysis JSONB DEFAULT '{}'::jsonb,
  source_type TEXT NOT NULL CHECK (source_type IN ('topic', 'link', 'other')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analyzed_sources ENABLE ROW LEVEL SECURITY;

-- Policies for analyzed_sources
CREATE POLICY "Users can view their own analyzed sources"
  ON public.analyzed_sources FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyzed sources"
  ON public.analyzed_sources FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyzed sources"
  ON public.analyzed_sources FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyzed sources"
  ON public.analyzed_sources FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for faster queries
CREATE INDEX idx_analyzed_sources_user_id ON public.analyzed_sources(user_id);
CREATE INDEX idx_analyzed_sources_brand_id ON public.analyzed_sources(brand_id);
CREATE INDEX idx_analyzed_sources_url ON public.analyzed_sources(url);

-- Add trigger for updated_at
CREATE TRIGGER update_analyzed_sources_updated_at
  BEFORE UPDATE ON public.analyzed_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();