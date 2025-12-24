-- Create unique constraint for selected_topics to prevent duplicates
ALTER TABLE public.selected_topics 
ADD CONSTRAINT unique_selected_topic_per_user_brand 
UNIQUE (user_id, brand_id, suggested_topic_id);