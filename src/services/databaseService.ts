import { api } from '../../sparti-cms/utils/api';

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
  private baseUrl = '/api/database';

  async getTables(): Promise<TableInfo[]> {
    const res = await api.get(`${this.baseUrl}/tables`);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Failed to fetch tables (${res.status})`);
    }
    const rows = await res.json();
    // Map server rows into TableInfo shape
    return rows.map((t: any) => ({
      name: t.table_name,
      rowCount: Number(t.row_count ?? 0),
      schema: [], // fetched via getTableSchema
    })) as TableInfo[];
  }

  async getTableSchema(tableName: string): Promise<ColumnInfo[]> {
    const res = await api.get(`${this.baseUrl}/tables/${encodeURIComponent(tableName)}/columns`);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Failed to fetch schema for ${tableName} (${res.status})`);
    }
    const rows = await res.json();
    return rows.map((c: any) => ({
      column: c.column_name,
      type: c.data_type,
      nullable: c.is_nullable === 'YES',
      key: !!c.is_primary_key,
    })) as ColumnInfo[];
  }

  async getTableData(tableName: string, limit: number = 100, offset: number = 0): Promise<any[]> {
    const url = `${this.baseUrl}/tables/${encodeURIComponent(tableName)}/data?limit=${encodeURIComponent(
      limit
    )}&offset=${encodeURIComponent(offset)}`;
    const res = await api.get(url);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `Failed to fetch data for ${tableName} (${res.status})`);
    }
    return await res.json();
  }

  async executeQuery(_query: string): Promise<any[]> {
    // No public query endpoint implemented on the server.
    throw new Error('Direct query execution is not available. Use specific endpoints.');
  }

  async getConnectionStatus(): Promise<{ connected: boolean; host: string; database: string }> {
    const res = await api.get('/health/detailed');
    if (!res.ok) {
      return { connected: false, host: 'unknown', database: 'unknown' };
    }
    const data = await res.json();
    return {
      connected: data.database === 'connected',
      host: window.location.host,
      database: data.database,
    };
  }
}

export const databaseService = new DatabaseService();