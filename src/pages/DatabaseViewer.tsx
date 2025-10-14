import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Database } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TableInfo {
  name: string;
  description: string;
  columns: { name: string; type: string; nullable: boolean }[];
}

const DatabaseViewer: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState<string>('cms_pages');
  const [tableData, setTableData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const tables: TableInfo[] = [
    {
      name: 'cms_pages',
      description: 'CMS Pages - All pages managed in the CMS',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'tenant_id', type: 'uuid', nullable: false },
        { name: 'title', type: 'text', nullable: false },
        { name: 'slug', type: 'text', nullable: false },
        { name: 'status', type: 'text', nullable: true },
        { name: 'created_at', type: 'timestamp', nullable: true },
      ],
    },
    {
      name: 'blog_posts',
      description: 'Blog Posts - All blog posts in the system',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'tenant_id', type: 'uuid', nullable: false },
        { name: 'title', type: 'text', nullable: false },
        { name: 'slug', type: 'text', nullable: false },
        { name: 'status', type: 'text', nullable: true },
        { name: 'published_at', type: 'timestamp', nullable: true },
      ],
    },
    {
      name: 'cms_forms',
      description: 'CMS Forms - Form definitions and configurations',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'tenant_id', type: 'uuid', nullable: false },
        { name: 'name', type: 'text', nullable: false },
        { name: 'status', type: 'text', nullable: true },
        { name: 'submissions', type: 'integer', nullable: true },
      ],
    },
    {
      name: 'cms_form_submissions',
      description: 'Form Submissions - All form submission data',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'form_id', type: 'uuid', nullable: false },
        { name: 'data', type: 'jsonb', nullable: false },
        { name: 'submitted_at', type: 'timestamp', nullable: true },
      ],
    },
    {
      name: 'contact_forms',
      description: 'Contact Forms - Contact form submissions',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'name', type: 'text', nullable: false },
        { name: 'email', type: 'text', nullable: false },
        { name: 'message', type: 'text', nullable: false },
        { name: 'status', type: 'text', nullable: true },
      ],
    },
    {
      name: 'user_profiles',
      description: 'User Profiles - User profile information',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'user_id', type: 'uuid', nullable: false },
        { name: 'email', type: 'text', nullable: false },
        { name: 'first_name', type: 'text', nullable: true },
        { name: 'last_name', type: 'text', nullable: true },
      ],
    },
    {
      name: 'tenants',
      description: 'Tenants - Multi-tenant configuration',
      columns: [
        { name: 'id', type: 'uuid', nullable: false },
        { name: 'name', type: 'text', nullable: false },
        { name: 'domain', type: 'text', nullable: false },
        { name: 'status', type: 'text', nullable: true },
      ],
    },
  ];

  const currentTable = tables.find((t) => t.name === selectedTable);

  useEffect(() => {
    // In a real implementation, you would fetch data from the database here
    // For now, we'll just show the table structure
    setIsLoading(true);
    setTimeout(() => {
      setTableData([]);
      setIsLoading(false);
    }, 500);
  }, [selectedTable]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/developer')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Database className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Database Viewer</h1>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Select Table</CardTitle>
            <CardDescription>Choose a table to view its structure and data</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger className="w-full max-w-md">
                <SelectValue placeholder="Select a table" />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table.name} value={table.name}>
                    <div className="flex flex-col">
                      <span className="font-medium">{table.name}</span>
                      <span className="text-xs text-muted-foreground">{table.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {currentTable && (
          <Card>
            <CardHeader>
              <CardTitle>{currentTable.name}</CardTitle>
              <CardDescription>{currentTable.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Table Structure</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Column Name</TableHead>
                        <TableHead>Data Type</TableHead>
                        <TableHead>Nullable</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentTable.columns.map((column) => (
                        <TableRow key={column.name}>
                          <TableCell className="font-medium">{column.name}</TableCell>
                          <TableCell>
                            <code className="bg-muted px-2 py-1 rounded text-sm">{column.type}</code>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                column.nullable
                                  ? 'bg-yellow-50 text-yellow-700'
                                  : 'bg-green-50 text-green-700'
                              }`}
                            >
                              {column.nullable ? 'Yes' : 'No'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Table Data</h3>
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading data...</div>
                  ) : tableData.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No data available or data viewing requires backend implementation
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Data display coming soon
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DatabaseViewer;
