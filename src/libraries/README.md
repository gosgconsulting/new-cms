# Design Systems Architecture

## 📋 Overview

This folder contains reusable design system implementations that can be easily installed and integrated into theme websites. Design systems provide a consistent set of components, styles, and patterns that can be used across multiple tenant themes.

**Purpose**: Create a modular, reusable architecture where design systems can be easily migrated from reference implementations, configured, and used by `/theme` websites without duplicating code.

---

## 🏗️ Architecture

### Two-Tier Structure

The design system architecture follows a two-tier structure:

```
src/libraries/
├── {design-system}/          # ✅ Active Design Systems
│   └── components/           # Migrated, CMS-integrated components
│
└── setups/                   # 📚 Reference/Setup Folders
    └── {design-system}-*/    # Original design system source code
```

#### Active Design Systems (`src/libraries/{name}/`)
- **Status**: Implemented, registered, and ready to use
- **Purpose**: CMS-integrated components that work with our schema system
- **Structure**: Migrated components that accept `ComponentSchema` from CMS
- **Example**: `src/libraries/flowbite/components/` - 29 active components

#### Setup Folders (`src/libraries/setups/`)
- **Status**: Reference implementations (not directly used)
- **Purpose**: Original design system source code to be migrated/adapted
- **Structure**: Each setup folder contains the original design system code with its own structure
- **Usage**: Reference for migration - extract and adapt components to work with CMS schema

### Architecture Flow

```mermaid
graph LR
    A[Setup Folders<br/>Original Design System Code] -->|Migration Process| B[Active Design Systems<br/>CMS-Integrated Components]
    B -->|Registered in| C[Library Registry]
    B -->|Used by| D[Theme Websites]
    C -->|Provides| E[Component Library Reference]
    D -->|Renders via| F[CMS Schema]
    F -->|Feeds data to| B
```

---

## 🔄 Migration Workflow

### Understanding the Migration Process

Each design system in the `setups/` folder contains its own code structure and patterns. The migration process transforms these original components into CMS-integrated components that:

1. **Accept CMS Schema**: Components receive `ComponentSchema` instead of direct props
2. **Extract Data**: Use helper functions to extract data from schema items/props
3. **Render with Design System**: Use the design system's UI components (e.g., `flowbite-react`, `daisyui`)
4. **Follow Standard Pattern**: All components follow the same structure for consistency

### Migration Transformation

**Before (Original Design System Component):**
```typescript
// Original component from setup folder
interface HeroProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

const Hero: React.FC<HeroProps> = ({ title, description, buttonText, buttonLink }) => {
  return (
    <section>
      <h1>{title}</h1>
      <p>{description}</p>
      <a href={buttonLink}>{buttonText}</a>
    </section>
  );
};
```

**After (Migrated CMS-Integrated Component):**
```typescript
// Migrated component in active design system
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";

interface FlowbiteHeroSectionProps {
  component: ComponentSchema;  // Accepts CMS schema
  className?: string;
}

const FlowbiteHeroSection: React.FC<FlowbiteHeroSectionProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  // Extract data from schema
  const getText = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      typeof (i as any).content === "string"
    ) as any;
    return item?.content || props[key] || "";
  };

  const title = getText("title");
  const description = getText("description");
  const buttonText = getText("buttonText");
  const buttonLink = getText("buttonLink");

  return (
    <FlowbiteSection className={className}>
      <h1>{title}</h1>
      <p>{description}</p>
      <Button href={buttonLink}>{buttonText}</Button>
    </FlowbiteSection>
  );
};
```

---

## 📐 Component Pattern

All design system components must follow this standard pattern for consistency and CMS integration.

### Required Structure

