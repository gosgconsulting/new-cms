# GO SG Website

A modern digital marketing agency website built with React, TypeScript, and Tailwind CSS, featuring an integrated Sparti CMS for content management.

## 🚀 Features

### Frontend
- **Homepage**: Clean, modern design with contact modal
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **SEO Optimized**: Meta tags, Open Graph, and structured data

### Admin Dashboard (Sparti CMS)
- **Content Management**: Pages, Blog, Header, Footer, Forms
- **Settings Management**: 
  - **Branding**: Site name, tagline, logo, favicon
  - **Style**: Color palette, typography, light/dark mode
  - **SEO**: Sitemap generation, meta titles/descriptions, robots.txt
  - **Developer**: Custom code injection, Google services integration
- **Database Integration**: PostgreSQL with UPSERT operations
- **Authentication**: Secure admin access

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI
- **Database**: PostgreSQL (Railway)
- **Server**: Express.js
- **Deployment**: Railway
- **CMS**: Sparti CMS (integrated)

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
   - For Railway deployment, use the environment variables from `railway-env-variables.txt`

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
2. **Set environment variables** from `railway-env-variables.txt`:
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

### API Endpoints

- `GET /health` - Health check
- `GET /api/branding` - Get branding settings
- `POST /api/branding` - Update branding settings

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

server.js               # Express server
```

### Available Scripts

- `npm run dev` - Start development server (Vite)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run preview` - Preview production build locally

## 🎨 Admin Dashboard

Access the admin dashboard at `/admin` with the following features:

### Navigation Menu
- **Pages**: Content management
- **Blog**: Blog post management
- **Header**: Header customization
- **Footer**: Footer customization  
- **Forms**: Form management
- **Settings**: Site configuration

### Settings Tabs
- **Branding**: Site name, tagline, logo, favicon
- **Style**: Colors, typography, themes
- **SEO**: Sitemap, meta tags, robots.txt, Open Graph
- **Developer**: Custom code, Google Tag Manager, Analytics, Search Console

## 🔒 Security

- Environment variables for sensitive data
- Secure database connections with SSL
- Input validation and sanitization
- CORS protection

## 📝 License

This project is proprietary and confidential.

## 🤝 Support

For support and questions, please contact the development team.

---

**Status**: ✅ Ready for deployment
**Last Updated**: October 14, 2025
