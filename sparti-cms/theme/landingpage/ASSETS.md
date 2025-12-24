# Asset Mapping Documentation

This document describes the asset mapping and usage in the ACATR Business Services theme.

## Asset Structure

```
assets/
├── logos/
│   ├── 752d249c-df1b-46fb-b5e2-fb20a9bb88d8.png  # Primary ACATR logo (header)
│   └── acatr-logo.png                              # Alternative logo
├── hero/
│   └── hero-business.jpg                           # Main hero section background
├── services/
│   ├── incorporation-services.jpg                  # Company incorporation
│   ├── accounting-dashboard.jpg                    # Accounting services
│   └── corporate-secretarial.jpg                   # Corporate secretarial
├── testimonials/
│   ├── testimonial-1.jpg                          # Customer photo 1
│   └── testimonial-2.jpg                          # Customer photo 2
├── fallback/
│   └── placeholder.svg                             # Fallback placeholder
└── legacy/
    ├── 1b3dc3e6-68ef-42d7-b09c-4313cd9fbadc.png   # Legacy asset
    ├── 1d669404-72a7-41cf-b076-dbe1c3fe97ef.png   # Legacy asset
    ├── 83f1323a-3955-423e-b915-abe897833469.png   # Legacy asset
    ├── 91769254-7c8e-4bcc-849d-c7c247894fbc.png   # Legacy asset
    └── f4749ba7-32f2-41b1-bf62-9ccf857bc6b6.png   # Legacy asset
```

## Usage in Components

### Header Component
- **Logo**: `752d249c-df1b-46fb-b5e2-fb20a9bb88d8.png`
- **Path**: `/theme/{tenantSlug}/assets/752d249c-df1b-46fb-b5e2-fb20a9bb88d8.png`
- **Loading**: `eager` (above the fold)

### Hero Section
- **Background**: `hero-business.jpg`
- **Path**: `/theme/{tenantSlug}/assets/hero-business.jpg`
- **Loading**: `lazy` (large image)
- **Alt Text**: "Professional business team collaboration"

### Services Section
1. **Singapore Company Incorporation**
   - **Image**: `incorporation-services.jpg`
   - **Loading**: `lazy`

2. **Annual Ongoing Services**
   - **Image**: `accounting-dashboard.jpg`
   - **Loading**: `lazy`

3. **Additional Services & Support**
   - **Image**: `corporate-secretarial.jpg`
   - **Loading**: `lazy`

### Testimonials Section
- **Sarah Chen**: `testimonial-1.jpg`
- **Marcus Rodriguez**: `testimonial-2.jpg`
- **Lisa Thompson**: `testimonial-1.jpg` (reused)
- **Loading**: `lazy` (below the fold)

### Footer Component
- **Logo**: Same as header (`752d249c-df1b-46fb-b5e2-fb20a9bb88d8.png`)
- **Loading**: `lazy` (bottom of page)

## Asset Optimization

### Image Formats
- **JPG**: Used for photographs (hero, services, testimonials)
- **PNG**: Used for logos and graphics with transparency
- **SVG**: Used for scalable graphics and placeholders

### Loading Strategy
- **Eager**: Header logo (above the fold, critical)
- **Lazy**: All other images (performance optimization)

### Responsive Considerations
- All images are responsive with CSS classes
- High-resolution images provided for retina displays
- Proper aspect ratios maintained across devices

## Fallback Strategy

1. **Primary**: Use specified theme asset
2. **Secondary**: Fall back to placeholder.svg
3. **Tertiary**: Browser default broken image handling

## Asset Serving

Assets are served through multiple mechanisms for reliability:

### Primary Serving (CMS Theme System)
- **Base URL**: `/theme/landingpage/assets/`
- **Full Path**: `/theme/landingpage/assets/{filename}`
- **Middleware**: Express static middleware in `server/app.js`
- **Source**: `sparti-cms/theme/landingpage/assets/`

### Fallback Serving (Public Directory)
- **Base URL**: `/theme/landingpage/assets/`
- **Full Path**: `/theme/landingpage/assets/{filename}`
- **Source**: `public/theme/landingpage/assets/`
- **Purpose**: Backup serving mechanism

### Error Handling
- **Fallback Image**: `placeholder.svg` for broken images
- **Logo Fallback**: Text-based tenant name display
- **Graceful Degradation**: Components handle missing images elegantly

## Migration Notes

- Original ACATR assets migrated from `src/assets/` and `public/lovable-uploads/`
- Legacy UUID-named assets preserved for backward compatibility
- New semantic naming convention adopted for clarity
- All image references updated in components

## Performance Metrics

- **Total Assets**: 13 files
- **Total Size**: ~2.5MB (estimated)
- **Critical Path**: Header logo only
- **Lazy Loaded**: 11 images
- **Format Distribution**: 7 JPG, 5 PNG, 1 SVG
