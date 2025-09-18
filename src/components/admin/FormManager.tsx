
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Eye, Download, Search, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FormSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  form_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

const FormManager = () => {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubmissions = async () => {
    try {
      console.log("Fetching form submissions...");
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching submissions:", error);
        throw error;
      }

      console.log("Fetched submissions:", data);
      setSubmissions(data || []);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch form submissions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const filteredSubmissions = submissions.filter(submission =>
    submission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-green-500";
      case "replied":
        return "bg-blue-500";
      case "in-progress":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      console.log("Updating submission status:", { id, newStatus });
      const { error } = await supabase
        .from('form_submissions')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        console.error("Error updating status:", error);
        throw error;
      }

      // Update local state
      setSubmissions(submissions.map(sub =>
        sub.id === id ? { ...sub, status: newStatus } : sub
      ));

      if (selectedSubmission && selectedSubmission.id === id) {
        setSelectedSubmission({ ...selectedSubmission, status: newStatus });
      }

      toast({
        title: "Status Updated",
        description: "Form submission status has been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to update status:", error);
      toast({
        title: "Error",
        description: "Failed to update submission status",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Form Manager</h1>
          <p className="text-gray-600 mt-2">Manage form submissions and inquiries</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={fetchSubmissions} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Mail className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{submissions.length}</p>
                <p className="text-sm text-gray-600">Total Submissions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {submissions.filter(s => s.status === 'new').length}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold">{submissions.filter(s => s.status === 'new').length}</p>
                <p className="text-sm text-gray-600">New</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {submissions.filter(s => s.status === 'in-progress').length}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold">{submissions.filter(s => s.status === 'in-progress').length}</p>
                <p className="text-sm text-gray-600">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {submissions.filter(s => s.status === 'replied').length}
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold">{submissions.filter(s => s.status === 'replied').length}</p>
                <p className="text-sm text-gray-600">Replied</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Form Submissions</CardTitle>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search submissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No form submissions found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Form Type</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.name}</TableCell>
                    <TableCell>{submission.email}</TableCell>
                    <TableCell>{submission.form_type}</TableCell>
                    <TableCell>{formatDate(submission.created_at)}</TableCell>
                    <TableCell>
                      <Badge 
                        className={`${getStatusColor(submission.status)} text-white`}
                      >
                        {submission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedSubmission(submission)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Form Submission Details</DialogTitle>
                          </DialogHeader>
                          {selectedSubmission && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-1">Name</label>
                                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedSubmission.name}</p>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Email</label>
                                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedSubmission.email}</p>
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium mb-1">Message</label>
                                <p className="text-sm bg-gray-50 p-3 rounded h-32 overflow-y-auto">
                                  {selectedSubmission.message}
                                </p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium mb-1">Form Type</label>
                                  <p className="text-sm bg-gray-50 p-2 rounded">{selectedSubmission.form_type}</p>
                                </div>
                                <div>
                                  <label className="block text-sm font-medium mb-1">Submitted At</label>
                                  <p className="text-sm bg-gray-50 p-2 rounded">{formatDate(selectedSubmission.created_at)}</p>
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium mb-2">Update Status</label>
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant={selectedSubmission.status === 'new' ? 'default' : 'outline'}
                                    onClick={() => handleStatusChange(selectedSubmission.id, 'new')}
                                  >
                                    New
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant={selectedSubmission.status === 'in-progress' ? 'default' : 'outline'}
                                    onClick={() => handleStatusChange(selectedSubmission.id, 'in-progress')}
                                  >
                                    In Progress
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant={selectedSubmission.status === 'replied' ? 'default' : 'outline'}
                                    onClick={() => handleStatusChange(selectedSubmission.id, 'replied')}
                                  >
                                    Replied
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FormManager;
