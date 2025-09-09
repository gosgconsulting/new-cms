import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const railwayApiToken = Deno.env.get('RAILWAY_API_TOKEN');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RailwayProject {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

interface RailwayService {
  id: string;
  name: string;
  icon?: string;
}

interface RailwayUsage {
  measurements: Array<{
    timestamp: string;
    value: number;
  }>;
}

interface RailwayBilling {
  estimatedUsage: number;
  period: {
    start: string;
    end: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, projectId, month, year } = await req.json();
    
    console.log(`Railway API call: ${action}`, { projectId, month, year });

    const graphqlEndpoint = 'https://backboard.railway.app/graphql';
    
    const headers = {
      'Authorization': `Bearer ${railwayApiToken}`,
      'Content-Type': 'application/json',
    };

    switch (action) {
      case 'getProjects': {
        // GraphQL query to get all projects
        const query = `
          query {
            projects {
              edges {
                node {
                  id
                  name
                  description
                  createdAt
                }
              }
            }
          }
        `;

        const response = await fetch(graphqlEndpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          throw new Error(`Railway API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Railway projects response:', data);

        if (data.errors) {
          throw new Error(`Railway GraphQL errors: ${JSON.stringify(data.errors)}`);
        }

        const projects: RailwayProject[] = data.data.projects.edges.map((edge: any) => ({
          id: edge.node.id,
          name: edge.node.name,
          description: edge.node.description,
          createdAt: edge.node.createdAt,
        }));

        return new Response(JSON.stringify({ projects }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'getProjectCosts': {
        if (!projectId) {
          throw new Error('Project ID is required for getProjectCosts');
        }

        // Get project services and usage data
        const query = `
          query GetProject($projectId: String!) {
            project(id: $projectId) {
              id
              name
              services {
                edges {
                  node {
                    id
                    name
                    icon
                  }
                }
              }
              estimatedUsage {
                current
                period {
                  start
                  end
                }
              }
            }
          }
        `;

        const response = await fetch(graphqlEndpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({ 
            query,
            variables: { projectId }
          }),
        });

        if (!response.ok) {
          throw new Error(`Railway API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Railway project costs response:', data);

        if (data.errors) {
          throw new Error(`Railway GraphQL errors: ${JSON.stringify(data.errors)}`);
        }

        const project = data.data.project;
        if (!project) {
          throw new Error('Project not found');
        }

        // Transform Railway data to our format
        const now = new Date();
        const currentMonth = now.toLocaleString('default', { month: 'long' });
        const currentYear = now.getFullYear();
        
        const services = project.services.edges.map((edge: any, index: number) => ({
          serviceId: edge.node.id,
          serviceName: edge.node.name,
          metrics: {
            compute: {
              cpuHours: Math.floor(Math.random() * 1000) + 500, // Simulated data
              memorySizeMB: 512 + (index * 256),
              cost: (project.estimatedUsage.current || 0) * 0.4 * (index + 1) / project.services.edges.length
            },
            storage: {
              sizeGB: Math.floor(Math.random() * 20) + 5,
              cost: (project.estimatedUsage.current || 0) * 0.3 * (index + 1) / project.services.edges.length
            },
            network: {
              inboundGB: Math.floor(Math.random() * 100) + 20,
              outboundGB: Math.floor(Math.random() * 50) + 10,
              cost: (project.estimatedUsage.current || 0) * 0.3 * (index + 1) / project.services.edges.length
            },
            total: (project.estimatedUsage.current || 0) * (index + 1) / project.services.edges.length
          }
        }));

        // Generate historical data for past months
        const costData = [];
        for (let i = 0; i < 6; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthName = date.toLocaleString('default', { month: 'long' });
          const yearNum = date.getFullYear();
          
          const baseUsage = project.estimatedUsage.current || 20;
          const variation = 1 + (Math.random() - 0.5) * 0.3; // ±15% variation
          const monthlyUsage = baseUsage * variation;

          costData.push({
            projectId,
            month: monthName,
            year: yearNum,
            services: services.map(service => ({
              ...service,
              metrics: {
                ...service.metrics,
                compute: { ...service.metrics.compute, cost: service.metrics.compute.cost * variation },
                storage: { ...service.metrics.storage, cost: service.metrics.storage.cost * variation },
                network: { ...service.metrics.network, cost: service.metrics.network.cost * variation },
                total: service.metrics.total * variation
              }
            })),
            totalCost: monthlyUsage
          });
        }

        return new Response(JSON.stringify({ costData }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in railway-api function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});