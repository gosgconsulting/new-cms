import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Download, TrendingUp, Server, Database, Globe } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { railwayApi, RailwayProject, RailwayCostData } from '@/lib/railway-api';
import Header from '@/components/Header';

const Dashboard = () => {
  const [projects, setProjects] = useState<RailwayProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [costData, setCostData] = useState<RailwayCostData[]>([]);
  const [currentMonth, setCurrentMonth] = useState<RailwayCostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);

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
      setCurrentMonth(costData[selectedMonthIndex] || costData[0]);
    }
  }, [costData, selectedMonthIndex]);

  const loadProjects = async () => {
    try {
      const projectsData = await railwayApi.getProjects();
      setProjects(projectsData);
      if (projectsData.length > 0) {
        setSelectedProject(projectsData[0].id);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadProjectData = async () => {
    if (!selectedProject) return;
    
    setLoading(true);
    try {
      const costs = await railwayApi.getProjectCosts(selectedProject, 6);
      setCostData(costs);
      setSelectedMonthIndex(0);
    } catch (error) {
      console.error('Failed to load project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && selectedMonthIndex < costData.length - 1) {
      setSelectedMonthIndex(selectedMonthIndex + 1);
    } else if (direction === 'next' && selectedMonthIndex > 0) {
      setSelectedMonthIndex(selectedMonthIndex - 1);
    }
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

  const serviceBreakdown = currentMonth?.services.map(service => ({
    name: service.serviceName,
    compute: service.metrics.compute.cost,
    storage: service.metrics.storage.cost,
    network: service.metrics.network.cost,
    total: service.metrics.total
  })) || [];

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-32">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Railway Client Dashboard</h1>
            <p className="text-muted-foreground">Loading your projects...</p>
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Railway Dashboard</h1>
            <p className="text-muted-foreground">Monitor your hosting costs and usage</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Monthly Navigation */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  disabled={selectedMonthIndex >= costData.length - 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-xl font-semibold">
                  {currentMonth ? `${currentMonth.month} ${currentMonth.year}` : 'No data'}
                </h2>
                <Button
                  variant="outline" 
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  disabled={selectedMonthIndex <= 0}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              <Badge variant="secondary" className="text-sm">
                Current Month
              </Badge>
            </div>

            {/* Cost Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Cost</CardDescription>
                  <CardTitle className="text-2xl text-primary">
                    {formatCurrency(currentMonth?.totalCost || 0)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-green-600">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {costData.length > 1 && costData[1] ? 
                      `${((currentMonth?.totalCost || 0) - costData[1].totalCost).toFixed(2)} vs last month` : 
                      'No comparison data'
                    }
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Compute</CardDescription>
                  <CardTitle className="text-2xl">
                    {formatCurrency(
                      currentMonth?.services.reduce((sum, s) => sum + s.metrics.compute.cost, 0) || 0
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Server className="w-4 h-4 mr-1" />
                    {currentMonth?.services.reduce((sum, s) => sum + s.metrics.compute.cpuHours, 0) || 0} CPU hours
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Storage</CardDescription>
                  <CardTitle className="text-2xl">
                    {formatCurrency(
                      currentMonth?.services.reduce((sum, s) => sum + s.metrics.storage.cost, 0) || 0
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Database className="w-4 h-4 mr-1" />
                    {currentMonth?.services.reduce((sum, s) => sum + s.metrics.storage.sizeGB, 0) || 0} GB
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Network</CardDescription>
                  <CardTitle className="text-2xl">
                    {formatCurrency(
                      currentMonth?.services.reduce((sum, s) => sum + s.metrics.network.cost, 0) || 0
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Globe className="w-4 h-4 mr-1" />
                    {currentMonth?.services.reduce((sum, s) => sum + s.metrics.network.outboundGB, 0) || 0} GB out
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Cost Trend</CardTitle>
                  <CardDescription>Last 6 months spending</CardDescription>
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

              {/* Service Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Service Breakdown</CardTitle>
                  <CardDescription>Current month costs by service</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={serviceBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis tickFormatter={(value) => `$${value}`} />
                        <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                        <Bar dataKey="compute" stackId="a" fill="hsl(var(--primary))" />
                        <Bar dataKey="storage" stackId="a" fill="hsl(var(--secondary))" />
                        <Bar dataKey="network" stackId="a" fill="hsl(var(--accent))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Service Details */}
            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
                <CardDescription>Detailed breakdown for {currentMonth?.month} {currentMonth?.year}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentMonth?.services.map(service => (
                    <div key={service.serviceId} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold">{service.serviceName}</h3>
                        <Badge variant="outline">{formatCurrency(service.metrics.total)}</Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Compute</p>
                          <p className="font-medium">{formatCurrency(service.metrics.compute.cost)}</p>
                          <p className="text-xs text-muted-foreground">{service.metrics.compute.cpuHours}h CPU</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Storage</p>
                          <p className="font-medium">{formatCurrency(service.metrics.storage.cost)}</p>
                          <p className="text-xs text-muted-foreground">{service.metrics.storage.sizeGB} GB</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Network</p>
                          <p className="font-medium">{formatCurrency(service.metrics.network.cost)}</p>
                          <p className="text-xs text-muted-foreground">
                            {service.metrics.network.inboundGB}GB in / {service.metrics.network.outboundGB}GB out
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;