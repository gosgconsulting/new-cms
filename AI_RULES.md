# AI Rules and Guidelines for GO SG Digital Marketing Website

## Tech Stack Overview

- **Frontend Framework**: React 18 with TypeScript for type safety and modern development
- **Styling**: Tailwind CSS for utility-first styling with shadcn/ui component library for consistent UI components
- **Routing**: React Router DOM v6 for client-side navigation and page routing
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Backend**: Supabase for database, authentication, and edge functions
- **Animations**: Framer Motion for smooth animations and transitions
- **Icons**: Lucide React for consistent iconography throughout the application
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Build Tool**: Vite for fast development and optimized production builds

## Library Usage Rules

### UI Components
- **ALWAYS** use shadcn/ui components from `@/components/ui/` for consistent design
- **NEVER** install additional UI libraries (Material-UI, Ant Design, etc.)
- For custom components, extend shadcn/ui components or create new ones following the same patterns
- Use Tailwind CSS classes exclusively for styling - no CSS modules or styled-components

### State Management
- **USE** React Query for all server state (API calls, data fetching, caching)
- **USE** React's built-in useState/useReducer for local component state
- **AVOID** Redux, Zustand, or other global state libraries unless absolutely necessary
- **USE** React Context only for theme, auth, or other truly global application state

### Forms and Validation
- **ALWAYS** use React Hook Form for form handling
- **ALWAYS** use Zod for form validation schemas
- **USE** the `@/components/ui/form` components for consistent form styling
- **NEVER** use Formik or other form libraries

### Database and Backend
- **USE** Supabase client from `@/integrations/supabase/client` for all database operations
- **USE** Supabase Edge Functions for server-side logic when needed
- **FOLLOW** the existing database schema and table structure
- **USE** Row Level Security (RLS) policies for data access control

### Animations
- **USE** Framer Motion for complex animations and page transitions
- **USE** Tailwind CSS animations for simple hover effects and transitions
- **AVOID** other animation libraries (React Spring, Lottie, etc.)
- Keep animations subtle and performance-focused

### Icons and Assets
- **USE** Lucide React icons exclusively - import from `lucide-react`
- **STORE** images in the `public/` directory or use Supabase storage
- **AVOID** other icon libraries (React Icons, Heroicons, etc.)

## Code Organization Rules

### File Structure
- **PLACE** pages in `src/pages/` directory
- **PLACE** reusable components in `src/components/` directory
- **PLACE** hooks in `src/hooks/` directory
- **PLACE** utilities in `src/lib/` directory
- **USE** kebab-case for file names (e.g., `contact-form.tsx`)

### Component Guidelines
- **USE** TypeScript interfaces for all props
- **EXPORT** components as default exports
- **USE** functional components with hooks exclusively
- **KEEP** components focused and single-responsibility
- **EXTRACT** reusable logic into custom hooks

### Import Rules
- **USE** absolute imports with `@/` prefix for internal modules
- **GROUP** imports: React imports first, then third-party, then internal
- **AVOID** default imports for utilities - use named imports

### Styling Guidelines
- **USE** Tailwind utility classes for all styling
- **FOLLOW** the existing color scheme: brandPurple, brandTeal, coral, deepBlue
- **USE** responsive design patterns with Tailwind breakpoints
- **MAINTAIN** consistent spacing using Tailwind's spacing scale

## WordPress Integration Rules

### Theme Conversion
- **MAINTAIN** the existing React component structure when converting to WordPress
- **USE** ACF (Advanced Custom Fields) for editable content sections
- **CONVERT** React components to PHP template parts in `template-parts/` directory
- **PRESERVE** the existing design system and Tailwind classes

### Admin Functionality
- **USE** WordPress user roles and capabilities for admin access control
- **CONVERT** the React admin dashboard to WordPress admin pages
- **MAINTAIN** the visual editing capabilities through WordPress block editor or ACF

## Performance Rules

### Optimization
- **USE** React.lazy() for code splitting on route level
- **OPTIMIZE** images using appropriate formats and sizes
- **MINIMIZE** bundle size by avoiding unnecessary dependencies
- **USE** React Query's caching to reduce API calls

### Best Practices
- **AVOID** inline functions in JSX render methods
- **USE** useMemo and useCallback for expensive computations
- **IMPLEMENT** proper error boundaries for error handling
- **FOLLOW** React best practices for component lifecycle

## Security Rules

### Authentication
- **USE** Supabase Auth for user authentication
- **IMPLEMENT** proper role-based access control
- **VALIDATE** user permissions on both client and server side
- **USE** secure HTTP-only cookies for session management

### Data Handling
- **SANITIZE** all user inputs
- **USE** Supabase RLS policies for data access control
- **VALIDATE** data on both client and server side
- **AVOID** exposing sensitive data in client-side code

## Testing Guidelines

### Testing Strategy
- **WRITE** unit tests for utility functions and hooks
- **TEST** critical user flows with integration tests
- **USE** React Testing Library for component testing
- **MOCK** external dependencies and API calls in tests

## Deployment Rules

### Environment Management
- **USE** environment variables for configuration
- **SEPARATE** development, staging, and production environments
- **SECURE** API keys and sensitive configuration
- **DOCUMENT** deployment processes and requirements

### Build Process
- **OPTIMIZE** for production builds
- **MINIMIZE** bundle size and loading times
- **IMPLEMENT** proper caching strategies
- **MONITOR** application performance and errors

## Forbidden Practices

### Never Do These
- **NEVER** install jQuery or other DOM manipulation libraries
- **NEVER** use CSS-in-JS libraries (styled-components, emotion)
- **NEVER** bypass TypeScript with `any` types without good reason
- **NEVER** commit sensitive data or API keys to version control
- **NEVER** use class components - always use functional components with hooks
- **NEVER** mutate props or state directly - always use proper state setters
- **NEVER** ignore ESLint warnings without addressing them properly

### Code Quality
- **ALWAYS** use meaningful variable and function names
- **ALWAYS** add TypeScript types for better code documentation
- **ALWAYS** handle loading and error states in components
- **ALWAYS** clean up side effects in useEffect cleanup functions