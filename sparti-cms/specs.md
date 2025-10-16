# Sparti CMS Module Specification

## Purpose
Sparti CMS is a portable visual content management module that can be plugged into any Lovable project. It provides a complete admin interface with visual editing capabilities, authentication, and content management tools.

## Core Functionality

### Visual Editor
- **Click-to-Edit**: Direct content editing on any page
- **Real-time WYSIWYG**: Instant visual feedback
- **Undo/Redo**: Action history management
- **Component Detection**: Universal element detection and editing

### Admin Interface (/admin)
- **Dashboard**: Main CMS control panel
- **Pages Manager**: Create and manage site pages
- **Typography Settings**: Font and text styling controls
- **Color Settings**: Theme and color management
- **Branding Settings**: Logo and brand asset management
- **Media Manager**: File upload and management
- **Component Library**: Preview and manage available components

### Authentication
- **Hardcoded Demo Auth**: admin/admin credentials
- **Session Management**: LocalStorage-based persistence
- **Route Protection**: Automatic redirect to login

## Architecture Overview

### Tech Stack

#### Frontend Framework
- **React 18+**: Modern React with hooks, context, and functional components
- **TypeScript**: Full type safety with strict configuration
- **Vite**: Lightning-fast build tool and development server
- **React Router v7**: Declarative client-side routing

#### Styling & Design System
- **Tailwind CSS**: Utility-first CSS with custom design tokens
- **CSS Custom Properties**: HSL-based color system for theming
- **Radix UI**: Accessible, unstyled component primitives
- **Framer Motion**: Smooth animations and micro-interactions
- **Lucide Icons**: Consistent, beautiful icon library

#### State Management
- **React Context**: Global state management for CMS settings
- **Custom Hooks**: Reusable business logic and API abstractions
- **LocalStorage**: Demo data persistence and session management
- **Component Registry**: Dynamic component detection and registration

#### Development Tools
- **ESLint**: Code quality and consistency enforcement
- **TypeScript Config**: Strict type checking and IntelliSense
- **Vite Config**: Optimized build and development configuration

### Module Structure
```
sparti-builder/
├── components/           # React component library
│   ├── admin/           # Admin dashboard components
│   │   └── CMSDashboard.tsx
│   ├── auth/            # Authentication system
│   │   ├── AuthProvider.tsx
│   │   ├── AuthPage.tsx
│   │   └── ProtectedRoute.tsx
│   ├── cms/             # Content management components
│   │   ├── BrandingSettings.tsx
│   │   ├── ColorSettings.tsx
│   │   ├── MediaManager.tsx
│   │   ├── PagesManager.tsx
│   │   └── TypographySettings.tsx
│   ├── editors/         # Visual content editors
│   │   ├── ButtonEditor.tsx
│   │   ├── ContainerEditor.tsx
│   │   ├── ImageEditor.tsx
│   │   └── TextEditor.tsx
│   ├── SpartiBuilder.tsx    # Main visual editor wrapper
│   ├── SpartiCMS.tsx        # Admin CMS application
│   └── SpartiCMSWrapper.tsx # Public site integration
├── context/             # React context providers
│   └── CMSSettingsContext.tsx
├── core/                # Core functionality
│   ├── element-detector.ts
│   ├── universal-detector.ts
│   ├── preview-player.ts
│   └── query.ts
├── hooks/               # Custom React hooks
│   ├── useDatabase.ts
│   └── useSpartiEditor.ts
├── styles/              # Styling and CSS
│   ├── sparti-styles.ts
│   └── modal-sparti-fix.css
├── types/               # TypeScript definitions
├── registry/            # Component registry system
│   ├── components/      # Component definitions
│   ├── schemas/         # JSON schemas
│   └── index.ts
├── index.ts             # Main module exports
└── specs.md             # This specification document
```

