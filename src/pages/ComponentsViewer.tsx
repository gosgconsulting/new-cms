import React, { useMemo, useState } from "react";
import MasterComponentsViewer from "../components/visual-builder/MasterComponentsViewer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { libraryRegistry, getDefaultLibraryId, getAvailableLibraries } from "../config/libraryRegistry";

const ComponentsViewer: React.FC = () => {
  const availableLibraries = useMemo(() => getAvailableLibraries(), []);
  const [libraryId, setLibraryId] = useState<string>(getDefaultLibraryId());
  const [view, setView] = useState<"libraries" | "components">("libraries");

  const currentLibrary = libraryRegistry.find((lib) => lib.id === libraryId);
  const metadata = useMemo(() => currentLibrary?.getMetadata(), [currentLibrary]);

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 80px)" }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        {/* Left: Design Library dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Design Library:</span>
          <Select value={libraryId} onValueChange={setLibraryId}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Select design library" />
            </SelectTrigger>
            <SelectContent>
              {availableLibraries.map((lib) => (
                <SelectItem key={lib.id} value={lib.id}>
                  {lib.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right: Toggle between Libraries and Components */}
        <Tabs value={view} onValueChange={(v) => setView(v as any)}>
          <TabsList>
            <TabsTrigger value="libraries">Libraries</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1">
        {view === "libraries" ? (
          metadata ? (
            <div className="p-6 space-y-3">
              <div>
                <h1 className="text-xl font-semibold">{metadata.label}</h1>
                <p className="text-sm text-gray-600">
                  {metadata.description || `Component library for ${metadata.label}`}
                </p>
              </div>
              <div className="text-sm text-gray-600">
                Components: <span className="font-medium text-gray-900">{metadata.components.length}</span>
              </div>
            </div>
          ) : (
            <div className="p-6 text-sm text-gray-500">This design library is not available yet.</div>
          )
        ) : (
          <MasterComponentsViewer libraryId={libraryId} />
        )}
      </div>
    </div>
  );
};

export default ComponentsViewer;