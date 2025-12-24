-- Create API logs table for monitoring and analytics
CREATE TABLE IF NOT EXISTS public.api_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id TEXT NOT NULL,
  request_type TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_api_logs_timestamp ON public.api_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_client_id ON public.api_logs(client_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_success ON public.api_logs(success);

-- Enable RLS for security
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for service role only (admin access)
CREATE POLICY "Service role can manage api_logs" ON public.api_logs
FOR ALL USING (auth.role() = 'service_role');

-- Create function to clean old logs (keep last 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_api_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.api_logs 
  WHERE timestamp < now() - interval '30 days';
END;
$$;

-- Create user sessions table for better rate limiting
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user sessions
CREATE POLICY "Users can view their own sessions" ON public.user_sessions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage sessions" ON public.user_sessions
FOR ALL USING (auth.role() = 'service_role');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_session_id ON public.user_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON public.user_sessions(last_activity DESC);