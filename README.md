# GO SG Website

A modern digital marketing agency website built with React, TypeScript, and Vite, featuring an integrated Sparti CMS for content management.

## Features

### Frontend
- Modern, responsive design with Tailwind CSS
- Contact modal with form submission
- SEO-optimized structure
- Fast loading with Vite build system

### Sparti CMS Admin Interface
Access the admin interface at `/admin` with credentials: `admin` / `admin`

**Navigation Menu:**
- **Pages** - Manage website pages and content
- **Blog** - Blog post management (placeholder)
- **Header** - Header customization (placeholder)
- **Footer** - Footer customization (placeholder)
- **Forms** - Form submissions and management (placeholder)
- **Settings** - Site configuration and styling

**Settings Features:**
- **Branding Tab**:
  - Site name and tagline configuration
  - Logo upload (placeholder)
  - Favicon upload (placeholder)

- **Style Tab**:
  - **Colors Section**: 
    - Light/Dark mode toggle
    - Brand color palette (Primary, Secondary, Success, Warning)
    - Live color picker with hex values
  - **Typography Section**:
    - Headings font selection
    - Body text font selection
    - Live font preview

- **SEO Tab**:
  - **XML Sitemap**:
    - Auto-generate sitemap.xml for search engines
    - Toggle sitemap generation on/off
    - Manual regeneration button
  - **Meta Titles & Descriptions**:
    - Page title template with variables: `{{page_title}}`, `{{site_name}}`, `{{category}}`, `{{author}}`
    - Homepage title template with variables: `{{site_name}}`, `{{tagline}}`
    - Description templates with variables: `{{page_excerpt}}`, `{{page_title}}`, `{{site_name}}`, `{{category}}`
    - Custom homepage description
    - Title separator options (|, -, •, /, :)
  - **Advanced SEO**:
    - Custom robots.txt editor with `{{site_url}}` variable
    - Open Graph social media settings
    - Default social image upload
    - Twitter handle and Facebook App ID configuration

- **Developer Tab**:
  - **Custom Code Section**:
    - Head section for custom HTML, CSS, JavaScript in `<head>`
    - Body section for scripts before closing `</body>` tag
    - Syntax-highlighted code editors with placeholders
  - **Google Services Integration**:
    - **Google Tag Manager**: Container ID configuration (GTM-XXXXXXX)
    - **Google Analytics**: Measurement ID setup (G-XXXXXXXXXX)
    - **Google Search Console**: Site verification meta tag content
    - Visual service cards with icons and descriptions

### Database Integration
- PostgreSQL database connection via Railway
- Form submission storage
- Session management with localStorage (demo mode)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd gosgwebsite

# Install dependencies
npm install

# Build the application
npm run build

# Start the server
npm start
```

The application will be available at `http://localhost:4173`

### Admin Access
1. Navigate to `http://localhost:4173/admin`
2. Login with credentials: `admin` / `admin`
3. Use the sidebar navigation to access different CMS sections

### Development
```bash
# Start development server
npm run dev
```

## Project Structure

```
src/
├── components/          # React components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── integrations/       # External service integrations

sparti-cms/             # Sparti CMS module
├── components/         # CMS components
│   ├── admin/         # Admin interface components
│   ├── auth/          # Authentication components
│   └── cms/           # Content management components
├── hooks/             # CMS-specific hooks
├── styles/            # CMS styling
└── types/             # TypeScript definitions
```

## Deployment

The application is configured for Railway deployment with:
- Express.js server for static file serving
- Health check endpoint at `/health`
- Environment variable support
- PostgreSQL database integration

## Technologies Used

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React icons
- **Backend**: Express.js, PostgreSQL
- **Deployment**: Railway
- **CMS**: Sparti CMS (integrated)

## License

This project is proprietary software for GO SG Digital Marketing Agency.
