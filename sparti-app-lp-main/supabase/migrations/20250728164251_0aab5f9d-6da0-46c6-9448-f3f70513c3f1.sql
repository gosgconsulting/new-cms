-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Update business_leads table to include user_id and run tracking (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'business_leads') THEN
        ALTER TABLE public.business_leads 
        ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
        ADD COLUMN IF NOT EXISTS lobstr_run_id UUID,
        ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS scraped_sequence INTEGER;
    END IF;
END $$;

-- Update business_leads RLS policies to be user-specific (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'business_leads') THEN
        DROP POLICY IF EXISTS "Anyone can view business leads" ON public.business_leads;
        DROP POLICY IF EXISTS "Service role can insert business leads" ON public.business_leads;

        CREATE POLICY "Users can view their own leads" 
        ON public.business_leads 
        FOR SELECT 
        USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

        CREATE POLICY "Users can insert their own leads" 
        ON public.business_leads 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own leads" 
        ON public.business_leads 
        FOR UPDATE 
        USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

        CREATE POLICY "Service role can manage all leads" 
        ON public.business_leads 
        FOR ALL 
        USING (current_setting('role') = 'service_role')
        WITH CHECK (current_setting('role') = 'service_role');
    END IF;
END $$;

-- Update lobstr_runs to include user tracking (if table exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'lobstr_runs') THEN
        ALTER TABLE public.lobstr_runs 
        ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
        ADD COLUMN IF NOT EXISTS results_saved_count INTEGER DEFAULT 0;

        -- Update lobstr_runs RLS policies
        DROP POLICY IF EXISTS "Anyone can view lobstr runs" ON public.lobstr_runs;
        DROP POLICY IF EXISTS "Service role can manage lobstr runs" ON public.lobstr_runs;

        CREATE POLICY "Users can view their own runs" 
        ON public.lobstr_runs 
        FOR SELECT 
        USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

        CREATE POLICY "Service role can manage all runs" 
        ON public.lobstr_runs 
        FOR ALL 
        USING (current_setting('role') = 'service_role')
        WITH CHECK (current_setting('role') = 'service_role');
    END IF;
END $$;

-- Create function to get current user ID for edge functions
CREATE OR REPLACE FUNCTION public.get_user_id_from_jwt()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
BEGIN
    SELECT auth.uid() INTO user_id;
    RETURN user_id;
END;
$$;