-- Create workflows table to store workflow configurations
CREATE TABLE IF NOT EXISTS public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workflow_steps table to store individual steps
CREATE TABLE IF NOT EXISTS public.workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  provider TEXT,
  brief TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'live')),
  step_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workflows
CREATE POLICY "Users can view workflows in their workspaces"
  ON public.workflows FOR SELECT
  USING (
    user_id = auth.uid() OR
    (workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workflows.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.status = 'active'
    ))
  );

CREATE POLICY "Users can create workflows in their workspaces"
  ON public.workflows FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    (workspace_id IS NULL OR EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workflows.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.status = 'active'
    ))
  );

CREATE POLICY "Users can update their workflows"
  ON public.workflows FOR UPDATE
  USING (
    user_id = auth.uid() OR
    (workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workflows.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.status = 'active'
      AND wm.role IN ('admin', 'editor')
    ))
  );

CREATE POLICY "Users can delete their workflows"
  ON public.workflows FOR DELETE
  USING (
    user_id = auth.uid() OR
    (workspace_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workflows.workspace_id
      AND wm.user_id = auth.uid()
      AND wm.status = 'active'
      AND wm.role = 'admin'
    ))
  );

-- RLS Policies for workflow_steps
CREATE POLICY "Users can view steps of accessible workflows"
  ON public.workflow_steps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workflows w
      WHERE w.id = workflow_steps.workflow_id
      AND (
        w.user_id = auth.uid() OR
        (w.workspace_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM workspace_members wm
          WHERE wm.workspace_id = w.workspace_id
          AND wm.user_id = auth.uid()
          AND wm.status = 'active'
        ))
      )
    )
  );

CREATE POLICY "Users can manage steps of their workflows"
  ON public.workflow_steps FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM workflows w
      WHERE w.id = workflow_steps.workflow_id
      AND (
        w.user_id = auth.uid() OR
        (w.workspace_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM workspace_members wm
          WHERE wm.workspace_id = w.workspace_id
          AND wm.user_id = auth.uid()
          AND wm.status = 'active'
          AND wm.role IN ('admin', 'editor')
        ))
      )
    )
  );

-- Create indexes for performance
CREATE INDEX idx_workflows_user_id ON public.workflows(user_id);
CREATE INDEX idx_workflows_workspace_id ON public.workflows(workspace_id);
CREATE INDEX idx_workflow_steps_workflow_id ON public.workflow_steps(workflow_id);
CREATE INDEX idx_workflow_steps_order ON public.workflow_steps(workflow_id, step_order);

-- Create updated_at trigger for workflows
CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON public.workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create updated_at trigger for workflow_steps  
CREATE TRIGGER update_workflow_steps_updated_at
  BEFORE UPDATE ON public.workflow_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;