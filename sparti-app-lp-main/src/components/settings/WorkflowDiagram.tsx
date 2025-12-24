import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { GripVertical, Plus, Trash2, ChevronDown, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { universalPromptTemplate } from '@/utils/promptTemplate';


type Step = {
  id: string;
  step: string;
  provider: string[];
  brief: string;
  status: 'pending' | 'in-progress' | 'live';
  config?: Record<string, any>;
};

type Workflow = {
  id: string;
  title: string;
  steps: Step[];
};

const getDefaultWorkflows = (): Workflow[] => [
  {
    id: crypto.randomUUID(),
    title: 'SEO Copilot - Create Campaign',
    steps: [
      { 
        id: crypto.randomUUID(),
        step: 'Campaign Setup', 
        provider: [], 
        brief: 'User fills campaign form with website URL, target keywords, country, language, and SEO goals',
        status: 'live'
      },
      { 
        id: crypto.randomUUID(),
        step: 'Keyword Extraction', 
        provider: ['Edge Function'], 
        brief: 'quick-setup-keyword-extraction analyzes input and extracts main target keywords for SEO strategy',
        status: 'live'
      },
      { 
        id: crypto.randomUUID(),
        step: 'Longtail Variants', 
        provider: ['Edge Function', 'OpenRouter'], 
        brief: 'quick-setup-longtail-variants generates 5-10 long-tail keyword variations per main keyword using AI',
        status: 'live'
      },
      { 
        id: crypto.randomUUID(),
        step: 'Source Discovery', 
        provider: ['Edge Function', 'DataForSEO API'], 
        brief: 'quick-setup-source-discovery identifies top-ranking authoritative sources for each keyword',
        status: 'live'
      },
      { 
        id: crypto.randomUUID(),
        step: 'Source Fetching', 
        provider: ['Edge Function', 'Firecrawl'], 
        brief: 'quick-setup-source-fetching scrapes and extracts content from discovered sources for research',
        status: 'live'
      },
      { 
        id: crypto.randomUUID(),
        step: 'Backlink Discovery', 
        provider: ['Edge Function', 'DataForSEO API'], 
        brief: 'quick-setup-backlink-discovery analyzes competitor backlink profiles and identifies link opportunities',
        status: 'live'
      },
      { 
        id: crypto.randomUUID(),
        step: 'Topic Generation', 
        provider: ['Edge Function', 'OpenRouter'], 
        brief: 'quick-setup-topic-generation creates 30+ blog topic suggestions based on keywords and competitor analysis',
        status: 'live'
      },
      { 
        id: crypto.randomUUID(),
        step: 'Intent Analysis', 
        provider: ['Edge Function', 'OpenRouter'], 
        brief: 'quick-setup-intent-analysis classifies each topic by user intent (informational, commercial, transactional)',
        status: 'live'
      },
      { 
        id: crypto.randomUUID(),
        step: 'Bulk Article Generation', 
        provider: ['Edge Function', 'OpenRouter', 'Firecrawl'], 
        brief: 'content-writing-workflow creates multiple SEO-optimized articles using Claude 3.5 Sonnet with internal linking and saves to database',
        status: 'live',
        config: {
          model: 'anthropic/claude-3.5-sonnet',
          temperature: 0.7,
          maxTokens: 6000,
          systemPrompt: 'You are an expert SEO content writer. Write naturally, engagingly, and optimize for search intent while maintaining brand voice.',
          userPrompt: universalPromptTemplate
        }
      },
      { 
        id: crypto.randomUUID(),
        step: 'Bulk Article Generation (GPT-4o)', 
        provider: ['Edge Function', 'OpenRouter', 'Firecrawl'], 
        brief: 'content-writing-unified creates multiple SEO-optimized articles using GPT-4o with internal linking and saves to database',
        status: 'live',
        config: {
          model: 'openai/gpt-4o',
          temperature: 0.7,
          maxTokens: 6000,
          systemPrompt: 'You are an expert SEO content writer. Write naturally, engagingly, and optimize for search intent while maintaining brand voice.',
          userPrompt: universalPromptTemplate
        }
      },
      { 
        id: crypto.randomUUID(),
        step: 'Campaign Ready', 
        provider: ['Supabase'], 
        brief: 'All articles, keywords, topics, and SEO data saved. Campaign is ready for review and publishing',
        status: 'live'
      }
    ]
  }
];

export const WorkflowDiagram = () => {
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  const [draggedStep, setDraggedStep] = useState<{ workflowId: string; stepId: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [configStep, setConfigStep] = useState<{ workflowId: string; stepId: string } | null>(null);

  // Load workflows from database
  useEffect(() => {
    initializeWorkflows();
  }, []);

  const initializeWorkflows = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if user has workflows in database
      const { data: existingWorkflows, error: fetchError } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) throw fetchError;

      const defaultWorkflows = getDefaultWorkflows();

      if (existingWorkflows && existingWorkflows.length > 0) {
        // Load existing workflows from database
        const workflowsWithSteps = await Promise.all(
          existingWorkflows.map(async (workflow) => {
            const { data: stepsData, error: stepsError } = await supabase
              .from('workflow_steps')
              .select('*')
              .eq('workflow_id', workflow.id)
              .order('step_order');

            if (stepsError) throw stepsError;

            return {
              id: workflow.id,
              title: workflow.title,
              steps: (stepsData || []).map(step => ({
                id: step.id,
                step: step.step_name,
                provider: step.provider || [],
                brief: step.brief,
                status: step.status as 'pending' | 'in-progress' | 'live',
                config: step.config || {}
              }))
            };
          })
        );

        // Sync step configs with defaults before checking for empty workflows
        await syncStepConfigsWithDefaults(workflowsWithSteps);

        // Check for workflows with empty steps and fix them
        const workflowsToFix = workflowsWithSteps.filter(w => w.steps.length === 0);
        
        if (workflowsToFix.length > 0) {
          console.log(`Found ${workflowsToFix.length} workflows with missing steps, fixing...`);
          
          for (const emptyWorkflow of workflowsToFix) {
            const defaultWorkflow = defaultWorkflows.find(dw => dw.title === emptyWorkflow.title);
            
            if (defaultWorkflow) {
              console.log(`Restoring steps for workflow: ${emptyWorkflow.title}`);
              
              const stepsToInsert = defaultWorkflow.steps.map((step, index) => ({
                id: crypto.randomUUID(),
                workflow_id: emptyWorkflow.id,
                step_name: step.step,
                provider: step.provider.length > 0 ? step.provider : null,
                brief: step.brief,
                status: step.status,
                step_order: index
              }));

              const { error: stepsError } = await supabase
                .from('workflow_steps')
                .insert(stepsToInsert);

              if (stepsError) {
                console.error(`Error inserting steps for ${emptyWorkflow.title}:`, stepsError);
              } else {
                const workflowIndex = workflowsWithSteps.findIndex(w => w.id === emptyWorkflow.id);
                if (workflowIndex !== -1) {
                  workflowsWithSteps[workflowIndex].steps = defaultWorkflow.steps.map((step, index) => ({
                    id: stepsToInsert[index].id,
                    step: step.step,
                    provider: step.provider,
                    brief: step.brief,
                    status: step.status,
                    config: step.config || {}
                  }));
                }
              }
            }
          }
          
          toast({
            title: 'Workflows Restored',
            description: `Fixed ${workflowsToFix.length} workflow(s) with missing steps`
          });
        }

        // Check if all default workflows exist, if not create missing ones
        const existingTitles = workflowsWithSteps.map(w => w.title);
        const missingWorkflows = defaultWorkflows.filter(dw => !existingTitles.includes(dw.title));

        // Delete workflows that are no longer in the default list
        const defaultTitles = defaultWorkflows.map(dw => dw.title);
        const workflowsToDelete = workflowsWithSteps.filter(w => !defaultTitles.includes(w.title));
        
        if (workflowsToDelete.length > 0) {
          console.log(`Deleting ${workflowsToDelete.length} unused workflows...`);
          
          for (const workflowToDelete of workflowsToDelete) {
            const { error: deleteError } = await supabase
              .from('workflows')
              .delete()
              .eq('id', workflowToDelete.id);
            
            if (deleteError) {
              console.error(`Error deleting workflow ${workflowToDelete.title}:`, deleteError);
            }
          }
          
          // Remove deleted workflows from the list
          const deletedIds = workflowsToDelete.map(w => w.id);
          const updatedWorkflows = workflowsWithSteps.filter(w => !deletedIds.includes(w.id));
          
          toast({
            title: 'Workflows Cleaned',
            description: `Removed ${workflowsToDelete.length} unused workflow(s)`
          });

          if (missingWorkflows.length > 0) {
            console.log(`Creating ${missingWorkflows.length} missing workflows...`);
            
            for (const missingWorkflow of missingWorkflows) {
              // Ensure all steps have config field
              const workflowWithConfig = {
                ...missingWorkflow,
                steps: missingWorkflow.steps.map(step => ({
                  ...step,
                  config: step.config || {}
                }))
              };
              await saveWorkflowToDatabase(workflowWithConfig, user.id);
              updatedWorkflows.push(workflowWithConfig);
            }

            toast({
              title: 'Workflows Updated',
              description: `Added ${missingWorkflows.length} new workflow(s)`
            });
          }
          
          // Sort workflows by default order: SEO Copilot - Create Campaign
          const workflowOrder = ['SEO Copilot - Create Campaign'];
          updatedWorkflows.sort((a, b) => {
            const indexA = workflowOrder.indexOf(a.title);
            const indexB = workflowOrder.indexOf(b.title);
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
          });
          
          setWorkflows(updatedWorkflows);
        } else {
          if (missingWorkflows.length > 0) {
            console.log(`Creating ${missingWorkflows.length} missing workflows...`);
            
            for (const missingWorkflow of missingWorkflows) {
              // Ensure all steps have config field
              const workflowWithConfig = {
                ...missingWorkflow,
                steps: missingWorkflow.steps.map(step => ({
                  ...step,
                  config: step.config || {}
                }))
              };
              await saveWorkflowToDatabase(workflowWithConfig, user.id);
              workflowsWithSteps.push(workflowWithConfig);
            }

            toast({
              title: 'Workflows Added',
              description: `Created ${missingWorkflows.length} missing workflow(s)`
            });
          }
          
          // Sort workflows by default order: SEO Copilot - Create Campaign
          const workflowOrder = ['SEO Copilot - Create Campaign'];
          workflowsWithSteps.sort((a, b) => {
            const indexA = workflowOrder.indexOf(a.title);
            const indexB = workflowOrder.indexOf(b.title);
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
          });
          
          setWorkflows(workflowsWithSteps);
        }
      } else {
        // Initialize default workflows with proper UUIDs
        const defaultWorkflows = getDefaultWorkflows();
        
        // Save default workflows to database
        for (const workflow of defaultWorkflows) {
          await saveWorkflowToDatabase(workflow, user.id);
        }
        
        setWorkflows(defaultWorkflows);
      }
    } catch (error) {
      console.error('Error initializing workflows:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize workflows',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const syncStepConfigsWithDefaults = async (workflows: Workflow[]) => {
    const defaultWorkflows = getDefaultWorkflows();

    for (const workflow of workflows) {
      // Find matching default workflow
      const defaultWorkflow = defaultWorkflows.find(dw => dw.title === workflow.title);
      if (!defaultWorkflow) continue;

      for (const step of workflow.steps) {
        // Find matching default step
        const defaultStep = defaultWorkflow.steps.find(ds => ds.step === step.step);
        if (!defaultStep || !defaultStep.config) continue;

        // Check if current step has empty or missing config
        const hasEmptyConfig = !step.config || 
          Object.keys(step.config).length === 0 ||
          !step.config.systemPrompt || 
          !step.config.userPrompt;

        if (hasEmptyConfig) {
          console.log(`Syncing config for step: ${step.step} (${step.id})`);
          
          // Update the step config in memory
          step.config = defaultStep.config;

          // Update the database
          const { error } = await supabase
            .from('workflow_steps')
            .update({ config: defaultStep.config })
            .eq('id', step.id);

          if (error) {
            console.error(`Error syncing config for step ${step.id}:`, error);
          } else {
            console.log(`Successfully synced config for step: ${step.step}`);
          }
        }
      }
    }
  };

  const saveWorkflowToDatabase = async (workflow: Workflow, userId: string) => {
    // Insert workflow
    const { error: workflowError } = await supabase
      .from('workflows')
      .insert({
        id: workflow.id,
        user_id: userId,
        title: workflow.title,
        description: ''
      });

    if (workflowError) throw workflowError;

    // Insert steps with config
    const stepsToInsert = workflow.steps.map((step, index) => ({
      id: step.id,
      workflow_id: workflow.id,
      step_name: step.step,
      provider: step.provider.length > 0 ? step.provider : null,
      brief: step.brief,
      status: step.status,
      step_order: index,
      config: step.config || null
    }));

    const { error: stepsError } = await supabase
      .from('workflow_steps')
      .insert(stepsToInsert);

    if (stepsError) throw stepsError;
  };

  const saveWorkflow = async (workflow: Workflow) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete existing steps first
      await supabase
        .from('workflow_steps')
        .delete()
        .eq('workflow_id', workflow.id);

      // Update workflow
      const { error: workflowError } = await supabase
        .from('workflows')
        .update({
          title: workflow.title,
          updated_at: new Date().toISOString()
        })
        .eq('id', workflow.id);

      if (workflowError) throw workflowError;

      // Insert all steps with new order and config
      const stepsToInsert = workflow.steps.map((step, index) => ({
        id: step.id,
        workflow_id: workflow.id,
        step_name: step.step,
        provider: step.provider.length > 0 ? step.provider : null,
        brief: step.brief,
        status: step.status,
        step_order: index,
        config: step.config || null
      }));

      const { error: stepsError } = await supabase
        .from('workflow_steps')
        .insert(stepsToInsert);

      if (stepsError) throw stepsError;
    } catch (error) {
      console.error('Error saving workflow:', error);
    }
  };

  const deleteWorkflow = async (workflowId: string) => {
    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', workflowId);

      if (error) throw error;

      setWorkflows(prev => prev.filter(w => w.id !== workflowId));
      toast({
        title: 'Success',
        description: 'Workflow deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting workflow:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete workflow',
        variant: 'destructive'
      });
    }
  };

  const deleteStep = (workflowId: string, stepId: string) => {
    setWorkflows(prev => prev.map(workflow => {
      if (workflow.id !== workflowId) return workflow;
      
      const updatedWorkflow = {
        ...workflow,
        steps: workflow.steps.filter(s => s.id !== stepId)
      };
      
      saveWorkflow(updatedWorkflow);
      return updatedWorkflow;
    }));
  };

  const updateStepStatus = (workflowId: string, stepId: string, status: 'pending' | 'in-progress' | 'live') => {
    setWorkflows(prev => prev.map(workflow => {
      if (workflow.id !== workflowId) return workflow;
      
      const updatedWorkflow = {
        ...workflow,
        steps: workflow.steps.map(step => 
          step.id === stepId ? { ...step, status } : step
        )
      };
      
      saveWorkflow(updatedWorkflow);
      return updatedWorkflow;
    }));
  };

  const updateStepBrief = (workflowId: string, stepId: string, brief: string) => {
    setWorkflows(prev => prev.map(workflow => {
      if (workflow.id !== workflowId) return workflow;
      
      const updatedWorkflow = {
        ...workflow,
        steps: workflow.steps.map(step => 
          step.id === stepId ? { ...step, brief } : step
        )
      };
      
      // Debounce save - you could add debounce logic here if needed
      saveWorkflow(updatedWorkflow);
      return updatedWorkflow;
    }));
  };

  const updateStepName = (workflowId: string, stepId: string, stepName: string) => {
    setWorkflows(prev => prev.map(workflow => {
      if (workflow.id !== workflowId) return workflow;
      
      const updatedWorkflow = {
        ...workflow,
        steps: workflow.steps.map(step => 
          step.id === stepId ? { ...step, step: stepName } : step
        )
      };
      
      saveWorkflow(updatedWorkflow);
      return updatedWorkflow;
    }));
  };

  const handleDragStart = (workflowId: string, stepId: string) => {
    setDraggedStep({ workflowId, stepId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (workflowId: string, targetStepId: string) => {
    if (!draggedStep || draggedStep.workflowId !== workflowId) return;

    setWorkflows(prev => prev.map(workflow => {
      if (workflow.id !== workflowId) return workflow;

      const steps = [...workflow.steps];
      const draggedIndex = steps.findIndex(s => s.id === draggedStep.stepId);
      const targetIndex = steps.findIndex(s => s.id === targetStepId);

      const [removed] = steps.splice(draggedIndex, 1);
      steps.splice(targetIndex, 0, removed);

      const updatedWorkflow = { ...workflow, steps };
      saveWorkflow(updatedWorkflow);
      return updatedWorkflow;
    }));

    setDraggedStep(null);
  };

  const addNewStep = (workflowId: string) => {
    const newStep: Step = {
      id: crypto.randomUUID(),
      step: 'New Step',
      provider: [],
      brief: 'Add description here',
      status: 'pending'
    };

    setWorkflows(prev => prev.map(workflow => {
      if (workflow.id !== workflowId) return workflow;
      
      const updatedWorkflow = {
        ...workflow,
        steps: [...workflow.steps, newStep]
      };
      
      saveWorkflow(updatedWorkflow);
      return updatedWorkflow;
    }));
  };

  const updateStepProvider = (workflowId: string, stepId: string, providers: string[]) => {
    setWorkflows(prev => prev.map(workflow => {
      if (workflow.id !== workflowId) return workflow;
      
      const updatedWorkflow = {
        ...workflow,
        steps: workflow.steps.map(step => 
          step.id === stepId ? { ...step, provider: providers } : step
        )
      };
      
      saveWorkflow(updatedWorkflow);
      return updatedWorkflow;
    }));
  };

  const getProviderColor = (provider: string) => {
    if (!provider) return '';
    
    if (provider.includes('OpenRouter')) return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
    if (provider.includes('Edge Function')) return 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20';
    if (provider.includes('Firecrawl')) return 'bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20';
    if (provider.includes('Supabase')) return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20';
    if (provider.includes('DataForSEO')) return 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20';
    if (provider.includes('N8N')) return 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20';
    
    return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live':
        return 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20';
      case 'in-progress':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20';
      case 'pending':
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20';
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading workflows...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Content Generation Workflows</h2>
        <p className="text-muted-foreground">
          Detailed flow of our content generation features with service providers
        </p>
      </div>

      {workflows.map((workflow) => (
        <Card key={workflow.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-primary">{workflow.title}</CardTitle>
                <CardDescription>
                  End-to-end process flow for {workflow.title.toLowerCase()}
                </CardDescription>
              </div>
              <Button
                onClick={() => addNewStep(workflow.id)}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Step
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]"></TableHead>
                  <TableHead className="w-[180px]">Step</TableHead>
                  <TableHead className="w-[200px]">Provider</TableHead>
                  <TableHead className="w-[140px]">Status</TableHead>
                  <TableHead>Brief</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workflow.steps.map((step) => (
                  <TableRow
                    key={step.id}
                    draggable
                    onDragStart={() => handleDragStart(workflow.id, step.id)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(workflow.id, step.id)}
                    className="cursor-move hover:bg-muted/50"
                  >
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={step.step}
                        onChange={(e) => updateStepName(workflow.id, step.id, e.target.value)}
                        className="font-medium"
                      />
                    </TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between h-auto min-h-[40px] py-2"
                          >
                            <div className="flex flex-wrap gap-1">
                              {step.provider.length > 0 ? (
                                step.provider.map((p) => (
                                  <Badge 
                                    key={p} 
                                    variant="outline" 
                                    className={getProviderColor(p)}
                                  >
                                    {p}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-muted-foreground text-sm">Select providers</span>
                              )}
                            </div>
                            <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0 ml-2" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-3" align="start">
                          <div className="space-y-2">
                            <div className="text-sm font-medium mb-2">Select Providers</div>
                            {[
                              'Edge Function',
                              'DataForSEO API',
                              'Firecrawl',
                              'OpenRouter',
                              'Supabase',
                              'N8N Webhook'
                            ].map((provider) => (
                              <div key={provider} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${step.id}-${provider}`}
                                  checked={step.provider.includes(provider)}
                                  onCheckedChange={(checked) => {
                                    const newProviders = checked
                                      ? [...step.provider, provider]
                                      : step.provider.filter(p => p !== provider);
                                    updateStepProvider(workflow.id, step.id, newProviders);
                                  }}
                                />
                                <label
                                  htmlFor={`${step.id}-${provider}`}
                                  className="text-sm cursor-pointer flex-1"
                                >
                                  {provider}
                                </label>
                              </div>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={step.status}
                        onValueChange={(value) => updateStepStatus(workflow.id, step.id, value as any)}
                      >
                        <SelectTrigger className={getStatusColor(step.status)}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="live">Live</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={step.brief}
                        onChange={(e) => updateStepBrief(workflow.id, step.id, e.target.value)}
                        className="min-h-[60px] text-sm resize-none"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {/* Only show config button for OpenRouter providers */}
                        {step.provider?.join(',')?.toLowerCase()?.includes('openrouter') ? (
                          <Button
                            onClick={() => setConfigStep({ workflowId: workflow.id, stepId: step.id })}
                            variant="ghost"
                            size="sm"
                            title="Configure prompt"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        ) : (
                          <div className="px-5" />
                        )}
                        <Button
                          onClick={() => deleteStep(workflow.id, step.id)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {/* Provider Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Service Providers</CardTitle>
          <CardDescription>External services and APIs used in our workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              'Edge Function',
              'DataForSEO API',
              'Firecrawl',
              'OpenRouter',
              'Supabase',
              'N8N Webhook'
            ].map((provider) => (
              <div key={provider} className="flex items-center gap-2">
                <Badge variant="outline" className={getProviderColor(provider)}>
                  {provider}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Configuration Dialog */}
      {configStep && (
        <Dialog open={!!configStep} onOpenChange={() => setConfigStep(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Configure Prompt</DialogTitle>
            </DialogHeader>
            <StepConfigurationDialog
              workflowId={configStep.workflowId}
              stepId={configStep.stepId}
              workflows={workflows}
              onClose={() => setConfigStep(null)}
              onSave={async (config) => {
                try {
                  // Save only the specific step configuration to database
                  // Note: This will work once the config column is added via migration
                  const { error } = await supabase
                    .from('workflow_steps')
                    .update({ config })
                    .eq('id', configStep.stepId)
                    .eq('workflow_id', configStep.workflowId);

                  if (error) {
                    // If config column doesn't exist yet, show helpful error
                    if (error.message.includes('config') && error.message.includes('column')) {
                      throw new Error('Database migration required: Please run the migration to add the config column to workflow_steps table.');
                    }
                    throw error;
                  }

                  // Update only the specific step in local state
                  setWorkflows(prev => prev.map(workflow => {
                    if (workflow.id !== configStep.workflowId) return workflow;
                    
                    return {
                      ...workflow,
                      steps: workflow.steps.map(step => 
                        step.id === configStep.stepId ? { ...step, config } : step
                      )
                    };
                  }));

                  toast({
                    title: "Prompt configuration saved",
                    description: "Step prompt settings have been updated successfully.",
                  });
                } catch (error) {
                  console.error('Error saving step config:', error);
                  toast({
                    title: "Error",
                    description: "Failed to save prompt configuration.",
                    variant: "destructive",
                  });
                }
                
                setConfigStep(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Step Configuration Dialog Component
interface StepConfigurationDialogProps {
  workflowId: string;
  stepId: string;
  workflows: Workflow[];
  onClose: () => void;
  onSave: (config: Record<string, any>) => void;
}

const StepConfigurationDialog = ({ workflowId, stepId, workflows, onClose, onSave }: StepConfigurationDialogProps) => {
  const workflow = workflows.find(w => w.id === workflowId);
  const step = workflow?.steps.find(s => s.id === stepId);
  
  const [config, setConfig] = useState<Record<string, any>>(step?.config || {});
  
  // Check if this step has predefined config (hardcoded)
  const isPredefinedConfig = step?.config && Object.keys(step.config).length > 0;

  if (!step) return null;

  const handleSave = () => {
    onSave(config);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium">{step.step}</h3>
        <p className="text-sm text-muted-foreground">{step.brief}</p>
        {isPredefinedConfig && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
            <span className="font-semibold">ℹ️ Read-Only:</span> This configuration is managed by the edge function code
          </p>
        )}
      </div>

      <div className="space-y-4">
        {/* System Prompt */}
        <div className="space-y-2">
          <Label>System Prompt</Label>
          <Textarea
            value={config.systemPrompt || ''}
            onChange={(e) => !isPredefinedConfig && setConfig(prev => ({ ...prev, systemPrompt: e.target.value }))}
            placeholder="Enter the system prompt that will guide the AI behavior for this step..."
            rows={4}
            className="font-mono text-sm"
            readOnly={isPredefinedConfig}
          />
          <p className="text-xs text-muted-foreground">
            This prompt defines the AI's role and behavior for this step.
          </p>
        </div>

        {/* User Prompt Template */}
        <div className="space-y-2">
          <Label>User Prompt Template</Label>
          <Textarea
            value={config.userPrompt || ''}
            onChange={(e) => !isPredefinedConfig && setConfig(prev => ({ ...prev, userPrompt: e.target.value }))}
            placeholder="Enter the user prompt template. Use {variable} syntax for dynamic content..."
            rows={10}
            className="font-mono text-sm"
            readOnly={isPredefinedConfig}
          />
          <p className="text-xs text-muted-foreground">
            Use variables like {"{topic}"}, {"{keywords}"}, {"{context}"} for dynamic content.
          </p>
        </div>

        {/* Model Selection for AI providers */}
        {step.provider.includes('OpenRouter') && (
          <div className="space-y-2">
            <Label>AI Model</Label>
            <Select 
              value={config.model || 'anthropic/claude-3.5-sonnet'} 
              onValueChange={(value) => !isPredefinedConfig && setConfig(prev => ({ ...prev, model: value }))}
              disabled={isPredefinedConfig}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                <SelectItem value="anthropic/claude-3.5-haiku">Claude 3.5 Haiku</SelectItem>
                <SelectItem value="anthropic/claude-3-opus">Claude 3 Opus</SelectItem>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                <SelectItem value="llama-3.1-70b-instruct">Llama 3.1 70B</SelectItem>
                <SelectItem value="llama-3.1-8b-instruct">Llama 3.1 8B</SelectItem>
                <SelectItem value="mixtral-8x7b-instruct">Mixtral 8x7B</SelectItem>
                <SelectItem value="mistral-7b-instruct">Mistral 7B</SelectItem>
                <SelectItem value="qwen-72b-instruct">Qwen 72B</SelectItem>
                <SelectItem value="yi-34b-chat">Yi 34B Chat</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose the AI model for this step. Claude models are great for analysis, GPT for general tasks, Gemini for multimodal content.
            </p>
          </div>
        )}

        {/* Temperature Setting */}
        <div className="space-y-2">
          <Label>Temperature</Label>
          <Input
            type="number"
            min="0"
            max="2"
            step="0.1"
            value={config.temperature || 0.7}
            onChange={(e) => !isPredefinedConfig && setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
            placeholder="0.7"
            readOnly={isPredefinedConfig}
          />
          <p className="text-xs text-muted-foreground">
            Controls randomness: 0 = deterministic, 2 = very creative
          </p>
        </div>

        {/* Max Tokens */}
        <div className="space-y-2">
          <Label>Max Tokens</Label>
          <Input
            type="number"
            value={config.maxTokens || 4000}
            onChange={(e) => !isPredefinedConfig && setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
            placeholder="4000"
            readOnly={isPredefinedConfig}
          />
          <p className="text-xs text-muted-foreground">
            Maximum number of tokens to generate
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          {isPredefinedConfig ? 'Close' : 'Cancel'}
        </Button>
        {!isPredefinedConfig && (
          <Button onClick={handleSave}>
            Save Configuration
          </Button>
        )}
      </div>
    </div>
  );
};
