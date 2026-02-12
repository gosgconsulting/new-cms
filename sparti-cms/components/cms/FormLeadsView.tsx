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
    // Fetch submissions from Postgres via API
    const fetchSubmissions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/form-submissions/${form.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch submissions');
        }

        const data = await response.json();
        setSubmissions(data);
      } catch (error) {
        console.error('Error fetching submissions:', error);
        setSubmissions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [form.id]);

  // Helper function to get field value from submission data
  const getFieldValue = (field: FormField, submissionData: Record<string, string>) => {
    // Try multiple possible keys: field name, field label (lowercased), or common variations
    const fieldNameLower = field.name.toLowerCase().replace(/\s+/g, '_');
    const fieldLabelLower = (field.placeholder || field.name).toLowerCase().replace(/\s+/g, '_');
    
    return submissionData[field.name] || 
           submissionData[fieldNameLower] || 
           submissionData[fieldLabelLower] ||
           submissionData[field.name.toLowerCase()] ||
           '';
  };

  const handleExport = () => {
    // Create CSV content
    const headers = ['Date', ...form.fields.map(f => f.name)];
    const rows = submissions.map(sub => [
      sub.date,
      ...form.fields.map(f => getFieldValue(f, sub.data))
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
                    {form.fields.map((field) => {
                      const fieldNameLower = field.name.toLowerCase().replace(/\s+/g, '_');
                      const fieldLabelLower = (field.placeholder || field.name).toLowerCase().replace(/\s+/g, '_');
                      const value = submission.data[field.name] || 
                                   submission.data[fieldNameLower] || 
                                   submission.data[fieldLabelLower] ||
                                   submission.data[field.name.toLowerCase()] ||
                                   '-';
                      return (
                        <TableCell key={field.name} className="text-gray-700">
                          {value}
                        </TableCell>
                      );
                    })}
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
