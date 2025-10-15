import React, { useState, useEffect } from 'react';
import { ArrowLeft, Database, Table, Eye, RefreshCw, Search, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TableInfo {
  table_name: string;
  row_count: number;
  table_schema: string;
  table_type: string;
}

interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  is_primary_key: boolean;
}

const DatabaseViewer: React.FC = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('[testing] Loading database tables...');
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4173';
      const response = await fetch(`${API_BASE_URL}/api/database/tables`);
      if (response.ok) {
        const tablesData = await response.json();
        setTables(tablesData);
        console.log('[testing] Tables loaded:', tablesData);
      } else {
        throw new Error('Failed to load tables');
      }
    } catch (err) {
      console.error('[testing] Error loading tables:', err);
      setError('Failed to load database tables');
      // Mock data for development
      setTables([
        { table_name: 'users', row_count: 150, table_schema: 'public', table_type: 'BASE TABLE' },
        { table_name: 'projects', row_count: 25, table_schema: 'public', table_type: 'BASE TABLE' },
        { table_name: 'project_steps', row_count: 120, table_schema: 'public', table_type: 'BASE TABLE' },
        { table_name: 'settings', row_count: 1, table_schema: 'public', table_type: 'BASE TABLE' },
        { table_name: 'analytics_events', row_count: 2500, table_schema: 'public', table_type: 'BASE TABLE' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTableData = async (tableName: string) => {
    setIsLoadingData(true);
    setError(null);
    try {
      console.log('[testing] Loading data for table:', tableName);
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4173';
      
      // Load table structure
      const columnsResponse = await fetch(`${API_BASE_URL}/api/database/tables/${tableName}/columns`);
      if (columnsResponse.ok) {
        const columnsData = await columnsResponse.json();
        setColumns(columnsData);
      }

      // Load table data (limited to first 100 rows)
      const dataResponse = await fetch(`${API_BASE_URL}/api/database/tables/${tableName}/data?limit=100`);
      if (dataResponse.ok) {
        const data = await dataResponse.json();
        setTableData(data);
        console.log('[testing] Table data loaded:', data);
      } else {
        throw new Error('Failed to load table data');
      }
    } catch (err) {
      console.error('[testing] Error loading table data:', err);
      setError(`Failed to load data for table: ${tableName}`);
      // Mock data for development
      if (tableName === 'users') {
        setColumns([
          { column_name: 'id', data_type: 'integer', is_nullable: 'NO', column_default: 'nextval(\'users_id_seq\'::regclass)', is_primary_key: true },
          { column_name: 'email', data_type: 'character varying', is_nullable: 'NO', column_default: null, is_primary_key: false },
          { column_name: 'created_at', data_type: 'timestamp with time zone', is_nullable: 'YES', column_default: 'now()', is_primary_key: false },
        ]);
        setTableData([
          { id: 1, email: 'admin@example.com', created_at: '2024-01-15T10:30:00Z' },
          { id: 2, email: 'user@example.com', created_at: '2024-01-16T14:20:00Z' },
        ]);
      }
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    loadTableData(tableName);
  };

  const filteredTables = tables.filter(table =>
    table.table_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return 'NULL';
    if (typeof value === 'object') return JSON.stringify(value);
    if (typeof value === 'string' && value.length > 50) {
      return value.substring(0, 50) + '...';
    }
    return String(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Database Viewer</h1>
              <p className="text-sm text-gray-500 mt-1">
                Browse and inspect your PostgreSQL database
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - Tables List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Tables</h2>
              <button
                onClick={loadTables}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 text-gray-500 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {error && (
              <div className="p-4 bg-red-50 border-b border-red-200">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-12 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2">
                {filteredTables.map((table) => (
                  <button
                    key={table.table_name}
                    onClick={() => handleTableSelect(table.table_name)}
                    className={`w-full text-left p-3 rounded-lg transition-colors mb-1 ${
                      selectedTable === table.table_name
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Table className="h-4 w-4 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {table.table_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {table.row_count.toLocaleString()} rows
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedTable ? (
            <>
              {/* Table Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedTable}</h2>
                    <p className="text-sm text-gray-500 mt-1">
                      {tableData.length} rows shown (limited to 100)
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Filter className="h-4 w-4 mr-1 inline" />
                      Filter
                    </button>
                    <button 
                      onClick={() => loadTableData(selectedTable)}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      disabled={isLoadingData}
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 inline ${isLoadingData ? 'animate-spin' : ''}`} />
                      Refresh
                    </button>
                  </div>
                </div>
              </div>

              {/* Table Schema */}
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Schema</h3>
                <div className="flex flex-wrap gap-2">
                  {columns.map((column) => (
                    <div
                      key={column.column_name}
                      className={`px-2 py-1 rounded text-xs ${
                        column.is_primary_key
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                          : 'bg-white text-gray-700 border border-gray-300'
                      }`}
                    >
                      <span className="font-medium">{column.column_name}</span>
                      <span className="text-gray-500 ml-1">({column.data_type})</span>
                      {column.is_primary_key && <span className="ml-1">🔑</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Table Data */}
              <div className="flex-1 overflow-auto bg-white">
                {isLoadingData ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
                      <p className="text-gray-500">Loading table data...</p>
                    </div>
                  </div>
                ) : tableData.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <Table className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No data found in this table</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          {columns.map((column) => (
                            <th
                              key={column.column_name}
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              {column.column_name}
                              {column.is_primary_key && <span className="ml-1">🔑</span>}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {tableData.map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            {columns.map((column) => (
                              <td
                                key={column.column_name}
                                className="px-4 py-3 text-sm text-gray-900 font-mono"
                              >
                                {formatValue(row[column.column_name])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center">
                <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Table</h3>
                <p className="text-gray-500">Choose a table from the sidebar to view its data and schema</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatabaseViewer;
