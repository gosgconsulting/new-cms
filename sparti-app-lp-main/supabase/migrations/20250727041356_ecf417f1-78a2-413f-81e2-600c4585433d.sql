-- First, let's add missing columns to the existing place_feedback table
ALTER TABLE public.place_feedback 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5),
ADD COLUMN IF NOT EXISTS experience_text TEXT,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected', 'approved'));

-- Create an index for better performance on user queries
CREATE INDEX IF NOT EXISTS idx_place_feedback_user_id ON public.place_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_place_feedback_place_id ON public.place_feedback(place_id);
CREATE INDEX IF NOT EXISTS idx_place_feedback_rating ON public.place_feedback(rating);

-- Create a profiles table for authenticated users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Update place_feedback policies to handle authenticated users
DROP POLICY IF EXISTS "Anyone can submit place feedback" ON public.place_feedback;
DROP POLICY IF EXISTS "Anyone can view place feedback" ON public.place_feedback;
DROP POLICY IF EXISTS "Users can submit place feedback" ON public.place_feedback;

-- Create new policies that work for both authenticated and anonymous users
CREATE POLICY "Users can submit place feedback" 
ON public.place_feedback 
FOR INSERT 
WITH CHECK (
  -- Allow if user is authenticated and user_id matches auth.uid()
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  -- Allow if user is not authenticated (anonymous feedback with IP)
  (auth.uid() IS NULL AND user_id IS NULL AND user_ip IS NOT NULL)
);

CREATE POLICY "Anyone can view place feedback" 
ON public.place_feedback 
FOR SELECT 
USING (true);

-- Create a function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Create trigger for automatic timestamp updates on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Drop existing function to change its return type
DROP FUNCTION IF EXISTS public.get_place_feedback_summary(text);

-- Create updated feedback summary function to include rating data
CREATE OR REPLACE FUNCTION public.get_place_feedback_summary(place_id_param text)
RETURNS TABLE(
  pet_friendly_count bigint, 
  not_pet_friendly_count bigint, 
  total_votes bigint,
  average_rating numeric,
  rating_count bigint
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    COUNT(*) FILTER (WHERE is_pet_friendly = true) as pet_friendly_count,
    COUNT(*) FILTER (WHERE is_pet_friendly = false) as not_pet_friendly_count,
    COUNT(*) as total_votes,
    ROUND(AVG(rating), 1) as average_rating,
    COUNT(*) FILTER (WHERE rating IS NOT NULL) as rating_count
  FROM public.place_feedback 
  WHERE place_id = place_id_param;
$$;

-- Create function to get detailed feedback for a place
CREATE OR REPLACE FUNCTION public.get_place_feedback_details(place_id_param text)
RETURNS TABLE(
  id uuid,
  is_pet_friendly boolean,
  rating integer,
  experience_text text,
  created_at timestamp with time zone,
  user_display_name text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    pf.id,
    pf.is_pet_friendly,
    pf.rating,
    pf.experience_text,
    pf.created_at,
    COALESCE(p.display_name, 'Anonymous') as user_display_name
  FROM public.place_feedback pf
  LEFT JOIN public.profiles p ON pf.user_id = p.id
  WHERE pf.place_id = place_id_param
  ORDER BY pf.created_at DESC;
$$;