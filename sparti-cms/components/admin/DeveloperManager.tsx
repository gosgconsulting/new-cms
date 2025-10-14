import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Database, Plus } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category?: string;
  start_date?: string;
  end_date?: string;
  total_steps?: number;
  completion_percentage?: number;
}

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
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showNewProjectModal, setShowNewProjectModal] = React.useState(false);

  React.useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      console.log('[testing] Loading projects...');
      const response = await fetch('/api/projects');
      if (response.ok) {
        const projectsData = await response.json();
        setProjects(projectsData);
        console.log('[testing] Projects loaded:', projectsData);
      } else {
        console.error('[testing] Failed to load projects');
      }
    } catch (error) {
      console.error('[testing] Error loading projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Development Projects</CardTitle>
              <CardDescription>Manage your development projects with tasks and progress tracking</CardDescription>
            </div>
            <Button onClick={() => setShowNewProjectModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h3>
              <p className="text-gray-600 mb-4">Create your first development project to get started.</p>
              <Button onClick={() => setShowNewProjectModal(true)}>
                Create Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-gray-900 truncate">{project.title}</h3>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className={getPriorityColor(project.priority)}>
                      {project.priority} priority
                    </span>
                    <span>{project.total_steps || 0} tasks</span>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{project.completion_percentage || 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${project.completion_percentage || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm">
                      View Tasks
                    </Button>
                    <div className="flex items-center space-x-1">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <NewProjectModal 
          onClose={() => setShowNewProjectModal(false)}
          onSave={() => {
            loadProjects();
            setShowNewProjectModal(false);
          }}
        />
      )}
    </div>
  );
};

const NewProjectModal: React.FC<{ onClose: () => void; onSave: () => void }> = ({ onClose, onSave }) => {
  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    start_date: '',
    end_date: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('[testing] Creating new project:', formData);
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('[testing] Project created successfully');
        onSave();
      } else {
        console.error('[testing] Failed to create project');
      }
    } catch (error) {
      console.error('[testing] Error creating project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Project</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter project title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Project description..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. Web Development"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </form>
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
                         <Button variant="outline" size="sm" onClick={() => navigate('/database-viewer')}>
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
