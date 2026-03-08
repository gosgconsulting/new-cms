# AI Rules for This App

This document sets clear guidelines for how the AI (and developers) should work within this codebase: what the tech stack is, and exactly which libraries to use for specific tasks.

## Tech Stack Overview (5–10 points)

- React 18 with TypeScript, built with Vite for fast development and bundling.
- Tailwind CSS for all styling, with shadcn/ui components (built on Radix UI) for consistent, accessible UI.
- React Router for navigation, with routes defined and maintained in `src/App.tsx`; pages live under `src/pages/`.
- lucide-react for icons across the app.
- Node.js + Express backend (in `server/`) exposing REST APIs consumed by the frontend.
- PostgreSQL with Sequelize ORM; multi-tenant CMS/data modules under `sparti-cms/`.
- Integrated Sparti CMS for page rendering, themes, content editing, and admin tooling.
- Prebuilt integrations for Google APIs and SMTP (Resend) under `src/integrations/`.
- Toast notifications using the shadcn/ui toast system (Toaster and `use-toast`) with helper utilities.
- Tailwind + shadcn/ui theming with Radix primitives for accessible, composable UI patterns.

## Library Usage Rules

### UI & Styling
- Always use shadcn/ui components for UI elements (Button, Input, Dialog, Drawer, Tabs, Accordion, Popover, Tooltip, Menubar, Sidebar, etc.).
- Styling must use Tailwind CSS classes; avoid introducing new global CSS. Only add targeted CSS when necessary (e.g., theme overrides in `sparti-cms/theme/*`).
- Do not add other UI libraries (e.g., Material UI, Ant Design, Bootstrap) unless explicitly requested.

### Icons
- Use lucide-react exclusively for icons. Do not add additional icon libraries.

### Forms & Validation
- Use the shadcn/ui form primitives provided in `src/components/ui/form.tsx` with React Hook Form patterns.
- Use shadcn/ui inputs (Input, Textarea, Select, Checkbox, Radio Group, etc.) for all form fields.
- Prefer lightweight validation patterns aligned with existing utilities; if schema validation is needed and available, use Zod with RHF resolver. Do not introduce other validation libraries.

### Routing & Pages
- Use React Router. Keep all route definitions in `src/App.tsx`.
- Create new pages under `src/pages/` and mount them via `src/App.tsx`. Do not move routing elsewhere.

### State & Data Flow
- Use React’s built-in hooks (`useState`, `useReducer`, `useEffect`) and Context for shared state.
- Do not add third-party state libraries (Redux, Zustand, MobX) unless specifically requested.
- Place data-access helpers and service wrappers in `src/services/` (e.g., `src/services/databaseService.ts`).

### Data Fetching
- Use the native `fetch` API and project helpers (e.g., `sparti-cms/utils/api.ts`) for HTTP requests.
- Do not introduce new HTTP clients (Axios, ky, etc.) unless explicitly required.

### Notifications (Toasts)
- Use the shadcn/ui toast system (`src/components/ui/toaster.tsx` and `src/components/ui/use-toast.ts`) for notifications.
- Convenience helpers in `src/utils/toast-utils.ts` should be preferred for consistent messaging.
- Avoid adding new toast/notification libraries; only use `sonner` if an existing pattern in the codebase requires global stacked notifications—otherwise stick to shadcn/ui toast.

### Modals, Popovers, Sheets & Overlays
- Use shadcn/ui components (Dialog, Drawer, Popover, Hover Card, Tooltip, Sheet) backed by Radix UI.
- Do not implement custom overlay logic unless extending existing components.

### Tables, Lists & Charts
- Use shadcn/ui Table for tabular data.
- For charts, use the project’s chart wrapper at `src/components/ui/chart.tsx`. Extend the wrapper rather than adding a new chart library.

### CMS & Content
- Use Sparti CMS components, editors, and renderers for content management, themes, and page schemas.
- Do not introduce external CMS libraries. Integrate via existing `sparti-cms/` modules and services.

### Backend & Database
- Interact with backend via existing Express REST endpoints (`server/routes/*`).
- Use Sequelize models and migrations already present under `sparti-cms/db/sequelize/`. Do not add alternative ORMs.

### Integrations
- Use prebuilt clients under `src/integrations/` (e.g., Google, SMTP/Resend).
- If authentication/database features are needed on the client side, add Supabase via the integration UI and follow project conventions (keep secrets in environment variables).

### File Organization & Conventions
- Put components in `src/components/` and pages in `src/pages/`. Keep components small and focused.
- Use TypeScript everywhere. Keep imports clean and avoid unresolved dependencies.
- Favor simple, readable implementations. Do not over-engineer error handling or abstractions.

### UX Practices
- Use toasts to inform users of important events (success, error, long-running operations).
- Ensure responsive design with Tailwind utility classes.