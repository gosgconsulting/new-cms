-- Add LLM model configuration columns to content_settings table
ALTER TABLE public.content_settings
ADD COLUMN IF NOT EXISTS content_model TEXT DEFAULT 'google/gemini-2.5-flash',
ADD COLUMN IF NOT EXISTS image_model TEXT DEFAULT 'google/gemini-2.5-flash-image-preview';

-- Add comment to document the columns
COMMENT ON COLUMN public.content_settings.content_model IS 'AI model used for content generation (e.g., google/gemini-2.5-flash, openai/gpt-5)';
COMMENT ON COLUMN public.content_settings.image_model IS 'AI model used for image generation (e.g., google/gemini-2.5-flash-image-preview, gpt-image-1)';