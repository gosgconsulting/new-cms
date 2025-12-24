# Template Landing Page

A clean, customizable landing page template for any business or organization. This template provides the mandatory structure and files needed to create a new theme in the Sparti CMS system.

## 📋 What's Included

### Mandatory Files (Required for all themes)
- ✅ `index.tsx` - Main theme component with generic content
- ✅ `theme.json` - Theme metadata and configuration
- ✅ `pages.json` - Page definitions and SEO settings
- ✅ `theme.css` - Basic theme styles with CSS variables
- ✅ `README.md` - This documentation

## 🚀 Quick Start

### 1. Copy Template to Create New Theme
```bash
cp -r sparti-cms/template/landingpage sparti-cms/theme/your-theme-name
```

### 2. Customize Mandatory Files

**Update `theme.json`:**
```json
{
  "name": "Your Theme Name",
  "description": "Your theme description",
  "author": "Your Name",
  // ... other settings
}
```

**Update `pages.json`:**
```json
{
  "pages": [
    {
      "page_name": "Homepage",
      "meta_title": "Your Business - Your Service",
      "meta_description": "Your SEO description",
      // ... other settings
    }
  ]
}
```

**Customize `index.tsx`:**
- Update default props (`tenantName`, `tenantSlug`)
- Modify content sections
- Add your business information

### 3. Your Theme is Ready!
Navigate to `/theme/your-theme-name` to see your new theme.

## 🎨 Customization Guide

### Content Sections
The template includes these customizable sections:

1. **Header** - Navigation and branding
2. **Hero Section** - Main landing area with call-to-action
3. **Features Section** - Key benefits or services
4. **CTA Section** - Final conversion area
5. **Footer** - Contact info and links

### Styling
The template uses CSS custom properties (variables) for easy customization:

```css
:root {
  --primary: 220 70% 50%;           /* Your brand color */
  --secondary: 220 14% 96%;         /* Secondary color */
  --background: 0 0% 100%;          /* Background color */
  /* ... more variables */
}
```

### Adding Components
To add more components:

1. Create `components/` directory
2. Add your component files
3. Import and use in `index.tsx`

### Adding Assets
To add images and assets:

1. Create `assets/` directory
2. Add your files
3. Reference with `/theme/your-theme-name/assets/filename.ext`

## 📁 Recommended Structure

For more complex themes, consider this structure:

```
your-theme-name/
├── index.tsx              # Main component (required)
├── theme.json            # Metadata (required)
├── pages.json            # Pages (required)
├── theme.css             # Styles (recommended)
├── README.md             # Documentation (recommended)
├── components/           # Custom components
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ui/              # Reusable UI components
├── assets/              # Images, icons, etc.
│   ├── images/
│   ├── icons/
│   └── logos/
└── verify-assets.js     # Asset verification (optional)
```

## 🔧 Development Tips

### 1. Start Simple
- Use this template as-is first
- Test that it works
- Then gradually add complexity

### 2. Keep It Generic
- Avoid hardcoded business names
- Use props for customizable content
- Make colors and styles easily changeable

### 3. Test Responsively
- The template is mobile-first
- Test on different screen sizes
- Ensure accessibility

### 4. Follow Conventions
- Use TypeScript interfaces for props
- Follow React best practices
- Use semantic HTML

## 🚨 Common Mistakes to Avoid

❌ **Don't copy existing themes** - They contain specific business content
❌ **Don't hardcode business names** - Use props for flexibility
❌ **Don't skip the mandatory files** - All three are required
❌ **Don't forget to test** - Always test your theme before deployment

## 📖 Next Steps

1. **Customize the content** - Replace placeholder text with your content
2. **Update the styling** - Modify CSS variables to match your brand
3. **Add more sections** - Create additional components as needed
4. **Test thoroughly** - Ensure everything works on different devices
5. **Document changes** - Update this README with your customizations

## 🆘 Need Help?

- Check the main theme documentation: `sparti-cms/theme/README.md`
- Look at existing themes for inspiration (but don't copy them)
- Test your theme at `/theme/your-theme-name`
- Use browser dev tools to debug styling issues

## 📝 Version History

- **v1.0.0** - Initial template with mandatory files and basic structure

---

**Remember**: This template provides the minimum required structure. You can always add more complexity later, but starting with this foundation ensures your theme will work properly in the CMS system.
