# GO SG Website

A modern digital marketing agency website built with React, TypeScript, and Tailwind CSS, featuring an integrated Sparti CMS for content management.

## 🚀 Features

### Frontend
- **Homepage**: Clean, modern design with contact modal
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **SEO Optimized**: Meta tags, Open Graph, and structured data

### Admin Dashboard (Sparti CMS)
- **Analytics Dashboard**: Comprehensive website performance tracking
  - **KPI Metrics**: Page views, sessions, bounce rate, conversions
  - **Real-time Data**: Live visitor tracking and activity monitoring
  - **Event Management**: Custom event tracking for leads and engagement
  - **Visual Charts**: Traffic trends, bounce rates, top pages analysis
- **Content Management**: Pages, Blog, Header, Footer, Forms
- **Settings Management**: 
  - **Branding**: Site name, tagline, logo, favicon
  - **Style**: Color palette, typography, light/dark mode
  - **SEO**: Sitemap generation, meta titles/descriptions, robots.txt
  - **Developer**: Custom code injection, Google services integration, **Project Management**
- **Database Integration**: PostgreSQL with UPSERT operations
- **Authentication**: Secure admin access

### Project Management (Developer Tab)
- **Project Cards**: Visual project overview with status, priority, and progress
- **Task Management**: Add, edit, and track project steps/tasks
- **Progress Tracking**: Automatic completion percentage calculation
- **Task Details**: Estimated hours, assigned person, due dates
- **Status Management**: Active, completed, on-hold, cancelled items
- **Step Status**: Pending, in-progress, completed tasks

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI
- **Database**: PostgreSQL (Railway)
- **Server**: Express.js with Multer for file uploads
- **Deployment**: Railway
- **CMS**: Sparti CMS (integrated)

### 🔌 API Integrations
- **OpenRouter**: AI services for chat completion and text generation
- **Google API**: Maps, Places, Reviews, and Translator services
- **SMTP (Resend)**: Email sending capabilities for contact forms

## 📦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (local or Railway)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gosgwebsite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - For local development, ensure you have PostgreSQL running
   - For Railway deployment, see `docs/deployment/` for environment setup guides

4. **Build the application**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:4173`

## 🚀 Deployment

### Railway Deployment

1. **Create a Railway project** with PostgreSQL service
2. **Set environment variables** (see `docs/deployment/` for details):
   ```
   DATABASE_PUBLIC_URL=${{Postgres.DATABASE_PUBLIC_URL}}
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   POSTGRES_DB=${{Postgres.POSTGRES_DB}}
   POSTGRES_USER=${{Postgres.POSTGRES_USER}}
   POSTGRES_PASSWORD=${{Postgres.POSTGRES_PASSWORD}}
   PORT=${{PORT}}
   NODE_ENV=production
   RAILWAY_HEALTHCHECK_TIMEOUT_SEC=120
   ```
3. **Configure healthcheck**:
   - Healthcheck Path: `/health`
   - Healthcheck Timeout: 120 seconds
4. **Deploy** using Railway CLI or GitHub integration

### Health Check
The application includes a health check endpoint at `/health` that returns:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-14T09:12:07.000Z",
  "port": 4173
}
```

## 🗄️ Database

### PostgreSQL Schema
The application automatically creates the following tables:

- **site_settings**: Stores branding and configuration settings
- **form_submissions**: Stores contact form submissions
- **contacts**: Stores contact information and lead data

### API Endpoints

#### Core APIs
- `GET /health` - Health check
- `GET /api/branding` - Get branding settings
- `POST /api/branding` - Update branding settings
- `POST /api/upload` - File upload endpoint

#### Form APIs
- `POST /api/form-submissions` - Save form submission
- `GET /api/form-submissions/:formId` - Get form submissions

#### Contact Management APIs
- `GET /api/contacts` - Get all contacts (with pagination and search)
- `GET /api/contacts/:id` - Get specific contact
- `POST /api/contacts` - Create new contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

## 🔧 Development

### Project Structure
```
src/
├── components/          # React components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── integrations/       # External service integrations

sparti-cms/
├── components/         # CMS components
├── db/                 # Database operations
├── hooks/              # CMS hooks
└── styles/             # CMS styles

docs/                   # Documentation
├── implementation/     # Feature implementation summaries
├── setup/              # Setup and configuration guides
├── deployment/         # Deployment documentation
└── features/           # Feature documentation

scripts/                 # Utility scripts
├── migrations/         # Database migration scripts
├── setup/              # Setup and initialization scripts
├── mcp/                # MCP-related scripts
├── servers/            # Server startup scripts
├── tests/              # Test scripts
├── utilities/          # Utility scripts
└── windows/            # Windows-specific scripts (.bat, .ps1)

server.js               # Express server
```

For detailed documentation, see [docs/README.md](docs/README.md).

### Available Scripts

**Development:**
- `npm run dev` - Start development server (Vite + backend)
- `npm run dev:db` - Start development server with database
- `npm run dev:backend` - Start backend server only
- `npm run dev:frontend` - Start frontend dev server only

**Build & Deploy:**
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run preview` - Preview production build locally
- `npm run deploy` - Build and start production server

**Database & Migrations:**
- `npm run migrate` - Run database migrations
- `npm run migrate:railway` - Run migrations in production

**MCP (Model Context Protocol):**
- `npm run mcp:start` - Start MCP server
- `npm run mcp:persistent` - Start persistent MCP server
- `npm run mcp:test` - Test MCP connection
- `npm run mcp:status` - Check MCP status
- `npm run mcp:fix` - Fix database viewer issues

**Testing:**
- `npm run health:test` - Test health endpoint
- `npm run test:deployment` - Test deployment
- `npm run test:contact` - Test contact form
- `npm run test:form` - Test form submission

All scripts are organized in the `scripts/` directory. See `docs/README.md` for more information.

## 🎨 Admin Dashboard

Access the admin dashboard at `/admin` with the following features:

### Navigation Menu
- **Analytics**: Website performance tracking
- **Pages**: Content management
- **Blog**: Blog post management
- **Header**: Header customization
- **Footer**: Footer customization  
- **Forms**: Form management
- **Contacts**: Contact database management
- **Settings**: Site configuration
- **Developer**: Development tools and project management

### Contact Management Features
- **Contact Table**: Display contacts with first name, last name, email, phone, company, source, and creation date
- **Search & Filter**: Find contacts by name, email, or company
- **Contact Details**: View full contact information in modal
- **Add/Edit Contacts**: Create new contacts or update existing ones
- **Status Tracking**: Track contact status (new, contacted, qualified, converted, closed)
- **Source Tracking**: Track where contacts came from (form, manual, import, etc.)
- **Form Integration**: Automatically create contacts from form submissions
- **Pagination**: Handle large contact databases efficiently

### Settings Tabs
- **Branding**: Site name, tagline, logo, favicon
- **Style**: Colors, typography, themes
- **SEO**: Sitemap, meta tags, robots.txt, Open Graph
- **Developer**: Custom code, Google services
- **Assignment**: Assign tasks to team members
- **Due Dates**: Set and track task deadlines

## 🔒 Security

- Environment variables for sensitive data
- Secure database connections with SSL
- Input validation and sanitization
- CORS protection
- File upload restrictions (images only, 2MB limit)
- API key management with proper scoping

## 📝 License

This project is proprietary and confidential.

## 🤝 Support

For support and questions, please contact the development team.

---

**Status**: ✅ Ready for deployment with Contact Management
**Last Updated**: October 14, 2025
