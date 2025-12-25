"use client";

import React, { useEffect } from "react";
import { Check, Plus, AlertTriangle, Info, Loader2, ChevronDown, ChevronRight, Trash2, Edit, Eye, Search, Upload, Share2, Link as LinkIcon, Download, Building2, FileText, Calculator, Sparkles } from "lucide-react";

// Simple section header
const GroupHeader: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div className="mb-4">
    <h3 className="text-base font-semibold">{title}</h3>
    {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
  </div>
);

// Simple section wrapper
const Section: React.FC<{ title?: string; id?: string; children: React.ReactNode }> = ({ title, id, children }) => (
  <section id={id} className="w-full">
    {title && <h2 className="text-xl font-semibold mb-4">{title}</h2>}
    {children}
  </section>
);

// Buttons set - GO SG CONSULTING style with purple primary, cyan secondary, and coral accent
const ButtonsShowcase: React.FC = () => (
  <div className="flex flex-wrap gap-2">
    <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 transition-base shadow-soft">
      <Plus size={16} /> Primary
    </button>
    <button 
      className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white hover:opacity-90 transition-base shadow-soft"
      style={{ background: 'linear-gradient(135deg, hsl(270 70% 60%), hsl(174 80% 45%))' }}
    >
      <Sparkles size={16} /> Gradient
    </button>
    <button 
      className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-white hover:opacity-90 transition-base shadow-soft"
      style={{ background: 'hsl(5 88% 62%)' }}
    >
      <Check size={16} /> Accent
    </button>
    <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-foreground hover:bg-accent hover:text-accent-foreground transition-base">
      Outline
    </button>
    <button className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-foreground hover:bg-accent hover:text-accent-foreground transition-base">
      Pill
    </button>
    <button className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-neutral-900 font-bold hover:bg-neutral-200 transition-base">
      White
    </button>
    <button className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-destructive-foreground hover:opacity-90 transition-base">
      <Trash2 size={16} /> Danger
    </button>
    <button 
      className="inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-white font-semibold hover:opacity-90 transition-base shadow-lg hover:shadow-xl"
      style={{ background: 'linear-gradient(to right, hsl(270 70% 60%), hsl(174 80% 45%))' }}
    >
      <Share2 size={16} /> CTA Gradient
    </button>
  </div>
);

// Inputs set - GO SG CONSULTING professional style
const InputsShowcase: React.FC = () => (
  <div className="grid gap-3 sm:grid-cols-2">
    <div className="space-y-1">
      <label className="text-sm font-medium text-foreground">Text input</label>
      <input 
        placeholder="Type here..." 
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-base focus:ring-2 focus:ring-ring focus:ring-offset-2" 
      />
    </div>
    <div className="space-y-1">
      <label className="text-sm font-medium text-foreground">With icon</label>
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <input 
          placeholder="Search..." 
          className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-sm outline-none transition-base focus:ring-2 focus:ring-ring focus:ring-offset-2" 
        />
      </div>
    </div>
    <div className="space-y-1 sm:col-span-2">
      <label className="text-sm font-medium text-foreground">Textarea</label>
      <textarea 
        rows={3} 
        placeholder="Enter details..." 
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-base focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none" 
      />
    </div>
    <div className="space-y-1">
      <label className="text-sm font-medium text-foreground">Select</label>
      <div className="relative">
        <select className="w-full appearance-none rounded-lg border border-input bg-background px-3 py-2 pr-8 text-sm outline-none transition-base focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <option>Option A</option>
          <option>Option B</option>
          <option>Option C</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>
    </div>
    <div className="space-y-1">
      <label className="text-sm font-medium text-foreground">File upload</label>
      <div className="flex items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 transition-base hover:bg-accent/50">
        <Upload className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Choose file...</span>
      </div>
    </div>
  </div>
);

