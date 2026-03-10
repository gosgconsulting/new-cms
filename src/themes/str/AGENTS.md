# STR Theme - AI Agent Guidelines

This document provides guidelines for AI agents working with the STR fitness theme.

## Theme Overview

The STR theme is a fitness/gym website theme with:
- Homepage with hero, about, programmes, gallery, testimonials, team, FAQ sections
- Booking flow pages (`/booking`, `/packages`, `/booking/classes`)
- Contact modal sidebar
- Thank you page

## Asset Structure

### Image Assets Location
All theme assets are stored in:
- `sparti-cms/theme/str/assets/` (source)
- `public/theme/str/assets/` (served)

### Key Asset Paths
- **Logo**: `/theme/str/assets/logos/str-logo-1-1024x604.png`
- **Hero Background**: `/theme/str/assets/hero/hero-background.jpg`
- **Gallery Images**: `/theme/str/assets/gallery/` (if needed)
- **Team Photos**: `/theme/str/assets/team/` (if needed)

## Image Modification Guidelines

### When User Provides an Image:
1. **Save the image** to the appropriate asset directory:
   - Hero backgrounds → `sparti-cms/theme/str/assets/hero/` and `public/theme/str/assets/hero/`
   - Logos → `sparti-cms/theme/str/assets/logos/` and `public/theme/str/assets/logos/`
   - Gallery images → `sparti-cms/theme/str/assets/gallery/` and `public/theme/str/assets/gallery/`
   - Team photos → `sparti-cms/theme/str/assets/team/` and `public/theme/str/assets/team/`

2. **Update the code** to reference the new image:
   - For Hero Section: Update `sparti-cms/theme/str/components/HeroSection.tsx`
   - The component accepts `imageSrc` prop or extracts from `items` schema
   - Default path: `/theme/str/assets/hero/hero-background.jpg`
   - Use the format: `/theme/str/assets/[category]/[filename]`

3. **Example - Hero Background**:
   ```tsx
   // In HeroSection.tsx, the image is already set up to use:
   const finalImageSrc = imageSrc || heroImage?.src || extractedProps.imageSrc || '/theme/str/assets/hero/hero-background.jpg';
   
   // To use a different image, either:
   // Option 1: Replace hero-background.jpg file in both directories
   // Option 2: Pass imageSrc prop: <HeroSection imageSrc="/theme/str/assets/hero/new-image.jpg" />
   // Option 3: Update the default in HeroSection.tsx
   ```

### Image Replacement Process:
1. User provides image via prompt or upload
2. Save image to both locations (sparti-cms and public)
3. Update component code to use new image path
4. Ensure proper alt text and styling classes are maintained

## Component Structure

### Main Theme File
- `sparti-cms/theme/str/index.tsx` - Homepage with all sections

### Page Files
- `sparti-cms/theme/str/booking.tsx` - Booking flow
- `sparti-cms/theme/str/packages.tsx` - Packages page
- `sparti-cms/theme/str/classes.tsx` - Classes booking page
- `sparti-cms/theme/str/thank-you.tsx` - Thank you page
- `sparti-cms/theme/str/ContactModal.tsx` - Contact sidebar modal

### Sections in Homepage (index.tsx)
1. **Hero Section** - Background image, heading, CTA
2. **About Us** - Text content, feature cards
3. **Programmes** - Accordion with 7 programmes
4. **Gallery** - Filterable image gallery
5. **Testimonials** - Reviews with star ratings
6. **Our Team** - Team member grid
7. **FAQ** - Accordion with questions
8. **CTA Banner** - Call to action section
9. **Footer** - Logo, menu, social links

## Color Scheme

- **Primary Red**: `#E00000`
- **Background**: Dark theme (defined in theme.css)
- **Text**: White/light colors for contrast
- **Star Ratings**: Yellow (`text-yellow-400 fill-yellow-400`) for review stars only

## Typography

- **Headings**: Bebas Neue (uppercase, bold)
- **Body Text**: Inter (normal case, readable)

## Making Changes

### Text Content Changes
- Directly edit text in the component files
- Maintain the uppercase styling for headings
- Keep descriptions readable and concise

### Image Changes
- Follow the asset structure guidelines above
- Update both source and public directories
- Maintain consistent naming conventions

### Style Changes
- Use Tailwind CSS classes
- Theme colors are defined in `theme.css` as CSS variables
- Maintain dark theme aesthetic

## Important Notes

- The STR theme uses **hardcoded components** (not schema-based like go sg consulting)
- Changes require direct code edits to component files
- Images must be saved to both `sparti-cms/theme/str/assets/` and `public/theme/str/assets/`
- Always maintain the dark theme aesthetic
- Keep the red primary color consistent throughout
