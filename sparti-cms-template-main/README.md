# Sparti Builder - Visual CMS Module

A portable, self-contained visual content management system that can be easily integrated into any Lovable.dev project. Built with React, TypeScript, and modern web technologies.

## 🚀 Features

### Visual Editor
- **Click-to-Edit**: Direct content editing on any page
- **Real-time WYSIWYG**: Instant visual feedback as you edit
- **Universal Detection**: Works with any HTML element or React component
- **Undo/Redo**: Complete action history management
- **Component Registry**: Extensible component detection system

### Admin Dashboard (/admin)
- **Complete CMS Interface**: Full-featured admin panel
- **Pages Manager**: Create and manage site pages
- **Typography Settings**: Comprehensive font and text controls
- **Color Management**: Theme and color customization
- **Branding Tools**: Logo and brand asset management
- **Media Manager**: File upload and organization
- **Component Library**: Preview and manage available components

### Authentication System
- **Demo Authentication**: Built-in demo auth (admin/admin)
- **Session Management**: Secure session handling
- **Protected Routes**: Automatic authentication routing
- **Pluggable Auth**: Extensible authentication system

## 🛠️ Tech Stack

### Core Technologies
- **React 18+** - Modern React with hooks and context
- **TypeScript** - Full type safety and IntelliSense
- **Vite** - Lightning-fast build tool and dev server
- **React Router v7** - Client-side routing and navigation

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **Radix UI** - Accessible, unstyled UI primitives
- **Framer Motion** - Smooth animations and transitions
- **Lucide Icons** - Beautiful, consistent icon library

### State Management
- **React Context** - Global state management
- **LocalStorage** - Demo data persistence
- **Custom Hooks** - Reusable business logic

### Development Tools
- **ESLint** - Code linting and quality
- **TypeScript Config** - Strict type checking
- **CSS Custom Properties** - Design system tokens

## 📦 Installation

### Quick Start
1. **Copy the module** to your Lovable project:
   ```bash
   # Copy the entire sparti-builder folder to your project root
   cp -r sparti-builder/ /path/to/your/project/
   ```

2. **Install dependencies** (if not already present):
   ```bash
   npm install @radix-ui/react-* framer-motion lucide-react
   ```

3. **Integrate into your app**:
   ```tsx
   // src/App.tsx
   import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
   import { SpartiCMS, SpartiCMSWrapper } from './sparti-builder';

   function App() {
     return (
       <Router>
         <Routes>
           {/* CMS Admin Routes */}
           <Route path="/admin/*" element={<SpartiCMS />} />
           
           {/* Main site with visual editor */}
           <Route path="/" element={
             <SpartiCMSWrapper>
               <YourLandingPage />
             </SpartiCMSWrapper>
           } />
         </Routes>
       </Router>
     );
   }
   ```

4. **Access the CMS**:
   - Navigate to `/admin` in your browser
   - Login with: `admin` / `admin`
   - Start editing your content visually!

## 🏗️ Architecture

### Module Structure
```
sparti-builder/
├── components/
│   ├── admin/              # Admin dashboard components
│   │   └── CMSDashboard.tsx
│   ├── auth/               # Authentication system
│   │   ├── AuthProvider.tsx
│   │   ├── AuthPage.tsx
│   │   └── ProtectedRoute.tsx
│   ├── cms/                # Content management tools
│   │   ├── BrandingSettings.tsx
│   │   ├── ColorSettings.tsx
│   │   ├── MediaManager.tsx
│   │   ├── PagesManager.tsx
│   │   └── TypographySettings.tsx
│   ├── editors/            # Visual content editors
│   │   ├── ButtonEditor.tsx
│   │   ├── ContainerEditor.tsx
│   │   ├── ImageEditor.tsx
│   │   └── TextEditor.tsx
│   ├── SpartiBuilder.tsx   # Main visual editor wrapper
│   ├── SpartiCMS.tsx       # Admin CMS wrapper
│   └── SpartiCMSWrapper.tsx # Public site wrapper
├── context/                # React context providers
│   └── CMSSettingsContext.tsx
├── core/                   # Core functionality
│   ├── element-detector.ts
│   ├── universal-detector.ts
│   └── query.ts
├── hooks/                  # Custom React hooks
│   ├── useDatabase.ts
│   └── useSpartiEditor.ts
├── styles/                 # Styling and CSS
│   ├── sparti-styles.ts
│   └── modal-sparti-fix.css
├── types/                  # TypeScript definitions
├── registry/               # Component registry system
├── index.ts               # Main module exports
└── specs.md               # Detailed specifications
```

### Integration Pattern
The module follows a clean integration pattern:

1. **SpartiCMS** - Complete admin interface at `/admin/*`
2. **SpartiCMSWrapper** - Wraps your content to enable visual editing
3. **Context Providers** - Manage global state and settings
4. **Component Registry** - Automatically detects and enables editing

## 🎯 Usage Examples

### Basic Integration
```tsx
import { SpartiCMSWrapper } from './sparti-builder';

export function HomePage() {
  return (
    <SpartiCMSWrapper>
      <header>
        <h1>Welcome to My Site</h1>
        <p>This content is now visually editable!</p>
      </header>
    </SpartiCMSWrapper>
  );
}
```

### Custom Component Registration
```tsx
// Make your components editable
<div data-sparti-element="custom-hero">
  <MyHeroComponent />
</div>
```

### Advanced Configuration
```tsx
<SpartiBuilder 
  config={{ 
    enabled: true, 
    toolbar: true, 
    autoDetect: true 
  }}
>
  <YourContent />
</SpartiBuilder>
```

## 🔧 Configuration

### Environment Setup
No environment variables required for basic usage. The module works out of the box with demo data.

### Customization Options
- **Theme Colors**: Modify via the admin color settings
- **Typography**: Configure fonts and text styling
- **Branding**: Upload logos and manage brand assets
- **Component Detection**: Extend the registry for custom components

## 🚦 Development

### Demo Credentials
- **Username**: `admin`
- **Password**: `admin`

### Local Development
```bash
# Start the development server
npm run dev

# Access the CMS admin
# Navigate to: http://localhost:5173/admin
```

### Adding Custom Components
1. Create your component with proper data attributes
2. Register it in the component registry
3. Add editor definitions if needed

## 📋 Requirements

### Dependencies
- React 18+
- React Router v6+
- Tailwind CSS
- TypeScript
- Vite

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Touch-friendly interface

## 🤝 Contributing

This module is designed to be:
- **Portable**: Easy to copy and integrate
- **Extensible**: Simple to customize and extend
- **Maintainable**: Clean, well-documented code
- **Accessible**: Built with accessibility in mind

## 📄 License

Built for Lovable.dev projects. Free to use and modify for your projects.

## 🆘 Support

For issues or questions:
1. Check the `sparti-builder/specs.md` for detailed specifications
2. Review the component documentation
3. Test with the demo authentication system

---

**Built with ❤️ for the Lovable.dev community**