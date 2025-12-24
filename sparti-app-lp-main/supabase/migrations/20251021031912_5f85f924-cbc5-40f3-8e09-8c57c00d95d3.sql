-- Create quick_setup_sessions table for tracking Quick Setup progress
CREATE TABLE IF NOT EXISTS public.quick_setup_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  website_url TEXT NOT NULL,
  country TEXT,
  language TEXT,
  ai_questions_answers JSONB DEFAULT '[]'::jsonb,
  keywords TEXT[] DEFAULT '{}'::text[],
  longtail_keywords JSONB DEFAULT '[]'::jsonb,
  sources JSONB DEFAULT '[]'::jsonb,
  competitors JSONB DEFAULT '[]'::jsonb,
  selected_topics JSONB DEFAULT '[]'::jsonb,
  backlink_strategy JSONB DEFAULT '{}'::jsonb,
  generation_config JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  current_step INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quick_setup_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own sessions" ON public.quick_setup_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON public.quick_setup_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON public.quick_setup_sessions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions" ON public.quick_setup_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX idx_quick_setup_sessions_user_id ON public.quick_setup_sessions(user_id);
CREATE INDEX idx_quick_setup_sessions_brand_id ON public.quick_setup_sessions(brand_id);
CREATE INDEX idx_quick_setup_sessions_status ON public.quick_setup_sessions(status);