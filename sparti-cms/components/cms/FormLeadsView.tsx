import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface FormField {
  name: string;
  placeholder: string;
  type: string;
}

interface FormData {
  id: string;
  name: string;
  fields: FormField[];
  submissions: number;
  location: string;
}

interface FormLeadsViewProps {
  form: FormData;
  onBack: () => void;
}

interface Submission {
  id: string;
  date: string;
  data: Record<string, string>;
}

const FormLeadsView: React.FC<FormLeadsViewProps> = ({ form, onBack }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch submissions from the database
    const fetchSubmissions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/form-submissions/${form.id}`);
        if (response.ok) {
          const data = await response.json();
          setSubmissions(data);
        } else {
          // Mock data for now
          setSubmissions([
            {
              id: '1',
              date: '2025-01-15 14:30',
              data: {
                name: 'John Smith',
                email: 'john@example.com',
                phone: '+65 9123 4567',
                message: 'Interested in your SEO services for my e-commerce website.'
              }
            },
            {
              id: '2',
              date: '2025-01-14 10:15',
              data: {
                name: 'Sarah Lee',
                email: 'sarah.lee@company.com',
                phone: '+65 8234 5678',
                message: 'Need help with local SEO for my restaurant chain.'
              }
            },
            {
              id: '3',
              date: '2025-01-13 16:45',
              data: {
                name: 'Michael Tan',
                email: 'michael@startup.sg',
                phone: '+65 9876 5432',
                message: 'Looking to improve organic rankings for my tech startup.'
              }
            }
          ]);
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
        // Use mock data on error
        setSubmissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [form.id]);

  const handleExport = () => {
    // Create CSV content
    const headers = ['Date', ...form.fields.map(f => f.name)];
    const rows = submissions.map(sub => [
      sub.date,
      ...form.fields.map(f => sub.data[f.name] || '')
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${form.name.replace(/\s+/g, '_')}_leads_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{form.name} - Leads</h2>
              <p className="text-sm text-gray-500 mt-1">
                {submissions.length} total submissions
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" className="border-gray-300">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button 
              onClick={handleExport}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="p-6">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading submissions...</p>
          </div>
        ) : submissions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No submissions yet.</p>
          </div>
        ) : (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-900">Date</TableHead>
                  {form.fields.map((field) => (
                    <TableHead key={field.name} className="font-semibold text-gray-900 capitalize">
                      {field.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-900">
                      {submission.date}
                    </TableCell>
                    {form.fields.map((field) => (
                      <TableCell key={field.name} className="text-gray-700">
                        {submission.data[field.name] || '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormLeadsView;
