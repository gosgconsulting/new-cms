import React from 'react';

interface FormData {
  id: string;
  name: string;
  fields: Array<{ name: string; placeholder: string; type: string }>;
  submissions: number;
  location: string;
}

const FormsManager: React.FC = () => {
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

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Forms Management</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your website forms and view submissions</p>
        </div>
      </div>

      {/* Forms List */}
      <div className="p-6">
        <div className="space-y-4">
          {forms.map((form) => (
            <div 
              key={form.id}
              className="border border-gray-200 rounded-lg p-5"
            >
              <div>
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
