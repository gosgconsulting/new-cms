# Spec.md — Sparti CMS Demo Project Specification

## 1. Purpose
Sparti CMS Demo is a standalone visual content management system that showcases the Sparti CMS capabilities through a demo interface. It provides a self-contained framework for demonstrating visual editing capabilities, component management, and CMS functionality without external database dependencies. This demo serves as a reference implementation for the full Sparti CMS system.

## 2. Core Functionality

### Visual Editor
- Click-to-edit functionality for any element on the page
- Real-time content editing with WYSIWYG interface
- Visual selection indicators for selected elements
- Undo/redo system for tracking changes
- Component-based editing with drag-and-drop capabilities

### Component Management
- Component preview and demonstration system
- Component library with visual preview modal system
- Animated components with Framer Motion integration
- Static component registration (no database dependencies)
- Component playground for testing and demonstration
- Template system for rapid prototyping

### Demo Architecture
- Standalone demo application showcasing Sparti CMS capabilities
- Hardcoded admin authentication (admin/admin)
- Self-contained component library and editor
- No external database dependencies
- Reference implementation for full Sparti CMS integration

### Admin Interface
- `/sparti` admin route for CMS management
- `/sparti/components` component library playground (no tenant filtering)
- Hardcoded authentication system
- Content management dashboard demonstration
- Component library and visual editor showcase
- Settings management interface

## 3. Architecture Overview

### Frontend Framework
- React with TypeScript
- Vite for build system and development server
- React Router for navigation
- TipTap for rich text editing
- Radix UI for accessible component primitives
- Tailwind CSS for styling
- Framer Motion for advanced animations
- Tabler Icons for additional icon library

### Backend Services
- Standalone demo application (no external backend required)
- Hardcoded authentication system for demo purposes
- Local state management for demo data

### Data Storage
- In-memory state management for demo functionality
- LocalStorage for basic persistence of demo data
- Static component registry for demo components
- **Demo Component Structure**: Component Library → UI Components
  - Static component definitions in code
  - Component metadata stored in local registry
  - No database dependencies required
- Component showcase system with local state
- Demo content managed through React state
- No external data persistence (demo purposes only)

### Deployment
- Standard Vite deployment (build and serve static files)
- Single-application deployment model
- Support for standard web servers (Apache, Nginx, Vercel, Netlify)
- No multi-tenant complexity (simplified demo architecture)

## 4. Input / Output Contracts

| Input | Format | Source |
|-------|--------|--------|
| Component Templates | React Components | Static Component Library |
| Content Data | JSON | Local State/LocalStorage |
| User Edits | DOM Events | Visual Editor |
| Admin Auth | Hardcoded | Login Form (admin/admin) |

| Output | Format | Destination |
|--------|--------|------------|
| Rendered Pages | HTML/CSS/JS | Browser |
| Demo Data | JSON | LocalStorage |
| Visual Changes | DOM Updates | Browser |
| Component Previews | React Components | Preview Modal |

## 5. Constraints / Edge Cases

- **Component Compatibility**: Components must follow specific patterns to be editable in the visual editor
- **Demo Limitations**: No persistent database - changes reset on page refresh
- **Authentication**: Hardcoded admin/admin credentials for demo purposes only
- **Performance**: Large component libraries may impact editor performance
- **Browser Compatibility**: Support for modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **URL Path Configuration**: Special handling for `/sparti` admin path
- **Storage Limits**: LocalStorage limitations for demo data persistence
- **Route Protection**: ALL `/sparti/*` routes MUST be protected with hardcoded authentication
- **Component Duplication**: Avoid duplicate components with same functionality - unify similar components under different categories instead
- **Route Duplication**: Each route should have a single, specific purpose - avoid multiple routes serving the same content

## 5.1 Component & Route Management Rules

### Component Creation Rules
1. **No Functional Duplicates**: If two components serve the same purpose, create ONE component and categorize it appropriately
2. **Category-Based Organization**: Use categories (hero, image, testimonials, etc.) to organize similar components
3. **Unique Naming**: Each component must have a unique name within its category
4. **Type Consistency**: Component `type` field must match an existing category in the component library

### Route Protection Rules  
1. **All Admin Routes Protected**: Every route under `/sparti/*` MUST use `<ProtectedRoute>` wrapper
2. **Authentication Required**: Users must be authenticated to access any admin functionality
3. **No Duplicate Routes**: Each route should serve a unique purpose - consolidate overlapping functionality

## 6. File Map

### Core Directories
- `/sparti-builder/` - Core Sparti CMS library for visual editing
  - `/components/` - Visual editor UI components
    - `SpartiBuilder.tsx` - Main builder wrapper component
    - `SpartiBuilderProvider.tsx` - Context provider for builder state
    - `SpartiToolbar.tsx` - Editor toolbar
    - `EditingOverlay.tsx` - Visual overlay for element selection
    - `ElementSelector.tsx` - Element selection handling
    - `ContentEditPanel.tsx` - Editor panel for content editing
    - `/editors/` - Editor components
      - `TextEditor.tsx` - Universal text editor for all element types
      - `ImageEditor.tsx` - Image editor with upload capabilities
  - `/core/` - Core functionality (composer, element-detector, preview-player)
    - `composer.ts` - Component composition system
    - `element-detector.ts` - DOM element detection for editing
    - `universal-detector.ts` - Universal framework detection
  - `/registry/` - Static component registry (no database)
    - Static component definitions and metadata
    - Component schemas and types
  - `/hooks/` - React hooks for editor functionality
    - `useSpartiEditor.ts` - Main editor hook
  - `/styles/` - CSS styles for the builder
    - `sparti-styles.ts` - Style injection management
