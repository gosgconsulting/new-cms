-- Create hotel_campaigns table
CREATE TABLE IF NOT EXISTS public.hotel_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_id UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  hotel_name TEXT,
  location TEXT,
  check_in_date DATE,
  check_out_date DATE,
  currency_code TEXT DEFAULT 'USD',
  radius_km INTEGER DEFAULT 10,
  max_results INTEGER DEFAULT 20,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hotel_campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own hotel campaigns" 
ON public.hotel_campaigns 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own hotel campaigns" 
ON public.hotel_campaigns 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hotel campaigns" 
ON public.hotel_campaigns 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hotel campaigns" 
ON public.hotel_campaigns 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_hotel_campaigns_updated_at
BEFORE UPDATE ON public.hotel_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create hotel_search_results table
CREATE TABLE IF NOT EXISTS public.hotel_search_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES public.hotel_campaigns(id) ON DELETE CASCADE,
  hotel_name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT,
  latitude DECIMAL,
  longitude DECIMAL,
  place_id TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  star_rating INTEGER,
  rating DECIMAL,
  reviews_count INTEGER,
  price_per_night JSONB,
  amenities TEXT[],
  images TEXT[],
  booking_links JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hotel_search_results ENABLE ROW LEVEL SECURITY;

-- Create policies for hotel search results
CREATE POLICY "Users can view hotel search results for their campaigns" 
ON public.hotel_search_results 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.hotel_campaigns 
    WHERE hotel_campaigns.id = hotel_search_results.campaign_id 
    AND hotel_campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create hotel search results for their campaigns" 
ON public.hotel_search_results 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.hotel_campaigns 
    WHERE hotel_campaigns.id = hotel_search_results.campaign_id 
    AND hotel_campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete hotel search results for their campaigns" 
ON public.hotel_search_results 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.hotel_campaigns 
    WHERE hotel_campaigns.id = hotel_search_results.campaign_id 
    AND hotel_campaigns.user_id = auth.uid()
  )
);

-- Create indexes for better performance
CREATE INDEX idx_hotel_campaigns_user_id ON public.hotel_campaigns(user_id);
CREATE INDEX idx_hotel_campaigns_brand_id ON public.hotel_campaigns(brand_id);
CREATE INDEX idx_hotel_search_results_campaign_id ON public.hotel_search_results(campaign_id);