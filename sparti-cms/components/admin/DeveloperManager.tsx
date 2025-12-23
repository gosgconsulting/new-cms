import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Database, Plus, FolderKanban, Puzzle, FileCode, Code, Globe, Monitor, FileText, Languages } from 'lucide-react';
import { PostgresIntegration, PostgresIntegrationListItem, Tenant } from './PostgresIntegration';
import { ComponentsIntegration, ComponentsIntegrationListItem } from './ComponentsIntegration';
import { AIAssistantIntegration, AIAssistantIntegrationListItem } from './AIAssistantIntegration';
import { useAuth } from '../auth/AuthProvider';

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
  const [activeTab, setActiveTab] = React.useState('projects');

  const tabs = [
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'integrations', label: 'Integrations', icon: Puzzle },
    { id: 'code', label: 'Code', icon: Code },

    { id: 'rules', label: 'Rules', icon: FileCode },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'projects':
        return <ProjectsTab />;
      case 'integrations':
        return <IntegrationsTab />;
      case 'code':
        return <CodeTab />;

      case 'rules':
        return <RulesTab />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    isActive
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
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
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Development Projects</h3>
        <p className="text-sm text-gray-600 mb-6">
          Manage your development projects with tasks and progress tracking
        </p>
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowNewProjectModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
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
  const [showAddIntegration, setShowAddIntegration] = useState(false);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const { currentTenantId } = useAuth();

  // Fetch tenant data when currentTenantId changes
  useEffect(() => {
    const fetchTenantData = async () => {
      if (currentTenantId) {
        try {
          const response = await fetch(`/api/tenants/${currentTenantId}`);
          if (response.ok) {
            const data = await response.json();
            setCurrentTenant(data);
          } else {
            console.error(`Failed to fetch tenant ${currentTenantId}`);
            setCurrentTenant(null);
          }
        } catch (error) {
          console.error('Error fetching tenant data:', error);
          setCurrentTenant(null);
        }
      } else {
        setCurrentTenant(null);
      }
    };

    fetchTenantData();
  }, [currentTenantId]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Integrations</h3>
        <p className="text-sm text-gray-600 mb-6">
          List of all connected APIs, services, and database integrations
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          {/* PostgreSQL Database - Now using the dedicated component */}
          {currentTenant ? (
            <PostgresIntegration 
              tenant={currentTenant}
              onViewClick={() => navigate('/database-viewer')} 
            />
          ) : (
            <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
              <Database className="h-8 w-8 mx-auto mb-2" />
              <p>No tenant selected. Please select a tenant to view database integration.</p>
            </div>
          )}
          
          {/* Components Integration */}
          <ComponentsIntegration
            onViewClick={() => navigate('/components-viewer')}
          />
          
          {/* Google Translation Integration */}
          <GoogleTranslationIntegration />
          
          {/* AI Assistant Integration */}
          <AIAssistantIntegration />

          <Button variant="outline" className="w-full" size="lg" onClick={() => setShowAddIntegration(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Integration
          </Button>
        </CardContent>
      </Card>

      {/* Add Integration Modal Placeholder */}
      {showAddIntegration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Integration</h3>
            <p className="text-sm text-gray-600 mb-4">
              More integrations coming soon! Currently available:
            </p>
            <ul className="text-sm text-gray-600 mb-4 space-y-1">
              {currentTenant ? (
                <PostgresIntegrationListItem tenant={currentTenant} />
              ) : (
                <li>• PostgreSQL Database (No tenant selected)</li>
              )}
              <ComponentsIntegrationListItem />
              <GoogleTranslationIntegrationListItem />
              <AIAssistantIntegrationListItem />
              <li>• Google APIs (Available in Integration Test)</li>
              <li>• OpenRouter AI (Available in Integration Test)</li>
            </ul>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowAddIntegration(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CodeTab: React.FC = () => {
  const [customCode, setCustomCode] = React.useState({
    head: '',
    body: '',
    gtmId: '',
    gaId: '',
    gscVerification: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setCustomCode(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Code & Analytics</h3>
        <p className="text-sm text-gray-600 mb-6">
          Add custom code and configure analytics services.
        </p>
      </div>
      
      {/* Custom Code Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="mb-6">
          <h4 className="text-base font-semibold text-gray-900 flex items-center">
            <Code className="h-5 w-5 mr-2" />
            Custom Code
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Add custom HTML, CSS, or JavaScript to your site
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Head Section */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Head Section
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Code added here will be inserted in the &lt;head&gt; section of your site
            </p>
            <textarea
              value={customCode.head}
              onChange={(e) => handleInputChange('head', e.target.value)}
              placeholder={`<!-- Add your custom head code here -->
<meta name='custom-meta' content='value'>
<link rel='stylesheet' href='custom.css'>
<script>
  // Custom JavaScript
</script>`}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm resize-none"
            />
          </div>
          
          {/* Body Section */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Body Section
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Code added here will be inserted before the closing &lt;/body&gt; tag
            </p>
            <textarea
              value={customCode.body}
              onChange={(e) => handleInputChange('body', e.target.value)}
              placeholder={`<!-- Add your custom body code here -->
<script>
  // Analytics or tracking code
  console.log('Custom body script loaded');
</script>`}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm resize-none"
            />
          </div>
        </div>
      </div>
      
      {/* Google Services Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="mb-6">
          <h4 className="text-base font-semibold text-gray-900 flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Google Services
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Configure Google analytics and tracking services
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Google Tag Manager */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Code className="h-4 w-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-gray-900 mb-2">Google Tag Manager</h5>
                <p className="text-sm text-gray-600 mb-3">
                  Manage all your marketing and analytics tags in one place
                </p>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700">
                    Container ID (GTM-XXXXXXX)
                  </label>
                  <input
                    type="text"
                    value={customCode.gtmId}
                    onChange={(e) => handleInputChange('gtmId', e.target.value)}
                    placeholder="GTM-XXXXXXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Google Analytics */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Globe className="h-4 w-4 text-green-600" />
                </div>
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-gray-900 mb-2">Google Analytics</h5>
                <p className="text-sm text-gray-600 mb-3">
                  Track website traffic and user behavior
                </p>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700">
                    Measurement ID (G-XXXXXXXXXX)
                  </label>
                  <input
                    type="text"
                    value={customCode.gaId}
                    onChange={(e) => handleInputChange('gaId', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Google Search Console */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Monitor className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
              <div className="flex-1">
                <h5 className="font-medium text-gray-900 mb-2">Google Search Console</h5>
                <p className="text-sm text-gray-600 mb-3">
                  Verify your site ownership for Search Console
                </p>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700">
                    Verification Meta Tag Content
                  </label>
                  <input
                    type="text"
                    value={customCode.gscVerification}
                    onChange={(e) => handleInputChange('gscVerification', e.target.value)}
                    placeholder="Enter the content value from the meta tag"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    Copy only the content value from: &lt;meta name="google-site-verification" content="<strong>this_part</strong>" /&gt;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-purple-600 hover:bg-purple-700">
          Save Changes
        </Button>
      </div>
    </div>
  );
};

const RobotsTxtTab: React.FC = () => {
  const [robotsTxt, setRobotsTxt] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [lastSaved, setLastSaved] = React.useState<string>('');

  React.useEffect(() => {
    loadRobotsTxt();
  }, []);

  const loadRobotsTxt = async () => {
    try {
      const response = await fetch('/robots.txt');
      if (response.ok) {
        const content = await response.text();
        setRobotsTxt(content);
      }
    } catch (error) {
      console.error('Error loading robots.txt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real implementation, this would save to the server
      // For now, we'll just simulate a save
      await new Promise(resolve => setTimeout(resolve, 500));
      setLastSaved(new Date().toLocaleTimeString());
      console.log('Robots.txt saved:', robotsTxt);
    } catch (error) {
      console.error('Error saving robots.txt:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Robots.txt Configuration</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure how search engines crawl your website. The robots.txt file tells search engine crawlers which pages they can or can't request from your site.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>robots.txt Content</CardTitle>
              <CardDescription>Edit your site's robots.txt file</CardDescription>
            </div>
            {lastSaved && (
              <span className="text-xs text-muted-foreground">
                Last saved: {lastSaved}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
          ) : (
            <>
              <div className="bg-muted/50 rounded-lg p-4 border">
                <textarea
                  value={robotsTxt}
                  onChange={(e) => setRobotsTxt(e.target.value)}
                  className="w-full h-96 font-mono text-sm bg-transparent border-none focus:outline-none resize-none"
                  placeholder="User-agent: *&#10;Allow: /"
                />
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  <p>Current URL: <span className="font-mono">{window.location.origin}/robots.txt</span></p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={loadRobotsTxt}>
                    Reset
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Common Directives</CardTitle>
          <CardDescription>Quick reference for robots.txt syntax</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">User-agent</h4>
              <p className="text-sm text-muted-foreground mb-2">Specifies which crawler the rules apply to</p>
              <code className="text-xs bg-background px-2 py-1 rounded">User-agent: Googlebot</code>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Allow</h4>
              <p className="text-sm text-muted-foreground mb-2">Allows crawlers to access specific paths</p>
              <code className="text-xs bg-background px-2 py-1 rounded">Allow: /public/</code>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Disallow</h4>
              <p className="text-sm text-muted-foreground mb-2">Blocks crawlers from accessing specific paths</p>
              <code className="text-xs bg-background px-2 py-1 rounded">Disallow: /admin/</code>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">Sitemap</h4>
              <p className="text-sm text-muted-foreground mb-2">Points to your sitemap location</p>
              <code className="text-xs bg-background px-2 py-1 rounded">Sitemap: https://example.com/sitemap.xml</code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const RulesTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Development & Design Rules</h3>
        <p className="text-sm text-gray-600 mb-6">
          Follow these guidelines to maintain code quality, design consistency, and best practices
        </p>
      </div>

      {/* UX/UI Rules */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-base font-semibold text-gray-900 mb-4">UX/UI Rules</h4>
        <p className="text-sm text-gray-600 mb-4">Design system and user experience guidelines</p>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <ul className="space-y-2 text-sm">
            <li className="text-gray-700">• Always use design system tokens from index.css and tailwind.config.ts</li>
            <li className="text-gray-700">• Never use hardcoded colors - use semantic color tokens (bg-surface, text-foreground, etc.)</li>
            <li className="text-gray-700">• Maintain consistent spacing using system scale (space-xs, space-sm, space-md, etc.)</li>
            <li className="text-gray-700">• Ensure all interactive elements have proper hover and focus states</li>
            <li className="text-gray-700">• Keep typography consistent using system classes (text-h1, text-body, etc.)</li>
            <li className="text-gray-700">• Design mobile-first, then enhance for larger screens</li>
          </ul>
        </div>
      </div>

      {/* Development Rules */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-base font-semibold text-gray-900 mb-4">Development Rules</h4>
        <p className="text-sm text-gray-600 mb-4">Code quality and architecture standards</p>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <ul className="space-y-2 text-sm">
            <li className="text-gray-700">• Use TypeScript for type safety</li>
            <li className="text-gray-700">• Create small, focused components instead of large monolithic files</li>
            <li className="text-gray-700">• Follow React best practices (hooks, functional components)</li>
            <li className="text-gray-700">• Implement proper error handling and loading states</li>
            <li className="text-gray-700">• Use Railway PostgreSQL for database operations</li>
            <li className="text-gray-700">• Keep API routes in server.js with proper error handling</li>
            <li className="text-gray-700">• Write clean, self-documenting code with minimal comments</li>
          </ul>
        </div>
      </div>

      {/* Database Rules */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h4 className="text-base font-semibold text-gray-900 mb-4">Database Rules</h4>
        <p className="text-sm text-gray-600 mb-4">Database design and query standards</p>
        
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <ul className="space-y-2 text-sm">
            <li className="text-gray-700">• Use Railway PostgreSQL as primary database</li>
            <li className="text-gray-700">• All database queries should use parameterized statements to prevent SQL injection</li>
            <li className="text-gray-700">• Implement proper indexing for frequently queried columns</li>
            <li className="text-gray-700">• Use transactions for multi-step operations</li>
            <li className="text-gray-700">• Keep database schema migrations in sparti-cms/db/migrations.sql</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Google Translation Integration Component
export const GoogleTranslationIntegration: React.FC = () => {
  // Check if the API key exists in environment variables
  // @ts-ignore - Vite environment variables
  const apiKeyExists = Boolean(import.meta.env?.VITE_GOOGLE_CLOUD_TRANSLATION_API_KEY);
  
  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Languages className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Google Translation API</h3>
            <Badge className={apiKeyExists ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
              {apiKeyExists ? "Active" : "Inactive"}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-600 mt-1 mb-3">
            Integrate Google's Translation API for multilingual content support
          </p>
          
          
          <div className="mt-4 text-xs text-gray-500">
            <p>{apiKeyExists 
              ? "Using API key from environment variables for security" 
              : "Add VITE_GOOGLE_CLOUD_TRANSLATION_API_KEY to your environment variables to activate"
            }</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Google Translation List Item Component
export const GoogleTranslationIntegrationListItem: React.FC = () => {
  return (
    <li className="flex items-center space-x-2">
      <Languages className="h-4 w-4 text-blue-600" />
      <span>• Google Translation API (Multilingual content support)</span>
    </li>
  );
};

export default DeveloperManager;

