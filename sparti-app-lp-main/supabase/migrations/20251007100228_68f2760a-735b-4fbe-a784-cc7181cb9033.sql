-- Create backlink topic generation history table
CREATE TABLE IF NOT EXISTS public.backlink_topic_generation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
  internal_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  location TEXT,
  language TEXT DEFAULT 'en',
  topics_number INTEGER NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create suggested backlink topics table
CREATE TABLE IF NOT EXISTS public.backlink_suggested_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id UUID NOT NULL REFERENCES public.backlink_topic_generation(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  keywords TEXT[] DEFAULT '{}',
  keyword_focus TEXT,
  suggested_internal_link_id UUID,
  search_intent TEXT,
  is_selected BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create selected backlink topics table
CREATE TABLE IF NOT EXISTS public.backlink_selected_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  suggested_topic_id UUID REFERENCES public.backlink_suggested_topics(id) ON DELETE CASCADE,
  assigned_internal_link_id UUID,
  title TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  keyword_focus TEXT,
  status TEXT NOT NULL DEFAULT 'selected' CHECK (status IN ('selected', 'in_progress', 'completed')),
  blog_post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_backlink_topic_generation_user_id ON public.backlink_topic_generation(user_id);
CREATE INDEX IF NOT EXISTS idx_backlink_topic_generation_brand_id ON public.backlink_topic_generation(brand_id);
CREATE INDEX IF NOT EXISTS idx_backlink_suggested_topics_generation_id ON public.backlink_suggested_topics(generation_id);
CREATE INDEX IF NOT EXISTS idx_backlink_selected_topics_user_id ON public.backlink_selected_topics(user_id);
CREATE INDEX IF NOT EXISTS idx_backlink_selected_topics_brand_id ON public.backlink_selected_topics(brand_id);

-- Enable Row Level Security
ALTER TABLE public.backlink_topic_generation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlink_suggested_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backlink_selected_topics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for backlink_topic_generation
CREATE POLICY "Users can view their own topic generations"
  ON public.backlink_topic_generation FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own topic generations"
  ON public.backlink_topic_generation FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own topic generations"
  ON public.backlink_topic_generation FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for backlink_suggested_topics
CREATE POLICY "Users can view suggested topics for their generations"
  ON public.backlink_suggested_topics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.backlink_topic_generation
      WHERE id = backlink_suggested_topics.generation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert suggested topics"
  ON public.backlink_suggested_topics FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update suggested topics for their generations"
  ON public.backlink_suggested_topics FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.backlink_topic_generation
      WHERE id = backlink_suggested_topics.generation_id
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for backlink_selected_topics
CREATE POLICY "Users can view their own selected topics"
  ON public.backlink_selected_topics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own selected topics"
  ON public.backlink_selected_topics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own selected topics"
  ON public.backlink_selected_topics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own selected topics"
  ON public.backlink_selected_topics FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_backlink_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_backlink_topic_generation_updated_at
  BEFORE UPDATE ON public.backlink_topic_generation
  FOR EACH ROW
  EXECUTE FUNCTION update_backlink_updated_at();

CREATE TRIGGER update_backlink_suggested_topics_updated_at
  BEFORE UPDATE ON public.backlink_suggested_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_backlink_updated_at();

CREATE TRIGGER update_backlink_selected_topics_updated_at
  BEFORE UPDATE ON public.backlink_selected_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_backlink_updated_at();