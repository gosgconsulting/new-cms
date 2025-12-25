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

## Data Storage
- **LocalStorage**: Demo data persistence
- **In-Memory State**: Runtime data management
- **Component Registry**: Static component definitions

## Component Compatibility
- All components must be detectable by the universal element detector
- Components should follow semantic HTML structure
- Support for custom data attributes for enhanced editing

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

## Last Updated
2025-01-28 - Updated with complete tech stack and modular architecture