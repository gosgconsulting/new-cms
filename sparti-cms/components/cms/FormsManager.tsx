import React, { useState } from 'react';
import { Eye, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FormLeadsView from './FormLeadsView';

interface FormData {
  id: string;
  name: string;
  fields: Array<{ name: string; placeholder: string; type: string }>;
  submissions: number;
  location: string;
}

const FormsManager: React.FC = () => {
  const [selectedForm, setSelectedForm] = useState<FormData | null>(null);

  // Detected forms from the homepage
  const forms: FormData[] = [
    {
      id: 'contact-modal',
      name: 'Contact Modal Form',
      fields: [
        { name: 'name', placeholder: 'John Doe', type: 'text' },
        { name: 'email', placeholder: 'hello@yourcompany.com', type: 'email' },
        { name: 'phone', placeholder: '+65 1234 5678', type: 'tel' },
        { name: 'message', placeholder: 'Tell us about your project...', type: 'textarea' }
      ],
      submissions: 0,
      location: ''
    }
  ];

  if (selectedForm) {
    return <FormLeadsView form={selectedForm} onBack={() => setSelectedForm(null)} />;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Forms Management</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your website forms and view submissions</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Form
          </Button>
        </div>
      </div>

      {/* Forms List */}
      <div className="p-6">
        <div className="space-y-4">
          {forms.map((form) => (
            <div 
              key={form.id}
              className="border border-gray-200 rounded-lg p-5 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{form.name}</h3>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium mr-2">Fields:</span>
                      <div className="flex flex-wrap gap-2">
                        {form.fields.map((field, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                            {field.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setSelectedForm(form)}
                  className="ml-4 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Leads
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {forms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No forms found. Create your first form to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormsManager;
