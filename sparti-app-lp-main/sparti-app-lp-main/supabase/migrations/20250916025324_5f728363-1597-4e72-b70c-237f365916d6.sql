-- Create tracked_keywords table for storing saved keywords
CREATE TABLE public.tracked_keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  brand_id UUID,
  keyword TEXT NOT NULL,
  position INTEGER,
  url TEXT,
  search_volume INTEGER,
  difficulty INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tracked_keywords ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own tracked keywords" 
ON public.tracked_keywords 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tracked keywords" 
ON public.tracked_keywords 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracked keywords" 
ON public.tracked_keywords 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracked keywords" 
ON public.tracked_keywords 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_tracked_keywords_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_tracked_keywords_updated_at
BEFORE UPDATE ON public.tracked_keywords
FOR EACH ROW
EXECUTE FUNCTION public.update_tracked_keywords_updated_at();