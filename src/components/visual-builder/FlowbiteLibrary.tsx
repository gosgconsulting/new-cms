"use client";

import React, { useEffect, useState } from "react";
import { Check, Plus, AlertTriangle, Info, Loader2, ChevronDown, ChevronRight, Trash2, Edit, Eye, Search, Upload, Share2, Link as LinkIcon, Download } from "lucide-react";
import { applyFlowbiteTheme, getAvailableFlowbiteThemes } from "../../utils/flowbiteThemeManager";
import FlowbiteSection from "../../libraries/flowbite/components/FlowbiteSection";

// Simple section header
const GroupHeader: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div className="mb-4">
    <h3 className="text-base font-semibold">{title}</h3>
    {description ? <p className="text-sm text-gray-500">{description}</p> : null}
  </div>
);

// Buttons set
const ButtonsShowcase: React.FC = () => (
  <div className="flex flex-wrap gap-2">
    <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
      <Plus size={16} /> Primary
    </button>
    <button className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-800 hover:bg-gray-200">
      Secondary
    </button>
    <button className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700">
      <Trash2 size={16} /> Danger
    </button>
    <button className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-gray-800 hover:bg-gray-50">
      Outline
    </button>
    <button className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-gray-800 hover:bg-gray-50">
      Pill
    </button>
    <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">
      <Check size={16} /> Success
    </button>
    <button className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-white hover:bg-amber-600">
      Warn
    </button>
    <button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">
      <Share2 size={16} /> Share
    </button>
  </div>
);

// Inputs set
const InputsShowcase: React.FC = () => (
  <div className="grid gap-3 sm:grid-cols-2">
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">Text input</label>
      <input placeholder="Type here..." className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">With icon</label>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input placeholder="Search..." className="w-full rounded-md border pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
    </div>
    <div className="space-y-1 sm:col-span-2">
      <label className="text-sm font-medium text-gray-700">Textarea</label>
      <textarea rows={3} placeholder="Enter details..." className="w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500" />
    </div>
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">Select</label>
      <div className="relative">
        <select className="w-full appearance-none rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500">
          <option>Option A</option>
          <option>Option B</option>
          <option>Option C</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
      </div>
    </div>
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-700">File upload</label>
      <div className="flex items-center gap-2 rounded-md border px-3 py-2">
        <Upload className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600">Choose file...</span>
      </div>
    </div>
  </div>
);

