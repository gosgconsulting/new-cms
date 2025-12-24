-- Fix lobstr_runs table by adding missing fields
ALTER TABLE public.lobstr_runs 
ADD COLUMN IF NOT EXISTS results_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS results_saved_count INTEGER DEFAULT 0;

-- Add unique constraint for ON CONFLICT operations (drop first if exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'lobstr_runs_user_id_squid_id_unique'
    ) THEN
        ALTER TABLE public.lobstr_runs 
        ADD CONSTRAINT lobstr_runs_user_id_squid_id_unique 
        UNIQUE (user_id, squid_id);
    END IF;
END $$;

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

-- Add missing fields to business_leads table if they don't exist
ALTER TABLE public.business_leads 
ADD COLUMN IF NOT EXISTS lobstr_run_id UUID,
ADD COLUMN IF NOT EXISTS scraped_sequence INTEGER DEFAULT 0;