### Integration Pattern
```tsx
// In host application App.tsx
import { SpartiCMS } from './sparti-builder';

function App() {
  return (
    <Router>
      <Routes>
        {/* CMS Admin Routes */}
        <Route path="/admin/*" element={<SpartiCMS />} />
        
        {/* Main site with editor */}
        <Route path="/" element={
          <SpartiCMSWrapper>
            <YourContent />
          </SpartiCMSWrapper>
        } />
      </Routes>
    </Router>
  );
}
```

## Development Workflow (SOP)

### 1. Server Setup
- Duplicate Railway template
- Duplicate Git repository
- Configure environment variables

### 2. Website Development (Frontend-First Approach)
**CRITICAL: Build frontend components BEFORE database migration**

1. **Design Frontend Website** (using Cursor/IDE)
   - Create all page components in `src/components/`
   - Design and style using design system tokens
   - Test components in isolation

2. **Create Components on Frontend**
   - Build complete, functional React components
   - Ensure components follow semantic HTML structure
   - Add proper TypeScript types
   - Implement all interactions and animations

3. **Add Components to CMS Admin**
   - Create component definition JSON files in `sparti-cms/registry/components/`
   - Define component schema with properties, editor, and metadata
   - Register component in ComponentRegistry

4. **Create Database Schema** (After frontend is complete)
   - Design database tables for components in `cms_components` table
   - Create migration SQL for component metadata
   - Define RLS policies for component access

5. **Sync Pages with Components**
   - Map frontend components to CMS registry
   - Link pages to available components
   - Configure component visibility and permissions

6. **Sync Blog with Sparti API**
   - Configure blog integration
   - Map blog posts to components
   - Setup content synchronization

### 3. Setups & Configuration
- **SMTP Setup**: Configure Resend API for email delivery
- **Email Recipients**: Set up email notification recipients
- **Email Content**: Design email templates
- **Content Integration**: Upload logo, favicon, client assets

### 4. Deployment
- Deploy to Railway/production environment
- Verify all integrations working
- Test email delivery and forms

### 5. Component Migration to Database
**IMPORTANT: This is the LAST step, not the first**
- Export component definitions from registry
- Run migration script to populate database
- Verify components appear in CMS admin
- Test component editing and synchronization

## Data Storage & Migration Strategy

### Development Phase (Frontend-First)
- **LocalStorage**: Demo data persistence during development
- **In-Memory State**: Runtime component registry
- **Static JSON Files**: Component definitions in `sparti-cms/registry/components/`

### Production Phase (After Migration)
- **Database Tables**: Component metadata in PostgreSQL
- **Component Registry**: Synced with database
- **Frontend Components**: Already built and tested

### Migration Process
```bash
# 1. Design and build frontend components first
npm run dev

# 2. Create component definitions in registry/
# 3. Test components thoroughly

# 4. Only after frontend is complete, migrate to database:
npm run migrate-components
```

## Component Compatibility
- All components must be detectable by the universal element detector
- Components should follow semantic HTML structure
- Support for custom data attributes for enhanced editing
- Component definitions must exist in registry BEFORE database migration

## Module Features

### Completed
- ✅ Universal element detection
- ✅ Visual editing toolbar
- ✅ Content edit panel
- ✅ Admin dashboard structure
- ✅ Hardcoded authentication
- ✅ Pages management (demo)
- ✅ Typography settings
- ✅ Color management
- ✅ Branding settings
- ✅ Media manager (demo)
- ✅ Component library

### In Progress
- 🔄 Module packaging and exports
- 🔄 Integration documentation
- 🔄 Demo site implementation

## Installation & Usage

### Quick Start
1. Copy `sparti-builder` folder to your project
2. Install required dependencies
3. Import and configure in your app
4. Access admin at `/admin` with credentials: admin/admin

