-- Create form_submissions table for storing contact form data
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id TEXT NOT NULL,
  form_name TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON public.form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_submitted_at ON public.form_submissions(submitted_at DESC);

-- Enable RLS
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert submissions
CREATE POLICY "Anyone can submit forms"
ON public.form_submissions
FOR INSERT
WITH CHECK (true);

-- Allow authenticated users to view submissions
CREATE POLICY "Authenticated users can view submissions"
ON public.form_submissions
FOR SELECT
USING (auth.uid() IS NOT NULL);