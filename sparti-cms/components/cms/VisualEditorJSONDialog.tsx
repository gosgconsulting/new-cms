import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../../../src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '../../../src/components/ui/dialog';
import { JSON_EDITOR_CONFIG } from '../../utils/componentHelpers';
import { CodeJar } from 'codejar';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism.css';
import { validateJSON } from '../../utils/validation';
import { Loader2 } from 'lucide-react';
import api from '../../utils/api';

interface VisualEditorJSONDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pageSlug: string;
  pageName: string;
  tenantId?: string;
  mode?: 'tenants' | 'theme';
  currentThemeId?: string | null;
  currentTenantId?: string | null;
  connectionName?: string;
}

export const VisualEditorJSONDialog: React.FC<VisualEditorJSONDialogProps> = ({
  open,
  onOpenChange,
  pageSlug,
  pageName,
  tenantId,
  mode = 'tenants',
  currentThemeId,
  currentTenantId,
  connectionName,
}) => {
  const [jsonString, setJsonString] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [connectionInfo, setConnectionInfo] = useState<{ type: 'tenant' | 'theme' | 'none'; name: string } | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const codeJarRef = useRef<CodeJar | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load connection info
  const loadConnectionInfo = async () => {
    try {
      // If connectionName is provided, use it
      if (connectionName) {
        setConnectionInfo({
          type: mode === 'theme' ? 'theme' : 'tenant',
          name: connectionName
        });
        return;
      }

      // Otherwise, fetch from API
      if (mode === 'theme' && currentThemeId) {
        // Fetch theme name
        const response = await api.get(`/api/themes`);
        if (response.ok) {
          const data = await response.json();
          const theme = data.themes?.find((t: any) => (t.slug || t.id) === currentThemeId);
          setConnectionInfo({
            type: 'theme',
            name: theme?.name || currentThemeId
          });
        } else {
          setConnectionInfo({
            type: 'theme',
            name: currentThemeId
          });
        }
      } else if (mode === 'tenants' && currentTenantId) {
        // Fetch tenant name
        const response = await api.get(`/api/tenants`);
        if (response.ok) {
          const data = await response.json();
          const tenant = data.find((t: any) => t.id === currentTenantId);
          setConnectionInfo({
            type: 'tenant',
            name: tenant?.name || currentTenantId
          });
        } else {
          setConnectionInfo({
            type: 'tenant',
            name: currentTenantId
          });
        }
      } else {
        setConnectionInfo({
          type: 'none',
          name: 'Not connected'
        });
      }
    } catch (error) {
      console.error('[testing] Error loading connection info:', error);
      setConnectionInfo({
        type: mode === 'theme' ? 'theme' : 'tenant',
        name: mode === 'theme' ? (currentThemeId || 'Not connected') : (currentTenantId || 'Not connected')
      });
    }
  };

  // Load JSON and connection info when dialog opens
  useEffect(() => {
    if (open) {
      loadConnectionInfo();
      loadPageLayout();
    } else {
      // Cleanup on close
      if (codeJarRef.current) {
        try {
          codeJarRef.current.destroy();
        } catch (error) {
          // Ignore cleanup errors
          console.warn('[testing] Error destroying CodeJar:', error);
        }
        codeJarRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      // Reset state
      setJsonString('');
      setJsonError(null);
      setLoading(false);
    }
  }, [open, pageSlug, tenantId, mode, currentThemeId, currentTenantId]);

  const loadPageLayout = async () => {
    try {
      setLoading(true);
      setJsonError(null);
      
      // For themes, we might not have a tenantId, so handle that
      const effectiveTenantId = tenantId || (mode === 'tenants' ? currentTenantId : undefined) || 'tenant-gosg';
      
      const encodedSlug = encodeURIComponent(pageSlug);
      const response = await api.get(`/api/ai-assistant/page-context?slug=${encodedSlug}&tenantId=${effectiveTenantId}`);
      const data = await response.json();
      
      if (data.success && data.pageContext?.layout) {
        const layoutJson = JSON.stringify(data.pageContext.layout, null, JSON_EDITOR_CONFIG.TAB_SIZE);
        setJsonString(layoutJson);
        // Update editor after setting JSON
        setTimeout(() => {
          if (codeJarRef.current && editorRef.current && document.contains(editorRef.current)) {
            codeJarRef.current.updateCode(layoutJson);
          } else if (editorRef.current && document.contains(editorRef.current)) {
            initializeCodeJar(editorRef.current);
          }
        }, 200);
      } else {
        // Empty layout if not found
        const emptyLayout = JSON.stringify({ components: [] }, null, JSON_EDITOR_CONFIG.TAB_SIZE);
        setJsonString(emptyLayout);
        setTimeout(() => {
          if (codeJarRef.current && editorRef.current && document.contains(editorRef.current)) {
            codeJarRef.current.updateCode(emptyLayout);
          } else if (editorRef.current && document.contains(editorRef.current)) {
            initializeCodeJar(editorRef.current);
          }
        }, 200);
      }
    } catch (error) {
      console.error('[testing] Error loading page layout:', error);
      setJsonError('Failed to load page layout');
      // Set empty layout on error
      const emptyLayout = JSON.stringify({ components: [] }, null, JSON_EDITOR_CONFIG.TAB_SIZE);
      setJsonString(emptyLayout);
      setTimeout(() => {
        if (codeJarRef.current && editorRef.current && document.contains(editorRef.current)) {
          codeJarRef.current.updateCode(emptyLayout);
        } else if (editorRef.current && document.contains(editorRef.current)) {
          initializeCodeJar(editorRef.current);
        }
      }, 200);
    } finally {
      setLoading(false);
    }
  };

  // Initialize CodeJar
  const initializeCodeJar = useCallback((element: HTMLDivElement) => {
    // Clean up any existing instance first
    if (codeJarRef.current) {
      try {
        codeJarRef.current.destroy();
      } catch (error) {
        // Ignore cleanup errors
      }
      codeJarRef.current = null;
    }

    if (!element || !open || !document.contains(element)) {
      return;
    }

    const highlight = (editor: HTMLElement) => {
      const code = editor.textContent || '';
      try {
        editor.innerHTML = Prism.highlight(code, Prism.languages.json, 'json');
      } catch (error) {
        editor.innerHTML = code;
      }
    };

    try {
      codeJarRef.current = CodeJar(element, highlight, {
        tab: ' '.repeat(JSON_EDITOR_CONFIG.TAB_SIZE),
      });

      const initialContent = jsonString || JSON.stringify({ components: [] }, null, JSON_EDITOR_CONFIG.TAB_SIZE);
      codeJarRef.current.updateCode(initialContent);

      codeJarRef.current.onUpdate((code) => {
        setJsonString(code);
        const validation = validateJSON(code);
        if (validation.valid) {
          setJsonError(null);
        } else {
          setJsonError(validation.error || 'Invalid JSON format.');
        }
      });

      setTimeout(() => {
        if (element && document.contains(element)) {
          element.focus();
        }
      }, JSON_EDITOR_CONFIG.FOCUS_DELAY || 200);
    } catch (error) {
      console.error('[testing] Error initializing CodeJar:', error);
    }
  }, [jsonString, open]);

  // Callback ref to initialize when element mounts
  const setEditorRef = useCallback((element: HTMLDivElement | null) => {
    if (element && open) {
      // Clear any existing timeout
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      
      // Initialize after a short delay to ensure DOM is ready
      retryTimeoutRef.current = setTimeout(() => {
        if (element && document.contains(element) && open) {
          initializeCodeJar(element);
        }
      }, JSON_EDITOR_CONFIG.INIT_DELAY || 200);
    } else if (!element && codeJarRef.current) {
      // Cleanup when element is removed
      try {
        codeJarRef.current.destroy();
      } catch (error) {
        // Ignore cleanup errors
      }
      codeJarRef.current = null;
    }
  }, [open, initializeCodeJar]);

  const handleSave = async () => {
    if (jsonError) {
      return;
    }

    try {
      setSaving(true);
      const parsed = JSON.parse(jsonString);
      
      // First get pageId from slug
      const effectiveTenantId = tenantId || (mode === 'tenants' ? currentTenantId : undefined) || 'tenant-gosg';
      const encodedSlug = encodeURIComponent(pageSlug);
      const pageContextResponse = await api.get(`/api/ai-assistant/page-context?slug=${encodedSlug}&tenantId=${effectiveTenantId}`);
      const pageContextData = await pageContextResponse.json();
      
      if (!pageContextData.success || !pageContextData.pageContext?.pageId) {
        throw new Error('Page not found');
      }
      
      const response = await api.put(`/api/pages/${pageContextData.pageContext.pageId}/layout`, {
        layout_json: parsed,
        tenantId: effectiveTenantId,
      });
      
      const data = await response.json();
      
      if (data.success) {
        onOpenChange(false);
      } else {
        setJsonError('Failed to save layout');
      }
    } catch (error) {
      console.error('[testing] Error saving layout:', error);
      setJsonError('Failed to save layout');
    } finally {
      setSaving(false);
    }
  };

  const handleSyncJSON = async () => {
    try {
      setSyncing(true);
      setJsonError(null);
      
      // Call AI Assistant to generate schema (using default affordable model)
      const effectiveTenantId = tenantId || (mode === 'tenants' ? currentTenantId : undefined) || 'tenant-gosg';
      const encodedSlug = encodeURIComponent(pageSlug);
      const response = await api.post('/api/ai-assistant/generate-schema', {
        pageSlug,
        pageName,
        tenantId: effectiveTenantId,
        model: 'claude-3-5-haiku-20241022', // Use affordable model for schema generation
      });
      
      const data = await response.json();
      
      if (data.success && data.schema) {
        const schemaJson = JSON.stringify(data.schema, null, JSON_EDITOR_CONFIG.TAB_SIZE);
        setJsonString(schemaJson);
        if (codeJarRef.current) {
          codeJarRef.current.updateCode(schemaJson);
        }
      } else {
        setJsonError(data.error || 'Failed to generate schema');
      }
    } catch (error) {
      console.error('[testing] Error syncing JSON:', error);
      setJsonError('Failed to sync JSON from AI');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Page Schema JSON Editor</DialogTitle>
          <DialogDescription>
            Edit the complete page structure. Be careful with this editor.
            {connectionInfo && (
              <div className="mt-2 text-xs text-muted-foreground">
                Connected to {connectionInfo.type === 'tenant' ? 'Tenant' : connectionInfo.type === 'theme' ? 'Theme' : ''}: <span className="font-semibold">{connectionInfo.name}</span>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto p-4 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div
              ref={setEditorRef}
              className="w-full h-full p-4 outline-none font-mono text-sm border border-gray-300 rounded overflow-auto bg-white"
              style={{
                minHeight: JSON_EDITOR_CONFIG.MIN_HEIGHT,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                tabSize: JSON_EDITOR_CONFIG.TAB_SIZE,
              }}
              spellCheck="false"
              dir="ltr"
            />
          )}
          {jsonError && <p className="text-destructive text-sm mt-2">{jsonError}</p>}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleSyncJSON}
            disabled={syncing || loading}
          >
            {syncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              'Sync JSON'
            )}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={!!jsonError || saving || loading}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save & Close'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