- `/src/` - Main demo application
  - `/components/` - Application UI components
    - `/ui/` - Shared UI components
      - `animated-testimonials.tsx` - Animated testimonials component with Framer Motion
      - `animated-testimonials-demo.tsx` - Demo implementation of animated testimonials
      - `button.tsx` - Button component
      - `card.tsx` - Card component
      - `input.tsx` - Input component
    - `/auth/` - Demo authentication components
      - `AuthPage.tsx` - Hardcoded login interface (admin/admin)
      - `AuthProvider.tsx` - Demo authentication context
      - `ProtectedRoute.tsx` - Route protection wrapper
    - `/cms/` - CMS demo components
      - `CMSDashboard.tsx` - Demo CMS dashboard
      - `ColorSettings.tsx` - Demo color management
      - `TypographySettings.tsx` - Demo typography settings
      - `MediaManager.tsx` - Demo media management
      - `LogoFaviconSettings.tsx` - Demo logo and favicon settings
    - `ConditionalSpartiWrapper.tsx` - Conditional Sparti editor wrapper
  - `/context/` - React context providers
    - `CMSSettingsContext.tsx` - Demo CMS settings management
  - `/pages/` - Demo page components
    - `LandingPage.tsx` - Main demo landing page
    - `ComponentLibrary.tsx` - Component library playground (no tenant filtering)
    - `NotFound.tsx` - 404 page

### Key Files
- `sparti-builder/index.ts` - Main export for Sparti library
- `src/App.tsx` - Main application component with routing
- `vite.config.ts` - Standard Vite configuration
- `package.json` - Standard dependencies and scripts
- `tailwind.config.js` - Tailwind CSS configuration

## 7. Development Workflow

### Demo Application Setup
1. Standard Vite React application structure
2. Wrap main component with `<SpartiBuilder>` component from `sparti-builder`
3. Configure routes to include `/sparti` admin path with hardcoded authentication
4. Register demo components in static component registry

### Creating Demo Components
1. Develop component in standard React/TypeScript
2. Add component to the static component library
3. Add component metadata to the component registry
4. Make component available in the visual editor playground

### Demo Content Management
1. Use React state and LocalStorage for demo data persistence
2. Implement demo CMS functionality without external dependencies
3. Showcase visual editing capabilities
4. Demonstrate component library and preview system

## 8. Current Status

### Completed Features (Demo Architecture)
- ✅ Visual editor core functionality with element selection
- ✅ Basic component system with providers and context
- ✅ Admin interface at `/sparti` path with hardcoded authentication
- ✅ Hardcoded authentication system (admin/admin)
- ✅ Protected routes for admin interface
- ✅ Simplified editor system (TextEditor for demo)
- ✅ Static component registry system
- ✅ Animated testimonials component with Framer Motion
- ✅ Component library with preview modal system
- ✅ Component playground functionality (no tenant filtering)
- ✅ Hero Carousel and Image Swiper components
- ✅ Image Editor with basic upload capabilities
- ✅ Enhanced element detection for image galleries
- ✅ Demo CMS dashboard interface
- ✅ Clean architecture without external dependencies

### In Progress (Demo Implementation)
- 🔄 LocalStorage-based demo data persistence
- 🔄 Demo media management without external storage
- 🔄 Additional demo components for showcase
- 🔄 Enhanced demo CMS functionality

## 9. Open Questions (Demo Focus)

- [ ] How to best demonstrate visual editing capabilities in the demo?
- [ ] What additional demo components should be included for showcase?
- [ ] How to optimize demo performance and loading times?
- [ ] What demo content will best showcase CMS capabilities?
- [x] Should we implement authentication for the demo CMS? ✅ Hardcoded admin/admin
- [ ] How to structure the demo for easy understanding by potential users?
- [ ] What's the best way to showcase component library functionality?

## 10. Roadmap (Demo Architecture)

### Phase 1: Demo Foundation ✅ (Complete)
- ✅ Visual editor core functionality
- ✅ Basic component system
- ✅ Admin interface at `/sparti` path
- ✅ Hardcoded authentication system
- ✅ Basic CMS dashboard demonstration
- ✅ Clean architecture without external dependencies

### Phase 2: Demo Component System ✅ (Current)
- ✅ Static component registry system
- ✅ Component library playground (no tenant filtering)
- ✅ Component preview modal system
- ✅ Animated testimonials component with Framer Motion
- ✅ Hero Carousel and Image Swiper components
- ✅ Simplified editor system (TextEditor for demo)

### Phase 3: Enhanced Demo Features (Current)
- 🔄 LocalStorage-based demo data persistence
- 🔄 Demo media management without external storage
- [ ] Additional demo components for showcase
- [ ] Enhanced demo CMS functionality
- [ ] Improved demo user experience
- [ ] Demo documentation and guides

### Phase 4: Demo Polish & Documentation
- [ ] Comprehensive demo walkthrough
- [ ] Demo performance optimization
- [ ] Enhanced visual feedback and animations
- [ ] Demo deployment documentation
- [ ] Integration guides for real implementations

## 11. Technical Debt & Improvements Needed (Demo Focus)

- [x] Remove all Supabase dependencies ✅ In Progress
- [x] Implement hardcoded authentication ✅ Needed
- [x] Component playground implementation ✅ Implemented
- [ ] Implement demo-specific error handling and loading states
- [ ] Add comprehensive TypeScript types for demo components
- [ ] Implement demo testing framework
- [ ] Add demo-specific logging and monitoring
- [ ] Optimize demo bundle size and performance
- [ ] Create additional demo components for showcase
- [ ] Implement LocalStorage-based demo persistence
- [ ] Add demo documentation and user guides

## 12. Last Updated
2025-01-28 - Restructured as standalone demo application, removed Supabase dependencies, updated specs for demo-only architecture with hardcoded authentication