```typescript
"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import DesignSystemSection from "./DesignSystemSection";
// Import design system UI components
// import { Button, Card } from "design-system-react";

interface DesignSystemComponentProps {
  component: ComponentSchema;  // Required: CMS schema
  className?: string;          // Optional: Additional styling
}

/**
 * Design System Component Name
 * 
 * Description of what this component does
 * 
 * @param component - Component schema from CMS
 * @param className - Additional CSS classes
 */
const DesignSystemComponent: React.FC<DesignSystemComponentProps> = ({
  component,
  className = "",
}) => {
  // 1. Extract schema data
  const props = component.props || {};
  const items = component.items || [];

  // 2. Helper functions for data extraction
  const getText = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      typeof (i as any).content === "string"
    ) as any;
    return item?.content || props[key] || "";
  };

  const getButton = (key: string) => {
    const item = items.find(
      (i) => (i.key?.toLowerCase() === key.toLowerCase() || key === "") &&
      i.type === "button"
    ) as any;
    return {
      content: item?.content || "",
      link: item?.link || "#",
    };
  };

  const getImage = (key: string = "image") => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "image"
    ) as any;
    return item?.src || props[key] || "";
  };

  // 3. Extract component data
  const title = getText("title");
  const description = getText("description");
  // ... more data extraction

  // 4. Render using design system components
  return (
    <DesignSystemSection className={className}>
      {/* Component content using design system UI */}
    </DesignSystemSection>
  );
};

export default DesignSystemComponent;
```

### Helper Functions Pattern

All components should use these standard helper functions for schema extraction:

- **`getText(key: string)`**: Extract text content from schema items or props
- **`getButton(key: string)`**: Extract button data (content, link, icon)
- **`getImage(key: string)`**: Extract image data (src, alt, title)
- **`getArray(key: string)`**: Extract array items from schema
- **`getHeading(key: string, level?: number)`**: Extract heading with optional level

### Base Section Component

Each design system should have a base `Section` component:

```typescript
export type DesignSystemSectionProps = {
  title?: string;
  subtitle?: string;
  containerClassName?: string;
  className?: string;
  id?: string;
  children?: React.ReactNode;
};

const DesignSystemSection: React.FC<DesignSystemSectionProps> = ({
  id,
  title,
  subtitle,
  containerClassName = "",
  className = "",
  children
}) => {
  return (
    <section id={id} className={`w-full ${className}`}>
      {(title || subtitle) && (
        <div className="flex flex-col gap-1">
          {title ? <h2>{title}</h2> : null}
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      )}
      <div className={containerClassName}>
        {children}
      </div>
    </section>
  );
};
```

---

## 🚀 Step-by-Step: Migrating a Design System

This guide walks you through migrating **DaisyUI** from the setup folder to an active design system. Follow the same pattern for any other design system.

### Prerequisites

- ✅ Design system library available in `src/libraries/setups/`
- ✅ Understanding of the design system's structure and components
- ✅ Knowledge of React/TypeScript
- ✅ Access to design system documentation

### Step 1: Review Setup Folder Structure

Explore the setup folder to understand the design system's structure:

```bash
# Example: Review DaisyUI setup folder
src/libraries/setups/daisyui-master/daisyui-master/
├── packages/
│   ├── daisyui/          # Core DaisyUI package
│   │   ├── src/
│   │   │   ├── components/  # Component CSS files
│   │   │   ├── themes/      # Theme definitions
│   │   │   └── ...
│   └── docs/             # Documentation and examples
└── README.md
```

**Key things to identify:**
- Component structure and naming conventions
- Available UI components
- Theme system (if applicable)
- Styling approach (CSS classes, utilities, etc.)

### Step 2: Install Dependencies

Add the design system package to your project:

```bash
npm install daisyui
# or
pnpm add daisyui
```

Verify it appears in `package.json` dependencies.

### Step 3: Configure Tailwind

Edit `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";
import flowbitePlugin from "flowbite/plugin";
import daisyui from "daisyui";  // Add design system plugin

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "./sparti-cms/**/*.{ts,tsx}",
    "./node_modules/flowbite/**/*.js",
    "./node_modules/daisyui/**/*.{js,ts,jsx,tsx}",  // Add content paths
  ],
  // ... existing theme config ...
  plugins: [
    require("tailwindcss-animate"),
    flowbitePlugin,
    daisyui,  // Add design system plugin
  ],
  // Design system specific configuration
  daisyui: {
    themes: ["light", "dark", "cupcake"],
    base: true,
    styled: true,
    utils: true,
  },
};

export default config;
```

