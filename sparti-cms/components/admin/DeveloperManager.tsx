import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

  const deleteProject = (projectId: number) => {
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const updateStepField = (projectId: number, stepIndex: number, field: 'step' | 'brief' | 'status', value: string) => {
    setProjects(projects.map(project => {
      if (project.id === projectId) {
        const updatedSteps = [...project.steps];
        updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], [field]: value };
        return { ...project, steps: updatedSteps };
      }
      return project;
    }));
  };

  return (
    <div className="space-y-6">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl text-primary">{project.name}</CardTitle>
              <CardDescription className="mt-1">{project.description}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                New Step
              </Button>
              <Button size="sm" variant="destructive" onClick={() => deleteProject(project.id)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Project
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Step</TableHead>
                  <TableHead className="w-[40%]">Brief</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {project.steps.map((step, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                    </TableCell>
                    <TableCell className="font-medium">
                      <Input
                        value={step.step}
                        onChange={(e) => updateStepField(project.id, index, 'step', e.target.value)}
                        className="border-0 focus-visible:ring-0 px-0"
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <Input
                        value={step.brief}
                        onChange={(e) => updateStepField(project.id, index, 'brief', e.target.value)}
                        className="border-0 focus-visible:ring-0 px-0"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={step.status}
                        onValueChange={(value) => updateStepField(project.id, index, 'status', value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Not started">Not started</SelectItem>
                          <SelectItem value="In progress">In progress</SelectItem>
                          <SelectItem value="Live">Live</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      <Button className="w-full" variant="outline">
        <Plus className="h-4 w-4 mr-2" />
        Add New Project
      </Button>
    </div>
  );
};

const IntegrationsTab: React.FC = () => {
  const integrations = [
    {
      name: 'PostgreSQL Database',
      type: 'Database',
      status: 'Connected',
      provider: 'Railway',
      description: 'Main database for storing project data, user information, and content'
    },
    {
      name: 'DataForSEO API',
      type: 'API',
      status: 'Active',
      provider: 'DataForSEO',
      description: 'API for keyword research, search volume, and SEO metrics'
    },
    {
      name: 'Firecrawl API',
      type: 'API',
      status: 'Active',
      provider: 'Firecrawl',
      description: 'Web scraping API for content research and topic analysis'
    }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Active Integrations</CardTitle>
          <CardDescription>List of all connected APIs, services, and database integrations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration, index) => (
              <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{integration.name}</h3>
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      {integration.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{integration.description}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Type: {integration.type}</span>
                    <span>Provider: {integration.provider}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" variant="outline">
        <Plus className="h-4 w-4 mr-2" />
        Add New Integration
      </Button>
    </div>
  );
};

const RulesTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>UX/UI Rules</CardTitle>
          <CardDescription>Design system and user experience guidelines</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Always use design system tokens from index.css and tailwind.config.ts</li>
            <li>Never use hardcoded colors - use semantic color tokens (bg-surface, text-foreground, etc.)</li>
            <li>Maintain consistent spacing using system scale (space-xs, space-sm, space-md, etc.)</li>
            <li>Ensure all interactive elements have proper hover and focus states</li>
            <li>Keep typography consistent using system classes (text-h1, text-body, etc.)</li>
            <li>Design mobile-first, then enhance for larger screens</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Development Rules</CardTitle>
          <CardDescription>Code quality and architecture standards</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Use TypeScript for type safety</li>
            <li>Create small, focused components instead of large monolithic files</li>
            <li>Follow React best practices (hooks, functional components)</li>
            <li>Implement proper error handling and loading states</li>
            <li>Use Railway PostgreSQL for database operations (no Supabase)</li>
            <li>Keep API routes in server.js with proper error handling</li>
            <li>Write clean, self-documenting code with minimal comments</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Rules</CardTitle>
          <CardDescription>Database design and query standards</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Use Railway PostgreSQL as primary database</li>
            <li>All database queries should use parameterized statements to prevent SQL injection</li>
            <li>Implement proper indexing for frequently queried columns</li>
            <li>Use transactions for multi-step operations</li>
            <li>Keep database schema migrations in sparti-cms/db/migrations.sql</li>
          </ul>
        </CardContent>
      </Card>

      <Button className="w-full" variant="outline">
        <Plus className="h-4 w-4 mr-2" />
        Add New Rule Section
      </Button>
    </div>
  );
};

export default DeveloperManager;
