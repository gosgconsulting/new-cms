import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Database, Plus } from 'lucide-react';

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
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Development Projects</CardTitle>
          <CardDescription>Manage your development projects and steps</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Project management features will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
};

const IntegrationsTab: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Active Integrations</CardTitle>
          <CardDescription>List of all connected APIs, services, and database integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-4 flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">PostgreSQL Database</h3>
                  <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-300">
                    Connected
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  Main database for storing project data, user information, and content
                </p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Type: Database</span>
                  <span>Provider: Railway</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/integration-test')}>
              View
            </Button>
          </div>

          <Button variant="outline" className="w-full" size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Add New Integration
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
          <CardTitle>UX/UI Rules</CardTitle>
          <CardDescription>Design system and user experience guidelines</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="text-muted-foreground">Always use design system tokens from index.css and tailwind.config.ts</li>
            <li className="text-muted-foreground">Never use hardcoded colors - use semantic color tokens (bg-surface, text-foreground, etc.)</li>
            <li className="text-muted-foreground">Maintain consistent spacing using system scale (space-xs, space-sm, space-md, etc.)</li>
            <li className="text-muted-foreground">Ensure all interactive elements have proper hover and focus states</li>
            <li className="text-muted-foreground">Keep typography consistent using system classes (text-h1, text-body, etc.)</li>
            <li className="text-muted-foreground">Design mobile-first, then enhance for larger screens</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Development Rules</CardTitle>
          <CardDescription>Code quality and architecture standards</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="text-muted-foreground">Use TypeScript for type safety</li>
            <li className="text-muted-foreground">Create small, focused components instead of large monolithic files</li>
            <li className="text-muted-foreground">Follow React best practices (hooks, functional components)</li>
            <li className="text-muted-foreground">Implement proper error handling and loading states</li>
            <li className="text-muted-foreground">Use Railway PostgreSQL for database operations (no Supabase)</li>
            <li className="text-muted-foreground">Keep API routes in server.js with proper error handling</li>
            <li className="text-muted-foreground">Write clean, self-documenting code with minimal comments</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database Rules</CardTitle>
          <CardDescription>Database design and query standards</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="text-muted-foreground">Use Railway PostgreSQL as primary database</li>
            <li className="text-muted-foreground">All database queries should use parameterized statements to prevent SQL injection</li>
            <li className="text-muted-foreground">Implement proper indexing for frequently queried columns</li>
            <li className="text-muted-foreground">Use transactions for multi-step operations</li>
            <li className="text-muted-foreground">Keep database schema migrations in sparti-cms/db/migrations.sql</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeveloperManager;