// Cards set
const CardsShowcase: React.FC = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {[1,2,3].map((i) => (
      <div key={i} className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <div className="aspect-[4/2] bg-gray-100" />
        <div className="p-4">
          <h4 className="text-sm font-semibold">Card title {i}</h4>
          <p className="text-xs text-gray-600">Subtle description for this card to demonstrate body copy.</p>
          <div className="mt-3 flex items-center gap-2">
            <button className="rounded-md bg-blue-600 px-3 py-1.5 text-xs text-white hover:bg-blue-700">View</button>
            <button className="rounded-md border px-3 py-1.5 text-xs hover:bg-gray-50">Edit</button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Alerts/Badges
const NotificationsShowcase: React.FC = () => (
  <div className="grid gap-3">
    <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800">
      <AlertTriangle className="mt-0.5 h-4 w-4" />
      <div>
        <p className="text-sm font-medium">Warning</p>
        <p className="text-xs">This is a cautionary message using Flowbite-like alert style.</p>
      </div>
    </div>
    <div className="flex items-start gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-blue-800">
      <Info className="mt-0.5 h-4 w-4" />
      <div>
        <p className="text-sm font-medium">Information</p>
        <p className="text-xs">An informational alert box styled to match the theme.</p>
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">Primary</span>
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Success</span>
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Warning</span>
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Danger</span>
      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700">Muted</span>
    </div>
  </div>
);

// Tables set
const TablesShowcase: React.FC = () => (
  <div className="overflow-hidden rounded-lg border bg-white">
    <table className="w-full text-left text-sm">
      <thead className="bg-gray-50 text-xs uppercase text-gray-500">
        <tr>
          <th className="px-4 py-3">Name</th>
          <th className="px-4 py-3">Role</th>
          <th className="px-4 py-3">Status</th>
          <th className="px-4 py-3">Actions</th>
        </tr>
      </thead>
      <tbody>
        {[
          { name: "Taylor", role: "Designer", status: "Active" },
          { name: "Jordan", role: "Engineer", status: "Invited" },
          { name: "Sam", role: "PM", status: "Disabled" },
        ].map((row, i) => (
          <tr key={i} className="border-t">
            <td className="px-4 py-3">{row.name}</td>
            <td className="px-4 py-3">{row.role}</td>
            <td className="px-4 py-3">
              <span className={`rounded-full px-2 py-0.5 text-xs ${
                row.status === "Active"
                  ? "bg-emerald-100 text-emerald-700"
                  : row.status === "Invited"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-gray-200 text-gray-600"
              }`}>{row.status}</span>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <button className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"><Eye size={14} /></button>
                <button className="rounded-md border px-2 py-1 text-xs hover:bg-gray-50"><Edit size={14} /></button>
                <button className="rounded-md border px-2 py-1 text-xs text-red-600 hover:bg-red-50"><Trash2 size={14} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Accordion/Disclosure
const AccordionShowcase: React.FC = () => (
  <div className="rounded-lg border bg-white divide-y">
    {[1,2,3].map((i) => (
      <details key={i} className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 hover:bg-gray-50">
          <span className="text-sm font-medium">Accordion item {i}</span>
          <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
        </summary>
        <div className="px-4 py-3 text-sm text-gray-600">
          Content for item {i}. This uses native details/summary with Flowbite-like styling.
        </div>
      </details>
    ))}
  </div>
);

// Icons/Links set
const IconsShowcase: React.FC = () => (
  <div className="flex flex-wrap items-center gap-4">
    <LinkIcon className="h-5 w-5 text-gray-600" />
    <Download className="h-5 w-5 text-gray-600" />
    <Upload className="h-5 w-5 text-gray-600" />
    <Info className="h-5 w-5 text-gray-600" />
    <AlertTriangle className="h-5 w-5 text-gray-600" />
    <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
  </div>
);

const FlowbiteLibrary: React.FC = () => {
  const themes = getAvailableFlowbiteThemes();
  const [styleId, setStyleId] = useState<string>(() => {
    try {
      return localStorage.getItem("flowbite-theme") || "default";
    } catch {
      return "default";
    }
  });

  useEffect(() => {
    applyFlowbiteTheme(styleId as any);
    try {
      localStorage.setItem("flowbite-theme", styleId);
    } catch {}
  }, [styleId]);

  const sections = [
    { id: "buttons", title: "Buttons" },
    { id: "inputs", title: "Form Inputs" },
    { id: "cards", title: "Cards" },
    { id: "notifications", title: "Notifications & Badges" },
    { id: "tables", title: "Tables" },
    { id: "accordion", title: "Accordion" },
    { id: "icons", title: "Icons" },
  ];

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
        <div>
          <h2 className="text-lg font-semibold">Flowbite Design Library</h2>
          <p className="text-sm text-gray-500">Reference-only gallery of common blocks and primitives.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Style:</span>
          <div className="relative">
            <select
              value={styleId}
              onChange={(e) => setStyleId(e.target.value)}
              className="w-[180px] appearance-none rounded-md border px-3 py-2 pr-8 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            >
              {themes.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Left: Sidebar */}
        <aside className="hidden lg:block sticky top-0 h-[calc(100vh-64px)] w-64 min-w-64 max-w-64 border-r bg-white p-4 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-500 mb-2 uppercase">Design System</div>
          <nav className="space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => handleScrollTo(s.id)}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-50 text-sm"
              >
                {s.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Right: Content */}
        <div className="flex-1 p-6 space-y-10">
          <FlowbiteSection title="Buttons" id="buttons">
            <GroupHeader title="Buttons" description="Common button variants for primary actions and utility." />
            <ButtonsShowcase />
          </FlowbiteSection>

          <FlowbiteSection title="Form Inputs" id="inputs">
            <GroupHeader title="Form Inputs" description="Basic text inputs, selects, and textareas." />
            <InputsShowcase />
          </FlowbiteSection>

          <FlowbiteSection title="Cards" id="cards">
            <GroupHeader title="Cards" description="Informational blocks with media, title and actions." />
            <CardsShowcase />
          </FlowbiteSection>

          <FlowbiteSection title="Notifications & Badges" id="notifications">
            <GroupHeader title="Alerts and Status" description="Alert styles and status badges." />
            <NotificationsShowcase />
          </FlowbiteSection>

          <FlowbiteSection title="Tables" id="tables">
            <GroupHeader title="Tables" description="Lightweight table styled like Flowbite." />
            <TablesShowcase />
          </FlowbiteSection>

          <FlowbiteSection title="Accordion" id="accordion">
            <GroupHeader title="Accordion" description="Disclosure/accordion using native details with styles." />
            <AccordionShowcase />
          </FlowbiteSection>

          <FlowbiteSection title="Icons" id="icons">
            <GroupHeader title="Icons" description="Representative set of lucide-react icons for the system." />
            <IconsShowcase />
          </FlowbiteSection>
        </div>
      </div>
    </div>
  );
};

export default FlowbiteLibrary;