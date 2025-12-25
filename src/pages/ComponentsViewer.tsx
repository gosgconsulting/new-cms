import React, { useMemo, useState } from "react";
import FlowbiteLibrary from "../components/visual-builder/FlowbiteLibrary";
import ACATRLibrary from "../components/visual-builder/ACATRLibrary";
import GOSGConsultingLibrary from "../components/visual-builder/GOSGConsultingLibrary";
import SpartiLibrary from "../components/visual-builder/SpartiLibrary";
import MasterComponentsViewer from "../components/visual-builder/MasterComponentsViewer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";

const ComponentsViewer: React.FC = () => {
  // Available design libraries; only show those that are implemented
  const availableLibraries = useMemo(
    () => [
      { id: "flowbite", label: "Flowbite", available: true },
      { id: "acatr", label: "ACATR", available: true },
      { id: "gosgconsulting", label: "GO SG CONSULTING", available: true },
      { id: "sparti", label: "Sparti", available: true },
      // Future libraries (enable once implemented):
      // { id: "landingpage", label: "Landing Page", available: false },
      // { id: "custom", label: "Custom", available: false },
    ],
    []
  );

  const [libraryId, setLibraryId] = useState<string>(
    availableLibraries.find((l) => l.available)?.id || "flowbite"
  );
  const [view, setView] = useState<"libraries" | "components">("libraries");

  const visibleLibraries = availableLibraries.filter((l) => l.available);

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
              {visibleLibraries.map((lib) => (
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
          libraryId === "flowbite" ? (
            <FlowbiteLibrary />
          ) : libraryId === "acatr" ? (
            <ACATRLibrary />
          ) : libraryId === "gosgconsulting" ? (
            <GOSGConsultingLibrary />
          ) : libraryId === "sparti" ? (
            <SpartiLibrary />
          ) : (
            <div className="p-6 text-sm text-gray-500">
              This design library is not available yet.
            </div>
          )
        ) : (
          <MasterComponentsViewer libraryId={libraryId} />
        )}
      </div>
    </div>
  );
};

export default ComponentsViewer;