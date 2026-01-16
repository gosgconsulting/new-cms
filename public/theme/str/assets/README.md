# STR Theme Assets

This folder contains the assets for the STR fitness training theme.

## Folder Structure

```
assets/
├── logos/                    # Brand logos
│   └── str-logo.png          # Main STR logo (replace this file)
├── hero/                     # Hero section images
│   └── hero-background.jpg   # Hero background (replace this file)
└── images/                   # Other content images
```

## How to Replace Assets

### Replace Logo
1. Place your logo file in: `logos/str-logo-1-1024x604.png`
2. Recommended format: PNG with transparency
3. Current file: `str-logo-1-1024x604.png` (1024x604px)

### Replace Hero Background
1. Place your hero image in: `hero/hero-background.jpg`
2. Recommended format: JPG (optimized for web)
3. Recommended size: 1920px width (or larger, will be scaled)
4. The image will be displayed with a grayscale filter and dark overlay

## File Naming

**Important**: Keep the exact filenames:
- Logo: `str-logo-1-1024x604.png`
- Hero: `hero-background.jpg`

The code references these specific filenames. If you use different names, you'll need to update the code in `sparti-cms/theme/str/index.tsx`.

## Notes

- All images should be optimized for web use
- The hero background will automatically fall back to a placeholder if the file is missing
- The logo will fall back to text "STR" if the file is missing
