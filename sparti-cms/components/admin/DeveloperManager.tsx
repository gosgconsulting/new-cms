import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

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
