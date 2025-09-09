export interface RailwayProject {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface RailwayService {
  id: string;
  name: string;
  projectId: string;
}

export interface RailwayUsageMetrics {
  compute: {
    cpuHours: number;
    memorySizeMB: number;
    cost: number;
  };
  storage: {
    sizeGB: number;
    cost: number;
  };
  network: {
    inboundGB: number;
    outboundGB: number;
    cost: number;
  };
  total: number;
}

export interface RailwayCostData {
  projectId: string;
  month: string;
  year: number;
  services: Array<{
    serviceId: string;
    serviceName: string;
    metrics: RailwayUsageMetrics;
  }>;
  totalCost: number;
}

// Mock data for development - fallback only if API fails
const mockProjects: RailwayProject[] = [
  {
    id: "proj_fallback_1",
    name: "Fallback Project 1",
    description: "API connection failed - using fallback data",
    createdAt: "2024-01-15T10:00:00Z"
  }
];

const mockCostData: { [key: string]: RailwayCostData[] } = {};

export class RailwayAPI {
  private supabaseUrl: string;
  private supabaseAnonKey: string;

  constructor() {
    this.supabaseUrl = 'https://eajxlakosmxdjyjczdwq.supabase.co';
    this.supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhanhsYWtvc214ZGp5amN6ZHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2NDY1MjAsImV4cCI6MjA2ODIyMjUyMH0.eTAy9aR6qD7OfnM-tM2w4XWGM4U0eMdog4rjyXnx76g';
  }

  async getProjects(): Promise<RailwayProject[]> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/railway-api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
        },
        body: JSON.stringify({ action: 'getProjects' }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      return data.projects || [];
    } catch (error) {
      console.error('Failed to fetch projects from Railway API:', error);
      throw error; // Don't fallback to mock data, let the UI handle the error
    }
  }

  async getProjectCosts(projectId: string, months: number = 6): Promise<RailwayCostData[]> {
    try {
      const response = await fetch(`${this.supabaseUrl}/functions/v1/railway-api`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.supabaseAnonKey}`,
        },
        body: JSON.stringify({ 
          action: 'getProjectCosts', 
          projectId,
          months 
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      return data.costData || [];
    } catch (error) {
      console.error('Failed to fetch project costs from Railway API:', error);
      throw error; // Don't fallback to mock data, let the UI handle the error
    }
  }

  async getMonthlyUsage(projectId: string, month: string, year: number): Promise<RailwayCostData | null> {
    const costs = await this.getProjectCosts(projectId);
    return costs.find(c => c.month === month && c.year === year) || null;
  }
}

export const railwayApi = new RailwayAPI();