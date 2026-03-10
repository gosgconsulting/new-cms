import React, { useState, useRef } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Tenant } from './PostgresIntegration';

interface WordPressImportIntegrationProps {
  tenant: Tenant;
}

interface ImportSummary {
  postsCreated: number;
  postsUpdated: number;
  categoriesCreated: number;
  tagsCreated: number;
  imagesDownloaded: number;
  errors: string[];
}

/**
 * WordPress Import Integration component that allows importing WordPress blog posts
 */
export const WordPressImportIntegration: React.FC<WordPressImportIntegrationProps> = ({ tenant }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    // Validate file type
    const validExtensions = ['.xml', '.json'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      setError('Please select a valid WordPress export file (.xml or .json)');
      return;
    }

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setError('File size must be less than 50MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setImportSummary(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !tenant || tenant.isTheme) {
      setError('Please select a file and ensure a tenant is selected');
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setError(null);
    setImportSummary(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('tenantId', tenant.id);

      const token = localStorage.getItem('sparti-user-session');
      const authToken = token ? JSON.parse(token).token : null;

      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setImportProgress(percentComplete);
        }
      });

      const response = await new Promise<Response>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(new Response(xhr.responseText, { status: xhr.status }));
          } else {
            reject(new Error(`Import failed: ${xhr.statusText}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error during import'));
        });

        xhr.open('POST', '/api/content/import/wordpress');
        if (authToken) {
          xhr.setRequestHeader('Authorization', `Bearer ${authToken}`);
        }
        xhr.send(formData);
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Import failed' }));
        throw new Error(errorData.error || 'Import failed');
      }

      const result = await response.json();
      setImportSummary(result.summary || {
        postsCreated: result.postsCreated || 0,
        postsUpdated: result.postsUpdated || 0,
        categoriesCreated: result.categoriesCreated || 0,
        tagsCreated: result.tagsCreated || 0,
        imagesDownloaded: result.imagesDownloaded || 0,
        errors: result.errors || []
      });
      setImportProgress(100);
      
      // Clear selected file after successful import
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('[testing] Error importing WordPress file:', err);
      setError(err.message || 'Failed to import WordPress file');
      setImportProgress(0);
    } finally {
      setIsImporting(false);
    }
  };

  if (!tenant) {
    return (
      <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
        <FileText className="h-8 w-8 mx-auto mb-2" />
        <p>No tenant data available</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start gap-4 mb-4">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <Upload className="h-6 w-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold">WordPress Import</h3>
            {tenant.isTheme ? (
              <Badge variant="outline" className="bg-purple-500/10 text-purple-700 border-purple-300">
                Theme: {tenant.name}
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-300">
                Tenant: {tenant.name}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            Import WordPress blog posts from XML or JSON export files
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>Type: Import Tool</span>
            <span>Format: XML (WXR) / JSON</span>
          </div>
        </div>
      </div>

      {tenant.isTheme ? (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
          WordPress Import is only available for tenants, not themes.
        </div>
      ) : (
        <>
          {/* File Upload Area */}
          <div
            className={`mt-4 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xml,.json"
              onChange={handleFileInputChange}
              className="hidden"
              disabled={isImporting}
            />
            
            {!selectedFile ? (
              <>
                <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag and drop a WordPress export file here, or click to browse
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                >
                  Select File
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  Supported formats: .xml (WXR), .json
                </p>
              </>
            ) : (
              <div className="flex items-center justify-center gap-3">
                <FileText className="h-8 w-8 text-purple-600" />
                <div className="text-left">
                  <p className="font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  disabled={isImporting}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>

          {/* Import Button */}
          {selectedFile && (
            <div className="mt-4">
              <Button
                onClick={handleImport}
                disabled={isImporting}
                className="w-full"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing... {importProgress > 0 && `${importProgress}%`}
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import WordPress File
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Progress Bar */}
          {isImporting && importProgress > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Import Error</p>
                <p className="text-xs text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Success Summary */}
          {importSummary && !isImporting && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
              <div className="flex items-start gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">Import Completed Successfully</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Posts Created:</span>
                  <span className="ml-2 font-semibold text-green-700">{importSummary.postsCreated}</span>
                </div>
                <div>
                  <span className="text-gray-600">Posts Updated:</span>
                  <span className="ml-2 font-semibold text-green-700">{importSummary.postsUpdated}</span>
                </div>
                <div>
                  <span className="text-gray-600">Categories Created:</span>
                  <span className="ml-2 font-semibold text-green-700">{importSummary.categoriesCreated}</span>
                </div>
                <div>
                  <span className="text-gray-600">Tags Created:</span>
                  <span className="ml-2 font-semibold text-green-700">{importSummary.tagsCreated}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-600">Images Downloaded:</span>
                  <span className="ml-2 font-semibold text-green-700">{importSummary.imagesDownloaded}</span>
                </div>
              </div>
              {importSummary.errors && importSummary.errors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-green-300">
                  <p className="text-xs font-medium text-amber-800 mb-1">Warnings:</p>
                  <ul className="text-xs text-amber-700 space-y-1">
                    {importSummary.errors.map((err, idx) => (
                      <li key={idx}>• {err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

/**
 * WordPress Import Integration list item for modals
 */
export const WordPressImportIntegrationListItem: React.FC<{ tenant?: Tenant }> = ({ tenant }) => {
  if (!tenant) {
    return <li>• WordPress Import (No tenant selected)</li>;
  }
  
  return (
    <li>• WordPress Import (Tenant: {tenant.name})</li>
  );
};

export default WordPressImportIntegration;

