// Migration UI component for batch schema migration

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../src/components/ui/card';
import { Button } from '../../../src/components/ui/button';
import { Badge } from '../../../src/components/ui/badge';
import { Progress } from '../../../src/components/ui/progress';
import { Alert, AlertDescription } from '../../../src/components/ui/alert';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Database, 
  ArrowRight,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../auth/AuthProvider';

interface PageInfo {
  id: string;
  page_name: string;
  slug: string;
  schema_version: string;
  needs_migration: boolean;
}

interface MigrationResult {
  success: boolean;
  migrated: number;
  skipped: number;
  errors: number;
  details: Array<{
    pageId: string;
    pageName: string;
    success: boolean;
    error?: string;
  }>;
}

interface SchemaMigrationProps {
  onClose?: () => void;
}

const SchemaMigration: React.FC<SchemaMigrationProps> = ({ onClose }) => {
  const { currentTenant } = useAuth();
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [selectedPages, setSelectedPages] = useState<Set<string>>(new Set());

  // Fetch pages that need migration
  useEffect(() => {
    const fetchPages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/pages/all?tenantId=${currentTenant.id}`);
        const data = await response.json();
        
        if (data.success) {
          // Check each page's schema version
          const pagesWithSchemaInfo = await Promise.all(
            data.pages.map(async (page: any) => {
              try {
                const pageResponse = await fetch(`/api/pages/${page.id}?tenantId=${currentTenant.id}`);
                const pageData = await pageResponse.json();
                
                if (pageData.success && pageData.page.layout) {
                  const version = pageData.page.layout._version?.version || '1.0';
                  const needsMigration = version === '1.0';
                  
                  return {
                    id: page.id,
                    page_name: page.page_name,
                    slug: page.slug,
                    schema_version: version,
                    needs_migration: needsMigration
                  };
                }
                
                return {
                  id: page.id,
                  page_name: page.page_name,
                  slug: page.slug,
                  schema_version: 'unknown',
                  needs_migration: false
                };
              } catch (error) {
                console.error(`Error checking page ${page.id}:`, error);
                return {
                  id: page.id,
                  page_name: page.page_name,
                  slug: page.slug,
                  schema_version: 'unknown',
                  needs_migration: false
                };
              }
            })
          );
          
          setPages(pagesWithSchemaInfo);
          
          // Auto-select pages that need migration
          const pagesNeedingMigration = pagesWithSchemaInfo
            .filter(page => page.needs_migration)
            .map(page => page.id);
          setSelectedPages(new Set(pagesNeedingMigration));
        }
      } catch (error) {
        console.error('Error fetching pages:', error);
        toast.error('Failed to load pages');
      } finally {
        setLoading(false);
      }
    };

    if (currentTenant.id) {
      fetchPages();
    }
  }, [currentTenant.id]);

  const handleSelectPage = (pageId: string) => {
    const newSelected = new Set(selectedPages);
    if (newSelected.has(pageId)) {
      newSelected.delete(pageId);
    } else {
      newSelected.add(pageId);
    }
    setSelectedPages(newSelected);
  };

  const handleSelectAll = () => {
    const pagesNeedingMigration = pages.filter(page => page.needs_migration);
    setSelectedPages(new Set(pagesNeedingMigration.map(page => page.id)));
  };

  const handleDeselectAll = () => {
    setSelectedPages(new Set());
  };

  const handleMigrate = async () => {
    if (selectedPages.size === 0) {
      toast.error('Please select at least one page to migrate');
      return;
    }

    try {
      setMigrating(true);
      setMigrationProgress(0);
      setMigrationResult(null);

      const selectedPagesList = Array.from(selectedPages);
      const results: MigrationResult['details'] = [];
      let migrated = 0;
      let skipped = 0;
      let errors = 0;

      for (let i = 0; i < selectedPagesList.length; i++) {
        const pageId = selectedPagesList[i];
        const page = pages.find(p => p.id === pageId);
        
        try {
          const response = await fetch(`/api/pages/${pageId}/migrate-schema`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              tenantId: currentTenant.id
            }),
          });

          const data = await response.json();
          
          if (data.success) {
            if (data.migrated) {
              migrated++;
            } else {
              skipped++;
            }
            results.push({
              pageId,
              pageName: page?.page_name || 'Unknown',
              success: true
            });
          } else {
            errors++;
            results.push({
              pageId,
              pageName: page?.page_name || 'Unknown',
              success: false,
              error: data.error || 'Migration failed'
            });
          }
        } catch (error) {
          errors++;
          results.push({
            pageId,
            pageName: page?.page_name || 'Unknown',
            success: false,
            error: error.message
          });
        }

        setMigrationProgress(((i + 1) / selectedPagesList.length) * 100);
      }

      const result: MigrationResult = {
        success: errors === 0,
        migrated,
        skipped,
        errors,
        details: results
      };

      setMigrationResult(result);
      
      if (result.success) {
        toast.success(`Migration completed: ${migrated} migrated, ${skipped} skipped`);
      } else {
        toast.error(`Migration completed with errors: ${migrated} migrated, ${skipped} skipped, ${errors} failed`);
      }

    } catch (error) {
      console.error('Error during migration:', error);
      toast.error('Migration failed');
    } finally {
      setMigrating(false);
    }
  };

  const pagesNeedingMigration = pages.filter(page => page.needs_migration);
  const selectedPagesNeedingMigration = pagesNeedingMigration.filter(page => selectedPages.has(page.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading pages...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Schema Migration</h2>
          <p className="text-muted-foreground">
            Migrate pages from old schema format to new format
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        )}
      </div>

      {/* Migration Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Migration Status
          </CardTitle>
          <CardDescription>
            Overview of pages and their schema versions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{pages.length}</div>
              <div className="text-sm text-muted-foreground">Total Pages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{pagesNeedingMigration.length}</div>
              <div className="text-sm text-muted-foreground">Need Migration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {pages.length - pagesNeedingMigration.length}
              </div>
              <div className="text-sm text-muted-foreground">Already New Format</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pages List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pages to Migrate</CardTitle>
              <CardDescription>
                Select pages to migrate to the new schema format
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={handleDeselectAll}>
                Deselect All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {pages.map((page) => (
              <div
                key={page.id}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedPages.has(page.id)
                    ? 'bg-blue-50 border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleSelectPage(page.id)}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedPages.has(page.id)}
                    onChange={() => handleSelectPage(page.id)}
                    className="rounded"
                  />
                  <div>
                    <div className="font-medium">{page.page_name}</div>
                    <div className="text-sm text-muted-foreground">{page.slug}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={page.needs_migration ? 'destructive' : 'default'}>
                    v{page.schema_version}
                  </Badge>
                  {page.needs_migration && (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  )}
                  {!page.needs_migration && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Migration Progress */}
      {migrating && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Migrating Schemas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(migrationProgress)}%</span>
              </div>
              <Progress value={migrationProgress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Migration Results */}
      {migrationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {migrationResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              Migration Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{migrationResult.migrated}</div>
                <div className="text-sm text-muted-foreground">Migrated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{migrationResult.skipped}</div>
                <div className="text-sm text-muted-foreground">Skipped</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{migrationResult.errors}</div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>
            
            {migrationResult.details.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {migrationResult.details.map((detail, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-2 rounded ${
                      detail.success ? 'bg-green-50' : 'bg-red-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {detail.success ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="font-medium">{detail.pageName}</span>
                    </div>
                    {detail.error && (
                      <span className="text-sm text-red-600">{detail.error}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Migration Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedPagesNeedingMigration.length} of {pagesNeedingMigration.length} pages selected
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleMigrate}
            disabled={migrating || selectedPages.size === 0}
            className="flex items-center gap-2"
          >
            {migrating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {migrating ? 'Migrating...' : 'Migrate Selected'}
          </Button>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Migration will convert old schema format to the new format with improved editing capabilities.
          This process is reversible and creates a backup of the original schema.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SchemaMigration;
