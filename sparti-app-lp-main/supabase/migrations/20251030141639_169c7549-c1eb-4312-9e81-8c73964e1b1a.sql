-- Create hotels table for Google Hotels scraping results
CREATE TABLE IF NOT EXISTS public.google_hotels_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.scraping_runs(id) ON DELETE CASCADE,
  
  -- Basic hotel information
  hotel_name TEXT NOT NULL,
  address TEXT,
  city TEXT,
  country TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  place_id TEXT,
  
  -- Contact information
  phone TEXT,
  email TEXT,
  website TEXT,
  
  -- Hotel details
  star_rating NUMERIC,
  rating NUMERIC,
  reviews_count INTEGER,
  hotel_class TEXT,
  property_type TEXT, -- hotel, resort, hostel, etc.
  
  -- Pricing information
  price_per_night JSONB, -- { amount: number, currency: string, date: string }
  price_range TEXT, -- $, $$, $$$, $$$$
  
  -- Amenities
  amenities JSONB DEFAULT '[]'::jsonb, -- ["wifi", "pool", "parking", etc.]
  room_amenities JSONB DEFAULT '[]'::jsonb,
  
  -- Room information
  rooms JSONB DEFAULT '[]'::jsonb, -- [{ name, type, beds, capacity, price, amenities }]
  
  -- Booking information
  booking_links JSONB DEFAULT '{}'::jsonb, -- { direct, booking_com, expedia, etc. }
  availability_status TEXT,
  check_in_time TEXT,
  check_out_time TEXT,
  
  -- Policies
  cancellation_policy TEXT,
  pet_policy TEXT,
  child_policy TEXT,
  
  -- Additional details
  description TEXT,
  highlights JSONB DEFAULT '[]'::jsonb, -- Key selling points
  nearby_attractions JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
  
  -- Status
  business_status TEXT DEFAULT 'OPERATIONAL',
  temporarily_closed BOOLEAN DEFAULT false,
  permanently_closed BOOLEAN DEFAULT false,
  
  -- Metadata
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.google_hotels_leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own hotel leads"
  ON public.google_hotels_leads
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hotel leads"
  ON public.google_hotels_leads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hotel leads"
  ON public.google_hotels_leads
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hotel leads"
  ON public.google_hotels_leads
  FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for better query performance
CREATE INDEX idx_google_hotels_leads_user_id ON public.google_hotels_leads(user_id);
CREATE INDEX idx_google_hotels_leads_campaign_id ON public.google_hotels_leads(campaign_id);
CREATE INDEX idx_google_hotels_leads_city ON public.google_hotels_leads(city);
CREATE INDEX idx_google_hotels_leads_country ON public.google_hotels_leads(country);
CREATE INDEX idx_google_hotels_leads_rating ON public.google_hotels_leads(rating);
CREATE INDEX idx_google_hotels_leads_created_at ON public.google_hotels_leads(created_at);

-- Add comment
COMMENT ON TABLE public.google_hotels_leads IS 'Stores hotel data scraped from Google Hotels with comprehensive details including rooms, amenities, and pricing';