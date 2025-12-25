# GO SG Consulting Theme

A full-stack digital growth solution theme with integrated blog functionality, migrated from the original gosgwebsite-main design (source folder removed after successful migration).

## Features

- **Homepage with Hero Section**: Eye-catching hero section with gradient backgrounds and call-to-action
- **Integrated Blog System**: Blog listing and post rendering with WordPress API integration
- **Contact Forms**: Modal-based contact form for lead generation
- **SEO Optimization**: Proper meta tags and structured data
- **Mobile Responsive**: Fully responsive design across all devices
- **Modern UI**: Gradient backgrounds, smooth animations, and modern design patterns

## Theme Structure

```
sparti-cms/theme/gosgconsulting/
├── index.tsx                 # Main theme component
├── theme.json               # Theme metadata and configuration
├── pages.json              # Page definitions and routing
├── theme.css               # Theme-specific styles
├── README.md               # This documentation
├── components/             # Theme components
│   ├── Header.tsx          # Site header with navigation
│   ├── Footer.tsx          # Site footer
│   ├── HeroSection.tsx     # Homepage hero section
│   ├── BlogSection.tsx     # Blog listing component
│   ├── ContactFormDialog.tsx # Contact form modal
│   └── ui/                 # Shared UI components
│       └── button.tsx      # Button component
└── assets/                 # Theme assets
    ├── go-sg-logo-official.png
    ├── gregoire-liao.png
    ├── logos/              # Client logos
    ├── results/            # SEO results images
    ├── seo/               # SEO service images
    └── seo-results-1.png
```

## Usage

This theme is automatically registered with the CMS when the theme sync service runs. It will appear in the theme dropdown when creating or editing tenants.

### Theme Props

The main theme component accepts the following props:

```typescript
interface TenantLandingProps {
  tenantName?: string;    // Default: 'GO SG Consulting'
  tenantSlug?: string;    // Default: 'gosgconsulting'
}
```

### Asset Paths

Assets are automatically resolved using the tenant slug:
- Logo: `/theme/{tenantSlug}/assets/go-sg-logo-official.png`
- Other assets follow the same pattern

## Components

### Header
- Sticky navigation with logo and contact button
- Responsive design with mobile optimization
- Backdrop blur effect on scroll

### HeroSection
- Full-screen hero with gradient backgrounds
- Animated elements and call-to-action
- Features list and company branding

### BlogSection
- Grid layout for blog posts
- Category tags and date formatting
- Hover effects and smooth transitions
- Integration with WordPress API

### Footer
- Simple footer with copyright and legal links
- Responsive layout

### ContactFormDialog
- Modal-based contact form
- Form validation and submission handling
- Responsive design

## Styling

The theme uses custom CSS variables and utility classes:

- `--gosg-primary`: Primary brand color (#6366f1)
- `--gosg-secondary`: Secondary brand color (#06b6d4)
- `--gosg-accent`: Accent color (#f59e0b)

Custom classes:
- `.gosg-gradient-bg`: Gradient background utility
- `.gosg-cta-button`: Call-to-action button styling
- `.gosg-card`: Card component styling
- `.gosg-fade-in`, `.gosg-slide-up`: Animation utilities

## Migration Notes

This theme was migrated from the original gosgwebsite-main website (source folder removed after migration) with the following changes:

1. **Component Architecture**: Converted from page-based to component-based architecture
2. **Asset Management**: Moved assets to theme-specific folder structure
3. **Styling**: Consolidated styles into theme.css with CSS variables
4. **Database Integration**: Added theme.json and pages.json for CMS integration
5. **Responsive Design**: Maintained original responsive behavior
6. **Blog Integration**: Preserved WordPress API integration for blog functionality

## Development

To modify this theme:

1. Edit components in the `components/` directory
2. Update styles in `theme.css`
3. Modify theme metadata in `theme.json`
4. Update page definitions in `pages.json`
5. Run theme sync to update database registration

The theme will be automatically available in the CMS admin interface for tenant selection.

