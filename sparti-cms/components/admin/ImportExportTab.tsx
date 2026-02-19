import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Download, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { api } from '../../utils/api';
import { uploadFile } from '../../utils/uploadToBlob';

interface ImportExportTabProps {
  currentTenantId: string;
}

/**
 * Replace all occurrences of URL keys with values in a JSON-serialized string (order by length desc to avoid substring issues).
 */
function replaceUrlsInString(str: string, urlMap: Record<string, string>): string {
  const entries = Object.entries(urlMap).sort((a, b) => b[0].length - a[0].length);
  let out = str;
  for (const [oldUrl, newUrl] of entries) {
    if (oldUrl && oldUrl !== newUrl) {
      out = out.split(oldUrl).join(newUrl);
    }
  }
  return out;
}

/**
 * Settings tab for tenant data import/export.
 * Export: single JSON (metadata + data; all media URLs absolute).
 * Import: user picks JSON; frontend downloads each media URL, uploads to Vercel Blob, replaces URLs in payload, POSTs JSON.
 */
export default function ImportExportTab({ currentTenantId }: ImportExportTabProps) {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ percent: number; label: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!importing) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [importing]);

  const handleExport = async () => {
    if (!currentTenantId) {
      toast({ title: 'Error', description: 'No tenant selected.', variant: 'destructive' });
      return;
    }
    setExporting(true);
    try {
      const res = await api.get(`/api/tenant-export?tenantId=${currentTenantId}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || 'Export failed');
      }
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const disposition = res.headers.get('Content-Disposition');
      const match = disposition && /filename="?([^";]+)"?/.exec(disposition);
      a.download = match ? match[1].trim() : `tenant-export-${currentTenantId}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast({ title: 'Export started', description: 'Your download should start shortly.' });
    } catch (e: any) {
      toast({ title: 'Export failed', description: e?.message || 'Could not export data.', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!currentTenantId) {
      toast({ title: 'Error', description: 'No tenant selected.', variant: 'destructive' });
      return;
    }
    if (!file.name.toLowerCase().endsWith('.json')) {
      toast({ title: 'Invalid file', description: 'Please select a JSON file.', variant: 'destructive' });
      return;
    }
    setImporting(true);
    setImportProgress({ percent: 0, label: 'Parsing…' });
    event.target.value = '';
    try {
      const text = await file.text();
      const payload = JSON.parse(text) as Record<string, unknown>;
      if (payload.version === undefined || !Array.isArray(payload.media)) {
        throw new Error('Invalid export JSON: expected version and media array.');
      }

      const urlMap: Record<string, string> = {};
      const mediaList = payload.media as Array<{ url?: string; relative_path?: string; filename?: string; original_filename?: string; mime_type?: string }>;
      const mediaWithUrl = mediaList.filter((row) => {
        const u = row.url || row.relative_path;
        return u && typeof u === 'string';
      });
      const totalMedia = mediaWithUrl.length;

      let uploaded = 0;
      for (let i = 0; i < mediaList.length; i++) {
        const row = mediaList[i];
        const oldUrl = row.url || row.relative_path;
        if (!oldUrl || typeof oldUrl !== 'string') continue;
        try {
          const fetchRes = await fetch(oldUrl, { mode: 'cors' });
          if (!fetchRes.ok) continue;
          const blob = await fetchRes.blob();
          const filename = row.original_filename || row.filename || `media-${i}.${(row.mime_type || '').split('/')[1] || 'bin'}`;
          const f = new File([blob], filename, { type: row.mime_type || blob.type || 'application/octet-stream' });
          const { url: newUrl } = await uploadFile(f, { tenantId: currentTenantId });
          urlMap[oldUrl] = newUrl;
          if (row.relative_path && row.relative_path !== oldUrl) urlMap[row.relative_path] = newUrl;
          uploaded += 1;
          if (totalMedia > 0) {
            setImportProgress({ percent: Math.round((uploaded / totalMedia) * 85), label: `Uploading ${uploaded}/${totalMedia}` });
          }
        } catch (_) {
          // Skip this media; URL may be CORS-blocked or unreachable
        }
      }

      setImportProgress({ percent: 90, label: 'Saving…' });
      const payloadStr = JSON.stringify(payload);
      const replacedStr = replaceUrlsInString(payloadStr, urlMap);
      const finalPayload = JSON.parse(replacedStr) as Record<string, unknown>;

      const res = await api.post(`/api/tenant-import?tenantId=${currentTenantId}`, finalPayload, {
        headers: { 'Content-Type': 'application/json' },
      });
      const result = res.ok ? await res.json().catch(() => ({})) : await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((result as { error?: string }).error || res.statusText || 'Import failed');
      }
      const { success, stats, errors } = result as { success?: boolean; stats?: Record<string, number>; errors?: string[] };
      const msg = [
        stats?.pages != null && `Pages: ${stats.pages}`,
        stats?.posts != null && `Posts: ${stats.posts}`,
        stats?.media != null && `Media: ${stats.media}`,
        stats?.categories != null && `Categories: ${stats.categories}`,
        stats?.tags != null && `Tags: ${stats.tags}`,
      ]
        .filter(Boolean)
        .join(', ');
      if (success) {
        toast({ title: 'Import complete', description: msg || 'Data imported successfully.' });
      } else {
        toast({
          title: 'Import finished with errors',
          description: errors?.length ? errors.join('; ') : msg,
          variant: 'destructive',
        });
      }
    } catch (e: any) {
      toast({ title: 'Import failed', description: e?.message || 'Could not import data.', variant: 'destructive' });
    } finally {
      setImportProgress({ percent: 100, label: 'Done' });
      setImporting(false);
      setTimeout(() => setImportProgress(null), 600);
    }
  };

  return (
    <div className="space-y-8 relative">
      {importProgress !== null && (
        <div className="fixed bottom-[25px] left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
          <div className="bg-background/95 backdrop-blur border border-border rounded-lg shadow-lg px-4 py-3 flex flex-col gap-2">
            <p className="text-xs text-amber-600 dark:text-amber-500 font-medium">
              Import in progress. Please do not close or leave this page.
            </p>
            <div className="flex items-center gap-3">
              <Progress value={importProgress.percent} className="flex-1 h-2" />
              <span className="text-sm font-medium text-foreground whitespace-nowrap min-w-[8rem]">
                {importProgress.label}
              </span>
            </div>
          </div>
        </div>
      )}
      <div>
        <h3 className="text-lg font-medium text-foreground mb-1">Export tenant data</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Download a single JSON file with all pages, posts, and media for the current tenant. Media URLs are absolute so they can be re-fetched on import.
        </p>
        <Button onClick={handleExport} disabled={exporting} className="gap-2">
          {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {exporting ? 'Exporting…' : 'Export tenant data'}
        </Button>
      </div>

      <div>
        <h3 className="text-lg font-medium text-foreground mb-1">Import tenant data</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose a JSON file from a previous export. Images are downloaded and re-uploaded to Vercel Blob, then data is imported. Pages and posts with existing slugs are skipped.
        </p>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleImport}
            disabled={importing}
          />
          <Button
            type="button"
            disabled={importing}
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {importing ? 'Importing…' : 'Choose JSON file'}
          </Button>
          <span className="text-xs text-muted-foreground">JSON from export</span>
        </div>
      </div>
    </div>
  );
}
