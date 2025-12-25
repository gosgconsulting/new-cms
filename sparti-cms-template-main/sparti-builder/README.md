# Sparti Builder - Visual Editor Plugin

A powerful visual content editor plugin that can be integrated into any React application, providing click-to-edit functionality similar to Pinegrow's visual builder.

## Features

✅ **Click-to-Select Elements** - Click any element on the page to select and edit it
✅ **Real-time Content Editing** - Edit text content, colors, and styles instantly
✅ **Visual Selection Indicators** - Clear visual feedback for selected and hovered elements
✅ **Undo/Redo System** - Full history tracking with undo/redo capabilities
✅ **Responsive Design** - Works on desktop and mobile devices
✅ **Plugin Architecture** - Easy to integrate into any Lovable project

## Quick Start

### 1. Installation
The plugin is already included in this project. To use it in other Lovable projects:

```bash
# Copy the sparti-builder folder to your project root
cp -r sparti-builder /path/to/your/project/
```

### 2. Integration
Wrap your app with the SpartiBuilder component:

```tsx
import { SpartiBuilder } from '../sparti-builder';

function App() {
  return (
    <SpartiBuilder config={{ enabled: true, toolbar: true, autoDetect: true }}>
      <YourAppContent />
    </SpartiBuilder>
  );
}
```

### 3. Usage
1. Click the "Edit with Sparti Builder" button in the top toolbar
2. Click on any element to select it
3. Edit content, colors, and styles in the right panel
4. Click "Save" to keep changes or "X" to exit edit mode

## Configuration

```tsx
interface SpartiBuilderConfig {
  enabled?: boolean;     // Enable/disable the plugin
  toolbar?: boolean;     // Show/hide the top toolbar
  autoDetect?: boolean;  // Auto-detect elements on hover
}
```

## Core Components

### SpartiBuilder
Main wrapper component that provides the editing environment.

### SpartiToolbar  
Fixed top toolbar with edit button and controls.

### ElementSelector
Handles click-to-select functionality and element detection.

### ContentEditPanel
Right-side panel for editing selected elements.

### EditingOverlay
Visual indicators for selected and hovered elements.

## Core Libraries

### composer.ts
Component composition system with drag-drop capability (converted from pg.composer.js).

### query.ts  
DOM manipulation and node management system (converted from pg-query.js).

### preview-player.ts
Real-time preview system with event handling (converted from pg.page-view-player.js).

## Hooks

### useSpartiEditor
Custom hook providing editing functionality:

```tsx
const {
  selectedElement,
  isEditing, 
  selectElement,
  updateContent,
  updateStyle,
  undo,
  redo,
  canUndo,
  canRedo
} = useSpartiEditor();
```

## Styling

The plugin uses semantic design tokens from your project's `index.css` and `tailwind.config.ts`:

- `hsl(var(--primary))` - Primary brand colors
- `hsl(var(--background))` - Background colors  
- `hsl(var(--foreground))` - Text colors
- `hsl(var(--border))` - Border colors

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+ 
- ✅ Safari 14+
- ✅ Edge 90+

## Development

### File Structure
```
sparti-builder/
├── components/           # React components
│   ├── SpartiBuilder.tsx
│   ├── SpartiBuilderProvider.tsx  
│   ├── SpartiToolbar.tsx
│   ├── ElementSelector.tsx
│   ├── EditingOverlay.tsx
│   └── ContentEditPanel.tsx
├── core/                # Core libraries (TypeScript)
│   ├── composer.ts
│   ├── query.ts  
│   └── preview-player.ts
├── hooks/               # Custom hooks
│   └── useSpartiEditor.ts
├── types.ts            # TypeScript definitions
├── index.ts           # Main exports
└── README.md          # This file
```

## Roadmap

🔄 **Phase 1 Complete**: Foundation & Visual Builder Core
- ✅ Plugin structure and integration
- ✅ Element selection and basic editing
- ✅ Visual overlays and indicators
- ✅ Content editing panel

🎯 **Phase 2**: Enhanced Editing Features
- [ ] Image replacement and upload
- [ ] Advanced styling controls
- [ ] Typography controls
- [ ] Layout editing (margins, padding)

🎯 **Phase 3**: Advanced Features  
- [ ] Component templates
- [ ] Export functionality
- [ ] Multi-device preview
- [ ] Animation editor

## Contributing

1. Make changes in the `sparti-builder/` folder
2. Test across different page layouts
3. Ensure mobile compatibility
4. Update documentation

## License

Part of the Lovable development environment. Contact Lovable for usage rights.