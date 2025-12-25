"use client";

export type FlowbiteCategory =
  | "navigation"
  | "footers"
  | "media"
  | "content"
  | "marketing"
  | "forms"
  | "ecommerce"
  | "utilities"
  | "admin";

export type FlowbiteComponentDef = {
  key: string;          // render_key like flowbite.header.v1
  name: string;         // Display name
  version: string;      // e.g., 1.0.0
  category: FlowbiteCategory;
  tags?: string[];
  thumbnail?: string;   // optional preview image
  path?: string;        // code path (for reference)
};

export const FLOWBITE_LIBRARY = {
  id: "flowbite",
  name: "Flowbite",
  description:
    "A tenant-agnostic master component library built with Tailwind and Flowbite styles. Use these components across all tenants for consistent, accessible UI.",
};

export const FLOWBITE_COMPONENTS: FlowbiteComponentDef[] = [
  {
    key: "flowbite.header.v1",
    name: "Header",
    version: "1.0.0",
    category: "navigation",
    tags: ["layout", "topbar", "menu"],
    path: "/src/libraries/flowbite/components/FlowbiteHeader.tsx",
  },
  {
    key: "flowbite.footer.v1",
    name: "Footer",
    version: "1.0.0",
    category: "footers",
    tags: ["links", "legal", "newsletter"],
    path: "/src/libraries/flowbite/components/FlowbiteFooter.tsx",
  },
  {
    key: "flowbite.slider.v1",
    name: "Slider",
    version: "1.0.0",
    category: "media",
    tags: ["carousel", "hero", "images", "overlay", "a11y"],
    path: "/src/libraries/flowbite/components/FlowbiteSlider.tsx",
  },
  {
    key: "flowbite.section.v1",
    name: "Section",
    version: "1.0.0",
    category: "content",
    tags: ["layout", "section", "container"],
    path: "/src/libraries/flowbite/components/FlowbiteSection.tsx",
  },
  {
    key: "flowbite.admin.dashboard-shell.v1",
    name: "Admin Dashboard Shell",
    version: "1.0.0",
    category: "admin",
    tags: ["layout", "admin", "sidebar"],
    path: "/src/libraries/flowbite/components/FlowbiteAdminDashboardShell.tsx",
  },
];

export const FLOWBITE_CATEGORIES: { id: "all" | "recent" | FlowbiteCategory; label: string }[] = [
  { id: "all", label: "All Components" },
  { id: "recent", label: "Recently added" },
  { id: "navigation", label: "Navigation" },
  { id: "footers", label: "Footers" },
  { id: "media", label: "Media" },
  { id: "content", label: "Content" },
  { id: "marketing", label: "Marketing" },
  { id: "forms", label: "Forms" },
  { id: "ecommerce", label: "Ecommerce" },
  { id: "utilities", label: "Utilities" },
  { id: "admin", label: "Admin" },
];