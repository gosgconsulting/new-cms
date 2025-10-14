import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const DeveloperManager: React.FC = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="projects" className="w-full">
        <TabsList>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6 mt-6">
          <ProjectsTab />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6 mt-6">
          <IntegrationsTab />
        </TabsContent>

        <TabsContent value="rules" className="space-y-6 mt-6">
          <RulesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ProjectsTab: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [steps, setSteps] = useState<any[]>([]);
  const [newStep, setNewStep] = useState({ step_title: '', brief: '' });

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadSteps(selectedProject);
    }
  }, [selectedProject]);

  const loadProjects = async () => {
    const { data, error } = await supabase
      .from('dev_projects')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Failed to load projects');
      return;
    }
    setProjects(data || []);
  };

  const loadSteps = async (projectId: string) => {
    const { data, error } = await supabase
      .from('dev_project_steps')
      .select('*')
      .eq('project_id', projectId)
      .order('sort_order', { ascending: true });
    
    if (error) {
      toast.error('Failed to load steps');
      return;
    }
    setSteps(data || []);
  };

  const createProject = async () => {
    if (!newProject.name) {
      toast.error('Project name is required');
      return;
    }

    const { data, error } = await supabase
      .from('dev_projects')
      .insert([newProject])
      .select()
      .single();

    if (error) {
      toast.error('Failed to create project');
      return;
    }

    toast.success('Project created');
    setNewProject({ name: '', description: '' });
    loadProjects();
  };

  const deleteProject = async (id: string) => {
    const { error } = await supabase
      .from('dev_projects')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete project');
      return;
    }

    toast.success('Project deleted');
    if (selectedProject === id) {
      setSelectedProject(null);
      setSteps([]);
    }
    loadProjects();
  };

  const addStep = async () => {
    if (!selectedProject || !newStep.step_title) {
      toast.error('Step title is required');
      return;
    }

    const { data, error } = await supabase
      .from('dev_project_steps')
      .insert([{
        project_id: selectedProject,
        ...newStep,
        sort_order: steps.length
      }])
      .select()
      .single();

    if (error) {
      toast.error('Failed to add step');
      return;
    }

    toast.success('Step added');
    setNewStep({ step_title: '', brief: '' });
    loadSteps(selectedProject);
  };

  const deleteStep = async (id: string) => {
    const { error } = await supabase
      .from('dev_project_steps')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('Failed to delete step');
      return;
    }

    toast.success('Step deleted');
    if (selectedProject) {
      loadSteps(selectedProject);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
          <CardDescription>Add a new development project</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Project Name"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
          />
          <Textarea
            placeholder="Project Description"
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
          />
          <Button onClick={createProject}>
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>Your development projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedProject === project.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedProject(project.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProject(project.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
            {projects.length === 0 && (
              <p className="text-muted-foreground text-center py-8">No projects yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Steps</CardTitle>
            <CardDescription>
              {selectedProject ? 'Manage steps for selected project' : 'Select a project to view steps'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedProject ? (
              <>
                <div className="space-y-3">
                  <Input
                    placeholder="Step Title"
                    value={newStep.step_title}
                    onChange={(e) => setNewStep({ ...newStep, step_title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Brief"
                    value={newStep.brief}
                    onChange={(e) => setNewStep({ ...newStep, brief: e.target.value })}
                  />
                  <Button onClick={addStep} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Step
                  </Button>
                </div>

                <div className="space-y-2 mt-4">
                  {steps.map((step) => (
                    <div key={step.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{step.step_title}</h4>
                          {step.brief && (
                            <p className="text-xs text-muted-foreground mt-1">{step.brief}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">Status: {step.status}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteStep(step.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {steps.length === 0 && (
                    <p className="text-muted-foreground text-center py-4 text-sm">No steps yet</p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground text-center py-8">Select a project to manage steps</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const IntegrationsTab: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integration Testing</CardTitle>
          <CardDescription>Test and manage your integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/integration-test')}>
            Open Integration Test Page
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const RulesTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Development Rules</CardTitle>
          <CardDescription>Configure development rules and guidelines</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Development rules configuration will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeveloperManager;
