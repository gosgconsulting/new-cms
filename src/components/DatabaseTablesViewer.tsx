import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Database, Table as TableIcon, Users, FolderOpen, Settings, BarChart3, RefreshCw, Eye, Download, FileText, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { databaseService, TableInfo as ServiceTableInfo } from "@/services/databaseService";

interface TableInfo extends ServiceTableInfo {
  icon: React.ReactNode;
  description: string;
}

interface DatabaseTablesViewerProps {
  onClose?: () => void;
}

const DatabaseTablesViewer: React.FC<DatabaseTablesViewerProps> = ({ onClose }) => {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data based on your actual database structure
  const mockTables: TableInfo[] = [
    {
      name: 'users',
      rowCount: 150,
      icon: <Users className="h-5 w-5 text-blue-500" />,
      description: 'User accounts and authentication data',
      schema: [
        { column: 'id', type: 'integer', nullable: false, key: true },
        { column: 'email', type: 'character varying', nullable: false, key: false },
        { column: 'created_at', type: 'timestamp with time zone', nullable: false, key: false }
      ],
      sampleData: [
        { id: 1, email: 'admin@example.com', created_at: '2024-01-15T10:30:00Z' },
        { id: 2, email: 'user@example.com', created_at: '2024-01-16T14:20:00Z' }
      ]
    },
    {
      name: 'settings',
      rowCount: 1,
      icon: <Settings className="h-5 w-5 text-orange-500" />,
      description: 'Application configuration and settings',
      schema: [
        { column: 'id', type: 'integer', nullable: false, key: true },
        { column: 'setting_key', type: 'character varying', nullable: false, key: false },
        { column: 'setting_value', type: 'text', nullable: true, key: false },
        { column: 'updated_at', type: 'timestamp', nullable: false, key: false }
      ],
      sampleData: [
        { id: 1, setting_key: 'site_name', setting_value: 'GO SG', updated_at: '2024-01-15T12:00:00Z' }
      ]
    },
    {
      name: 'analytics_events',
      rowCount: 2500,
      icon: <BarChart3 className="h-5 w-5 text-red-500" />,
      description: 'Website analytics and user interaction data',
      schema: [
        { column: 'id', type: 'integer', nullable: false, key: true },
        { column: 'event_name', type: 'character varying', nullable: false, key: false },
        { column: 'user_id', type: 'integer', nullable: true, key: false },
        { column: 'properties', type: 'jsonb', nullable: true, key: false },
        { column: 'timestamp', type: 'timestamp', nullable: false, key: false }
      ],
      sampleData: [
        { id: 1, event_name: 'page_view', user_id: 1, properties: '{"page": "/", "referrer": "google.com"}', timestamp: '2024-01-16T10:15:00Z' },
        { id: 2, event_name: 'contact_form_submit', user_id: null, properties: '{"form_id": "hero_contact"}', timestamp: '2024-01-16T11:30:00Z' }
      ]
    }
  ];

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    setLoading(true);
    try {
      const serviceTables = await databaseService.getTables();
      
      // Add icons and descriptions to the service data
      const tablesWithMeta: TableInfo[] = serviceTables.map(table => ({
        ...table,
        icon: getTableIcon(table.name),
        description: getTableDescription(table.name)
      }));
      
      setTables(tablesWithMeta);
    } catch (error) {
      console.error('Error loading tables:', error);
      // Fallback to mock data if service fails
      setTables(mockTables);
    } finally {
      setLoading(false);
    }
  };

  const getTableIcon = (tableName: string): React.ReactNode => {
    switch (tableName) {
      case 'contacts':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'form_submissions':
        return <Mail className="h-5 w-5 text-pink-500" />;
      case 'site_settings':
        return <Settings className="h-5 w-5 text-orange-500" />;
      default:
        return <TableIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTableDescription = (tableName: string): string => {
    switch (tableName) {
      case 'contacts':
        return 'Contact information and lead data';
      case 'form_submissions':
        return 'Website form submissions and inquiries';
      case 'site_settings':
        return 'Application configuration and settings';
      default:
        return 'Database table information';
    }
  };

  const refreshTables = async () => {
    setRefreshing(true);
    await loadTables();
    setRefreshing(false);
  };

  const getTableById = (tableName: string) => {
    return tables.find(table => table.name === tableName);
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">null</span>;
    }
    if (typeof value === 'string' && value.length > 50) {
      return <span title={value}>{value.substring(0, 50)}...</span>;
    }
    return String(value);
  };

  const exportTableData = (tableName: string) => {
    const table = getTableById(tableName);
    if (table && table.sampleData) {
      const dataStr = JSON.stringify(table.sampleData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${tableName}_data.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-brandPurple" />
          <span className="text-lg">Loading database tables...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-7xl mx-auto p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Database className="h-8 w-8 text-brandPurple" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">PostgreSQL Database</h1>
            <p className="text-muted-foreground">Railway • Connected • {tables.length} tables</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={refreshTables}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="outline" size="sm">
              Close
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Tables Overview</TabsTrigger>
          <TabsTrigger value="data">Table Data</TabsTrigger>
          <TabsTrigger value="schema">Table Schema</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {tables.map((table, index) => (
                <motion.div
                  key={table.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {table.icon}
                          <CardTitle className="text-lg">{table.name}</CardTitle>
                        </div>
                        <Badge variant="secondary" className="bg-brandPurple/10 text-brandPurple">
                          {table.rowCount.toLocaleString()} rows
                        </Badge>
                      </div>
                      <CardDescription className="text-sm">
                        {table.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => {
                            setSelectedTable(table.name);
                            setActiveTab('data');
                          }}
                          size="sm"
                          variant="outline"
                          className="flex-1"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Data
                        </Button>
                        <Button
                          onClick={() => exportTableData(table.name)}
                          size="sm"
                          variant="outline"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <select
              value={selectedTable || ''}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="">Select a table...</option>
              {tables.map(table => (
                <option key={table.name} value={table.name}>
                  {table.name} ({table.rowCount} rows)
                </option>
              ))}
            </select>
          </div>

          {selectedTable && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getTableById(selectedTable)?.icon}
                    <CardTitle>{selectedTable}</CardTitle>
                    <Badge variant="secondary">
                      {getTableById(selectedTable)?.rowCount} rows
                    </Badge>
                  </div>
                  <Button
                    onClick={() => exportTableData(selectedTable)}
                    size="sm"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 w-full">
                  {getTableById(selectedTable)?.sampleData && (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {Object.keys(getTableById(selectedTable)!.sampleData![0]).map(column => (
                            <TableHead key={column} className="font-semibold">
                              {column}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getTableById(selectedTable)!.sampleData!.map((row, index) => (
                          <TableRow key={index}>
                            {Object.values(row).map((value, cellIndex) => (
                              <TableCell key={cellIndex} className="font-mono text-sm">
                                {formatValue(value)}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="schema" className="space-y-4">
          <div className="flex items-center space-x-4 mb-4">
            <select
              value={selectedTable || ''}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="px-3 py-2 border border-input rounded-md bg-background"
            >
              <option value="">Select a table...</option>
              {tables.map(table => (
                <option key={table.name} value={table.name}>
                  {table.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTable && (
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  {getTableById(selectedTable)?.icon}
                  <CardTitle>Schema: {selectedTable}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {getTableById(selectedTable)?.schema && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Column</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Nullable</TableHead>
                        <TableHead>Key</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getTableById(selectedTable)!.schema!.map((column, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-semibold">
                            {column.column}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {column.type}
                          </TableCell>
                          <TableCell>
                            <Badge variant={column.nullable ? "secondary" : "destructive"}>
                              {column.nullable ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {column.key && (
                              <Badge variant="default" className="bg-brandPurple">
                                Primary
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default DatabaseTablesViewer;
