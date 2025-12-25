import React, { useMemo, useState, useEffect } from 'react';
import { SpartiCMSWrapper } from '../../sparti-cms';
import FlowbiteExamples from '../components/FlowbiteExamples';
import { applyFlowbiteTheme, getAvailableFlowbiteThemes, initFlowbiteTheme } from '@/utils/flowbiteThemeManager';

const ComponentsViewer: React.FC = () => {
  // NEW: library dropdown and view switcher
  const libraries = useMemo(() => [{ id: 'flowbite', name: 'Flowbite' }], []);
  const [library, setLibrary] = useState<string>('flowbite');
  const [mode, setMode] = useState<'library' | 'components'>('components');

  // Flowbite registry (header, footer, slider)
  const flowbiteComponents = [
    { key: 'flowbite.header.v1', name: 'Header', path: '/libraries/flowbite/components/FlowbiteHeader' },
    { key: 'flowbite.footer.v1', name: 'Footer', path: '/libraries/flowbite/components/FlowbiteFooter' },
    { key: 'flowbite.slider.v1', name: 'Slider', path: '/libraries/flowbite/components/FlowbiteSlider' }
  ];

  const activeComponents = library === 'flowbite' ? flowbiteComponents : [];

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

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {mode === 'library' ? (
          <div className="max-w-3xl space-y-4">
            <h1 className="text-2xl font-semibold">Flowbite Library</h1>
            <p className="text-muted-foreground">
              A tenant-agnostic master component library built with Tailwind and Flowbite styles.
              Use these components across all tenants for consistent, accessible UI.
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground">
              <li>Header (flowbite.header.v1)</li>
              <li>Footer (flowbite.footer.v1)</li>
              <li>Slider (flowbite.slider.v1)</li>
            </ul>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeComponents.map((c) => (
              <div key={c.key} className="border rounded-lg p-4 bg-card">
                <div className="text-xs text-muted-foreground">{c.key}</div>
                <h3 className="font-semibold mt-1">{c.name}</h3>
                <div className="mt-3 flex items-center gap-2">
                  <a
                    href="#!"
                    className="text-sm text-primary hover:underline"
                    onClick={(e) => e.preventDefault()}
                    title="Preview (coming soon)"
                  >
                    Preview
                  </a>
                  <span className="text-muted-foreground text-xs">•</span>
                  <a
                    href="#!"
                    className="text-sm text-primary hover:underline"
                    onClick={(e) => e.preventDefault()}
                    title="Use this component (coming soon)"
                  >
                    Use
                  </a>
                </div>
                <div className="mt-3 text-xs text-muted-foreground">
                  {c.path}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentsViewer;