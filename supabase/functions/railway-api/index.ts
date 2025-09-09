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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, projectId, months = 6 } = await req.json();
    
    console.log(`Railway API call: ${action}`, { projectId, months, tokenPresent: !!railwayApiToken });

    if (!railwayApiToken) {
      throw new Error('Railway API token not configured');
    }

    const headers = {
      'Authorization': `Bearer ${railwayApiToken}`,
      'Content-Type': 'application/json',
    };

    switch (action) {
      case 'getProjects': {
        console.log('Attempting to fetch projects from Railway API...');
        
        // Try multiple API endpoints that Railway might use
        const endpoints = [
          'https://backboard.railway.app/v2/projects',
          'https://api.railway.app/v2/projects',
          'https://backboard.railway.app/projects',
          'https://api.railway.app/projects'
        ];

        let lastError = null;
        
        for (const endpoint of endpoints) {
          try {
            console.log(`Trying endpoint: ${endpoint}`);
            
            const response = await fetch(endpoint, {
              method: 'GET',
              headers,
            });

            console.log(`Response from ${endpoint}:`, {
              status: response.status,
              statusText: response.statusText,
              headers: Object.fromEntries(response.headers.entries())
            });

            if (response.ok) {
              const projects = await response.json();
              console.log('Successfully fetched projects:', projects);

              // Handle different response formats
              let transformedProjects = [];
              if (Array.isArray(projects)) {
                transformedProjects = projects.map((project: any) => ({
                  id: project.id,
                  name: project.name || project.title || `Project ${project.id}`,
                  description: project.description || '',
                  createdAt: project.createdAt || project.created_at || new Date().toISOString(),
                }));
              } else if (projects.data && Array.isArray(projects.data)) {
                transformedProjects = projects.data.map((project: any) => ({
                  id: project.id,
                  name: project.name || project.title || `Project ${project.id}`,
                  description: project.description || '',
                  createdAt: project.createdAt || project.created_at || new Date().toISOString(),
                }));
              } else if (projects.projects && Array.isArray(projects.projects)) {
                transformedProjects = projects.projects.map((project: any) => ({
                  id: project.id,
                  name: project.name || project.title || `Project ${project.id}`,
                  description: project.description || '',
                  createdAt: project.createdAt || project.created_at || new Date().toISOString(),
                }));
              }

              return new Response(JSON.stringify({ projects: transformedProjects }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            } else {
              const errorText = await response.text();
              lastError = `${endpoint} returned ${response.status}: ${errorText}`;
              console.error(`Failed ${endpoint}:`, lastError);
            }
          } catch (err) {
            lastError = `Error with ${endpoint}: ${err.message}`;
            console.error(lastError);
          }
        }

        // If all endpoints failed, try GraphQL as fallback
        try {
          console.log('Trying GraphQL endpoint as fallback...');
          const graphqlQuery = {
            query: `
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
            `
          };

          const response = await fetch('https://backboard.railway.app/graphql', {
            method: 'POST',
            headers,
            body: JSON.stringify(graphqlQuery),
          });

          console.log('GraphQL response:', response.status, response.statusText);

          if (response.ok) {
            const data = await response.json();
            console.log('GraphQL response data:', data);

            if (data.data && data.data.projects && data.data.projects.edges) {
              const transformedProjects = data.data.projects.edges.map((edge: any) => ({
                id: edge.node.id,
                name: edge.node.name,
                description: edge.node.description || '',
                createdAt: edge.node.createdAt,
              }));

              return new Response(JSON.stringify({ projects: transformedProjects }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              });
            }
          } else {
            const errorText = await response.text();
            console.error('GraphQL failed:', errorText);
          }
        } catch (err) {
          console.error('GraphQL error:', err.message);
        }

        throw new Error(`All Railway API endpoints failed. Last error: ${lastError}`);
      }

      case 'getProjectCosts': {
        if (!projectId) {
          throw new Error('Project ID is required for getProjectCosts');
        }

        console.log(`Fetching costs for project: ${projectId}`);

        // Generate mock cost data based on the real project
        const now = new Date();
        const costData = [];

        for (let i = 0; i < months; i++) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthName = date.toLocaleString('default', { month: 'long' });
          const yearNum = date.getFullYear();

          const baseUsage = 15 + Math.random() * 25; // $15-40 range
          const variation = 1 + (Math.random() - 0.5) * 0.3; // ±15% variation
          const monthlyUsage = baseUsage * variation;

          // Mock services for the project
          const serviceMetrics = [
            {
              serviceId: `${projectId}-web`,
              serviceName: 'Web Service',
              metrics: {
                compute: { cpuHours: 720, memorySizeMB: 512, cost: monthlyUsage * 0.6 },
                storage: { sizeGB: 10, cost: monthlyUsage * 0.2 },
                network: { inboundGB: 50, outboundGB: 25, cost: monthlyUsage * 0.2 },
                total: monthlyUsage
              }
            }
          ];

          costData.push({
            projectId,
            month: monthName,
            year: yearNum,
            services: serviceMetrics,
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
      details: error.stack,
      tokenPresent: !!railwayApiToken
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});