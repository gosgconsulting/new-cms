import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ChevronDown, Search, LayoutGrid, List, Download, TrendingUp, Server, Database, Globe } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { railwayApi, RailwayProject, RailwayCostData } from '@/lib/railway-api';
import Header from '@/components/Header';

const Dashboard = () => {
  const [projects, setProjects] = useState<RailwayProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<RailwayProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [costData, setCostData] = useState<RailwayCostData[]>([]);
  const [currentMonth, setCurrentMonth] = useState<RailwayCostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadProjectData();
    }
  }, [selectedProject]);

  useEffect(() => {
    if (costData.length > 0) {
      setCurrentMonth(costData[0]);
    }
  }, [costData]);

  useEffect(() => {
    const filtered = projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [projects, searchTerm]);

  const loadProjects = async () => {
    try {
      const projectsData = await railwayApi.getProjects();
      setProjects(projectsData);
      if (projectsData.length > 0) {
        setSelectedProject(projectsData[0].id);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to load projects:', error);
      setLoading(false);
      // Show error state instead of using mock data
    }
  };

  const loadProjectData = async () => {
    if (!selectedProject) return;
    
    setLoading(true);
    try {
      const costs = await railwayApi.getProjectCosts(selectedProject, 6);
      setCostData(costs);
    } catch (error) {
      console.error('Failed to load project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProjectServiceCount = (projectId: string): number => {
    const project = projects.find(p => p.id === projectId);
    return (project as any)?.servicesCount || 0;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const chartData = costData.map(data => ({
    month: `${data.month.slice(0, 3)} ${data.year}`,
    cost: data.totalCost
  })).reverse();

  const getEstimatedCost = (currentCost: number): number => {
    // Estimate next month cost with 10-30% variation
    const variation = 1 + (Math.random() * 0.2 + 0.1);
    return currentCost * variation;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-32">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Railway Dashboard</h1>
            <p className="text-muted-foreground">Loading your Railway projects...</p>
            <div className="mt-8 space-y-4 max-w-md mx-auto">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-32">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Railway Dashboard</h1>
            <p className="text-muted-foreground mb-4">
              No Railway projects found or unable to connect to Railway API.
            </p>
            <p className="text-sm text-muted-foreground">
              Please ensure your Railway API token is configured correctly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 pt-32 pb-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Railway Dashboard</h1>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200">
              PRO
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Projects Overview */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">{projects.length} Projects</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Projects List */}
          <Card className="mb-6">
            <CardContent className="p-0">
              {loading ? (
                <div className="space-y-4 p-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredProjects.map((project, index) => (
                    <div
                      key={project.id}
                      className={`flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                        selectedProject === project.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedProject(project.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground font-mono">
                          {index}.
                        </span>
                        <span className="font-medium">{project.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {getProjectServiceCount(project.id)} services
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Usage by Project Section */}
        {selectedProject && !loading && currentMonth && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Usage by Project</h2>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {costData.slice(0, 6).map((data, index) => (
                      <div key={`${data.projectId}-${data.month}`} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground font-mono">
                            {index}.
                          </span>
                          <span className="font-medium">
                            {projects.find(p => p.id === data.projectId)?.name || 'Unknown Project'}
                          </span>
                          <span className="text-sm text-muted-foreground">- {data.month}</span>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground mb-1">Current Cost</div>
                            <div className="font-bold text-lg">{formatCurrency(data.totalCost)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground mb-1">Estimated</div>
                            <div className="font-bold text-lg text-muted-foreground">
                              {formatCurrency(getEstimatedCost(data.totalCost))}
                            </div>
                          </div>
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cost Trend Chart */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Cost Trend</CardTitle>
                <CardDescription>
                  Monthly costs for {projects.find(p => p.id === selectedProject)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line 
                        type="monotone" 
                        dataKey="cost" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle>Service Breakdown</CardTitle>
                <CardDescription>
                  Current services for {projects.find(p => p.id === selectedProject)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentMonth.services.map(service => (
                    <Card key={service.serviceId} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-sm">{service.serviceName}</h3>
                        <Badge variant="outline" className="text-xs">
                          {formatCurrency(service.metrics.total)}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Compute:</span>
                          <span>{formatCurrency(service.metrics.compute.cost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Storage:</span>
                          <span>{formatCurrency(service.metrics.storage.cost)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Network:</span>
                          <span>{formatCurrency(service.metrics.network.cost)}</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {!selectedProject && !loading && (
          <Card className="text-center p-8">
            <CardContent>
              <h3 className="text-lg font-semibold mb-2">Select a Project</h3>
              <p className="text-muted-foreground">
                Choose a project from the list above to view its usage and cost details.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;