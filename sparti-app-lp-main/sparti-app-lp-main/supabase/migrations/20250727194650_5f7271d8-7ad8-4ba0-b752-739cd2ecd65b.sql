-- Lead Contact Management Tables

-- Contact interactions table
CREATE TABLE public.contact_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL,
  campaign_id UUID,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('call', 'email', 'meeting', 'demo', 'proposal', 'follow_up', 'note')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'rescheduled')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  outcome TEXT,
  notes TEXT,
  next_action TEXT,
  follow_up_date TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can create interactions" 
ON public.contact_interactions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view interactions" 
ON public.contact_interactions 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update interactions" 
ON public.contact_interactions 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete interactions" 
ON public.contact_interactions 
FOR DELETE 
USING (true);

-- Follow-up reminders table
CREATE TABLE public.follow_up_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL,
  campaign_id UUID,
  interaction_id UUID,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('call', 'email', 'meeting', 'proposal_follow_up', 'check_in')),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'snoozed', 'cancelled')),
  completed_at TIMESTAMP WITH TIME ZONE,
  snooze_until TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.follow_up_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can create reminders" 
ON public.follow_up_reminders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view reminders" 
ON public.follow_up_reminders 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can update reminders" 
ON public.follow_up_reminders 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete reminders" 
ON public.follow_up_reminders 
FOR DELETE 
USING (true);

-- Lead progression history table
CREATE TABLE public.lead_progression_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL,
  campaign_id UUID,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID,
  reason TEXT,
  notes TEXT,
  probability_score INTEGER CHECK (probability_score >= 0 AND probability_score <= 100),
  estimated_value NUMERIC,
  expected_close_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lead_progression_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can create progression history" 
ON public.lead_progression_history 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can view progression history" 
ON public.lead_progression_history 
FOR SELECT 
USING (true);

-- Add foreign key constraints
ALTER TABLE public.contact_interactions 
ADD CONSTRAINT fk_contact_interactions_lead 
FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;

ALTER TABLE public.contact_interactions 
ADD CONSTRAINT fk_contact_interactions_campaign 
FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE SET NULL;

ALTER TABLE public.follow_up_reminders 
ADD CONSTRAINT fk_follow_up_reminders_lead 
FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;

ALTER TABLE public.follow_up_reminders 
ADD CONSTRAINT fk_follow_up_reminders_campaign 
FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE SET NULL;

ALTER TABLE public.follow_up_reminders 
ADD CONSTRAINT fk_follow_up_reminders_interaction 
FOREIGN KEY (interaction_id) REFERENCES public.contact_interactions(id) ON DELETE SET NULL;

ALTER TABLE public.lead_progression_history 
ADD CONSTRAINT fk_lead_progression_history_lead 
FOREIGN KEY (lead_id) REFERENCES public.leads(id) ON DELETE CASCADE;

ALTER TABLE public.lead_progression_history 
ADD CONSTRAINT fk_lead_progression_history_campaign 
FOREIGN KEY (campaign_id) REFERENCES public.campaigns(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_contact_interactions_lead_id ON public.contact_interactions(lead_id);
CREATE INDEX idx_contact_interactions_campaign_id ON public.contact_interactions(campaign_id);
CREATE INDEX idx_contact_interactions_scheduled_at ON public.contact_interactions(scheduled_at);
CREATE INDEX idx_contact_interactions_status ON public.contact_interactions(status);

CREATE INDEX idx_follow_up_reminders_lead_id ON public.follow_up_reminders(lead_id);
CREATE INDEX idx_follow_up_reminders_scheduled_for ON public.follow_up_reminders(scheduled_for);
CREATE INDEX idx_follow_up_reminders_status ON public.follow_up_reminders(status);

CREATE INDEX idx_lead_progression_history_lead_id ON public.lead_progression_history(lead_id);
CREATE INDEX idx_lead_progression_history_created_at ON public.lead_progression_history(created_at);

-- Add update triggers
CREATE TRIGGER update_contact_interactions_updated_at
BEFORE UPDATE ON public.contact_interactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_follow_up_reminders_updated_at
BEFORE UPDATE ON public.follow_up_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update existing leads table to add contact management fields
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_contacted_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS next_follow_up_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS contact_attempts INTEGER DEFAULT 0;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS lead_temperature TEXT CHECK (lead_temperature IN ('cold', 'warm', 'hot', 'qualified')) DEFAULT 'cold';
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS probability_score INTEGER CHECK (probability_score >= 0 AND probability_score <= 100);
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS estimated_value NUMERIC;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS expected_close_date DATE;