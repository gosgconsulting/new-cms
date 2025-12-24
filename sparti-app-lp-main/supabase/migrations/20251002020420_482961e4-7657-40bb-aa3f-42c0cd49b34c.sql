-- Create table for custom instruction prompts
CREATE TABLE IF NOT EXISTS public.custom_instruction_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_instruction_prompts ENABLE ROW LEVEL SECURITY;

-- Users can manage their own prompts or workspace prompts
CREATE POLICY "Users can view own or workspace prompts"
  ON public.custom_instruction_prompts
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR (workspace_id IS NOT NULL AND is_workspace_member(workspace_id, auth.uid()))
  );

CREATE POLICY "Users can create own or workspace prompts"
  ON public.custom_instruction_prompts
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR (workspace_id IS NOT NULL AND is_workspace_member(workspace_id, auth.uid()))
  );

CREATE POLICY "Users can update own or workspace prompts"
  ON public.custom_instruction_prompts
  FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR (workspace_id IS NOT NULL AND is_workspace_member(workspace_id, auth.uid()))
  );

CREATE POLICY "Users can delete own or workspace prompts"
  ON public.custom_instruction_prompts
  FOR DELETE
  USING (
    auth.uid() = user_id 
    OR (workspace_id IS NOT NULL AND is_workspace_member(workspace_id, auth.uid()))
  );

-- Create trigger to update updated_at
CREATE TRIGGER update_custom_instruction_prompts_updated_at
  BEFORE UPDATE ON public.custom_instruction_prompts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_custom_instruction_prompts_user_brand 
  ON public.custom_instruction_prompts(user_id, brand_id);

CREATE INDEX idx_custom_instruction_prompts_workspace 
  ON public.custom_instruction_prompts(workspace_id);