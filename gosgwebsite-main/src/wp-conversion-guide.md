
# WordPress Theme Conversion Guide

This document provides comprehensive instructions on how to convert this React site into a fully functional WordPress theme.

## Theme Structure

Create the following WordPress theme structure:

```
theme-name/
├── assets/
│   ├── css/
│   │   ├── tailwind.css      (Compiled from Tailwind)
│   │   └── style.css         (Additional styles)
│   ├── js/
│   │   ├── components/       (JS functionality for interactive components)
│   │   └── main.js           (Main JavaScript file)
│   └── images/               (Theme images)
├── inc/
│   ├── custom-post-types.php (Service, Testimonial, etc. CPTs)
│   ├── acf-fields.php        (Advanced Custom Fields configuration)
│   ├── theme-options.php     (Theme options panel)
│   ├── editor.php            (Admin editing functionality)
│   └── enqueue.php           (Script and style enqueueing)
├── template-parts/
│   ├── components/           (Small reusable components)
│   │   ├── button.php
│   │   ├── card.php
│   │   └── ...
│   ├── home/
│   │   ├── hero.php
│   │   ├── services.php
│   │   ├── why-choose-us.php
│   │   └── ...
│   ├── services/
│   │   ├── hero.php
│   │   ├── features.php
│   │   └── ...
│   └── ...
├── functions.php             (Theme functions)
├── index.php                 (Main template)
├── header.php                (Header template)
├── footer.php                (Footer template)
├── front-page.php            (Homepage template)
├── page.php                  (Default page template)
├── single.php                (Single post template)
├── single-service.php        (Single service template)
├── 404.php                   (404 page template)
├── archive.php               (Archive template)
├── page-contact.php          (Contact page template)
├── customizer.php            (Theme customization)
└── style.css                 (Theme information)
```

## Component Conversion Map

| React Component | WordPress Template |
|-----------------|-------------------|
| Header.tsx | header.php |
| Footer.tsx | footer.php |
| Index.tsx | front-page.php |
| Contact.tsx | page-contact.php |
| WebsiteDesign.tsx, SEO.tsx, etc. | single-service.php (with conditional logic) |
| ServiceHero.tsx | template-parts/services/hero.php |
| HeroSection.tsx | template-parts/home/hero.php |
| WhyChooseUsSection.tsx | template-parts/home/why-choose-us.php |
| ServiceFeatures.tsx | template-parts/services/features.php |
| ServiceCaseStudies.tsx | template-parts/services/case-studies.php |
| CTASection.tsx | template-parts/shared/cta.php |
| TestimonialsCarousel.tsx | template-parts/shared/testimonials.php |
| FAQAccordion.tsx | template-parts/shared/faq.php |
| WhatsAppButton.tsx | template-parts/components/whatsapp-button.php |

## Custom Post Types

Create the following custom post types:

1. **Services**
   - Register in inc/custom-post-types.php
   - Fields: title, content, features, case studies, etc.
   - Template: single-service.php

2. **Case Studies**
   - Register in inc/custom-post-types.php
   - Fields: title, content, client, industry, results, images
   - Template: single-case-study.php

3. **Testimonials**
   - Register in inc/custom-post-types.php
   - Fields: quote, author, company, rating, etc.
   - Used in testimonials.php template part

## Admin Customizer Integration

The React admin customizer should be converted to:

1. **Theme Customizer API**
   - For color and typography options
   - Define in customizer.php

2. **ACF Flexible Content**
   - For editable sections
   - Define field groups in inc/acf-fields.php

3. **Section Editor**
   - Convert the EditableSection component to utilize WordPress block editor or ACF
   - Allow inline editing with proper user role checking

## Advanced Custom Fields (ACF)

Set up ACF for page-specific content:

1. **Home Page Fields**
   ```php
   // Example field group for home hero section
   acf_add_local_field_group(array(
       'key' => 'group_home_hero',
       'title' => 'Hero Section',
       'fields' => array(
           array(
               'key' => 'field_hero_title',
               'label' => 'Hero Title',
               'name' => 'hero_title',
               'type' => 'text',
           ),
           array(
               'key' => 'field_hero_subtitle',
               'label' => 'Hero Subtitle',
               'name' => 'hero_subtitle',
               'type' => 'textarea',
           ),
           // More fields...
       ),
       'location' => array(
           array(
               array(
                   'param' => 'page_template',
                   'operator' => '==',
                   'value' => 'front-page.php',
               ),
           ),
       ),
   ));
   ```

2. **Service Page Fields**
   - Hero content
   - Features list
   - Benefits
   - Case studies
   - Plans and pricing

3. **Theme Options**
   - Contact information
   - Social media links
   - Global CTA buttons
   - Brand colors

## Animation Handling

1. Replace Framer Motion animations with:
   - CSS animations with `data-aos` attributes
   - AOS (Animate On Scroll) library
   - Simple CSS transitions

## Tailwind CSS Integration

1. Set up Tailwind with WordPress:
   - Install Tailwind via NPM in your theme directory
   - Configure tailwind.config.js to scan PHP files:
     ```js
     content: [
       './*.php',
       './template-parts/**/*.php',
       './inc/**/*.php'
     ]
     ```
   - Compile to a static CSS file for production

2. Ensure proper CSS cascade:
   - Use namespaced classes for theme styles
   - Enqueue compiled Tailwind CSS with appropriate dependencies

## User Role Management

Convert the current admin editing functionality to use WordPress user roles:

```php
// Example user role check in template parts
function go_sg_is_editor() {
    return current_user_can('edit_posts') || current_user_can('edit_pages');
}

// Usage in template
if (go_sg_is_editor()): 
    // Show edit button
endif;
```

## Responsive Images

1. Replace static image paths with:
   - `wp_get_attachment_image()`
   - Featured images using `the_post_thumbnail()`
   - Image sizes using `add_image_size()`

## Navigation Menus

1. Replace hardcoded navigation links with:
   - Register menu locations in functions.php:
     ```php
     register_nav_menus(array(
         'primary' => 'Primary Menu',
         'footer_services' => 'Footer Services Menu',
         'footer_links' => 'Footer Quick Links Menu',
     ));
     ```
   - Use `wp_nav_menu()` with custom walker classes

## Form Handling

1. Replace React forms with:
   - Contact Form 7 plugin
   - Gravity Forms plugin
   - Custom WordPress form handling with nonces

## Final Steps

1. Add WordPress theme header to style.css:
   ```css
   /*
   Theme Name: GO SG Digital Agency
   Theme URI: https://gosg.com
   Author: Your Name
   Author URI: https://yoursite.com
   Description: Custom WordPress theme for GO SG Digital Agency
   Version: 1.0.0
   License: GNU General Public License v2 or later
   License URI: http://www.gnu.org/licenses/gpl-2.0.html
   Text Domain: gosg
   */
   ```

2. Create screenshot.png (1200×900px) for theme preview
3. Test thoroughly on a staging environment
4. Implement SEO best practices via Yoast or similar
5. Ensure performance optimization with caching

## Admin Editing Functionality

Convert the current React-based editor to WordPress:

1. For section editing:
   - Use Block Editor (Gutenberg) for rich content editing
   - Implement metaboxes for structured content

2. For global theme settings:
   - Create a Theme Options page using ACF or the Theme Customizer API
