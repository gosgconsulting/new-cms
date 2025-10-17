import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Mail, 
  Settings, 
  Eye, 
  Copy,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Send,
  Users,
  MessageSquare,
  Calendar,
  Search,
  Filter,
  Download,
  MoreVertical,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

interface FormField {
  id?: number;
  field_name: string;
  field_type: string;
  field_label: string;
  placeholder?: string;
  is_required: boolean;
  validation_rules?: any;
  options?: string[];
  sort_order: number;
}

interface Form {
  id: number;
  name: string;
  description?: string;
  fields: FormField[];
  settings: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EmailSettings {
  id?: number;
  form_id: number;
  notification_enabled: boolean;
  notification_emails: string[];
  notification_subject: string;
  notification_template: string;
  auto_reply_enabled: boolean;
  auto_reply_subject: string;
  auto_reply_template: string;
  from_email?: string;
  from_name?: string;
}

interface FormSubmission {
  id: number;
  form_id: number;
  submission_data: any;
  submitter_email?: string;
  submitter_name?: string;
  submitter_ip?: string;
  status: string;
  notes?: string;
  submitted_at: string;
  processed_at?: string;
}

const FormsManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('forms');
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [emailSettings, setEmailSettings] = useState<EmailSettings | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [editingForm, setEditingForm] = useState<Form | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Field type options for form builder
  const fieldTypes = [
    { value: 'text', label: 'Text Input' },
    { value: 'email', label: 'Email' },
    { value: 'tel', label: 'Phone' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'select', label: 'Select Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'file', label: 'File Upload' },
    { value: 'date', label: 'Date' },
    { value: 'number', label: 'Number' }
  ];

  useEffect(() => {
    loadForms();
  }, []);

  useEffect(() => {
    if (selectedForm) {
      loadEmailSettings(selectedForm.id);
      loadSubmissions(selectedForm.id);
    }
  }, [selectedForm]);

  const loadForms = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setForms(data || []);
      if (data && data.length > 0 && !selectedForm) {
        setSelectedForm(data[0]);
      }
    } catch (err: any) {
      setError(`Failed to load forms: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmailSettings = async (formId: number) => {
    try {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .eq('form_id', formId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setEmailSettings(data || null);
    } catch (err: any) {
      console.error('Failed to load email settings:', err.message);
    }
  };

  const loadSubmissions = async (formId: number) => {
    try {
      const { data, error } = await supabase
        .from('form_submissions_extended')
        .select('*')
        .eq('form_id', formId)
        .order('submitted_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setSubmissions(data || []);
    } catch (err: any) {
      console.error('Failed to load submissions:', err.message);
    }
  };

  const saveForm = async (formData: Partial<Form>) => {
    try {
      setError(null);
      
      if (editingForm?.id) {
        // Update existing form
        const { error } = await supabase
          .from('forms')
          .update({
            name: formData.name,
            description: formData.description,
            fields: formData.fields,
            settings: formData.settings,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingForm.id);

        if (error) throw error;
        setSuccess('Form updated successfully!');
      } else {
        // Create new form
        const { data, error } = await supabase
          .from('forms')
          .insert({
            name: formData.name,
            description: formData.description,
            fields: formData.fields || [],
            settings: formData.settings || {},
            is_active: formData.is_active ?? true
          })
          .select()
          .single();

        if (error) throw error;
        setSuccess('Form created successfully!');
        
        // Create default email settings for new form
        if (data) {
          await supabase
            .from('email_settings')
            .insert({
              form_id: data.id,
              notification_enabled: true,
              notification_emails: ['admin@gosg.com.sg'],
              notification_subject: `New ${formData.name} Submission`,
              notification_template: 'You have received a new form submission.',
              auto_reply_enabled: false,
              auto_reply_subject: 'Thank you for your submission',
              auto_reply_template: 'Thank you for contacting us. We will get back to you soon.',
              from_name: 'GOSG Team'
            });
        }
      }
      
      await loadForms();
      setShowFormModal(false);
      setEditingForm(null);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(`Failed to save form: ${err.message}`);
    }
  };

  const saveEmailSettings = async (settings: EmailSettings) => {
    try {
      setError(null);
      
      if (settings.id) {
        // Update existing settings
        const { error } = await supabase
          .from('email_settings')
          .update({
            notification_enabled: settings.notification_enabled,
            notification_emails: settings.notification_emails,
            notification_subject: settings.notification_subject,
            notification_template: settings.notification_template,
            auto_reply_enabled: settings.auto_reply_enabled,
            auto_reply_subject: settings.auto_reply_subject,
            auto_reply_template: settings.auto_reply_template,
            from_email: settings.from_email,
            from_name: settings.from_name,
            updated_at: new Date().toISOString()
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('email_settings')
          .insert({
            form_id: settings.form_id,
            notification_enabled: settings.notification_enabled,
            notification_emails: settings.notification_emails,
            notification_subject: settings.notification_subject,
            notification_template: settings.notification_template,
            auto_reply_enabled: settings.auto_reply_enabled,
            auto_reply_subject: settings.auto_reply_subject,
            auto_reply_template: settings.auto_reply_template,
            from_email: settings.from_email,
            from_name: settings.from_name
          });

        if (error) throw error;
      }
      
      setSuccess('Email settings saved successfully!');
      if (selectedForm) {
        await loadEmailSettings(selectedForm.id);
      }
      setShowEmailModal(false);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(`Failed to save email settings: ${err.message}`);
    }
  };

  const deleteForm = async (formId: number) => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', formId);

      if (error) throw error;
      
      setSuccess('Form deleted successfully!');
      await loadForms();
      
      if (selectedForm?.id === formId) {
        setSelectedForm(forms.find(f => f.id !== formId) || null);
      }
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(`Failed to delete form: ${err.message}`);
    }
  };

  const exportSubmissions = () => {
    if (!submissions.length) return;
    
    const csvContent = [
      ['ID', 'Form', 'Submitter Name', 'Submitter Email', 'Status', 'Submitted At', 'Data'],
      ...submissions.map(sub => [
        sub.id,
        selectedForm?.name || '',
        sub.submitter_name || '',
        sub.submitter_email || '',
        sub.status,
        new Date(sub.submitted_at).toLocaleString(),
        JSON.stringify(sub.submission_data)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedForm?.name || 'form'}-submissions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch = !searchTerm || 
      sub.submitter_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.submitter_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandPurple"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground flex items-center">
                <FileText className="mr-3 h-6 w-6 text-brandPurple" />
                Forms Management
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Create and manage forms, configure email settings, and view submissions
              </p>
            </div>
            <button
              onClick={() => {
                setEditingForm(null);
                setShowFormModal(true);
              }}
              className="flex items-center px-4 py-2 bg-brandPurple text-white rounded-lg hover:bg-brandPurple/90 transition-colors"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Form
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="p-4 bg-destructive/10 border-l-4 border-destructive">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-destructive mr-2" />
              <p className="text-destructive text-sm">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto">
                <X className="h-4 w-4 text-destructive" />
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border-l-4 border-green-500">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <p className="text-green-700 text-sm">{success}</p>
              <button onClick={() => setSuccess(null)} className="ml-auto">
                <X className="h-4 w-4 text-green-500" />
              </button>
            </div>
          </div>
        )}

        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="forms" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Forms
              </TabsTrigger>
              <TabsTrigger value="submissions" className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                Submissions ({submissions.length})
              </TabsTrigger>
              <TabsTrigger value="emails" className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                Email Settings
              </TabsTrigger>
            </TabsList>

            {/* Forms Tab */}
            <TabsContent value="forms" className="space-y-4">
              <div className="grid gap-4">
                {forms.map((form) => (
                  <div
                    key={form.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedForm?.id === form.id
                        ? 'border-brandPurple bg-brandPurple/5'
                        : 'border-border hover:border-brandPurple/50'
                    }`}
                    onClick={() => setSelectedForm(form)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground">{form.name}</h3>
                        <p className="text-sm text-muted-foreground">{form.description}</p>
                        <div className="flex items-center mt-2 space-x-4 text-xs text-muted-foreground">
                          <span>{form.fields?.length || 0} fields</span>
                          <span className={`px-2 py-1 rounded ${form.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                            {form.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span>Created {new Date(form.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingForm(form);
                            setShowFormModal(true);
                          }}
                          className="p-2 hover:bg-secondary rounded-lg transition-colors"
                        >
                          <Edit3 className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteForm(form.id);
                          }}
                          className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {forms.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No forms created yet</p>
                    <button
                      onClick={() => setShowFormModal(true)}
                      className="mt-2 text-brandPurple hover:underline"
                    >
                      Create your first form
                    </button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Submissions Tab */}
            <TabsContent value="submissions" className="space-y-4">
              {selectedForm ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">Submissions for: {selectedForm.name}</h3>
                      <p className="text-sm text-muted-foreground">{filteredSubmissions.length} submissions</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search submissions..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="px-3 py-1 border border-border rounded-lg text-sm"
                        />
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-1 border border-border rounded-lg text-sm"
                      >
                        <option value="all">All Status</option>
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                        <option value="archived">Archived</option>
                      </select>
                      <button
                        onClick={exportSubmissions}
                        className="flex items-center px-3 py-1 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm"
                      >
                        <Download className="mr-1 h-4 w-4" />
                        Export
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {filteredSubmissions.map((submission) => (
                      <div key={submission.id} className="p-4 border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-foreground">
                              {submission.submitter_name || 'Anonymous'}
                            </span>
                            <span className="text-muted-foreground">
                              {submission.submitter_email}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              submission.status === 'new' ? 'bg-blue-100 text-blue-700' :
                              submission.status === 'read' ? 'bg-yellow-100 text-yellow-700' :
                              submission.status === 'replied' ? 'bg-green-100 text-green-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {submission.status}
                            </span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(submission.submitted_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <pre className="whitespace-pre-wrap font-sans">
                            {JSON.stringify(submission.submission_data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ))}

                    {filteredSubmissions.length === 0 && (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No submissions found</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a form to view submissions</p>
                </div>
              )}
            </TabsContent>

            {/* Email Settings Tab */}
            <TabsContent value="emails" className="space-y-4">
              {selectedForm ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">Email Settings for: {selectedForm.name}</h3>
                      <p className="text-sm text-muted-foreground">Configure notification and auto-reply emails</p>
                    </div>
                    <button
                      onClick={() => setShowEmailModal(true)}
                      className="flex items-center px-4 py-2 bg-brandPurple text-white rounded-lg hover:bg-brandPurple/90 transition-colors"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Configure Emails
                    </button>
                  </div>

                  {emailSettings ? (
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Notification Settings */}
                      <div className="p-4 border border-border rounded-lg">
                        <div className="flex items-center mb-3">
                          <Mail className="h-5 w-5 text-brandPurple mr-2" />
                          <h4 className="font-medium text-foreground">Notification Emails</h4>
                          <span className={`ml-auto px-2 py-1 rounded text-xs ${
                            emailSettings.notification_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {emailSettings.notification_enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Recipients:</span>
                            <div className="mt-1">
                              {emailSettings.notification_emails.map((email, index) => (
                                <span key={index} className="inline-block bg-secondary px-2 py-1 rounded mr-1 mb-1">
                                  {email}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Subject:</span>
                            <p className="font-medium">{emailSettings.notification_subject}</p>
                          </div>
                        </div>
                      </div>

                      {/* Auto-Reply Settings */}
                      <div className="p-4 border border-border rounded-lg">
                        <div className="flex items-center mb-3">
                          <Send className="h-5 w-5 text-brandTeal mr-2" />
                          <h4 className="font-medium text-foreground">Auto-Reply Email</h4>
                          <span className={`ml-auto px-2 py-1 rounded text-xs ${
                            emailSettings.auto_reply_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {emailSettings.auto_reply_enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">From:</span>
                            <p className="font-medium">{emailSettings.from_name || 'Not set'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Subject:</span>
                            <p className="font-medium">{emailSettings.auto_reply_subject}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No email settings configured</p>
                      <button
                        onClick={() => setShowEmailModal(true)}
                        className="mt-2 text-brandPurple hover:underline"
                      >
                        Configure email settings
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a form to configure email settings</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <FormModal
          form={editingForm}
          onSave={saveForm}
          onClose={() => {
            setShowFormModal(false);
            setEditingForm(null);
          }}
          fieldTypes={fieldTypes}
        />
      )}

      {/* Email Settings Modal */}
      {showEmailModal && selectedForm && (
        <EmailSettingsModal
          formId={selectedForm.id}
          settings={emailSettings}
          onSave={saveEmailSettings}
          onClose={() => setShowEmailModal(false)}
        />
      )}
    </div>
  );
};

// Form Modal Component
const FormModal: React.FC<{
  form: Form | null;
  onSave: (form: Partial<Form>) => void;
  onClose: () => void;
  fieldTypes: Array<{ value: string; label: string }>;
}> = ({ form, onSave, onClose, fieldTypes }) => {
  const [formData, setFormData] = useState<Partial<Form>>({
    name: form?.name || '',
    description: form?.description || '',
    fields: form?.fields || [],
    settings: form?.settings || {},
    is_active: form?.is_active ?? true
  });

  const addField = () => {
    const newField: FormField = {
      field_name: '',
      field_type: 'text',
      field_label: '',
      placeholder: '',
      is_required: false,
      sort_order: (formData.fields?.length || 0) + 1
    };
    
    setFormData({
      ...formData,
      fields: [...(formData.fields || []), newField]
    });
  };

  const updateField = (index: number, field: Partial<FormField>) => {
    const updatedFields = [...(formData.fields || [])];
    updatedFields[index] = { ...updatedFields[index], ...field };
    setFormData({ ...formData, fields: updatedFields });
  };

  const removeField = (index: number) => {
    const updatedFields = [...(formData.fields || [])];
    updatedFields.splice(index, 1);
    setFormData({ ...formData, fields: updatedFields });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              {form ? 'Edit Form' : 'Create New Form'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Form Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brandPurple"
                placeholder="Enter form name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brandPurple"
                rows={3}
                placeholder="Enter form description"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-foreground">
                Active
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-foreground">Form Fields</h4>
              <button
                onClick={addField}
                className="flex items-center px-3 py-1 bg-brandPurple text-white rounded-lg hover:bg-brandPurple/90 transition-colors text-sm"
              >
                <Plus className="mr-1 h-4 w-4" />
                Add Field
              </button>
            </div>

            <div className="space-y-4">
              {formData.fields?.map((field, index) => (
                <div key={index} className="p-4 border border-border rounded-lg">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Field Name</label>
                      <input
                        type="text"
                        value={field.field_name}
                        onChange={(e) => updateField(index, { field_name: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brandPurple text-sm"
                        placeholder="e.g., name, email"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Field Type</label>
                      <select
                        value={field.field_type}
                        onChange={(e) => updateField(index, { field_type: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brandPurple text-sm"
                      >
                        {fieldTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Label</label>
                      <input
                        type="text"
                        value={field.field_label}
                        onChange={(e) => updateField(index, { field_label: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brandPurple text-sm"
                        placeholder="Field label"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Placeholder</label>
                      <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={(e) => updateField(index, { placeholder: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brandPurple text-sm"
                        placeholder="Placeholder text"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`required-${index}`}
                        checked={field.is_required}
                        onChange={(e) => updateField(index, { is_required: e.target.checked })}
                        className="mr-2"
                      />
                      <label htmlFor={`required-${index}`} className="text-sm font-medium text-foreground">
                        Required
                      </label>
                    </div>

                    <button
                      onClick={() => removeField(index)}
                      className="flex items-center px-2 py-1 text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-sm"
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {(!formData.fields || formData.fields.length === 0) && (
                <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No fields added yet</p>
                  <button
                    onClick={addField}
                    className="mt-2 text-brandPurple hover:underline text-sm"
                  >
                    Add your first field
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            disabled={!formData.name}
            className="px-4 py-2 bg-brandPurple text-white rounded-lg hover:bg-brandPurple/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {form ? 'Update Form' : 'Create Form'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Email Settings Modal Component
const EmailSettingsModal: React.FC<{
  formId: number;
  settings: EmailSettings | null;
  onSave: (settings: EmailSettings) => void;
  onClose: () => void;
}> = ({ formId, settings, onSave, onClose }) => {
  const [emailData, setEmailData] = useState<EmailSettings>({
    form_id: formId,
    notification_enabled: settings?.notification_enabled ?? true,
    notification_emails: settings?.notification_emails || ['admin@gosg.com.sg'],
    notification_subject: settings?.notification_subject || 'New Form Submission',
    notification_template: settings?.notification_template || 'You have received a new form submission from {{name}} ({{email}}).\n\nMessage:\n{{message}}',
    auto_reply_enabled: settings?.auto_reply_enabled ?? false,
    auto_reply_subject: settings?.auto_reply_subject || 'Thank you for your submission',
    auto_reply_template: settings?.auto_reply_template || 'Dear {{name}},\n\nThank you for contacting us. We have received your message and will get back to you within 24 hours.\n\nBest regards,\nGOSG Team',
    from_email: settings?.from_email || '',
    from_name: settings?.from_name || 'GOSG Team',
    ...settings
  });

  const [newEmail, setNewEmail] = useState('');

  const addNotificationEmail = () => {
    if (newEmail && !emailData.notification_emails.includes(newEmail)) {
      setEmailData({
        ...emailData,
        notification_emails: [...emailData.notification_emails, newEmail]
      });
      setNewEmail('');
    }
  };

  const removeNotificationEmail = (email: string) => {
    setEmailData({
      ...emailData,
      notification_emails: emailData.notification_emails.filter(e => e !== email)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Email Settings</h3>
            <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Notification Settings */}
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="notification_enabled"
                checked={emailData.notification_enabled}
                onChange={(e) => setEmailData({ ...emailData, notification_enabled: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="notification_enabled" className="font-medium text-foreground">
                Enable Notification Emails
              </label>
            </div>

            {emailData.notification_enabled && (
              <div className="ml-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Notification Recipients</label>
                  <div className="space-y-2">
                    {emailData.notification_emails.map((email, index) => (
                      <div key={index} className="flex items-center justify-between bg-secondary px-3 py-2 rounded-lg">
                        <span className="text-foreground">{email}</span>
                        <button
                          onClick={() => removeNotificationEmail(email)}
                          className="text-destructive hover:bg-destructive/10 p-1 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex space-x-2">
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brandPurple"
                        placeholder="Add email address"
                        onKeyPress={(e) => e.key === 'Enter' && addNotificationEmail()}
                      />
                      <button
                        onClick={addNotificationEmail}
                        className="px-3 py-2 bg-brandPurple text-white rounded-lg hover:bg-brandPurple/90 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Notification Subject</label>
                  <input
                    type="text"
                    value={emailData.notification_subject}
                    onChange={(e) => setEmailData({ ...emailData, notification_subject: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brandPurple"
                    placeholder="Email subject"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Notification Template</label>
                  <textarea
                    value={emailData.notification_template}
                    onChange={(e) => setEmailData({ ...emailData, notification_template: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brandPurple"
                    rows={6}
                    placeholder="Email template (use {{field_name}} for dynamic content)"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use placeholders like {{`{name}`}}, {{`{email}`}}, {{`{message}`}} for dynamic content
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Auto-Reply Settings */}
          <div className="space-y-4 border-t border-border pt-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="auto_reply_enabled"
                checked={emailData.auto_reply_enabled}
                onChange={(e) => setEmailData({ ...emailData, auto_reply_enabled: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="auto_reply_enabled" className="font-medium text-foreground">
                Enable Auto-Reply Email to Client
              </label>
            </div>

            {emailData.auto_reply_enabled && (
              <div className="ml-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">From Name</label>
                    <input
                      type="text"
                      value={emailData.from_name || ''}
                      onChange={(e) => setEmailData({ ...emailData, from_name: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brandPurple"
                      placeholder="GOSG Team"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">From Email (Optional)</label>
                    <input
                      type="email"
                      value={emailData.from_email || ''}
                      onChange={(e) => setEmailData({ ...emailData, from_email: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brandPurple"
                      placeholder="noreply@gosg.com.sg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Auto-Reply Subject</label>
                  <input
                    type="text"
                    value={emailData.auto_reply_subject}
                    onChange={(e) => setEmailData({ ...emailData, auto_reply_subject: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brandPurple"
                    placeholder="Thank you for your submission"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Auto-Reply Template</label>
                  <textarea
                    value={emailData.auto_reply_template}
                    onChange={(e) => setEmailData({ ...emailData, auto_reply_template: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brandPurple"
                    rows={6}
                    placeholder="Auto-reply message template"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use placeholders like {{`{name}`}} for personalized auto-replies
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-border flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(emailData)}
            className="px-4 py-2 bg-brandPurple text-white rounded-lg hover:bg-brandPurple/90 transition-colors"
          >
            Save Email Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormsManager;