### Dependencies
```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^7.8.2",
    "@radix-ui/react-*": "^1.x.x",
    "framer-motion": "^12.23.12",
    "lucide-react": "^0.542.0",
    "tailwind-merge": "^3.3.1",
    "tailwindcss-animate": "^1.0.7",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1"
  },
  "devDependencies": {
    "typescript": "^5.x.x",
    "vite": "^7.x.x",
    "tailwindcss": "^3.x.x",
    "eslint": "^9.x.x"
  }
}

## Constraints
- **Demo Mode**: No external database required
- **Hardcoded Auth**: Uses admin/admin for demo purposes
- **LocalStorage**: Data persists in browser only
- **Component Detection**: Limited to standard HTML elements and React components

## Roadmap

### Phase 1: Core Module (Current)
- [x] Move all CMS components to module
- [x] Implement portable authentication
- [x] Create admin dashboard
- [x] Setup demo data management

### Phase 2: Enhanced Integration
- [ ] Improved component detection
- [ ] Custom component registration
- [ ] Advanced styling options
- [ ] Export/import functionality

### Phase 3: Production Features
- [ ] Database integration options
- [ ] Real authentication providers
- [ ] Multi-user support
- [ ] Advanced permissions

## Technical Debt
- Remove any external dependencies from main app
- Optimize component bundle size
- Improve TypeScript coverage
- Add comprehensive error handling

## File Map

### Core Module Files
- `index.ts` - Main module exports
- `components/SpartiCMS.tsx` - Main CMS wrapper
- `components/admin/` - Admin interface components
- `components/auth/` - Authentication system
- `components/cms/` - Content management tools
- `core/` - Universal detection and editing
- `hooks/` - Custom hooks for CMS functionality

### Integration Files
- `README.md` - Module documentation
- `package.json` - Module dependencies (future)
- `types.ts` - Public type definitions

## Development Standards

All development must follow these core guidelines:

### UX/UI Rules
- Always use design system tokens from `index.css` and `tailwind.config.ts`
- Never use hardcoded colors - use semantic color tokens (bg-surface, text-foreground, etc.)
- Maintain consistent spacing using system scale (space-xs, space-sm, space-md, etc.)
- Ensure all interactive elements have proper hover and focus states
- Keep typography consistent using system classes (text-h1, text-body, etc.)
- Design mobile-first, then enhance for larger screens

See `sparti-cms/docs/ux-ui-guidelines.md` for complete UX/UI standards.

### Development Rules
- Use TypeScript for type safety in all components
- Create small, focused components instead of large monolithic files
- Follow React best practices (hooks, functional components)
- Implement proper error handling and loading states
- Use Railway PostgreSQL for database operations (no Supabase)
- Keep API routes in server.js with proper error handling
- Write clean, self-documenting code with minimal comments

See `sparti-cms/docs/development-rules.md` for complete development standards.

### Database Rules
- Use Railway PostgreSQL as primary database
- All database queries should use parameterized statements to prevent SQL injection
- Implement proper indexing for frequently queried columns
- Use transactions for multi-step operations
- Keep database schema migrations in `sparti-cms/db/migrations.sql`

See `sparti-cms/docs/database-rules.md` for complete database standards.

## Documentation References

### Core Guidelines
- **UX/UI Rules**: `sparti-cms/docs/ux-ui-guidelines.md` - Design system and user experience standards
- **Development Rules**: `sparti-cms/docs/development-rules.md` - Code quality and architecture standards
- **Database Rules**: `sparti-cms/docs/database-rules.md` - Database design and query standards
- **Development Workflow**: `sparti-cms/docs/development-workflow.md` - Step-by-step SOP for projects

### Technical References
- Design System: `src/index.css` and `tailwind.config.ts`
- Button Variants: `src/components/ui/button.tsx`
- Component Registry: `sparti-cms/registry/`
- Database Migrations: `sparti-cms/db/migrations.sql`

### Example Implementations
- Homepage: `src/pages/Index.tsx`
- Hero Section: `src/components/HeroSection.tsx`
- Standard Section: `src/components/SEOServicesShowcase.tsx`
- Blog Page: `src/pages/Blog.tsx`

## Last Updated
2025-01-28 - Added comprehensive development standards and documentation references