"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Eye } from "lucide-react";
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

const normalizeId = (path: string) => {
  const parts = path.split("/");
  const file = parts[parts.length - 1] || "";
  return file.replace(/\.json$/i, "");
};

const MasterComponentsViewer: React.FC<{ libraryId?: string }> = ({ libraryId }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<RegistryEntry | null>(null);

  const items = useMemo<RegistryEntry[]>(() => {
    return Object.entries(modules).map(([path, mod]: [string, any]) => {
      const json = (mod?.default || mod) as Record<string, any>;
      const id = normalizeId(path);
      const title = (json.title || json.name || json.type || id) as string;
      const description =
        (json.description as string) ||
        (Array.isArray(json.items) ? `Fields: ${json.items.length}` : "");
      return {
        id,
        title,
        description,
        ...json,
      };
    });
  }, []);

  // Filter by selected design library first (currently Flowbite)
  const libraryFiltered = useMemo<RegistryEntry[]>(() => {
    if (!libraryId) return items;

    if (libraryId === "flowbite") {
      const allow = ["hero", "services", "features", "ingredients", "team", "about"];
      return items.filter((it) => {
        const id = String(it.id || "").toLowerCase();
        const t = String(it.type || it.title || "").toLowerCase();
        return allow.some((k) => id.includes(k) || t.includes(k));
      });
    }

    // Fallback: if library not recognized, show all
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

      {/* Modal for viewing component design (schema JSON) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selected?.title || selected?.id || "Component"}</DialogTitle>
            {selected?.description ? (
              <DialogDescription>{selected.description}</DialogDescription>
            ) : null}
          </DialogHeader>
          <div className="mt-2">
            {selected ? (
              <div className="rounded-md border bg-white p-3">
                <FlowbiteComponentPreview schema={selected as any} />
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MasterComponentsViewer;