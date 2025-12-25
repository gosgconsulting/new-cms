"use client";

import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";

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

const MasterComponentsViewer: React.FC = () => {
  const [query, setQuery] = useState("");

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const hay = `${it.id} ${it.title || ""} ${it.description || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

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
              <div className="mt-3">
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                  {entry.id}
                </span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-sm text-gray-500">
            No components match “{query}”.
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterComponentsViewer;