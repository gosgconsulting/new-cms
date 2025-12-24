# ACATR Business Services Theme

A sophisticated professional business services landing page theme with advanced components, dynamic content support, and comprehensive service showcases. Perfect for business incorporation, accounting, and corporate services.

## Features

- **Professional Design**: Modern, clean design with professional gradients and shadows
- **Multi-Component Architecture**: Modular components for easy customization
- **Dynamic Content Support**: CMS-compatible with schema integration
- **Contact Form Integration**: Built-in contact form with email functionality
- **Responsive Design**: Mobile-first responsive design
- **SEO Optimized**: Proper meta tags and semantic HTML
- **Trust Indicators**: Professional badges and success metrics
- **Service Showcase**: Detailed service sections with alternating layouts
- **Customer Testimonials**: Review system with ratings and results
- **FAQ Section**: Collapsible FAQ accordion
- **Professional Assets**: High-quality business images included

## Components

### Core Components
- `Header.tsx` - Navigation with logo, menu, and contact CTA
- `HeroSection.tsx` - Advanced hero with gradient text and trust indicators
- `ServicesSection.tsx` - Detailed services showcase with alternating layouts
- `TestimonialsSection.tsx` - Customer reviews with ratings and results
- `FAQSection.tsx` - Collapsible FAQ component
- `CTASection.tsx` - Call-to-action with contact form integration
- `Footer.tsx` - Comprehensive footer with links and company info
- `ContactFormDialog.tsx` - Modal contact form component

### UI Components
- `Button.tsx` - Customizable button component
- `Card.tsx` - Card components with variants
- `Accordion.tsx` - Accordion components for FAQ

## Usage

The theme is designed to work with the CMS system and accepts the following props:

```typescript
interface TenantLandingProps {
  tenantName?: string;    // Default: 'ACATR Business Services'
  tenantSlug?: string;    // Default: 'landingpage'
}
```

## Customization

### Colors and Styling
The theme uses CSS custom properties defined in `theme.css`. Key variables:

- `--primary`: Main brand color (purple)
- `--accent`: Accent color (orange)
- `--gradient-primary`: Primary gradient
- `--gradient-hero`: Hero section gradient
- `--shadow-soft/medium/strong`: Professional shadows

### Content Customization
All content can be customized through the component props or CMS integration:

- Service descriptions and features
- Testimonial content and ratings
- FAQ questions and answers
- Contact information
- Company branding

### Assets
Theme assets are located in the `assets/` directory:

**Logos:**
- `752d249c-df1b-46fb-b5e2-fb20a9bb88d8.png` - ACATR Header Logo
- `acatr-logo.png` - Alternative Logo

**Hero Section:**
- `hero-business.jpg` - Main hero background image

**Service Images:**
- `incorporation-services.jpg` - Company incorporation services
- `accounting-dashboard.jpg` - Accounting and financial services
- `corporate-secretarial.jpg` - Corporate secretarial services

**Testimonials:**
- `testimonial-1.jpg` - Customer testimonial photo 1
- `testimonial-2.jpg` - Customer testimonial photo 2

**Fallback:**
- `placeholder.svg` - SVG placeholder for missing images

**Legacy Assets (from original ACATR):**
- Various PNG files with UUID names for backward compatibility

## File Structure

```
sparti-cms/theme/landingpage/
├── index.tsx                 # Main theme component
├── components/               # Component directory
│   ├── Header.tsx
│   ├── HeroSection.tsx
│   ├── ServicesSection.tsx
│   ├── TestimonialsSection.tsx
│   ├── FAQSection.tsx
│   ├── CTASection.tsx
│   ├── Footer.tsx
│   ├── ContactFormDialog.tsx
│   └── ui/                   # UI components
│       ├── button.tsx
│       ├── card.tsx
│       └── accordion.tsx
├── assets/                   # Theme assets
├── theme.css                 # Theme styling
├── theme.json               # Theme metadata
├── pages.json               # Page definitions
└── README.md                # This file
```

## Integration

The theme integrates with the CMS system through:

1. **Theme Loading**: Automatically loaded by the CMS theme system
2. **Asset Serving**: Assets served from `/theme/{tenantSlug}/assets/`
3. **Dynamic Content**: Compatible with CMS content management
4. **Tenant Customization**: Supports tenant-specific branding and content

## Performance

- Optimized component structure
- Efficient CSS with custom properties
- Lazy loading compatible
- Minimal dependencies
- Professional image optimization

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive
- Progressive enhancement
- Accessibility compliant

## Version History

- **v2.0.0**: Complete ACATR migration with advanced components
- **v1.0.0**: Basic landing page template

## License

Copyright © 2024 GOSG. All rights reserved.
