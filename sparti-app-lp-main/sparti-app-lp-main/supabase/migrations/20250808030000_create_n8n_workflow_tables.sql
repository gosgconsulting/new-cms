-- Create tables to store n8n workflow data in Supabase for sharing across apps

-- Workflows table (synced from n8n API)
CREATE TABLE IF NOT EXISTS public.n8n_workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    n8n_workflow_id TEXT NOT NULL UNIQUE, -- n8n's internal workflow ID
    name TEXT NOT NULL,
    description TEXT,
    active BOOLEAN DEFAULT false,
    tags JSONB DEFAULT '[]'::jsonb,
    nodes JSONB DEFAULT '{}'::jsonb,
    connections JSONB DEFAULT '{}'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    static_data JSONB DEFAULT '{}'::jsonb,
    version_id TEXT,
    
    -- Metadata
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- n8n timestamps
    n8n_created_at TIMESTAMP WITH TIME ZONE,
    n8n_updated_at TIMESTAMP WITH TIME ZONE
);

-- Workflow executions table (synced from n8n API)
CREATE TABLE IF NOT EXISTS public.n8n_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    n8n_execution_id TEXT NOT NULL UNIQUE, -- n8n's internal execution ID
    workflow_id UUID REFERENCES public.n8n_workflows(id) ON DELETE CASCADE,
    n8n_workflow_id TEXT NOT NULL, -- For reference even if workflow is deleted
    
    -- Execution details
    mode TEXT DEFAULT 'trigger', -- manual, trigger, webhook, etc.
    status TEXT DEFAULT 'running', -- running, success, error, waiting
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    stopped_at TIMESTAMP WITH TIME ZONE,
    finished BOOLEAN DEFAULT false,
    
    -- Execution data (optional, can be large)
    data JSONB,
    error_message TEXT,
    
    -- Metadata
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    synced_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Workflow statistics table (aggregated data)
CREATE TABLE IF NOT EXISTS public.n8n_workflow_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES public.n8n_workflows(id) ON DELETE CASCADE,
    n8n_workflow_id TEXT NOT NULL,
    
    -- Time period for stats
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type TEXT DEFAULT 'daily', -- daily, weekly, monthly
    
    -- Statistics
    total_executions INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    failed_executions INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    avg_execution_time_ms INTEGER DEFAULT 0,
    
    -- Metadata
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure unique stats per workflow per period
    UNIQUE(workflow_id, period_start, period_end, period_type)
);

-- Workflow tags table (normalized tags for better querying)
CREATE TABLE IF NOT EXISTS public.n8n_workflow_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID REFERENCES public.n8n_workflows(id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL,
    tag_id TEXT, -- n8n's tag ID if available
    
    -- Metadata
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure unique tags per workflow
    UNIQUE(workflow_id, tag_name)
);

-- Workflow sync status table (track sync operations)
CREATE TABLE IF NOT EXISTS public.n8n_sync_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sync_type TEXT NOT NULL, -- workflows, executions, stats
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    sync_status TEXT DEFAULT 'pending', -- pending, running, completed, failed
    items_synced INTEGER DEFAULT 0,
    error_message TEXT,
    
    -- Metadata
    brand_id UUID REFERENCES public.brands(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Ensure unique sync status per type per brand
    UNIQUE(sync_type, brand_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_brand_id ON public.n8n_workflows(brand_id);
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_user_id ON public.n8n_workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_active ON public.n8n_workflows(active);
CREATE INDEX IF NOT EXISTS idx_n8n_workflows_n8n_id ON public.n8n_workflows(n8n_workflow_id);

CREATE INDEX IF NOT EXISTS idx_n8n_executions_workflow_id ON public.n8n_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_brand_id ON public.n8n_executions(brand_id);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_status ON public.n8n_executions(status);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_started_at ON public.n8n_executions(started_at);
CREATE INDEX IF NOT EXISTS idx_n8n_executions_n8n_workflow_id ON public.n8n_executions(n8n_workflow_id);

CREATE INDEX IF NOT EXISTS idx_n8n_workflow_stats_workflow_id ON public.n8n_workflow_stats(workflow_id);
CREATE INDEX IF NOT EXISTS idx_n8n_workflow_stats_period ON public.n8n_workflow_stats(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_n8n_workflow_stats_brand_id ON public.n8n_workflow_stats(brand_id);

CREATE INDEX IF NOT EXISTS idx_n8n_workflow_tags_workflow_id ON public.n8n_workflow_tags(workflow_id);
CREATE INDEX IF NOT EXISTS idx_n8n_workflow_tags_name ON public.n8n_workflow_tags(tag_name);

CREATE INDEX IF NOT EXISTS idx_n8n_sync_status_brand_id ON public.n8n_sync_status(brand_id);
CREATE INDEX IF NOT EXISTS idx_n8n_sync_status_type ON public.n8n_sync_status(sync_type);

-- Add updated_at trigger for workflows
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_n8n_workflows_updated_at 
    BEFORE UPDATE ON public.n8n_workflows 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_n8n_workflow_stats_updated_at 
    BEFORE UPDATE ON public.n8n_workflow_stats 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.n8n_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_workflow_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_workflow_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_sync_status ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view workflows from their brands" ON public.n8n_workflows
    FOR SELECT USING (
        brand_id IN (
            SELECT id FROM public.brands 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert workflows for their brands" ON public.n8n_workflows
    FOR INSERT WITH CHECK (
        brand_id IN (
            SELECT id FROM public.brands 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update workflows from their brands" ON public.n8n_workflows
    FOR UPDATE USING (
        brand_id IN (
            SELECT id FROM public.brands 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete workflows from their brands" ON public.n8n_workflows
    FOR DELETE USING (
        brand_id IN (
            SELECT id FROM public.brands 
            WHERE user_id = auth.uid()
        )
    );

-- Similar policies for executions
CREATE POLICY "Users can view executions from their brands" ON public.n8n_executions
    FOR SELECT USING (
        brand_id IN (
            SELECT id FROM public.brands 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert executions for their brands" ON public.n8n_executions
    FOR INSERT WITH CHECK (
        brand_id IN (
            SELECT id FROM public.brands 
            WHERE user_id = auth.uid()
        )
    );

-- Similar policies for stats and tags (shortened for brevity)
CREATE POLICY "Users can view stats from their brands" ON public.n8n_workflow_stats
    FOR SELECT USING (
        brand_id IN (
            SELECT id FROM public.brands 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage stats for their brands" ON public.n8n_workflow_stats
    FOR ALL USING (
        brand_id IN (
            SELECT id FROM public.brands 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view tags from their brands" ON public.n8n_workflow_tags
    FOR SELECT USING (
        brand_id IN (
            SELECT id FROM public.brands 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage tags for their brands" ON public.n8n_workflow_tags
    FOR ALL USING (
        brand_id IN (
            SELECT id FROM public.brands 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can view sync status for their brands" ON public.n8n_sync_status
    FOR SELECT USING (
        brand_id IN (
            SELECT id FROM public.brands 
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage sync status for their brands" ON public.n8n_sync_status
    FOR ALL USING (
        brand_id IN (
            SELECT id FROM public.brands 
            WHERE user_id = auth.uid()
        )
    );


