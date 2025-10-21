# Development Rules

## Overview
Code quality and architecture standards for Sparti CMS development.

## Core Development Principles

### TypeScript Usage
- **Use TypeScript for type safety** in all components and modules
- Define proper interfaces and types for all data structures
- Avoid `any` types - use proper typing or `unknown` when necessary
- Leverage TypeScript for better IntelliSense and error catching

### Component Architecture
- **Create small, focused components** instead of large monolithic files
- Single Responsibility Principle - each component should do one thing well
- Keep components under 200 lines when possible
- Split large components into smaller, reusable pieces

### React Best Practices
- **Follow React best practices** (hooks, functional components)
- Use custom hooks to extract reusable logic
- Implement proper error boundaries
- Use React.memo() for expensive renders when appropriate
- Leverage useCallback and useMemo for performance optimization

### Error Handling
- **Implement proper error handling** and loading states
- Always handle API errors gracefully
- Show user-friendly error messages
- Log errors for debugging purposes
- Implement fallback UI for error states

### Database Operations
- **Use Railway PostgreSQL** for database operations
- All database queries go through server.js API routes
- Never expose database credentials to the client
- Use parameterized queries to prevent SQL injection

### Code Quality
- **Keep API routes in server.js** with proper error handling
- Write clean, self-documenting code with minimal comments
- Follow consistent naming conventions
- Remove unused imports and dead code
- Keep functions small and focused

### API Design
- Follow RESTful conventions for API endpoints
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Return consistent response formats
- Include proper status codes
- Implement request validation

## Code Style Guidelines

### Naming Conventions
- Components: PascalCase (e.g., `UserProfile.tsx`)
- Functions: camelCase (e.g., `fetchUserData`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- Files: kebab-case for non-components (e.g., `user-utils.ts`)

### Import Organization
```typescript
// 1. React imports
import { useState, useEffect } from 'react';

// 2. Third-party imports
import { motion } from 'framer-motion';

// 3. Local component imports
import { Button } from '@/components/ui/button';

// 4. Utility imports
import { cn } from '@/lib/utils';

// 5. Type imports
import type { User } from '@/types';
```

### File Structure
```
component-name/
├── ComponentName.tsx       # Main component
├── ComponentName.test.tsx  # Tests (if applicable)
├── types.ts                # Component-specific types
└── utils.ts                # Component-specific utilities
```

## Performance Guidelines

### Optimization
- Lazy load components when appropriate
- Use code splitting for large features
- Optimize images (use WebP, proper sizing)
- Minimize bundle size
- Implement proper caching strategies

### Rendering
- Avoid unnecessary re-renders
- Use React DevTools Profiler to identify bottlenecks
- Implement virtualization for long lists
- Debounce user inputs when appropriate

## Testing Guidelines

### Component Testing
- Test user interactions
- Test error states
- Test loading states
- Test edge cases
- Mock external dependencies

## Documentation

### Code Documentation
- Write clear function and component descriptions
- Document complex algorithms
- Keep documentation up-to-date
- Use JSDoc for function documentation when helpful

### Inline Comments
- Only comment when code isn't self-explanatory
- Explain "why" not "what"
- Remove commented-out code
- Use TODO comments sparingly

## Security Best Practices

### Data Protection
- Never expose sensitive data in client-side code
- Sanitize user inputs
- Use environment variables for secrets
- Implement proper authentication checks
- Use HTTPS in production

### API Security
- Implement rate limiting
- Validate all inputs
- Use CORS properly
- Implement proper error messages (don't leak sensitive info)

## Deployment

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] No console errors or warnings
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Performance tested
- [ ] Security reviewed

---

**Last Updated:** 2025-01-28  
**Version:** 1.0.0
