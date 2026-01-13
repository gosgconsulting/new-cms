# Sissonne Dance Academy - Brand Style Guide

## Brand Overview

Sissonne Dance Academy embodies elegance, precision, and artistic excellence. Our brand reflects the grace of classical ballet while embracing modern dance forms, creating a sophisticated yet approachable identity.

## Typography

### Font Families

- **Headlines**: Libre Baskerville (serif) - Classical, elegant, sophisticated
- **Headlines Cursive**: Great Vibes (cursive) - For special emphasis and family-related content
- **Body Text**: Poppins (sans-serif) - Clean, modern, highly readable, thin weights for elegance
- **Handwriting**: Dancing Script (cursive) - For "family" references and warm, personal content
- **Buttons**: Poppins (sans-serif) - Consistent with body text

### Typography Guidelines

- Use **headline cursive** (Great Vibes) sparingly for special words like "dance journey", "family", "transformation"
- Keep body text light (font-weight: 300) for elegance
- Capitalize only the first letter of sentences and proper nouns
- Avoid ALL CAPS except for small UI elements where necessary

## Color Palette

### Primary Colors

- **Dance Pink**: `hsl(330, 45%, 75%)` - Primary brand color, used for CTAs and highlights
- **Dance Purple**: `hsl(330, 25%, 75%)` - Secondary accent, used in gradients
- **Dance Black**: `hsl(220, 13%, 9%)` - Text and sophisticated contrast
- **Dance White**: `hsl(0, 0%, 98%)` - Clean backgrounds and text on dark

### Supporting Colors

- **Dance Rose**: `hsl(330, 30%, 88%)` - Soft backgrounds and gentle accents
- **Dance Gray 50-900**: Various shades for text hierarchy and backgrounds

### Color Usage Guidelines

#### Call-to-Action (CTA) Colors

- **Primary CTA**: Gradient from Dance Pink to Dance Purple
- **Secondary CTA**: Dance Black background with white text
- **Hover States**: Reverse gradients or slightly darker shades
- **Button Text**: Always use medium font-weight (500), not bold

#### Interactive Elements

- **Active/Selected State**: Dance Pink background
- **Hover State**: Dance Pink text color
- **Focus State**: Dance Pink border/outline

#### Consistency Rules

1. **All primary CTAs** should use the pink-to-purple gradient
2. **All secondary CTAs** should use black background with white text
3. **Selected/active tabs** should use Dance Pink background, not black
4. **Hover animations** should use Dance Pink as the accent color

## Component Guidelines

### Header

- **Background**: Clean white with subtle shadow
- **Position**: Sticky on scroll for easy navigation
- **Logo**: Circular with border, scale appropriately
- **Navigation**: Clean typography with Dance Pink hover states
- **CTA Button**: Primary gradient style

### Buttons

- **Primary**: Gradient background (Dance Pink to Purple)
- **Secondary**: Black background, white text
- **Text**: Medium weight, proper capitalization
- **Border Radius**: Rounded-full for modern appearance
- **Hover**: Scale slightly (105%) with smooth transitions

### Images

- **Text Overlays**: Display by default, not just on hover
- **Hover Effects**: Subtle animations (scale, opacity, or overlay effects)
- **Aspect Ratios**: Maintain consistent proportions across sections

### Cards and Containers

- **Background**: Dance White or subtle gray tones
- **Shadows**: Soft, elegant shadows that lift content
- **Border Radius**: Consistent rounded corners (16px-24px)
- **Spacing**: Generous padding for breathing room

## Animation and Interactions

### Hover Effects

- **Scale**: Subtle scale(1.05) for buttons and cards
- **Transitions**: 300ms duration with ease-in-out timing
- **Color Transitions**: Smooth color changes using Dance Pink
- **Shadow**: Enhance shadows on hover for depth

### Image Animations

- **Gallery**: Subtle zoom or parallax effects
- **Cards**: Gentle lift with shadow enhancement
- **Avoid**: Jarring or overly dramatic animations

## Voice and Tone

### Brand Voice

- **Elegant**: Sophisticated language reflecting dance artistry
- **Approachable**: Warm and welcoming to all skill levels
- **Professional**: Expert instruction and proven results
- **Inspiring**: Motivational and encouraging growth

### Content Guidelines

- Use lowercase for most headings except proper nouns
- Emphasize "family" and community aspects
- Highlight international standards and achievements
- Balance technical expertise with emotional connection

## Technical Implementation

### CSS Classes

```css
/* Typography */
.heading-primary {
  font-family: "Libre Baskerville";
  font-weight: 700;
}
.heading-cursive {
  font-family: "Great Vibes";
  font-weight: 400;
}
.body-text {
  font-family: "Poppins";
  font-weight: 300;
}
.handwriting {
  font-family: "Dancing Script";
  font-weight: 400;
}

/* Colors */
.text-brand-pink {
  color: hsl(330, 45%, 75%);
}
.bg-brand-gradient {
  background: linear-gradient(to right, hsl(330, 45%, 75%), hsl(330, 25%, 75%));
}

/* Components */
.btn-primary {
  /* Pink gradient with proper styling */
}
.btn-secondary {
  /* Black background with white text */
}
```

### Tailwind Classes

- Primary buttons: `bg-gradient-to-r from-dance-pink to-dance-purple`
- Text colors: `text-dance-pink`, `text-dance-black`
- Hover states: `hover:text-dance-pink`, `hover:scale-105`

## Quality Checklist

### Before Launch

- [ ] All CTAs use consistent gradient styling
- [ ] Selected/active states use Dance Pink, not black
- [ ] Typography uses proper font families and weights
- [ ] Image text displays by default
- [ ] Hover animations are subtle and elegant
- [ ] Color usage follows brand guidelines
- [ ] Header is sticky and well-designed
- [ ] Mobile responsiveness maintained

### Regular Audits

- Review color consistency across all pages
- Ensure typography hierarchy is maintained
- Verify button styles match brand guidelines
- Check hover states and animations
- Validate accessibility and contrast ratios

---

_This guide ensures consistent, elegant branding across all Sissonne Dance Academy digital touchpoints._
