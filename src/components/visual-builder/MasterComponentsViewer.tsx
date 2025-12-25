"use client";

import React, { useMemo, useState, useEffect } from "react";
import { ComponentGrid, type RegistryEntry } from "./ComponentGrid";
import { ComponentPreviewDialog } from "./ComponentPreviewDialog";
import { useTenants } from "../../hooks/useTenants";
import { useTenantComponent } from "../../hooks/useTenantComponent";

// Eagerly load all registry component JSON definitions via Vite glob
const modules = import.meta.glob("../../../sparti-cms/registry/components/*.json", { eager: true });

// ADDED: normalizeId helper to extract an ID from a Vite glob path like '.../features-section.json'
const normalizeId = (path: string): string => {
  const parts = path.split("/");
  const file = parts[parts.length - 1] || "";
  return file.replace(/\.json$/i, "");
};

const MasterComponentsViewer: React.FC<{ libraryId?: string }> = ({ libraryId }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<RegistryEntry | null>(null);
  const [tenantIndex, setTenantIndex] = useState<number>(0);

  // Load tenants when dialog opens
  const { tenants, isLoading: loadingTenants } = useTenants(open);
  const currentTenant = tenants[tenantIndex] || null;

  // Load component for current tenant
  const { component: tenantComponent, isLoading: loadingTenantComp } = useTenantComponent(
    currentTenant?.id || null,
    selected?.id || null,
    libraryId,
    open && !!selected && !!currentTenant
  );

  // Load registry items
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

  // Filter by library
  const libraryFiltered = useMemo<RegistryEntry[]>(() => {
    if (!libraryId) return items;
    if (libraryId === "flowbite") {
      // Only show Diora template components: Hero, Services, Features, Ingredients, Team, About
      const dioraComponents = ["hero", "services", "features", "ingredients", "team", "about"];
      return items.filter((it) => {
        const id = String(it.id || "").toLowerCase();
        const t = String(it.type || it.title || "").toLowerCase();
        // Match only Diora template components
        return dioraComponents.some((k) => id.includes(k) || t.includes(k));
      });
    }
    return items;
  }, [items, libraryId]);

  // Filter by search query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = libraryFiltered;
    if (!q) return base;
    return base.filter((it) => {
      const hay = `${it.id} ${it.title || ""} ${it.description || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [libraryFiltered, query]);

  // Reset tenant index when tenants change
  useEffect(() => {
    if (tenants.length > 0 && tenantIndex >= tenants.length) {
      setTenantIndex(0);
    }
  }, [tenants, tenantIndex]);

  const handleViewClick = (entry: RegistryEntry) => {
    setSelected(entry);
    setOpen(true);
  };

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
  };

  return (
    <>
      <ComponentGrid
        items={filtered}
        query={query}
        onQueryChange={setQuery}
        onViewClick={handleViewClick}
      />

      <ComponentPreviewDialog
        open={open}
        onOpenChange={setOpen}
        selected={selected}
        tenants={tenants}
        tenantIndex={tenantIndex}
        tenantComponent={tenantComponent}
        loadingTenantComp={loadingTenantComp || loadingTenants}
        onTenantSelect={handleSelectTenant}
        onTenantPrev={handlePrevTenant}
        onTenantNext={handleNextTenant}
      />
    </>
  );
};

export default MasterComponentsViewer;
