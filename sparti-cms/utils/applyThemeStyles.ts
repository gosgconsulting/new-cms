/**
 * Utility to apply theme styles from database to the document
 * Converts theme styles JSON to CSS variables and applies them
 */

export interface ThemeStyles {
  // Primary Colors
  primary?: string;
  primaryForeground?: string;
  
  // Secondary Colors
  secondary?: string;
  secondaryForeground?: string;
  
  // Base Colors
  background?: string;
  foreground?: string;
  card?: string;
  cardForeground?: string;
  
  // Accent Colors
  accent?: string;
  accentForeground?: string;
  muted?: string;
  mutedForeground?: string;
  
  // Additional Colors
  border?: string;
  input?: string;
  ring?: string;
  destructive?: string;
  destructiveForeground?: string;
  
  // Typography
  typography?: {
    fontSans?: string;
    fontSerif?: string;
    fontMono?: string;
    baseFontSize?: string;
    headingScale?: string;
    lineHeight?: string;
  };
}

/**
 * Convert hex color to HSL format for CSS variables
 */
function hexToHsl(hex: string): string | null {
  if (!hex || !hex.startsWith('#')) {
    return null;
  }
  
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number, s: number, l: number;
  
  l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
      default: h = 0;
    }
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `${h} ${s}% ${l}%`;
}

/**
 * Apply theme styles to the document root as CSS variables
 * @param styles - Theme styles object from database
 * @param selector - CSS selector to apply styles to (default: ':root')
 */
export function applyThemeStyles(styles: ThemeStyles | null, selector: string = ':root'): void {
  if (!styles) {
    console.log('[applyThemeStyles] No styles provided, skipping application');
    return;
  }

  // Get or create style element
  let styleElement = document.getElementById('theme-styles-dynamic') as HTMLStyleElement;
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'theme-styles-dynamic';
    document.head.appendChild(styleElement);
  }

  // Build CSS variables
  const cssVariables: string[] = [];

  // Color variables
  if (styles.primary) {
    cssVariables.push(`--primary: ${hexToHsl(styles.primary) || styles.primary};`);
  }
  if (styles.primaryForeground) {
    cssVariables.push(`--primary-foreground: ${hexToHsl(styles.primaryForeground) || styles.primaryForeground};`);
  }
  if (styles.secondary) {
    cssVariables.push(`--secondary: ${hexToHsl(styles.secondary) || styles.secondary};`);
  }
  if (styles.secondaryForeground) {
    cssVariables.push(`--secondary-foreground: ${hexToHsl(styles.secondaryForeground) || styles.secondaryForeground};`);
  }
  if (styles.background) {
    cssVariables.push(`--background: ${hexToHsl(styles.background) || styles.background};`);
  }
  if (styles.foreground) {
    cssVariables.push(`--foreground: ${hexToHsl(styles.foreground) || styles.foreground};`);
  }
  if (styles.card) {
    cssVariables.push(`--card: ${hexToHsl(styles.card) || styles.card};`);
  }
  if (styles.cardForeground) {
    cssVariables.push(`--card-foreground: ${hexToHsl(styles.cardForeground) || styles.cardForeground};`);
  }
  if (styles.accent) {
    cssVariables.push(`--accent: ${hexToHsl(styles.accent) || styles.accent};`);
  }
  if (styles.accentForeground) {
    cssVariables.push(`--accent-foreground: ${hexToHsl(styles.accentForeground) || styles.accentForeground};`);
  }
  if (styles.muted) {
    cssVariables.push(`--muted: ${hexToHsl(styles.muted) || styles.muted};`);
  }
  if (styles.mutedForeground) {
    cssVariables.push(`--muted-foreground: ${hexToHsl(styles.mutedForeground) || styles.mutedForeground};`);
  }
  if (styles.border) {
    cssVariables.push(`--border: ${hexToHsl(styles.border) || styles.border};`);
  }
  if (styles.input) {
    cssVariables.push(`--input: ${hexToHsl(styles.input) || styles.input};`);
  }
  if (styles.ring) {
    cssVariables.push(`--ring: ${hexToHsl(styles.ring) || styles.ring};`);
  }
  if (styles.destructive) {
    cssVariables.push(`--destructive: ${hexToHsl(styles.destructive) || styles.destructive};`);
  }
  if (styles.destructiveForeground) {
    cssVariables.push(`--destructive-foreground: ${hexToHsl(styles.destructiveForeground) || styles.destructiveForeground};`);
  }

  // Typography variables
  if (styles.typography) {
    if (styles.typography.fontSans) {
      cssVariables.push(`--font-sans: ${styles.typography.fontSans};`);
    }
    if (styles.typography.fontSerif) {
      cssVariables.push(`--font-serif: ${styles.typography.fontSerif};`);
    }
    if (styles.typography.fontMono) {
      cssVariables.push(`--font-mono: ${styles.typography.fontMono};`);
    }
    if (styles.typography.baseFontSize) {
      cssVariables.push(`--font-base-size: ${styles.typography.baseFontSize};`);
    }
    if (styles.typography.headingScale) {
      cssVariables.push(`--font-heading-scale: ${styles.typography.headingScale};`);
    }
    if (styles.typography.lineHeight) {
      cssVariables.push(`--font-line-height: ${styles.typography.lineHeight};`);
    }
  }

  // Apply styles
  if (cssVariables.length > 0) {
    styleElement.textContent = `${selector} {\n  ${cssVariables.join('\n  ')}\n}`;
    console.log(`[applyThemeStyles] Applied ${cssVariables.length} CSS variables to ${selector}`);
  } else {
    console.log('[applyThemeStyles] No valid styles to apply');
  }
}

/**
 * Remove applied theme styles
 */
export function removeThemeStyles(): void {
  const styleElement = document.getElementById('theme-styles-dynamic');
  if (styleElement) {
    styleElement.remove();
    console.log('[applyThemeStyles] Removed theme styles');
  }
}

