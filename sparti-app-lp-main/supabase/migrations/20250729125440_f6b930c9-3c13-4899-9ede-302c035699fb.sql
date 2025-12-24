-- Fix lobstr_runs table constraints and add missing fields
ALTER TABLE public.lobstr_runs 
ADD COLUMN IF NOT EXISTS results_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS results_saved_count INTEGER DEFAULT 0;

-- Add unique constraint for ON CONFLICT operations
ALTER TABLE public.lobstr_runs 
ADD CONSTRAINT IF NOT EXISTS lobstr_runs_user_id_squid_id_unique 
UNIQUE (user_id, squid_id);

-- Create contact_interactions table
CREATE TABLE IF NOT EXISTS public.contact_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID,
  interaction_type TEXT NOT NULL,
  outcome TEXT,
  interaction_notes TEXT,
  contact_method TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  follow_up_required BOOLEAN DEFAULT false,
  interaction_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on contact_interactions
ALTER TABLE public.contact_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for contact_interactions
CREATE POLICY "Users can create their own contact interactions" 
ON public.contact_interactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own contact interactions" 
ON public.contact_interactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own contact interactions" 
ON public.contact_interactions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contact interactions" 
ON public.contact_interactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create follow_up_reminders table
CREATE TABLE IF NOT EXISTS public.follow_up_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reminder_type TEXT NOT NULL,
  message TEXT,
  lead_id UUID,
  reminder_date TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS on follow_up_reminders
ALTER TABLE public.follow_up_reminders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for follow_up_reminders
CREATE POLICY "Users can create their own follow up reminders" 
ON public.follow_up_reminders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own follow up reminders" 
ON public.follow_up_reminders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own follow up reminders" 
ON public.follow_up_reminders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own follow up reminders" 
ON public.follow_up_reminders 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add missing fields to business_leads table if they don't exist
ALTER TABLE public.business_leads 
ADD COLUMN IF NOT EXISTS lobstr_run_id UUID REFERENCES public.lobstr_runs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS scraped_sequence INTEGER DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_interactions_user_id ON public.contact_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_interactions_lead_id ON public.contact_interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_reminders_user_id ON public.follow_up_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_reminders_reminder_date ON public.follow_up_reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_business_leads_lobstr_run_id ON public.business_leads(lobstr_run_id);

-- Create trigger for updating timestamps
CREATE OR REPLACE FUNCTION public.update_contact_interaction_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_follow_up_reminder_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_contact_interactions_updated_at ON public.contact_interactions;
CREATE TRIGGER update_contact_interactions_updated_at
  BEFORE UPDATE ON public.contact_interactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contact_interaction_updated_at();

DROP TRIGGER IF EXISTS update_follow_up_reminders_updated_at ON public.follow_up_reminders;
CREATE TRIGGER update_follow_up_reminders_updated_at
  BEFORE UPDATE ON public.follow_up_reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_follow_up_reminder_updated_at();