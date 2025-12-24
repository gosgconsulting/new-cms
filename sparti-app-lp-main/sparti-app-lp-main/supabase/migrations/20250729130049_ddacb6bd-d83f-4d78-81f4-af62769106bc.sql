-- Add foreign key constraint for lobstr_run_id (if not exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'business_leads_lobstr_run_id_fkey'
    ) THEN
        ALTER TABLE public.business_leads 
        ADD CONSTRAINT business_leads_lobstr_run_id_fkey 
        FOREIGN KEY (lobstr_run_id) REFERENCES public.lobstr_runs(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_interactions_user_id ON public.contact_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_interactions_lead_id ON public.contact_interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_reminders_user_id ON public.follow_up_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_reminders_reminder_date ON public.follow_up_reminders(reminder_date);
CREATE INDEX IF NOT EXISTS idx_business_leads_lobstr_run_id ON public.business_leads(lobstr_run_id);

-- Create trigger functions with proper search path
CREATE OR REPLACE FUNCTION public.update_contact_interaction_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_follow_up_reminder_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

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