### Step 4: Create Design System Folder Structure

Create the folder structure for your active design system:

```bash
mkdir -p src/libraries/daisyui/components
mkdir -p src/styles/daisyui
```

### Step 5: Create Base Section Component

Create `src/libraries/daisyui/components/DaisyUISection.tsx` following the pattern from [Component Pattern](#component-pattern) section.

### Step 6: Migrate Components from Setup Folder

This is the core migration step. For each component you want to migrate:

1. **Identify the component** in the setup folder
2. **Understand its structure** and props
3. **Create migrated version** that:
   - Accepts `ComponentSchema` instead of direct props
   - Uses helper functions to extract data
   - Uses design system's UI components
   - Follows the standard component pattern

**Example Migration:**

From setup folder, you might find a hero component example. Adapt it:

```typescript
// src/libraries/daisyui/components/DaisyUIHeroSection.tsx
"use client";

import React from "react";
import type { ComponentSchema } from "../../../../sparti-cms/types/schema";
import DaisyUISection from "./DaisyUISection";

interface DaisyUIHeroSectionProps {
  component: ComponentSchema;
  className?: string;
}

const DaisyUIHeroSection: React.FC<DaisyUIHeroSectionProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  const getText = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      typeof (i as any).content === "string"
    ) as any;
    return item?.content || props[key] || "";
  };

  const getButton = (key: string) => {
    const item = items.find(
      (i) => (i.key?.toLowerCase() === key.toLowerCase() || key === "") &&
      i.type === "button"
    ) as any;
    return {
      content: item?.content || "",
      link: item?.link || "#",
    };
  };

  const title = getText("title") || getText("heading");
  const description = getText("description") || getText("subtitle");
  const cta = getButton("cta");

  return (
    <DaisyUISection className={className}>
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">{title}</h1>
            <p className="mb-5">{description}</p>
            {cta.content && (
              <a href={cta.link} className="btn btn-primary">
                {cta.content}
              </a>
            )}
          </div>
        </div>
      </div>
    </DaisyUISection>
  );
};

export default DaisyUIHeroSection;
```

**Repeat this process** for each component you want to migrate (Hero, Header, Footer, Cards, etc.).

### Step 7: Create Theme Manager (if applicable)

If your design system supports themes, create a theme manager:

```typescript
// src/utils/daisyuiThemeManager.ts
type DaisyUITheme = 'light' | 'dark' | 'cupcake' | 'bumblebee' | 'emerald';

const STORAGE_KEY = 'daisyui-theme';

export function applyDaisyUITheme(theme: DaisyUITheme) {
  const html = document.documentElement;
  html.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {}
}

export function initDaisyUITheme(defaultTheme: DaisyUITheme = 'light') {
  let saved: DaisyUITheme | null = null;
  try {
    const s = localStorage.getItem(STORAGE_KEY) as DaisyUITheme | null;
    if (s) saved = s;
  } catch {}
  applyDaisyUITheme(saved || defaultTheme);
}

export function getAvailableDaisyUIThemes(): { id: DaisyUITheme; label: string }[] {
  return [
    { id: 'light', label: 'Light' },
    { id: 'dark', label: 'Dark' },
    { id: 'cupcake', label: 'Cupcake' },
    // ... more themes
  ];
}
```

### Step 8: Create Library Reference Page

Create a reference page component that showcases all migrated components:

```typescript
// src/components/visual-builder/DaisyUILibrary.tsx
import React from "react";
import DaisyUISection from "@/libraries/daisyui/components/DaisyUISection";
import type { ComponentSchema } from "../../../sparti-cms/types/schema";

const DaisyUILibrary: React.FC = () => {
  const components: Array<{
    id: string;
    name: string;
    description: string;
    sampleSchema: ComponentSchema;
  }> = [
    {
      id: "daisyui-hero",
      name: "Hero Section",
      description: "Full-width hero section with title, description, and CTA",
      sampleSchema: {
        type: "daisyui-hero",
        props: {},
        items: [
          { key: "title", content: "Welcome to Our Service" },
          { key: "description", content: "We provide amazing solutions." },
          { key: "cta", type: "button", content: "Get Started", link: "#" },
        ],
      },
    },
    // Add more components as you migrate them
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">DaisyUI Design System</h1>
          <p className="text-gray-600">Component library reference</p>
        </div>

        <div className="space-y-12">
          {components.map((component) => (
            <DaisyUISection key={component.id} title={component.name} id={component.id}>
              <div className="mb-4">
                <p className="text-sm text-gray-600">{component.description}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                {/* Component preview would go here */}
              </div>
            </DaisyUISection>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DaisyUILibrary;
```

### Step 9: Register in Library Registry

Edit `src/config/libraryRegistry.ts`:

```typescript
import FlowbiteLibrary from "../components/visual-builder/FlowbiteLibrary";
import DaisyUILibrary from "../components/visual-builder/DaisyUILibrary";  // Add import

export const libraryRegistry: LibraryConfig[] = [
  {
    id: "flowbite",
    label: "Flowbite",
    available: true,
    component: FlowbiteLibrary,
  },
  {
    id: "daisyui",  // Add your design system
    label: "DaisyUI",
    available: true,
    component: DaisyUILibrary,
  },
];
```

### Step 10: Add Styles (if needed)

If your design system needs custom CSS, create theme files:

```css
/* src/styles/daisyui/default.css */
@import "daisyui/dist/full.css";

/* Custom overrides if needed */
```

### Step 11: Initialize in Main App (if needed)

If your design system needs initialization, update `src/main.tsx`:

```typescript
import { initDaisyUITheme } from '@/utils/daisyuiThemeManager';

// Initialize design system
initDaisyUITheme('light');
```

### Step 12: Test Integration

1. Create a test component using your migrated design system
2. Verify it renders correctly with sample schema data
3. Test in a theme to ensure integration works
4. Check that all helper functions extract data correctly

---

## 🔗 Integration Points

### Library Registry

Design systems are registered in `src/config/libraryRegistry.ts`:

```typescript
export interface LibraryConfig {
  id: string;
  label: string;
  available: boolean;
  component?: ComponentType;  // Reference page component
}
```

This registry makes design systems available throughout the application.

### Component Key Mapper

Components can be mapped to schema keys in `src/utils/componentKeyMapper.ts`:

```typescript
const LIBRARY_MAPPINGS: Record<string, Record<string, string>> = {
  flowbite: {
    header: "header",
    footer: "footer",
    // ... more mappings
  },
  daisyui: {
    // Add DaisyUI-specific mappings
  },
};
```

### Theme Integration

Themes in `sparti-cms/theme/{theme-name}/` can import and use design system components:

```typescript
// sparti-cms/theme/my-theme/index.tsx
import FlowbiteHeroSection from '@/libraries/flowbite/components/FlowbiteHeroSection';
import DaisyUIHeroSection from '@/libraries/daisyui/components/DaisyUIHeroSection';

// Use in theme component
<FlowbiteHeroSection component={heroSchema} />
<DaisyUIHeroSection component={heroSchema} />
```

### Styling System

Design system styles are organized in `src/styles/{design-system}/`:

```
src/styles/
├── flowbite/
│   ├── default.css
│   ├── minimal.css
│   └── ...
└── daisyui/
    └── default.css
```

Themes can override design system styles in their `theme.css`:

```css
/* sparti-cms/theme/my-theme/theme.css */
/* Override design system styles */
.btn-primary {
  @apply bg-purple-600 hover:bg-purple-700;
}
```

---

## ✅ Migration Checklist

When migrating a design system, ensure you complete:

- [ ] Review setup folder structure and identify components to migrate
- [ ] Install npm package and verify in `package.json`
- [ ] Configure Tailwind config (plugin + content paths)
- [ ] Create folder structure (`src/libraries/{name}/components/`)
- [ ] Create base Section component
- [ ] Migrate at least 5-10 core components (Hero, Header, Footer, Section, Card, etc.)
- [ ] Create theme manager (if design system supports themes)
- [ ] Create library reference page component
- [ ] Register in `libraryRegistry.ts`
- [ ] Add styles in `src/styles/{name}/` (if needed)
- [ ] Initialize in `main.tsx` (if needed)
- [ ] Test components with sample schema data
- [ ] Test integration in a theme
- [ ] Document component props and expected schema structure

---

## 📚 Reference: Current Design Systems

### Flowbite ✅

- **Location**: `src/libraries/flowbite/`
- **Components**: 29 components
- **Themes**: 5 themes (default, minimal, enterprise, playful, mono)
- **Setup Reference**: `src/libraries/setups/flowbite-react-main/`
- **Documentation**: `docs/development/flowbite-component-creation-sop.md`
- **Pattern**: Reference implementation for migration workflow

**Key Files:**
- Base component: `src/libraries/flowbite/components/FlowbiteSection.tsx`
- Example component: `src/libraries/flowbite/components/FlowbiteHeroSection.tsx`
- Theme manager: `src/utils/flowbiteThemeManager.ts`
- Library page: `src/components/visual-builder/FlowbiteLibrary.tsx`

---

## 🎨 Best Practices

### Migration Best Practices

1. **Start with Core Components**: Migrate Hero, Header, Footer, Section first
2. **Follow the Pattern**: Use Flowbite components as reference for structure
3. **Extract Reusable Helpers**: Create shared helper functions if needed
4. **Test Incrementally**: Test each migrated component before moving to the next
5. **Document Schema**: Document what schema structure each component expects

### Component Structure Standards

1. **Consistency**: All components follow the same pattern
2. **Schema-Driven**: Accept `ComponentSchema` from CMS
3. **Type Safety**: Use TypeScript interfaces for all props
4. **Reusability**: Create base components (like `Section`) that can be reused
5. **Accessibility**: Follow design system's accessibility guidelines

### Code Quality

1. **Helper Functions**: Use standard helper functions for data extraction
2. **Error Handling**: Handle missing data gracefully (empty strings, default values)
3. **Documentation**: Include JSDoc comments explaining component purpose
4. **Naming**: Follow naming convention: `{DesignSystem}{ComponentName}Section.tsx`

---

## 🐛 Troubleshooting

### Design System Not Appearing

- **Check registry**: Verify it's registered in `libraryRegistry.ts`
- **Check availability**: Ensure `available: true` in registry
- **Verify imports**: Check component import paths are correct

### Styles Not Loading

- **Tailwind config**: Verify plugin is added and content paths include design system files
- **CSS imports**: Check if CSS needs to be imported in `main.tsx` or component files
- **Theme conflicts**: Check for conflicting styles in theme CSS

### Components Not Rendering

- **Schema structure**: Verify `ComponentSchema` structure matches component expectations
- **Data extraction**: Check helper functions are extracting data correctly
- **Console errors**: Check browser console for TypeScript or runtime errors
- **Package installation**: Verify design system package is installed in `package.json`

### Migration Issues

- **Component structure**: Compare with Flowbite components to ensure pattern is followed
- **Helper functions**: Verify helper functions match the standard pattern
- **Type errors**: Check TypeScript types match expected schema structure

---

## 📖 Additional Resources

- **Flowbite Setup Guide**: `docs/development/flowbite-component-creation-sop.md`
- **Theme System**: `sparti-cms/theme/README.md`
- **Library Registry**: `src/config/libraryRegistry.ts`
- **Component Key Mapper**: `src/utils/componentKeyMapper.ts`
- **Design Systems Page**: `/design-systems` route in app

---

## 🤝 Contributing

When migrating a new design system:

1. Follow the step-by-step migration guide above
2. Create at least 5-10 core components (Hero, Section, Header, Footer, Card, etc.)
3. Test with sample schema data
4. Test integration in a theme
5. Update this README with your design system details
6. Document component schemas and expected props

---

**Last Updated**: 2025-01-27  
**Maintained By**: Development Team
