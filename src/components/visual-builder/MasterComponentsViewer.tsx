"use client";

import React, { useMemo, useState, useEffect } from "react";
import { Search, Eye, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import FlowbiteComponentPreview from "./FlowbiteComponentPreview";

// Eagerly load all registry component JSON definitions via Vite glob
const modules = import.meta.glob("../../../sparti-cms/registry/components/*.json", { eager: true });

type RegistryEntry = {
  id: string;
  name?: string;
  title?: string;
  description?: string;
  type?: string;
  [key: string]: any;
};

// ADDED: normalizeId helper to extract an ID from a Vite glob path like '.../features-section.json'
const normalizeId = (path: string): string => {
  const parts = path.split("/");
  const file = parts[parts.length - 1] || "";
  return file.replace(/\.json$/i, "");
};

type Tenant = {
  id: string;
  name: string;
  slug?: string;
};

function normalizeComponentKey(id: string) {
  const s = id.toLowerCase();
  // Map registry ids to schema keys used per-tenant
  if (s.includes("header")) return "header";
  if (s.includes("footer")) return "footer";
  if (s.includes("hero")) return "hero";
  if (s.includes("services")) return "services";
  if (s.includes("features")) return "features";
  if (s.includes("ingredients")) return "ingredients";
  if (s.includes("team")) return "team";
  if (s.includes("about")) return "about";
  return s;
}

const MasterComponentsViewer: React.FC<{ libraryId?: string }> = ({ libraryId }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<RegistryEntry | null>(null);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [tenantIndex, setTenantIndex] = useState<number>(0);
  const currentTenant = tenants[tenantIndex] || null;

  const [tenantComponent, setTenantComponent] = useState<any | null>(null);
  const [loadingTenantComp, setLoadingTenantComp] = useState(false);
  const [tenantMenuOpen, setTenantMenuOpen] = useState(false);

  const items = useMemo<RegistryEntry[]>(() => {
    return Object.entries(modules).map(([path, mod]: [string, any]) => {
      const json = (mod?.default || mod) as Record<string, any>;
      const id = normalizeId(path);
      const title = (json.title || json.name || json.type || id) as string;
      const description =
        (json.description as string) ||
        (Array.isArray(json.items) ? `Fields: ${json.items.length}` : "");
      return { id, title, description, ...json };
    });
  }, []);

  const libraryFiltered = useMemo<RegistryEntry[]>(() => {
    if (!libraryId) return items;
    if (libraryId === "flowbite") {
      const allow = ["hero", "services", "features", "ingredients", "team", "about", "header", "footer"];
      return items.filter((it) => {
        const id = String(it.id || "").toLowerCase();
        const t = String(it.type || it.title || "").toLowerCase();
        return allow.some((k) => id.includes(k) || t.includes(k));
      });
    }
    return items;
  }, [items, libraryId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = libraryFiltered;
    if (!q) return base;
    return base.filter((it) => {
      const hay = `${it.id} ${it.title || ""} ${it.description || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [libraryFiltered, query]);

  // Load tenants via server route; default to first tenant so we never show "Select tenant"
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function loadTenants() {
      // Prefer our server route; if it fails, fallback to public route if present
      const urls = ["/api/tenants", "/api/public/tenants"];
      let data: any[] = [];
      for (const u of urls) {
        try {
          const res = await fetch(u);
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json)) {
              data = json;
              break;
            } else if (Array.isArray(json?.data)) {
              data = json.data;
              break;
            }
          }
        } catch {}
      }

      if (cancelled) return;

      const list: Tenant[] = Array.isArray(data)
        ? data.map((t: any) => ({
            id: String(t.id ?? t.tenantId ?? t.slug ?? t.name ?? Math.random()),
            name: String(t.name ?? t.slug ?? t.id ?? "Tenant"),
            slug: t.slug ?? t.name ?? t.id,
          }))
        : [];

      if (list.length > 0) {
        setTenants(list);
        setTenantIndex(0); // ensure first tenant (e.g., Diora or Moski) is selected
      } else {
        setTenants([]);
        setTenantIndex(0);
      }
    }

    loadTenants();
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Load component schema for current tenant
  useEffect(() => {
    if (!open || !selected || !currentTenant) return;

    let cancelled = false;
    async function loadTenantComponent() {
      setLoadingTenantComp(true);
      setTenantComponent(null);

      const compId = selected.id;
      const key = normalizeComponentKey(compId);
      const tenantId = currentTenant.id;

      // Try precise endpoint if available, then fall back to site_schemas-style route
      const urls = [
        `/api/tenants/${encodeURIComponent(tenantId)}/components/${encodeURIComponent(compId)}`,
        `/api/tenants/${encodeURIComponent(tenantId)}/schemas/${encodeURIComponent(key)}`,
        `/api/public/tenants/${encodeURIComponent(tenantId)}/schemas/${encodeURIComponent(key)}`
      ];

      let found: any = null;

      for (const u of urls) {
        try {
          const res = await fetch(u);
          if (cancelled) return;
          if (res.ok) {
            const data = await res.json();
            // Accept schema under common keys
            found = data?.schema ?? data?.component ?? data?.schema_value ?? data ?? null;
            if (found) break;
          }
        } catch {}
      }

      // If header/footer exist per-tenant in site_schemas, prefer preview; sections may be missing until seeded.
      setTenantComponent(found);
      setLoadingTenantComp(false);
    }

    loadTenantComponent();
  }, [open, selected?.id, currentTenant?.id]);

  const handlePrevTenant = () => {
    if (tenants.length === 0) return;
    setTenantIndex((i) => (i - 1 + tenants.length) % tenants.length);
  };
  const handleNextTenant = () => {
    if (tenants.length === 0) return;
    setTenantIndex((i) => (i + 1) % tenants.length);
  };
  const handleSelectTenant = (idx: number) => {
    setTenantIndex(idx);
    setTenantMenuOpen(false);
  };

  return (
    <div className="w-full p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search master components..."
            className="w-full rounded-md border pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((entry) => (
          <div key={entry.id} className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <div className="p-4">
              <h4 className="text-sm font-semibold">{entry.title || entry.id}</h4>
              {entry.description ? (
                <p className="mt-1 text-xs text-gray-600">{entry.description}</p>
              ) : null}
              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                  {entry.id}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    setSelected(entry);
                    setOpen(true);
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-sm text-gray-500">
            No components match "{query}".
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selected?.title || selected?.id || "Component"}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handlePrevTenant}
                  disabled={tenants.length <= 1}
                  aria-label="Previous tenant"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 pl-3 pr-2"
                    onClick={() => setTenantMenuOpen((v) => !v)}
                    aria-haspopup="listbox"
                    aria-expanded={tenantMenuOpen}
                    aria-label="Select tenant"
                  >
                    <span className="mr-2 max-w-[160px] truncate">
                      {currentTenant?.name || (tenants[0]?.name ?? "Select tenant")}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </Button>

                  {tenantMenuOpen && tenants.length > 0 ? (
                    <div
                      role="listbox"
                      className="absolute right-0 z-20 mt-1 w-64 overflow-hidden rounded-md border bg-white shadow-md"
                    >
                      <ul className="max-h-64 overflow-auto py-1">
                        {tenants.map((t, idx) => (
                          <li key={t.id}>
                            <button
                              className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 ${
                                idx === tenantIndex ? "bg-gray-50" : ""
                              }`}
                              onClick={() => handleSelectTenant(idx)}
                            >
                              <span className="truncate">{t.name}</span>
                              {t.slug ? (
                                <span className="ml-2 shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                                  {t.slug}
                                </span>
                              ) : null}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleNextTenant}
                  disabled={tenants.length <= 1}
                  aria-label="Next tenant"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
            {selected?.description ? (
              <DialogDescription>{selected.description}</DialogDescription>
            ) : null}
          </DialogHeader>

          <div className="mt-2">
            <div className="rounded-md border bg-white p-3">
              {loadingTenantComp ? (
                <div className="p-6 text-sm text-gray-500">Loading component from tenant...</div>
              ) : tenantComponent ? (
                <FlowbiteComponentPreview schema={tenantComponent as any} />
              ) : (
                <div className="space-y-3 p-6">
                  <p className="text-sm text-gray-600">
                    No saved design found for this component in the selected tenant.
                  </p>
                  <div className="rounded-md border bg-gray-50 p-3">
                    {/* Fallback: show default registry preview to avoid blank modal */}
                    <FlowbiteComponentPreview schema={selected as any} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MasterComponentsViewer;