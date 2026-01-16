# STR Theme Asset Management

This document describes the asset structure and usage for the STR fitness training theme.

## Asset Directory Structure

```
assets/
├── logos/                    # Brand logos and marks
│   └── str-logo.png          # Main STR logo (white text on black background)
├── hero/                     # Hero section background images
│   └── hero-background.jpg   # Main hero section background image
├── images/                   # Content images (section images, etc.)
└── icons/                    # Icon graphics (if needed)
```

## Asset Locations

Assets are stored in two locations for redundancy:

1. **Public Directory** (served directly):
   - `public/theme/str/assets/`
   - Used for direct file serving during development and production

2. **Theme Source Directory** (source of truth):
   - `sparti-cms/theme/str/assets/`
   - Used as the primary source for theme assets

## Current Assets

### Logos
- **str-logo-1-1024x604.png**: Main STR logo
  - Used in: Header navigation, Footer
  - Path: `/theme/str/assets/logos/str-logo-1-1024x604.png`
  - Format: PNG with transparency
  - Dimensions: 1024x604px
  - **Location**: Already uploaded in `sparti-cms/theme/str/assets/logos/` and `public/theme/str/assets/logos/`

### Hero Background
- **hero-background.jpg**: Hero section background image
  - Used in: Hero section (main landing area)
  - Path: `/theme/str/assets/hero/hero-background.jpg`
  - Format: JPG (optimized for web)
  - Dimensions: Recommended 1920px width
  - **Current**: Black and white gym interior photo with dynamic lighting
  - **To replace**: Place your hero image in `public/theme/str/assets/hero/hero-background.jpg` and `sparti-cms/theme/str/assets/hero/hero-background.jpg`

## Usage in Components

### Header Logo
- **Component**: `sparti-cms/theme/str/index.tsx` (line ~201)
- **Path**: `/theme/str/assets/logos/str-logo-1-1024x604.png`
- **Size**: `h-8` (32px height, auto width)
- **Fallback**: Text "STR" if image fails to load

### Footer Logo
- **Component**: `sparti-cms/theme/str/index.tsx` (line ~742)
- **Path**: `/theme/str/assets/logos/str-logo-1-1024x604.png`
- **Size**: `h-12` (48px height, auto width)
- **Fallback**: Text "STR" if image fails to load

### Hero Background Image
- **Component**: `sparti-cms/theme/str/index.tsx` (line ~265)
- **Path**: `/theme/str/assets/hero/hero-background.jpg`
- **Size**: Full width, covers entire hero section
- **Fallback**: Falls back to placeholder image if not found

## Adding New Images

### For Content Images (Hero, Backgrounds, etc.)
1. Place image in: `public/theme/str/assets/images/` and `sparti-cms/theme/str/assets/images/`
2. Reference in code: `/theme/str/assets/images/your-image.jpg`
3. Use appropriate format:
   - **JPG**: For photographs
   - **PNG**: For graphics with transparency
   - **SVG**: For scalable graphics
   - **WebP**: For optimized web images (with fallback)

### Example Usage
```tsx
<img 
  src="/theme/str/assets/images/hero-background.jpg" 
  alt="Training session" 
  className="w-full h-full object-cover"
  loading="lazy"
/>
```

## Image Optimization Guidelines

1. **Hero Images**: Optimize for web, max width 1920px
2. **Background Images**: Use appropriate compression
3. **Logos**: Maintain high quality, use PNG for transparency
4. **Icons**: Consider SVG for scalability

## Error Handling

All image components include error handling:
- Fallback to text/placeholder if image fails to load
- Prevents duplicate fallback elements
- Graceful degradation for missing assets

## Future Asset Organization

As the theme grows, organize assets by section:
- `assets/images/hero/` - Hero section images
- `assets/images/gallery/` - Gallery images
- `assets/images/team/` - Team member photos
- `assets/images/testimonials/` - Testimonial photos (if needed)
