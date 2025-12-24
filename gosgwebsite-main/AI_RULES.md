# AI Rules and Development Guidelines

This document defines clear rules for how this app should be built and extended. Follow these conventions to keep the codebase simple, consistent, and maintainable.

## Tech Stack (5–10 bullet points)

- React 18 + TypeScript with Vite for the frontend (fast builds and type safety)
- Tailwind CSS for styling with shadcn/ui components and Radix UI primitives for accessible UI
- React Router v6 with routes defined in src/App.tsx and pages in src/pages/
- Express.js backend (backend/server.js) with PostgreSQL via pg for data and APIs
- TanStack Query for client-side data fetching, caching, and request lifecycle
- TipTap for rich-text editing in CMS components
- Lucide React for icons across the app
- Framer Motion for subtle animations and micro-interactions
- Chart.js (via react-chartjs-2) as the default charting library for dashboards
- Integration clients for OpenRouter AI, Google APIs, and SMTP/Resend under src/integrations/

## Library Usage Rules

- UI and Styling
  - Always use Tailwind CSS utility classes for layout and styling.
  - Prefer shadcn/ui components for UI building; do not modify shadcn/ui source files—wrap or extend via new components in src/components/.
  - Use Radix UI primitives only when you need accessible low-level building blocks not covered by shadcn/ui.

- Routing
  - Keep all routes in src/App.tsx (do not move them).
  - Place route pages under src/pages/ with small, focused functional components.
  - Use nested routes when needed; avoid duplicating shared layout logic.

- Data Fetching & State
  - Use TanStack Query for server data, caching, and loading/error states; colocate queries near components.
  - Use local component state (useState/useReducer) for ephemeral UI state; avoid adding global state libraries.
  - Do not fetch directly from DB in the frontend—always go through backend APIs.

- Forms & Validation
  - Use react-hook-form with zod for schema validation and type-safe form handling.
  - Prefer shadcn/ui Form components for consistent styling and accessibility.
  - Provide helpful inline validation messages; avoid blocking UX.

- Notifications & Feedback
  - Use shadcn/ui toast (use-toast and Toaster) for user notifications.
  - Keep messages concise and informative; use success/error variants appropriately.
  - Avoid introducing additional toast libraries.

- Icons & Animations
  - Use lucide-react for all icons; keep icon sizes and colors consistent via Tailwind classes.
  - Use Framer Motion only for subtle, purposeful animations; avoid heavy or distracting motion.

- Charts & Visualization
  - Prefer Chart.js via react-chartjs-2 for analytics dashboards.
  - Use Recharts only when a simpler chart fits better and performance is adequate; do not mix chart libs in the same view.

- Integrations & API Clients
  - Use the provided clients in src/integrations/:
    - openRouterClient for AI (OpenRouter)
    - googleAPIClient for Maps/Places/Translate
    - smtpClient (and server endpoints) for emails via Resend
  - Do not call third-party APIs directly from UI components; go through integration clients or backend endpoints.
  - Check API key presence via checkIntegrationStatus() before running integration features in development.

- Backend & Database
  - Use Express.js APIs (backend/server.js) for all data operations.
  - Use pg for PostgreSQL queries with parameterized statements.
  - Do not add new server frameworks or database clients without agreement.

- Files, Uploads & Media
  - Use the existing Express Multer setup for file uploads; access via backend endpoints.
  - Reference media via the public/ directory or CMS-managed media paths; avoid inlining large assets.

- Project Structure & Conventions
  - Components in src/components/, pages in src/pages/, hooks in src/hooks/, utilities in src/utils/.
  - Create small, focused components (generally under ~100 lines); refactor large files into smaller pieces.
  - Maintain TypeScript types for props and API responses; avoid any unless truly necessary.

- Error Handling & UX
  - Let errors bubble where appropriate; surface them via UI states and toasts.
  - Provide clear loading and empty states; avoid silent failures.
  - Do not implement complex error-retry logic unless requested.

- Supabase & External DB Services
  - Supabase is not used by default—do not introduce it.
  - If Supabase or another auth/DB provider is required, add it explicitly via the app’s integration flow before usage.

- Performance & Accessibility
  - Optimize images and assets; keep bundle size reasonable.
  - Ensure accessible labels, focus states, and keyboard navigation for interactive components.
  - Favor server-side pagination for large lists; avoid rendering very long lists without virtualization.