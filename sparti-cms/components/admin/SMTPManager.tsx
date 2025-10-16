import React, { useState, useEffect } from 'react';
import { Mail, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const SMTPManager: React.FC = () => {
  const [smtpConfig, setSmtpConfig] = useState({
    resendApiKey: '',
    fromEmail: '',
    fromName: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSmtpConfig();
  }, []);

  const loadSmtpConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('project_settings')
        .select('*')
        .single();

      if (data) {
        setSmtpConfig({
          resendApiKey: (data as any).smtp_resend_key || '',
          fromEmail: (data as any).smtp_from_email || '',
          fromName: (data as any).smtp_from_name || ''
        });
      }
    } catch (err) {
      console.error('Error loading SMTP config:', err);
      setError('Failed to load SMTP configuration');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSmtpConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const { data: existing } = await supabase
        .from('project_settings')
        .select('id')
        .single();

      const updateData = {
        smtp_resend_key: smtpConfig.resendApiKey,
        smtp_from_email: smtpConfig.fromEmail,
        smtp_from_name: smtpConfig.fromName,
        updated_at: new Date().toISOString()
      };

      if (existing) {
        const { error } = await supabase
          .from('project_settings')
          .update(updateData)
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('project_settings')
          .insert(updateData);

        if (error) throw error;
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving SMTP config:', err);
      setError('Failed to save SMTP configuration');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Mail className="h-6 w-6 mr-2" />
          SMTP Configuration
        </h2>
        <p className="text-gray-600 mt-1">
          Configure your email sending service using Resend
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-800">SMTP configuration saved successfully!</p>
        </div>
      )}

      {/* Configuration Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSaveSmtpConfig} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Key className="inline h-4 w-4 mr-2" />
              Resend API Key
            </label>
            <input
              type="password"
              value={smtpConfig.resendApiKey}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, resendApiKey: e.target.value })}
              placeholder="re_..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              Get your API key from <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">resend.com/api-keys</a>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Mail className="inline h-4 w-4 mr-2" />
              From Email
            </label>
            <input
              type="email"
              value={smtpConfig.fromEmail}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
              placeholder="noreply@yourdomain.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              The email address that emails will be sent from
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Name
            </label>
            <input
              type="text"
              value={smtpConfig.fromName}
              onChange={(e) => setSmtpConfig({ ...smtpConfig, fromName: e.target.value })}
              placeholder="Your Company Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              The name that will appear as the sender
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>

      {/* Information Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">About Resend SMTP</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            <strong>1. Create an account:</strong> Sign up at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline">resend.com</a>
          </p>
          <p>
            <strong>2. Verify your domain:</strong> Add your domain at <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline">resend.com/domains</a>
          </p>
          <p>
            <strong>3. Generate API key:</strong> Create an API key at <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">resend.com/api-keys</a>
          </p>
          <p>
            <strong>4. Configure above:</strong> Enter your API key, verified from email, and company name
          </p>
        </div>
      </div>
    </div>
  );
};

export default SMTPManager;
