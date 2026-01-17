import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api } from "../../utils/api";
import { Copy, Image as ImageIcon, Upload } from "lucide-react";

type ThemeAsset = {
  path: string;
  url: string;
};

function getHeadersForMultipart() {
  const session = localStorage.getItem("sparti-user-session");
  const token = session ? JSON.parse(session)?.token : null;

  const accessKey = localStorage.getItem("sparti-access-key");
  const tenantApiKey = localStorage.getItem("sparti-tenant-api-key");

  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(accessKey ? { "X-Access-Key": accessKey } : {}),
    ...(tenantApiKey ? { "X-Tenant-API-Key": tenantApiKey, "X-API-Key": tenantApiKey } : {}),
  } as Record<string, string>;
}

function isImageAsset(p: string) {
  return /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(p);
}

interface ThemeAssetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  themeSlug: string;
}

const ThemeAssetsDialog: React.FC<ThemeAssetsDialogProps> = ({ open, onOpenChange, themeSlug }) => {
  const [assets, setAssets] = useState<ThemeAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter((a) => a.path.toLowerCase().includes(q) || a.url.toLowerCase().includes(q));
  }, [assets, search]);

  const loadAssets = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/themes/${encodeURIComponent(themeSlug)}/assets`);
      if (!res.ok) {
        setAssets([]);
        return;
      }
      const data = await res.json();
      setAssets(Array.isArray(data.assets) ? data.assets : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadAssets();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, themeSlug]);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const response = await fetch(
        `${api.getBaseUrl()}/api/themes/${encodeURIComponent(themeSlug)}/assets/upload`,
        {
          method: "POST",
          headers: getHeadersForMultipart(),
          body: form,
        }
      );

      if (!response.ok) {
        return;
      }

      await loadAssets();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Theme Assets: {themeSlug}</DialogTitle>
          <DialogDescription>
            Assets here are served as <span className="font-mono">/theme/{themeSlug}/assets/&lt;file&gt;</span>. You can hard-code these URLs in theme code,
            or use uploaded DB media URLs (e.g. <span className="font-mono">/uploads/...</span>).
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets…"
          />
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
            }}
          />
          <Button
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading…" : "Upload"}
          </Button>
        </div>

        <ScrollArea className="h-[420px] rounded-md border">
          <div className="p-4">
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading assets…</div>
            ) : filtered.length === 0 ? (
              <div className="text-sm text-muted-foreground">No assets found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtered.map((asset) => (
                  <div
                    key={asset.url}
                    className="rounded-lg border bg-background p-3 flex gap-3 items-start"
                  >
                    <div className="w-20 h-14 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                      {isImageAsset(asset.path) ? (
                        <img
                          src={asset.url}
                          alt={asset.path}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate" title={asset.path}>
                        {asset.path}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono truncate" title={asset.url}>
                        {asset.url}
                      </div>
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigator.clipboard.writeText(asset.url)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy URL
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ThemeAssetsDialog;
