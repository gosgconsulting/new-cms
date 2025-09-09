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

// Mock data for development - replace with actual API calls
export const mockProjects: RailwayProject[] = [
  {
    id: "proj_1",
    name: "Client Website - ABC Corp",
    description: "Production website hosting",
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "proj_2", 
    name: "E-commerce Store - XYZ Ltd",
    description: "Online store with database",
    createdAt: "2024-02-01T14:30:00Z"
  }
];

export const mockCostData: { [key: string]: RailwayCostData[] } = {
  "proj_1": [
    {
      projectId: "proj_1",
      month: "December",
      year: 2024,
      services: [
        {
          serviceId: "svc_1",
          serviceName: "Web Server",
          metrics: {
            compute: { cpuHours: 720, memorySizeMB: 512, cost: 15.60 },
            storage: { sizeGB: 10, cost: 2.50 },
            network: { inboundGB: 50, outboundGB: 25, cost: 1.25 },
            total: 19.35
          }
        },
        {
          serviceId: "svc_2", 
          serviceName: "Database",
          metrics: {
            compute: { cpuHours: 720, memorySizeMB: 256, cost: 7.80 },
            storage: { sizeGB: 5, cost: 1.25 },
            network: { inboundGB: 10, outboundGB: 5, cost: 0.25 },
            total: 9.30
          }
        }
      ],
      totalCost: 28.65
    },
    {
      projectId: "proj_1",
      month: "November", 
      year: 2024,
      services: [
        {
          serviceId: "svc_1",
          serviceName: "Web Server",
          metrics: {
            compute: { cpuHours: 720, memorySizeMB: 512, cost: 15.60 },
            storage: { sizeGB: 8, cost: 2.00 },
            network: { inboundGB: 42, outboundGB: 18, cost: 1.00 },
            total: 18.60
          }
        },
        {
          serviceId: "svc_2",
          serviceName: "Database", 
          metrics: {
            compute: { cpuHours: 720, memorySizeMB: 256, cost: 7.80 },
            storage: { sizeGB: 4, cost: 1.00 },
            network: { inboundGB: 8, outboundGB: 3, cost: 0.18 },
            total: 8.98
          }
        }
      ],
      totalCost: 27.58
    }
  ]
};

export class RailwayAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string = 'mock-key') {
    this.apiKey = apiKey;
    this.baseUrl = 'https://backboard.railway.app/graphql';
  }

  async getProjects(): Promise<RailwayProject[]> {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockProjects), 500);
    });
  }

  async getProjectCosts(projectId: string, months: number = 6): Promise<RailwayCostData[]> {
    // Mock implementation - replace with actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const data = mockCostData[projectId] || [];
        resolve(data.slice(0, months));
      }, 800);
    });
  }

  async getMonthlyUsage(projectId: string, month: string, year: number): Promise<RailwayCostData | null> {
    const costs = await this.getProjectCosts(projectId);
    return costs.find(c => c.month === month && c.year === year) || null;
  }
}

export const railwayApi = new RailwayAPI();