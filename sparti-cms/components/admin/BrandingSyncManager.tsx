import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, AlertCircle, Copy, Download, Upload } from 'lucide-react';

interface TenantSyncStatus {
  tenantId: string;
  tenantName: string;
  total: number;
  existing: number;
  missing: number;
  missingKeys: string[];
  isComplete: boolean;
}

interface SyncResult {
  tenantId: string;
  tenantName: string;
  success: boolean;
  updates?: number;
  inserts?: number;
  skipped?: number;
  error?: string;
}

export const BrandingSyncManager: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<TenantSyncStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedMaster, setSelectedMaster] = useState<string>('');
  const [syncOptions, setSyncOptions] = useState({
    overwrite: false,
    onlyMissing: true
  });

  useEffect(() => {
    loadSyncStatus();
  }, []);

  const loadSyncStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings/branding/sync/status');
      const data = await response.json();
      
      if (data.success) {
        setSyncStatus(data.tenants);
      }
    } catch (error) {
      console.error('Failed to load sync status:', error);
      setMessage({ type: 'error', text: 'Failed to load sync status' });
    } finally {
      setLoading(false);
    }
  };

  const handleEnsureDefaults = async () => {
    try {
      setSyncing(true);
      setMessage(null);
      
      const response = await fetch('/api/settings/branding/sync/defaults', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `Added default settings to ${data.results.filter((r: any) => r.added > 0).length} tenants` 
        });
        await loadSyncStatus();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to ensure defaults' });
      }
    } catch (error) {
      console.error('Failed to ensure defaults:', error);
      setMessage({ type: 'error', text: 'Failed to ensure defaults' });
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncAll = async () => {
    if (!selectedMaster) {
      setMessage({ type: 'error', text: 'Please select a master tenant' });
      return;
    }

    try {
      setSyncing(true);
      setMessage(null);
      
      const response = await fetch('/api/settings/branding/sync/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          masterTenantId: selectedMaster === 'global' ? null : selectedMaster,
          options: syncOptions
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        const successCount = data.results.filter((r: SyncResult) => r.success).length;
        setMessage({ 
          type: 'success', 
          text: `Successfully synced ${successCount} of ${data.tenantsProcessed} tenants` 
        });
        await loadSyncStatus();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to sync all tenants' });
      }
    } catch (error) {
      console.error('Failed to sync all:', error);
      setMessage({ type: 'error', text: 'Failed to sync all tenants' });
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncSingle = async (targetTenantId: string) => {
    if (!selectedMaster) {
      setMessage({ type: 'error', text: 'Please select a master tenant' });
      return;
    }

    try {
      setSyncing(true);
      setMessage(null);
      
      const response = await fetch('/api/settings/branding/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceTenantId: selectedMaster === 'global' ? null : selectedMaster,
          targetTenantId,
          options: syncOptions
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `Synced: ${data.inserts} added, ${data.updates} updated, ${data.skipped} skipped` 
        });
        await loadSyncStatus();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to sync tenant' });
      }
    } catch (error) {
      console.error('Failed to sync tenant:', error);
      setMessage({ type: 'error', text: 'Failed to sync tenant' });
    } finally {
      setSyncing(false);
    }
  };

  const completeCount = syncStatus.filter(s => s.isComplete).length;
  const incompleteCount = syncStatus.filter(s => !s.isComplete).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Branding Settings Sync</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage and synchronize branding settings across all tenants
          </p>
        </div>
        <button
          onClick={loadSyncStatus}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{syncStatus.length}</div>
          <div className="text-sm text-gray-500">Total Tenants</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-700">{completeCount}</div>
          <div className="text-sm text-green-600">Complete</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-amber-700">{incompleteCount}</div>
          <div className="text-sm text-amber-600">Incomplete</div>
        </div>
      </div>

      {/* Sync Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Sync Controls</h3>
        
        {/* Master Tenant Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Master Tenant (Source)
          </label>
          <select
            value={selectedMaster}
            onChange={(e) => setSelectedMaster(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select master tenant...</option>
            <option value="global">Global (null tenant_id)</option>
            {syncStatus.map(tenant => (
              <option key={tenant.tenantId} value={tenant.tenantId}>
                {tenant.tenantName} ({tenant.existing}/{tenant.total} settings)
              </option>
            ))}
          </select>
        </div>

        {/* Sync Options */}
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={syncOptions.onlyMissing}
              onChange={(e) => setSyncOptions({ ...syncOptions, onlyMissing: e.target.checked })}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Only add missing settings (don't update existing)</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={syncOptions.overwrite}
              onChange={(e) => setSyncOptions({ ...syncOptions, overwrite: e.target.checked })}
              disabled={syncOptions.onlyMissing}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Overwrite existing settings</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleEnsureDefaults}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Ensure All Have Defaults
          </button>
          <button
            onClick={handleSyncAll}
            disabled={syncing || !selectedMaster}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            Sync All from Master
          </button>
        </div>
      </div>

      {/* Tenant List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Tenant Status</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {syncStatus.map(tenant => (
            <div key={tenant.tenantId} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {tenant.isComplete ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{tenant.tenantName}</div>
                      <div className="text-sm text-gray-500">{tenant.tenantId}</div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      {tenant.existing}/{tenant.total} settings
                    </span>
                    {tenant.missing > 0 && (
                      <span className="text-amber-600 font-medium">
                        {tenant.missing} missing
                      </span>
                    )}
                  </div>
                  {tenant.missing > 0 && tenant.missingKeys.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Missing: {tenant.missingKeys.slice(0, 5).join(', ')}
                      {tenant.missingKeys.length > 5 && ` +${tenant.missingKeys.length - 5} more`}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleSyncSingle(tenant.tenantId)}
                  disabled={syncing || !selectedMaster || tenant.tenantId === selectedMaster}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium disabled:opacity-50"
                >
                  <Copy className="h-4 w-4" />
                  Sync
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};