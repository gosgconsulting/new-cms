import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { api } from '../../utils/api';
import FormLeadsView from './FormLeadsView';
import { 
  FileText, 
  Plus, 
  Edit3, 
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
  ChevronRight,
  Target
} from 'lucide-react';

interface FormField {
  id?: number;
  field_name: string;
  field_type: string;
  field_label: string;
  placeholder?: string;
  is_required: boolean;
  validation_rules?: Record<string, unknown>;
  options?: string[];
  sort_order: number;
  // Database linking
  links_to_table?: 'contacts' | 'messages' | null;
  links_to_field?: string; // e.g., 'full_name', 'email', 'phone', 'message'
}

interface Form {
  id: number;
  name: string;
  description?: string;
  fields: FormField[];
  settings: Record<string, unknown>;
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
  submission_data: Record<string, unknown>;
  submitter_email?: string;
  submitter_name?: string;
  submitter_ip?: string;
  status: string;
  notes?: string;
  submitted_at: string;
  processed_at?: string;
}

const FormsManager: React.FC = () => {
  const { currentTenantId } = useAuth();
  const [forms, setForms] = useState<Form[]>([]);
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [emailSettings, setEmailSettings] = useState<EmailSettings | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showLeadsView, setShowLeadsView] = useState(false);
  const [editingForm, setEditingForm] = useState<Form | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Field type options for form builder
  const fieldTypes = [
    { value: 'full_name', label: 'Full Name (Linked to Contacts)', linksTo: 'contacts' },
    { value: 'text', label: 'Text Input' },
    { value: 'email', label: 'Email Input' },
    { value: 'phone', label: 'Phone Input' },
    { value: 'message', label: 'Message (Linked to Messages)', linksTo: 'messages' },
    { value: 'button', label: 'Button' },
    { value: 'textarea', label: 'Textarea' },
    { value: 'select', label: 'Select Dropdown' },
    { value: 'checkbox', label: 'Checkbox' },
    { value: 'radio', label: 'Radio Button' },
    { value: 'file', label: 'File Upload' },
    { value: 'date', label: 'Date' },
    { value: 'number', label: 'Number' },
    { value: 'url', label: 'URL' }
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

  // Load submissions when leads view is shown
  useEffect(() => {
    if (showLeadsView && selectedForm) {
      loadSubmissions(selectedForm.id);
    }
  }, [showLeadsView, selectedForm?.id]);

  const loadForms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!currentTenantId) {
        setError('Tenant ID is required');
        setIsLoading(false);
        return;
      }
      
      const response = await api.get(`/api/forms?tenantId=${encodeURIComponent(currentTenantId)}`, {
        tenantId: currentTenantId
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setForms(data);
      
      // Auto-select first form if none selected
      if (!selectedForm && data.length > 0) {
        setSelectedForm(data[0]);
      }
    } catch (err: unknown) {
      setError(`Failed to load forms: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadEmailSettings = async (formId: number) => {
    try {
      if (!currentTenantId) return;
      const response = await api.get(`/api/forms/${formId}/email-settings`, {
        tenantId: currentTenantId
      });
      if (!response.ok) {
        if (response.status === 404) {
          setEmailSettings(null);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setEmailSettings(data);
    } catch (err: unknown) {
      console.error('Failed to load email settings:', err);
      setEmailSettings(null);
    }
  };

  const loadSubmissions = async (formId: number) => {
    try {
      if (!currentTenantId) return;
      const response = await api.get(`/api/forms/${formId}/submissions`, {
        tenantId: currentTenantId
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setSubmissions(data);
    } catch (err: unknown) {
      console.error('Failed to load submissions:', err);
      setSubmissions([]);
    }
  };

  const saveForm = async (formData: Partial<Form>) => {
    try {
      setError(null);
      
      if (editingForm) {
        // Update existing form
        const response = await api.put(`/api/forms/${editingForm.id}`, {
          name: formData.name,
          description: formData.description,
          fields: formData.fields || [],
          settings: formData.settings || {},
          is_active: formData.is_active ?? true,
          tenantId: currentTenantId
        }, {
          tenantId: currentTenantId
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setSuccess('Form updated successfully!');
      } else {
        // Create new form
        const response = await api.post('/api/forms', {
          name: formData.name,
          description: formData.description,
          fields: formData.fields || [],
          settings: formData.settings || {},
          is_active: formData.is_active ?? true,
          tenantId: currentTenantId
        }, {
          tenantId: currentTenantId
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setSuccess('Form created successfully!');
      }
      
      await loadForms();
      setShowFormModal(false);
      setEditingForm(null);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(`Failed to save form: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const saveEmailSettings = async (settings: EmailSettings) => {
    try {
      setError(null);
      
      const response = await api.put(`/api/forms/${settings.form_id}/email-settings`, {
        notification_enabled: settings.notification_enabled,
        notification_emails: settings.notification_emails,
        notification_subject: settings.notification_subject,
        notification_template: settings.notification_template,
        auto_reply_enabled: settings.auto_reply_enabled,
        auto_reply_subject: settings.auto_reply_subject,
        auto_reply_template: settings.auto_reply_template,
        from_email: settings.from_email,
        from_name: settings.from_name
      }, {
        tenantId: currentTenantId
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      setSuccess('Email settings saved successfully!');
      if (selectedForm) {
        await loadEmailSettings(selectedForm.id);
      }
      setShowEmailModal(false);
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      setError(`Failed to save email settings: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brandPurple mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading forms...</p>
        </div>
      </div>
    );
  }

  // Show leads view if active
  if (showLeadsView && selectedForm) {
    return (
      <div className="space-y-6">
        <FormLeadsView
          form={{
            id: selectedForm.id.toString(),
            name: selectedForm.name,
            fields: selectedForm.fields.map(f => ({
              name: f.field_label || f.field_name,
              placeholder: f.placeholder || '',
              type: f.field_type
            })),
            submissions: submissions.length,
            location: ''
          }}
          onBack={() => {
            setShowLeadsView(false);
          }}
        />
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
            <div className="flex items-center space-x-3">
              <button
                onClick={async () => {
                  if (!currentTenantId) {
                    setError('Tenant ID is required');
                    return;
                  }
                  
                  if (!confirm('This will remove duplicate forms for your tenant. Submissions from deleted duplicates will be merged into the most recent form. Continue?')) {
                    return;
                  }
                  
                  try {
                    setIsLoading(true);
                    const response = await api.post(`/api/forms/cleanup-duplicates?tenantId=${encodeURIComponent(currentTenantId)}`, null, {
                      tenantId: currentTenantId
                    });
                    
                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || 'Failed to clean up duplicates');
                    }
                    
                    const result = await response.json();
                    setSuccess(`Successfully removed ${result.deletedCount} duplicate form(s)`);
                    
                    // Reload forms after cleanup
                    await loadForms();
                  } catch (err: unknown) {
                    setError(`Failed to clean up duplicates: ${err instanceof Error ? err.message : 'Unknown error'}`);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                title="Remove duplicate forms"
              >
                <Filter className="mr-2 h-4 w-4" />
                Clean Duplicates
              </button>
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
          {/* Forms List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Forms
              </h3>
            </div>

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
                          setSelectedForm(form);
                          setShowLeadsView(true);
                        }}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-white border-2 border-gray-900 rounded-lg hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-200 transition-all duration-200"
                        title="View Leads"
                      >
                        Leads
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedForm(form);
                          setShowEmailModal(true);
                        }}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:ring-4 focus:outline-none focus:ring-purple-200 transition-all duration-200"
                        title="Email Settings"
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Emails
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingForm(form);
                          setShowFormModal(true);
                        }}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors focus:ring-2 focus:outline-none focus:ring-gray-200"
                        title="Edit Form"
                      >
                        <Edit3 className="w-4 h-4" />
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
          </div>
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
          formName={selectedForm.name}
          emailSettings={emailSettings}
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
  fieldTypes: Array<{ value: string; label: string; linksTo?: string }>;
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
      sort_order: (formData.fields?.length || 0) + 1,
      links_to_table: null,
      links_to_field: undefined
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
                        onChange={(e) => {
                          const newType = e.target.value;
                          const selectedType = fieldTypes.find(t => t.value === newType);
                          const updates: Partial<FormField> = { field_type: newType };
                          
                          // Auto-set database linking based on field type
                          if (newType === 'full_name') {
                            updates.links_to_table = 'contacts';
                            updates.links_to_field = 'full_name';
                            updates.field_name = 'full_name';
                            updates.field_label = updates.field_label || 'Full Name';
                          } else if (newType === 'email') {
                            updates.links_to_table = 'contacts';
                            updates.links_to_field = 'email';
                            updates.field_name = 'email';
                            updates.field_label = updates.field_label || 'Email Address';
                          } else if (newType === 'phone') {
                            updates.links_to_table = 'contacts';
                            updates.links_to_field = 'phone';
                            updates.field_name = 'phone';
                            updates.field_label = updates.field_label || 'Phone Number';
                          } else if (newType === 'message') {
                            updates.links_to_table = 'messages';
                            updates.links_to_field = 'message';
                            updates.field_name = 'message';
                            updates.field_label = updates.field_label || 'Message';
                          } else if (newType === 'button') {
                            updates.links_to_table = null;
                            updates.links_to_field = undefined;
                            updates.is_required = false; // Buttons are never required
                          } else {
                            updates.links_to_table = null;
                            updates.links_to_field = undefined;
                          }
                          
                          updateField(index, updates);
                        }}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-brandPurple text-sm"
                      >
                        {fieldTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      {field.field_type === 'full_name' && (
                        <p className="text-xs text-muted-foreground mt-1">Linked to Contacts table</p>
                      )}
                      {field.field_type === 'message' && (
                        <p className="text-xs text-muted-foreground mt-1">Linked to Messages table</p>
                      )}
                      {(field.field_type === 'email' || field.field_type === 'phone') && (
                        <p className="text-xs text-muted-foreground mt-1">Will be saved to Contacts table</p>
                      )}
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
                        disabled={field.field_type === 'button'}
                      />
                    </div>
                  </div>

                  {/* Button-specific settings */}
                  {field.field_type === 'button' && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-700">
                        Button fields are used for form submission. They don't require a name or placeholder.
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`required-${index}`}
                        checked={field.is_required}
                        onChange={(e) => updateField(index, { is_required: e.target.checked })}
                        className="mr-2"
                        disabled={field.field_type === 'button'}
                      />
                      <label htmlFor={`required-${index}`} className="text-sm font-medium text-foreground">
                        Required {field.field_type === 'button' && '(N/A for buttons)'}
                      </label>
                    </div>

                    <button
                      onClick={() => removeField(index)}
                      className="flex items-center px-2 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                    >
                      <X className="mr-1 h-4 w-4" />
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
  formName: string;
  emailSettings: EmailSettings | null;
  onSave: (settings: EmailSettings) => void;
  onClose: () => void;
}> = ({ formId, formName, emailSettings, onSave, onClose }) => {
  const [emailData, setEmailData] = useState<EmailSettings>({
    form_id: formId,
    notification_enabled: emailSettings?.notification_enabled ?? true,
    notification_emails: emailSettings?.notification_emails || ['admin@gosg.com.sg'],
    notification_subject: emailSettings?.notification_subject || 'New Form Submission',
    notification_template: emailSettings?.notification_template || 'You have received a new form submission from {{name}} ({{email}}).\n\nMessage:\n{{message}}',
    auto_reply_enabled: emailSettings?.auto_reply_enabled ?? false,
    auto_reply_subject: emailSettings?.auto_reply_subject || 'Thank you for your submission',
    auto_reply_template: emailSettings?.auto_reply_template || 'Dear {{name}},\n\nThank you for contacting us. We have received your message and will get back to you within 24 hours.\n\nBest regards,\nGOSG Team',
    from_email: emailSettings?.from_email || '',
    from_name: emailSettings?.from_name || 'GOSG Team',
    ...emailSettings
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
            <h3 className="text-lg font-semibold text-foreground">Email Settings - {formName}</h3>
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
                          className="text-red-600 hover:bg-red-50 p-1 rounded"
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
                    Use placeholders like {`{{name}}`}, {`{{email}}`}, {`{{message}}`} for dynamic content
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
                    Use placeholders like {`{{name}}`} for personalized auto-replies
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