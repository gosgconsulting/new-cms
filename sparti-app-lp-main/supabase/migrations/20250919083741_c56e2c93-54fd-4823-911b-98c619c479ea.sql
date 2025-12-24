-- Create table for topic research history
CREATE TABLE public.topic_research_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_id UUID NOT NULL,
  keywords TEXT[] NOT NULL,
  location TEXT NOT NULL,
  language TEXT NOT NULL,
  topics_number INTEGER NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for suggested topics from research
CREATE TABLE public.suggested_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  research_id UUID NOT NULL REFERENCES public.topic_research_history(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  keyword_focus TEXT,
  source TEXT,
  intent TEXT,
  is_selected BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for selected topics (separate from blog_posts)
CREATE TABLE public.selected_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_id UUID NOT NULL,
  suggested_topic_id UUID REFERENCES public.suggested_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  keywords TEXT[] NOT NULL,
  keyword_focus TEXT,
  intent TEXT,
  status TEXT NOT NULL DEFAULT 'selected',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.topic_research_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggested_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.selected_topics ENABLE ROW LEVEL SECURITY;

-- RLS policies for topic_research_history
CREATE POLICY "Users can manage their own research history" 
ON public.topic_research_history 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS policies for suggested_topics
CREATE POLICY "Users can view suggested topics from their research" 
ON public.suggested_topics 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.topic_research_history trh 
  WHERE trh.id = suggested_topics.research_id 
  AND trh.user_id = auth.uid()
));

CREATE POLICY "Users can update their suggested topics" 
ON public.suggested_topics 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.topic_research_history trh 
  WHERE trh.id = suggested_topics.research_id 
  AND trh.user_id = auth.uid()
));

CREATE POLICY "Users can delete their suggested topics" 
ON public.suggested_topics 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.topic_research_history trh 
  WHERE trh.id = suggested_topics.research_id 
  AND trh.user_id = auth.uid()
));

-- RLS policies for selected_topics
CREATE POLICY "Users can manage their own selected topics" 
ON public.selected_topics 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION public.update_research_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_suggested_topics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_selected_topics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_topic_research_history_updated_at
BEFORE UPDATE ON public.topic_research_history
FOR EACH ROW
EXECUTE FUNCTION public.update_research_history_updated_at();

CREATE TRIGGER update_suggested_topics_updated_at
BEFORE UPDATE ON public.suggested_topics
FOR EACH ROW
EXECUTE FUNCTION public.update_suggested_topics_updated_at();

CREATE TRIGGER update_selected_topics_updated_at
BEFORE UPDATE ON public.selected_topics
FOR EACH ROW
EXECUTE FUNCTION public.update_selected_topics_updated_at();