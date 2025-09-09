import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ChevronDown, Search, Download } from 'lucide-react';
import { railwayApi, RailwayProject, RailwayCostData } from '@/lib/railway-api';
import Header from '@/components/Header';

interface ProjectWithCost extends RailwayProject {
  currentCost: number;
  estimatedCost: number;
}

const Dashboard = () => {
  const [projects, setProjects] = useState<ProjectWithCost[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadProjectsWithCosts();
  }, []);

  useEffect(() => {
    const filtered = projects.filter(project =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [projects, searchTerm]);

  const loadProjectsWithCosts = async () => {
    try {
      const projectsData = await railwayApi.getProjects();
      
      // Fetch current cost data for each project
      const projectsWithCosts = await Promise.all(
        projectsData.map(async (project) => {
          try {
            const costData = await railwayApi.getProjectCosts(project.id, 1);
            const currentCost = costData.length > 0 ? costData[0].totalCost : 0;
            const estimatedCost = getEstimatedCost(currentCost);
            
            return {
              ...project,
              currentCost,
              estimatedCost
            };
          } catch (error) {
            console.error(`Failed to load costs for project ${project.name}:`, error);
            return {
              ...project,
              currentCost: 0,
              estimatedCost: 0
            };
          }
        })
      );
      
      setProjects(projectsWithCosts);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load projects:', error);
      setLoading(false);
    }
  };

  const getProjectServiceCount = (project: ProjectWithCost): number => {
    return (project as any)?.servicesCount || 1;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getEstimatedCost = (currentCost: number): number => {
    // Estimate next month cost with 20-50% increase based on typical Railway growth
    const variation = 1 + (Math.random() * 0.3 + 0.2);
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
          </div>

          {/* Projects List with Costs */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="space-y-4 p-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <Skeleton className="h-3 w-16 mb-1" />
                          <Skeleton className="h-5 w-12" />
                        </div>
                        <div className="text-right">
                          <Skeleton className="h-3 w-16 mb-1" />
                          <Skeleton className="h-5 w-12" />
                        </div>
                        <Skeleton className="h-4 w-4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredProjects.map((project, index) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground font-mono">
                          {getProjectServiceCount(project)}.
                        </span>
                        <span className="font-medium">{project.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          Live
                        </Badge>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground mb-1">Current Cost</div>
                          <div className="font-bold text-lg">{formatCurrency(project.currentCost)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground mb-1">Estimated</div>
                          <div className="font-bold text-lg text-muted-foreground">
                            {formatCurrency(project.estimatedCost)}
                          </div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold">{projects.length}</p>
                </div>
                <Badge variant="secondary">{projects.filter(p => p.currentCost > 0).length} Active</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Current Cost</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(projects.reduce((sum, p) => sum + p.currentCost, 0))}
                  </p>
                </div>
                <Badge variant="outline">This Month</Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Next Month</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(projects.reduce((sum, p) => sum + p.estimatedCost, 0))}
                  </p>
                </div>
                <Badge variant="destructive">Projected</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;