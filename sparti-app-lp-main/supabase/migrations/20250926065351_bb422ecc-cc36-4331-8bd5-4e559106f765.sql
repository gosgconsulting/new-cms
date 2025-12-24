-- Add RLS policies for selected_topics table
CREATE POLICY "Users can create own selected topics" ON public.selected_topics
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own selected topics" ON public.selected_topics
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own selected topics" ON public.selected_topics
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own selected topics" ON public.selected_topics
FOR DELETE USING (auth.uid() = user_id);