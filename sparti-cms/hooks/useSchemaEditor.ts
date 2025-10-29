import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '../components/auth/AuthProvider';
import api from '../utils/api';

interface UseSchemaEditorOptions<T> {
  schemaKey: string;
  defaultSchema: T;
  onError?: (error: Error) => void;
}

export function useSchemaEditor<T>({ 
  schemaKey, 
  defaultSchema, 
  onError 
}: UseSchemaEditorOptions<T>) {
  const { currentTenantId } = useAuth();
  const [schema, setSchema] = useState<T>(defaultSchema);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentTenantId) {
      loadSchema();
    }
  }, [currentTenantId]);

  const loadSchema = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/site-schemas/${schemaKey}?tenantId=${currentTenantId}`, {
        headers: {
          'X-Tenant-Id': currentTenantId || ''
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.schema) {
          setSchema(data.schema);
        } else {
          setSchema(defaultSchema);
        }
      } else {
        console.error(`Failed to load ${schemaKey} schema`);
        setSchema(defaultSchema);
      }
    } catch (error) {
      console.error(`Error loading ${schemaKey} schema:`, error);
      setSchema(defaultSchema);
      const errorMessage = `Failed to load ${schemaKey} schema`;
      toast.error(errorMessage);
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const saveSchema = async (schemaToSave: T) => {
    try {
      setSaving(true);
      const response = await api.put(`/api/site-schemas/${schemaKey}?tenantId=${currentTenantId}`, {
        schema: schemaToSave
      }, {
        headers: {
          'X-Tenant-Id': currentTenantId || '',
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success(`${schemaKey} schema saved successfully`);
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to save ${schemaKey} schema`);
      }
    } catch (error) {
      console.error(`Error saving ${schemaKey} schema:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to save ${schemaKey} schema`;
      toast.error(errorMessage);
      onError?.(error as Error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateSchema = (updates: Partial<T>) => {
    setSchema(prev => ({ ...prev, ...updates }));
  };

  return {
    schema,
    setSchema,
    loading,
    saving,
    loadSchema,
    saveSchema,
    updateSchema
  };
}
