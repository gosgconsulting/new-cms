/**
 * Resend Domain Management Client
 * Handles domain operations, DNS records, and SMTP configuration
 */

export interface ResendDomain {
  id: string;
  name: string;
  status: 'not_started' | 'pending' | 'verified' | 'failed';
  created_at: string;
  region: string;
  dns_records: DNSRecord[];
}

export interface DNSRecord {
  record: string;
  name: string;
  type: 'TXT' | 'MX' | 'CNAME';
  value: string;
  status: 'not_started' | 'pending' | 'verified' | 'failed';
  priority?: number;
}

export interface SMTPConfig {
  host: string;
  port: number[];
  username: string;
  password: string; // This will be the API key
  security: string[];
}

export interface CreateDomainRequest {
  name: string;
  region?: 'us-east-1' | 'eu-west-1';
}

export class ResendDomainsClient {
  private apiKey: string;
  private baseUrl = 'https://api.resend.com';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_RESEND_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('[testing] Resend API key not found. Set VITE_RESEND_API_KEY environment variable.');
    }
  }

  /**
   * Get all domains
   */
  async getDomains(): Promise<ResendDomain[]> {
    if (!this.apiKey) {
      throw new Error('Resend API key is required');
    }

    const response = await fetch(`${this.baseUrl}/domains`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch domains: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  /**
   * Get a specific domain by ID
   */
  async getDomain(domainId: string): Promise<ResendDomain> {
    if (!this.apiKey) {
      throw new Error('Resend API key is required');
    }

    const response = await fetch(`${this.baseUrl}/domains/${domainId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to fetch domain: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Add a new domain
   */
  async createDomain(domainData: CreateDomainRequest): Promise<ResendDomain> {
    if (!this.apiKey) {
      throw new Error('Resend API key is required');
    }

    const response = await fetch(`${this.baseUrl}/domains`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(domainData)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create domain: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Delete a domain
   */
  async deleteDomain(domainId: string): Promise<void> {
    if (!this.apiKey) {
      throw new Error('Resend API key is required');
    }

    const response = await fetch(`${this.baseUrl}/domains/${domainId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to delete domain: ${response.status} - ${error}`);
    }
  }

  /**
   * Verify domain DNS records
   */
  async verifyDomain(domainId: string): Promise<ResendDomain> {
    if (!this.apiKey) {
      throw new Error('Resend API key is required');
    }

    const response = await fetch(`${this.baseUrl}/domains/${domainId}/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to verify domain: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Get SMTP configuration details
   */
  getSMTPConfig(): SMTPConfig {
    return {
      host: 'smtp.resend.com',
      port: [25, 465, 587, 2465, 2587],
      username: 'resend',
      password: this.apiKey, // API key is used as password
      security: ['STARTTLS', 'SSL/TLS']
    };
  }

  /**
   * Get domain status color for UI
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'not_started':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  }

  /**
   * Get status display text
   */
  getStatusText(status: string): string {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending Verification';
      case 'failed':
        return 'Verification Failed';
      case 'not_started':
      default:
        return 'Not Started';
    }
  }

  /**
   * Format DNS record for display
   */
  formatDNSRecord(record: DNSRecord): string {
    switch (record.type) {
      case 'TXT':
        return `${record.name} TXT "${record.value}"`;
      case 'MX':
        return `${record.name} MX ${record.priority || 10} ${record.value}`;
      case 'CNAME':
        return `${record.name} CNAME ${record.value}`;
      default:
        return `${record.name} ${record.type} ${record.value}`;
    }
  }

  /**
   * Check if API key is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
}

// Export singleton instance
export const resendDomainsClient = new ResendDomainsClient();
