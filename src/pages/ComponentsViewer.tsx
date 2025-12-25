import React, { useMemo, useState } from 'react';
import { FLOWBITE_LIBRARY, FLOWBITE_COMPONENTS, FLOWBITE_CATEGORIES, type FlowbiteComponentDef } from '@/components/FlowbiteExamples';

// Add a simple chip component
const Chip = ({ children, active = false, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={`px-2.5 py-1 rounded-full text-xs border ${active ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-foreground border-border hover:bg-muted/80'}`}
  >
    {children}
  </button>
);

const ComponentsViewer: React.FC = () => {
  // Libraries dropdown (only Flowbite for now)
  const libraries = useMemo(() => [{ id: FLOWBITE_LIBRARY.id, name: FLOWBITE_LIBRARY.name }], []);
  const [library, setLibrary] = useState<string>(FLOWBITE_LIBRARY.id);
  const [mode, setMode] = useState<'library' | 'components'>('components');

  // Sidebar state
  const [category, setCategory] = useState<typeof FLOWBITE_CATEGORIES[number]['id']>('all');
  const [search, setSearch] = useState<string>('');
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // Build tag list from catalog
  const allTags = useMemo(() => {
    const set = new Set<string>();
    FLOWBITE_COMPONENTS.forEach(c => (c.tags || []).forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, []);

  // Filtered list
  const list: FlowbiteComponentDef[] = useMemo(() => {
    if (library !== FLOWBITE_LIBRARY.id) return [];
    let items = [...FLOWBITE_COMPONENTS];

    // Category filter
    if (category !== 'all' && category !== 'recent') {
      items = items.filter(i => i.category === category);
    }

    // Search filter
    const q = search.trim().toLowerCase();
    if (q) {
      items = items.filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.key.toLowerCase().includes(q) ||
        (i.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    // Tag filter
    if (activeTags.length > 0) {
      items = items.filter(i => activeTags.every(t => (i.tags || []).includes(t)));
    }

    // Recently added (simple heuristic: sort by name desc as placeholder)
    if (category === 'recent') {
      items = items.sort((a, b) => a.name.localeCompare(b.name)).reverse();
    } else {
      items = items.sort((a, b) => a.name.localeCompare(b.name));
    }

    return items;
  }, [library, category, search, activeTags]);

  // Category counts
  const counts = useMemo(() => {
    const base = {
      all: FLOWBITE_COMPONENTS.length,
      recent: FLOWBITE_COMPONENTS.length,
      navigation: FLOWBITE_COMPONENTS.filter(c => c.category === 'navigation').length,
      footers: FLOWBITE_COMPONENTS.filter(c => c.category === 'footers').length,
      media: FLOWBITE_COMPONENTS.filter(c => c.category === 'media').length,
      content: FLOWBITE_COMPONENTS.filter(c => c.category === 'content').length,
      marketing: FLOWBITE_COMPONENTS.filter(c => c.category === 'marketing').length,
      forms: FLOWBITE_COMPONENTS.filter(c => c.category === 'forms').length,
      ecommerce: FLOWBITE_COMPONENTS.filter(c => c.category === 'ecommerce').length,
      utilities: FLOWBITE_COMPONENTS.filter(c => c.category === 'utilities').length,
    } as Record<string, number>;
    return base;
  }, []);

  const toggleTag = (tag: string) => {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top controls */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Library dropdown */}
          <div className="flex items-center gap-3">
            <label htmlFor="lib" className="text-sm text-muted-foreground">Library</label>
            <select
              id="lib"
              value={library}
              onChange={(e) => setLibrary(e.target.value)}
              className="h-9 rounded-md border px-3 text-sm bg-background"
            >
              {libraries.map(l => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Mode switcher */}
          <div className="inline-flex rounded-md border bg-muted p-1">
            <button
              onClick={() => setMode('library')}
              className={`px-3 py-1.5 text-sm rounded ${mode === 'library' ? 'bg-background shadow' : 'text-muted-foreground'}`}
            >
              Library
            </button>
            <button
              onClick={() => setMode('components')}
              className={`px-3 py-1.5 text-sm rounded ${mode === 'components' ? 'bg-background shadow' : 'text-muted-foreground'}`}
            >
              Components
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        {/* Left sidebar */}
        <aside className="md:sticky md:top-20 h-fit">
          {/* Search */}
          <div className="mb-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search components..."
              className="w-full h-9 rounded-md border px-3 text-sm bg-background"
            />
          </div>
          {/* Categories */}
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase px-1">Types</div>
            <nav className="mt-1 space-y-1">
              {FLOWBITE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm ${category === cat.id ? 'bg-muted' : 'hover:bg-muted/60'}`}
                >
                  <span>{cat.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {counts[String(cat.id)] ?? 0}
                  </span>
                </button>
              ))}
            </nav>
          </div>
          {/* Tags */}
          {allTags.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase px-1">Tags</div>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <Chip key={tag} active={activeTags.includes(tag)} onClick={() => toggleTag(tag)}>
                    {tag}
                  </Chip>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Main content */}
        <main>
          {mode === 'library' ? (
            <div className="max-w-3xl space-y-4">
              <h1 className="text-2xl font-semibold">{FLOWBITE_LIBRARY.name} Library</h1>
              <p className="text-muted-foreground">{FLOWBITE_LIBRARY.description}</p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {FLOWBITE_CATEGORIES.filter(c => c.id !== 'all' && c.id !== 'recent').map(cat => (
                  <div key={cat.id} className="border rounded-lg p-4">
                    <div className="text-xs text-muted-foreground">{cat.id}</div>
                    <div className="text-base font-medium mt-1">{cat.label}</div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {counts[String(cat.id)]} component{(counts[String(cat.id)] || 0) === 1 ? '' : 's'}
                    </div>
                    <div className="mt-3">
                      <button
                        className="text-sm text-primary hover:underline"
                        onClick={() => {
                          setMode('components');
                          setCategory(cat.id);
                        }}
                      >
                        View components
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 text-sm text-muted-foreground">
                Showing {list.length} result{list.length === 1 ? '' : 's'}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((c) => (
                  <div key={c.key} className="border rounded-lg p-4 bg-card">
                    <div className="text-xs text-muted-foreground">{c.key}</div>
                    <h3 className="font-semibold mt-1">{c.name}</h3>
                    <div className="mt-1 text-xs text-muted-foreground">v{c.version} • {c.category}</div>
                    {c.tags && c.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {c.tags.map(t => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-muted text-xs">{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        className="text-sm text-primary hover:underline"
                        onClick={() => {/* TODO: open preview drawer */}}
                        title="Preview (coming soon)"
                      >
                        Preview
                      </button>
                      <span className="text-muted-foreground text-xs">•</span>
                      <button
                        className="text-sm text-primary hover:underline"
                        onClick={() => {/* TODO: use component flow */}}
                        title="Use this component (coming soon)"
                      >
                        Use
                      </button>
                    </div>
                    {c.path && (
                      <div className="mt-3 text-xs text-muted-foreground">{c.path}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ComponentsViewer;