// Cards set - GO SG CONSULTING professional cards with shadows
const CardsShowcase: React.FC = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {[1,2,3].map((i) => (
      <div key={i} className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-soft transition-base hover:shadow-medium">
        <div 
          className="aspect-[4/2]" 
          style={{ background: 'linear-gradient(135deg, hsl(270 70% 60% / 0.1), hsl(174 80% 45% / 0.1))' }} 
        />
        <div className="p-6">
          <h4 className="text-sm font-semibold mb-1">Card title {i}</h4>
          <p className="text-xs text-muted-foreground mb-3">Professional card design with GO SG CONSULTING styling. Subtle description for this card to demonstrate body copy.</p>
          <div className="flex items-center gap-2">
            <button className="rounded-lg bg-white px-3 py-1.5 text-xs text-neutral-900 font-bold hover:bg-neutral-200 transition-base">View</button>
            <button className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground transition-base">Edit</button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Alerts/Badges - GO SG CONSULTING style
const NotificationsShowcase: React.FC = () => (
  <div className="grid gap-3">
    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800">
      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium">Warning</p>
        <p className="text-xs">This is a cautionary message using GO SG CONSULTING alert style.</p>
      </div>
    </div>
    <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/10 p-3 text-primary">
      <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <div>
        <p className="text-sm font-medium">Information</p>
        <p className="text-xs">An informational alert box styled to match the GO SG CONSULTING theme.</p>
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Primary</span>
      <span 
        className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
        style={{ background: 'hsl(174 80% 45%)' }}
      >
        Cyan
      </span>
      <span 
        className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
        style={{ background: 'hsl(5 88% 62%)' }}
      >
        Coral
      </span>
      <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">Danger</span>
      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Muted</span>
    </div>
  </div>
);

// Tables set - GO SG CONSULTING professional tables
const TablesShowcase: React.FC = () => (
  <div className="overflow-hidden rounded-lg border bg-card shadow-soft">
    <table className="w-full text-left text-sm">
      <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
        <tr>
          <th className="px-4 py-3 font-semibold">Name</th>
          <th className="px-4 py-3 font-semibold">Service</th>
          <th className="px-4 py-3 font-semibold">Status</th>
          <th className="px-4 py-3 font-semibold">Actions</th>
        </tr>
      </thead>
      <tbody>
        {[
          { name: "Taylor", service: "Incorporation", status: "Active" },
          { name: "Jordan", service: "Accounting", status: "Pending" },
          { name: "Sam", service: "Secretarial", status: "Completed" },
        ].map((row, i) => (
          <tr key={i} className="border-t border-border transition-base hover:bg-muted/30">
            <td className="px-4 py-3 font-medium">{row.name}</td>
            <td className="px-4 py-3 text-muted-foreground">{row.service}</td>
            <td className="px-4 py-3">
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                row.status === "Active"
                  ? "bg-primary/10 text-primary"
                  : row.status === "Pending"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-muted text-muted-foreground"
              }`}>{row.status}</span>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <button className="rounded-lg border border-border px-2 py-1 text-xs transition-base hover:bg-accent hover:text-accent-foreground"><Eye size={14} /></button>
                <button className="rounded-lg border border-border px-2 py-1 text-xs transition-base hover:bg-accent hover:text-accent-foreground"><Edit size={14} /></button>
                <button className="rounded-lg border border-border px-2 py-1 text-xs text-destructive transition-base hover:bg-destructive/10"><Trash2 size={14} /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// Accordion/Disclosure - GO SG CONSULTING style
const AccordionShowcase: React.FC = () => (
  <div className="rounded-lg border bg-card divide-y divide-border shadow-soft">
    {[1,2,3].map((i) => (
      <details key={i} className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 transition-base hover:bg-muted/30">
          <span className="text-sm font-medium">Accordion item {i}</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-90" />
        </summary>
        <div className="px-4 py-3 text-sm text-muted-foreground">
          Content for item {i}. This uses native details/summary with GO SG CONSULTING professional styling.
        </div>
      </details>
    ))}
  </div>
);

// Icons/Links set - GO SG CONSULTING business icons
const IconsShowcase: React.FC = () => (
  <div className="flex flex-wrap items-center gap-4">
    <Building2 className="h-5 w-5 text-primary" />
    <FileText className="h-5 w-5 text-primary" />
    <Calculator className="h-5 w-5" style={{ color: 'hsl(174 80% 45%)' }} />
    <LinkIcon className="h-5 w-5 text-muted-foreground" />
    <Download className="h-5 w-5 text-muted-foreground" />
    <Upload className="h-5 w-5 text-muted-foreground" />
    <Info className="h-5 w-5 text-primary" />
    <AlertTriangle className="h-5 w-5" style={{ color: 'hsl(5 88% 62%)' }} />
    <Loader2 className="h-5 w-5 animate-spin text-primary" />
  </div>
);

const GOSGConsultingLibrary: React.FC = () => {
  const sections = [
    { id: "buttons", title: "Buttons" },
    { id: "inputs", title: "Form Inputs" },
    { id: "cards", title: "Cards" },
    { id: "notifications", title: "Notifications & Badges" },
    { id: "tables", title: "Tables" },
    { id: "accordion", title: "Accordion" },
    { id: "icons", title: "Icons" },
  ];

  // Set GO SG CONSULTING theme CSS variables on mount
  useEffect(() => {
    const root = document.documentElement;
    const originalValues: Record<string, string> = {};
    
    // GO SG CONSULTING Theme CSS Variables
    const gosgVars = {
      '--primary': '270 70% 60%',
      '--primary-foreground': '0 0% 98%',
      '--accent': '210 50% 90%',
      '--accent-foreground': '210 100% 12%',
      '--background': '0 0% 96%',
      '--foreground': '210 100% 12%',
      '--card': '0 0% 100%',
      '--card-foreground': '210 100% 12%',
      '--secondary': '210 50% 90%',
      '--secondary-foreground': '210 100% 12%',
      '--muted': '210 50% 90%',
      '--muted-foreground': '210 50% 40%',
      '--border': '210 50% 85%',
      '--input': '210 50% 85%',
      '--ring': '270 70% 60%',
      '--destructive': '0 84% 60%',
      '--destructive-foreground': '0 0% 98%',
    };

    // Store original values and apply GO SG CONSULTING theme
    Object.entries(gosgVars).forEach(([key, value]) => {
      originalValues[key] = root.style.getPropertyValue(key);
      root.style.setProperty(key, value);
    });

    // Restore original values on unmount
    return () => {
      Object.entries(originalValues).forEach(([key, value]) => {
        if (value) {
          root.style.setProperty(key, value);
        } else {
          root.style.removeProperty(key);
        }
      });
    };
  }, []);

  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
        <div>
          <h2 className="text-lg font-semibold">GO SG CONSULTING Design Library</h2>
          <p className="text-sm text-muted-foreground">Professional consulting design system with purple primary, cyan secondary, and coral accent colors.</p>
        </div>
      </div>

      <div className="flex">
        {/* Left: Sidebar */}
        <aside className="hidden lg:block sticky top-0 h-[calc(100vh-64px)] w-64 min-w-64 max-w-64 border-r bg-background p-4 overflow-y-auto">
          <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Design System</div>
          <nav className="space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => handleScrollTo(s.id)}
                className="w-full text-left px-3 py-2 rounded-md hover:bg-accent/50 hover:text-accent-foreground text-sm transition-base"
              >
                {s.title}
              </button>
            ))}
          </nav>
        </aside>

        {/* Right: Content */}
        <div className="flex-1 p-6 space-y-10">
          <Section title="Buttons" id="buttons">
            <GroupHeader title="Buttons" description="Professional button variants with GO SG CONSULTING purple primary, cyan gradient, and coral accent colors." />
            <ButtonsShowcase />
          </Section>

          <Section title="Form Inputs" id="inputs">
            <GroupHeader title="Form Inputs" description="Professional form inputs with smooth transitions and focus states." />
            <InputsShowcase />
          </Section>

          <Section title="Cards" id="cards">
            <GroupHeader title="Cards" description="Professional card components with soft shadows and hover effects." />
            <CardsShowcase />
          </Section>

          <Section title="Notifications & Badges" id="notifications">
            <GroupHeader title="Alerts and Status" description="Alert styles and status badges with GO SG CONSULTING color scheme." />
            <NotificationsShowcase />
          </Section>

          <Section title="Tables" id="tables">
            <GroupHeader title="Tables" description="Professional data tables with hover states and status indicators." />
            <TablesShowcase />
          </Section>

          <Section title="Accordion" id="accordion">
            <GroupHeader title="Accordion" description="Disclosure/accordion using native details with GO SG CONSULTING styling." />
            <AccordionShowcase />
          </Section>

          <Section title="Icons" id="icons">
            <GroupHeader title="Icons" description="Business-focused icons for the GO SG CONSULTING design system." />
            <IconsShowcase />
          </Section>
        </div>
      </div>
    </div>
  );
};

export default GOSGConsultingLibrary;

