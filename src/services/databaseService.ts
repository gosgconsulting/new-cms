// Database service to interact with MCP PostgreSQL server
// This would connect to your actual MCP server in a real implementation

export interface TableInfo {
  name: string;
  rowCount: number;
  schema: ColumnInfo[];
  sampleData?: any[];
}

export interface ColumnInfo {
  column: string;
  type: string;
  nullable: boolean;
  key: boolean;
}

class DatabaseService {
  private baseUrl = '/api/database'; // This would be your MCP server endpoint

  async getTables(): Promise<TableInfo[]> {
    try {
      // Mock data matching your ACTUAL PostgreSQL database structure
      return [
        {
          name: 'contacts',
          rowCount: 45,
          schema: [
            { column: 'id', type: 'integer', nullable: false, key: true },
            { column: 'name', type: 'character varying', nullable: false, key: false },
            { column: 'email', type: 'character varying', nullable: false, key: false },
            { column: 'phone', type: 'character varying', nullable: true, key: false },
            { column: 'company', type: 'character varying', nullable: true, key: false },
            { column: 'message', type: 'text', nullable: true, key: false },
            { column: 'source', type: 'character varying', nullable: true, key: false },
            { column: 'created_at', type: 'timestamp', nullable: false, key: false }
          ],
          sampleData: [
            { id: 1, name: 'John Smith', email: 'john@company.com', phone: '+65 9123 4567', company: 'Tech Corp', message: 'Interested in SEO services', source: 'website_form', created_at: '2024-01-16T10:15:00Z' },
            { id: 2, name: 'Sarah Lee', email: 'sarah@startup.sg', phone: null, company: 'StartupSG', message: 'Need help with digital marketing', source: 'referral', created_at: '2024-01-15T14:30:00Z' },
            { id: 3, name: 'Michael Wong', email: 'michael@enterprise.com', phone: '+65 8765 4321', company: 'Enterprise Solutions', message: 'Looking for comprehensive digital strategy', source: 'linkedin', created_at: '2024-01-14T11:20:00Z' }
          ]
        },
        {
          name: 'form_submissions',
          rowCount: 89,
          schema: [
            { column: 'id', type: 'integer', nullable: false, key: true },
            { column: 'form_type', type: 'character varying', nullable: false, key: false },
            { column: 'form_data', type: 'jsonb', nullable: false, key: false },
            { column: 'ip_address', type: 'inet', nullable: true, key: false },
            { column: 'user_agent', type: 'text', nullable: true, key: false },
            { column: 'created_at', type: 'timestamp', nullable: false, key: false }
          ],
          sampleData: [
            { id: 1, form_type: 'contact', form_data: '{"name": "Alice Wong", "email": "alice@example.com", "message": "Hello!"}', ip_address: '192.168.1.1', created_at: '2024-01-16T11:30:00Z' },
            { id: 2, form_type: 'newsletter', form_data: '{"email": "subscriber@example.com"}', ip_address: '10.0.0.1', created_at: '2024-01-16T09:45:00Z' },
            { id: 3, form_type: 'quote_request', form_data: '{"name": "David Tan", "email": "david@business.sg", "service": "SEO", "budget": "5000"}', ip_address: '203.116.43.15', created_at: '2024-01-15T16:45:00Z' }
          ]
        },
        {
          name: 'site_settings',
          rowCount: 12,
          schema: [
            { column: 'id', type: 'integer', nullable: false, key: true },
            { column: 'setting_key', type: 'character varying', nullable: false, key: false },
            { column: 'setting_value', type: 'text', nullable: true, key: false },
            { column: 'setting_type', type: 'character varying', nullable: false, key: false },
            { column: 'updated_at', type: 'timestamp', nullable: false, key: false }
          ],
          sampleData: [
            { id: 1, setting_key: 'site_name', setting_value: 'GO SG Digital Marketing', setting_type: 'string', updated_at: '2024-01-15T12:00:00Z' },
            { id: 2, setting_key: 'site_tagline', setting_value: 'Your Digital Success Partner', setting_type: 'string', updated_at: '2024-01-15T12:00:00Z' },
            { id: 3, setting_key: 'primary_color', setting_value: '#8B5CF6', setting_type: 'color', updated_at: '2024-01-15T12:00:00Z' }
          ]
        }
      ];
    } catch (error) {
      console.error('Error fetching tables:', error);
      throw error;
    }
  }

  async getTableData(tableName: string, limit: number = 10): Promise<any[]> {
    try {
      // In a real implementation, this would query your MCP server
      const tables = await this.getTables();
      const table = tables.find(t => t.name === tableName);
      return table?.sampleData || [];
    } catch (error) {
      console.error(`Error fetching data for table ${tableName}:`, error);
      throw error;
    }
  }

  async executeQuery(query: string): Promise<any[]> {
    try {
      // In a real implementation, this would execute the query via MCP
      console.log('Executing query:', query);
      return [];
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  async getTableSchema(tableName: string): Promise<ColumnInfo[]> {
    try {
      const tables = await this.getTables();
      const table = tables.find(t => t.name === tableName);
      return table?.schema || [];
    } catch (error) {
      console.error(`Error fetching schema for table ${tableName}:`, error);
      throw error;
    }
  }

  async getConnectionStatus(): Promise<{ connected: boolean; host: string; database: string }> {
    try {
      // In a real implementation, this would check MCP server status
      return {
        connected: true,
        host: 'trolley.proxy.rlwy.net:58867',
        database: 'railway'
      };
    } catch (error) {
      console.error('Error checking connection status:', error);
      return {
        connected: false,
        host: 'unknown',
        database: 'unknown'
      };
    }
  }
}

export const databaseService = new DatabaseService();
