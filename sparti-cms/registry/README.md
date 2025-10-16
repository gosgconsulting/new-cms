# Sparti Component Registry

This folder contains the local component registry that serves as the **source of truth** during development. Components are designed here first, then migrated to the database for production.

## Development Philosophy: Frontend-First

**CRITICAL WORKFLOW:**
1. Build and test frontend components in `src/components/`
2. Create component definitions in `registry/components/`
3. Test components in CMS admin interface
4. Only after complete testing, migrate to database

The registry provides fast access to component definitions without requiring database queries during development.

## Structure

```
registry/
├── components/           # Component definitions
│   ├── text.json        # Text component schema
│   └── [component].json # Other component schemas
├── schemas/             # JSON schemas for validation
│   └── component.schema.json
├── index.ts            # Registry utilities
└── sync.ts             # Database sync functions
```

## Component Definition Format

Each component JSON file contains:

```json
{
  "id": "text",
  "name": "Text Component", 
  "type": "text",
  "category": "content",
  "description": "Editable text content",
  "properties": {
    "content": {
      "type": "string",
      "description": "The text content",
      "editable": true
    },
    "styles": {
      "type": "object", 
      "description": "CSS styles",
      "editable": true
    }
  },
  "editor": "TextEditor",
  "version": "1.0.0",
  "tenant_scope": "global",
  "last_updated": "2025-01-26T12:00:00Z"
}
```

## Usage

```typescript
import { ComponentRegistry } from './registry';

// Get all available components
const components = ComponentRegistry.getAll();

// Get specific component
const textComponent = ComponentRegistry.get('text');

// Register new component (syncs to database)
await ComponentRegistry.register(componentDefinition);

// Sync from database
await ComponentRegistry.syncFromDatabase();
```