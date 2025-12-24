-- Create business_leads table
CREATE TABLE public.business_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT,
  name TEXT NOT NULL,
  category TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  rating NUMERIC,
  reviews_count INTEGER,
  price_level INTEGER,
  social_media JSONB,
  contact_info JSONB,
  business_status TEXT,
  lead_score NUMERIC,
  latitude NUMERIC,
  longitude NUMERIC,
  digital_presence JSONB,
  business_size TEXT,
  website_technology TEXT[],
  ai_qualification JSONB,
  ai_scoring JSONB,
  notes TEXT,
  interaction_status TEXT NOT NULL DEFAULT 'new',
  last_contact_date TIMESTAMP WITH TIME ZONE,
  user_id UUID NOT NULL,
  search_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact_interactions table
CREATE TABLE public.contact_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.business_leads(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL,
  interaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  contact_method TEXT,
  interaction_notes TEXT,
  outcome TEXT,
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create follow_up_reminders table
CREATE TABLE public.follow_up_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID REFERENCES public.business_leads(id) ON DELETE CASCADE,
  reminder_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reminder_type TEXT NOT NULL,
  message TEXT,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_up_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_leads
CREATE POLICY "Users can view their own business leads" ON public.business_leads
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own business leads" ON public.business_leads
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business leads" ON public.business_leads
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business leads" ON public.business_leads
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for contact_interactions
CREATE POLICY "Users can view their own contact interactions" ON public.contact_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contact interactions" ON public.contact_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contact interactions" ON public.contact_interactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contact interactions" ON public.contact_interactions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for follow_up_reminders
CREATE POLICY "Users can view their own follow up reminders" ON public.follow_up_reminders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own follow up reminders" ON public.follow_up_reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own follow up reminders" ON public.follow_up_reminders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own follow up reminders" ON public.follow_up_reminders
  FOR DELETE USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_business_leads_updated_at
  BEFORE UPDATE ON public.business_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contact_interactions_updated_at
  BEFORE UPDATE ON public.contact_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_follow_up_reminders_updated_at
  BEFORE UPDATE ON public.follow_up_reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();