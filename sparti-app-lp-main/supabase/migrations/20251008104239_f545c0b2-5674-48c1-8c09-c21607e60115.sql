-- Create countries table
CREATE TABLE IF NOT EXISTS public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  flag_emoji TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read countries
CREATE POLICY "Anyone can view countries"
  ON public.countries
  FOR SELECT
  USING (true);

-- Only admins can modify countries
CREATE POLICY "Admins can manage countries"
  ON public.countries
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Insert all countries
INSERT INTO public.countries (name, code, flag_emoji) VALUES
  ('United States', 'US', '🇺🇸'),
  ('United Kingdom', 'GB', '🇬🇧'),
  ('Canada', 'CA', '🇨🇦'),
  ('Australia', 'AU', '🇦🇺'),
  ('Germany', 'DE', '🇩🇪'),
  ('France', 'FR', '🇫🇷'),
  ('Spain', 'ES', '🇪🇸'),
  ('Italy', 'IT', '🇮🇹'),
  ('Netherlands', 'NL', '🇳🇱'),
  ('Belgium', 'BE', '🇧🇪'),
  ('Switzerland', 'CH', '🇨🇭'),
  ('Austria', 'AT', '🇦🇹'),
  ('Sweden', 'SE', '🇸🇪'),
  ('Norway', 'NO', '🇳🇴'),
  ('Denmark', 'DK', '🇩🇰'),
  ('Finland', 'FI', '🇫🇮'),
  ('Poland', 'PL', '🇵🇱'),
  ('Czech Republic', 'CZ', '🇨🇿'),
  ('Ireland', 'IE', '🇮🇪'),
  ('Portugal', 'PT', '🇵🇹'),
  ('Greece', 'GR', '🇬🇷'),
  ('Japan', 'JP', '🇯🇵'),
  ('South Korea', 'KR', '🇰🇷'),
  ('China', 'CN', '🇨🇳'),
  ('India', 'IN', '🇮🇳'),
  ('Singapore', 'SG', '🇸🇬'),
  ('Hong Kong', 'HK', '🇭🇰'),
  ('New Zealand', 'NZ', '🇳🇿'),
  ('Brazil', 'BR', '🇧🇷'),
  ('Mexico', 'MX', '🇲🇽'),
  ('Argentina', 'AR', '🇦🇷'),
  ('Chile', 'CL', '🇨🇱'),
  ('South Africa', 'ZA', '🇿🇦'),
  ('Israel', 'IL', '🇮🇱'),
  ('United Arab Emirates', 'AE', '🇦🇪'),
  ('Saudi Arabia', 'SA', '🇸🇦'),
  ('Turkey', 'TR', '🇹🇷'),
  ('Russia', 'RU', '🇷🇺'),
  ('Indonesia', 'ID', '🇮🇩'),
  ('Thailand', 'TH', '🇹🇭'),
  ('Malaysia', 'MY', '🇲🇾'),
  ('Philippines', 'PH', '🇵🇭'),
  ('Vietnam', 'VN', '🇻🇳'),
  ('Egypt', 'EG', '🇪🇬'),
  ('Nigeria', 'NG', '🇳🇬'),
  ('Kenya', 'KE', '🇰🇪'),
  ('Afghanistan', 'AF', '🇦🇫'),
  ('Albania', 'AL', '🇦🇱'),
  ('Algeria', 'DZ', '🇩🇿'),
  ('Andorra', 'AD', '🇦🇩'),
  ('Angola', 'AO', '🇦🇴'),
  ('Antigua and Barbuda', 'AG', '🇦🇬'),
  ('Armenia', 'AM', '🇦🇲'),
  ('Azerbaijan', 'AZ', '🇦🇿'),
  ('Bahamas', 'BS', '🇧🇸'),
  ('Bahrain', 'BH', '🇧🇭'),
  ('Bangladesh', 'BD', '🇧🇩'),
  ('Barbados', 'BB', '🇧🇧'),
  ('Belarus', 'BY', '🇧🇾'),
  ('Belize', 'BZ', '🇧🇿'),
  ('Benin', 'BJ', '🇧🇯'),
  ('Bhutan', 'BT', '🇧🇹'),
  ('Bolivia', 'BO', '🇧🇴'),
  ('Bosnia and Herzegovina', 'BA', '🇧🇦'),
  ('Botswana', 'BW', '🇧🇼'),
  ('Brunei', 'BN', '🇧🇳'),
  ('Bulgaria', 'BG', '🇧🇬'),
  ('Burkina Faso', 'BF', '🇧🇫'),
  ('Burundi', 'BI', '🇧🇮'),
  ('Cambodia', 'KH', '🇰🇭'),
  ('Cameroon', 'CM', '🇨🇲'),
  ('Cape Verde', 'CV', '🇨🇻'),
  ('Central African Republic', 'CF', '🇨🇫'),
  ('Chad', 'TD', '🇹🇩'),
  ('Colombia', 'CO', '🇨🇴'),
  ('Comoros', 'KM', '🇰🇲'),
  ('Congo', 'CG', '🇨🇬'),
  ('Costa Rica', 'CR', '🇨🇷'),
  ('Croatia', 'HR', '🇭🇷'),
  ('Cuba', 'CU', '🇨🇺'),
  ('Cyprus', 'CY', '🇨🇾'),
  ('Democratic Republic of the Congo', 'CD', '🇨🇩'),
  ('Djibouti', 'DJ', '🇩🇯'),
  ('Dominica', 'DM', '🇩🇲'),
  ('Dominican Republic', 'DO', '🇩🇴'),
  ('Ecuador', 'EC', '🇪🇨'),
  ('El Salvador', 'SV', '🇸🇻'),
  ('Equatorial Guinea', 'GQ', '🇬🇶'),
  ('Eritrea', 'ER', '🇪🇷'),
  ('Estonia', 'EE', '🇪🇪'),
  ('Eswatini', 'SZ', '🇸🇿'),
  ('Ethiopia', 'ET', '🇪🇹'),
  ('Fiji', 'FJ', '🇫🇯'),
  ('Gabon', 'GA', '🇬🇦'),
  ('Gambia', 'GM', '🇬🇲'),
  ('Georgia', 'GE', '🇬🇪'),
  ('Ghana', 'GH', '🇬🇭'),
  ('Grenada', 'GD', '🇬🇩'),
  ('Guatemala', 'GT', '🇬🇹'),
  ('Guinea', 'GN', '🇬🇳'),
  ('Guinea-Bissau', 'GW', '🇬🇼'),
  ('Guyana', 'GY', '🇬🇾'),
  ('Haiti', 'HT', '🇭🇹'),
  ('Honduras', 'HN', '🇭🇳'),
  ('Hungary', 'HU', '🇭🇺'),
  ('Iceland', 'IS', '🇮🇸'),
  ('Iran', 'IR', '🇮🇷'),
  ('Iraq', 'IQ', '🇮🇶'),
  ('Ivory Coast', 'CI', '🇨🇮'),
  ('Jamaica', 'JM', '🇯🇲'),
  ('Jordan', 'JO', '🇯🇴'),
  ('Kazakhstan', 'KZ', '🇰🇿'),
  ('Kuwait', 'KW', '🇰🇼'),
  ('Kyrgyzstan', 'KG', '🇰🇬'),
  ('Laos', 'LA', '🇱🇦'),
  ('Latvia', 'LV', '🇱🇻'),
  ('Lebanon', 'LB', '🇱🇧'),
  ('Lesotho', 'LS', '🇱🇸'),
  ('Liberia', 'LR', '🇱🇷'),
  ('Libya', 'LY', '🇱🇾'),
  ('Liechtenstein', 'LI', '🇱🇮'),
  ('Lithuania', 'LT', '🇱🇹'),
  ('Luxembourg', 'LU', '🇱🇺'),
  ('Madagascar', 'MG', '🇲🇬'),
  ('Malawi', 'MW', '🇲🇼'),
  ('Maldives', 'MV', '🇲🇻'),
  ('Mali', 'ML', '🇲🇱'),
  ('Malta', 'MT', '🇲🇹'),
  ('Marshall Islands', 'MH', '🇲🇭'),
  ('Mauritania', 'MR', '🇲🇷'),
  ('Mauritius', 'MU', '🇲🇺'),
  ('Micronesia', 'FM', '🇫🇲'),
  ('Moldova', 'MD', '🇲🇩'),
  ('Monaco', 'MC', '🇲🇨'),
  ('Mongolia', 'MN', '🇲🇳'),
  ('Montenegro', 'ME', '🇲🇪'),
  ('Morocco', 'MA', '🇲🇦'),
  ('Mozambique', 'MZ', '🇲🇿'),
  ('Myanmar', 'MM', '🇲🇲'),
  ('Namibia', 'NA', '🇳🇦'),
  ('Nauru', 'NR', '🇳🇷'),
  ('Nepal', 'NP', '🇳🇵'),
  ('Nicaragua', 'NI', '🇳🇮'),
  ('Niger', 'NE', '🇳🇪'),
  ('North Korea', 'KP', '🇰🇵'),
  ('North Macedonia', 'MK', '🇲🇰'),
  ('Oman', 'OM', '🇴🇲'),
  ('Pakistan', 'PK', '🇵🇰'),
  ('Palau', 'PW', '🇵🇼'),
  ('Palestine', 'PS', '🇵🇸'),
  ('Panama', 'PA', '🇵🇦'),
  ('Papua New Guinea', 'PG', '🇵🇬'),
  ('Paraguay', 'PY', '🇵🇾'),
  ('Peru', 'PE', '🇵🇪'),
  ('Qatar', 'QA', '🇶🇦'),
  ('Romania', 'RO', '🇷🇴'),
  ('Rwanda', 'RW', '🇷🇼'),
  ('Saint Kitts and Nevis', 'KN', '🇰🇳'),
  ('Saint Lucia', 'LC', '🇱🇨'),
  ('Saint Vincent and the Grenadines', 'VC', '🇻🇨'),
  ('Samoa', 'WS', '🇼🇸'),
  ('San Marino', 'SM', '🇸🇲'),
  ('Sao Tome and Principe', 'ST', '🇸🇹'),
  ('Senegal', 'SN', '🇸🇳'),
  ('Serbia', 'RS', '🇷🇸'),
  ('Seychelles', 'SC', '🇸🇨'),
  ('Sierra Leone', 'SL', '🇸🇱'),
  ('Slovakia', 'SK', '🇸🇰'),
  ('Slovenia', 'SI', '🇸🇮'),
  ('Solomon Islands', 'SB', '🇸🇧'),
  ('Somalia', 'SO', '🇸🇴'),
  ('Sri Lanka', 'LK', '🇱🇰'),
  ('Sudan', 'SD', '🇸🇩'),
  ('Suriname', 'SR', '🇸🇷'),
  ('Syria', 'SY', '🇸🇾'),
  ('Taiwan', 'TW', '🇹🇼'),
  ('Tajikistan', 'TJ', '🇹🇯'),
  ('Tanzania', 'TZ', '🇹🇿'),
  ('Timor-Leste', 'TL', '🇹🇱'),
  ('Togo', 'TG', '🇹🇬'),
  ('Tonga', 'TO', '🇹🇴'),
  ('Trinidad and Tobago', 'TT', '🇹🇹'),
  ('Tunisia', 'TN', '🇹🇳'),
  ('Turkmenistan', 'TM', '🇹🇲'),
  ('Tuvalu', 'TV', '🇹🇻'),
  ('Uganda', 'UG', '🇺🇬'),
  ('Ukraine', 'UA', '🇺🇦'),
  ('Uruguay', 'UY', '🇺🇾'),
  ('Uzbekistan', 'UZ', '🇺🇿'),
  ('Vanuatu', 'VU', '🇻🇺'),
  ('Vatican City', 'VA', '🇻🇦'),
  ('Venezuela', 'VE', '🇻🇪'),
  ('Yemen', 'YE', '🇾🇪'),
  ('Zambia', 'ZM', '🇿🇲'),
  ('Zimbabwe', 'ZW', '🇿🇼')
ON CONFLICT (name) DO NOTHING;

-- Add country_id column to seo_internal_links if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'seo_internal_links' 
    AND column_name = 'country_id'
  ) THEN
    ALTER TABLE public.seo_internal_links 
    ADD COLUMN country_id UUID REFERENCES public.countries(id) ON DELETE SET NULL;
    
    CREATE INDEX idx_seo_internal_links_country_id ON public.seo_internal_links(country_id);
  END IF;
END $$;

-- Migrate existing country data from country column to country_id
UPDATE public.seo_internal_links sil
SET country_id = c.id
FROM public.countries c
WHERE sil.country = c.name
AND sil.country_id IS NULL;