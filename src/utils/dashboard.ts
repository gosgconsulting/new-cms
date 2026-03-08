
// Utility functions for the dashboard

// Update CSS variable
export const updateCssVariable = (name: string, value: string) => {
  document.documentElement.style.setProperty(name, value);
};

// Load Google Font with better management
export const loadGoogleFont = (fontFamily: string) => {
  const existingLink = document.querySelector(`link[href*="${fontFamily.replace(' ', '+')}"]`);
  if (existingLink) return existingLink as HTMLLinkElement;
  
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
  return link;
};

// Export settings as JSON
export const exportSettings = (settings: Record<string, any>) => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "theme-settings.json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

// Save settings to localStorage
export const saveToLocalStorage = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error("Error saving to localStorage:", error);
    return false;
  }
};

// Load settings from localStorage
export const loadFromLocalStorage = (key: string) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error("Error loading from localStorage:", error);
    return null;
  }
};

// Initialize global theme settings on app start
export const initializeGlobalTheme = () => {
  // Load and apply saved colors
  const savedColors = loadFromLocalStorage('website-colors');
  if (savedColors) {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', savedColors.primary);
    root.style.setProperty('--brand-secondary', savedColors.secondary);
    root.style.setProperty('--brand-accent', savedColors.accent);
    root.style.setProperty('--brand-background', savedColors.background);
    root.style.setProperty('--brand-text', savedColors.text);
    root.style.setProperty('--primary', savedColors.primary);
    root.style.setProperty('--brand-purple', savedColors.primary);
    root.style.setProperty('--brand-teal', savedColors.secondary);
    root.style.setProperty('--coral', savedColors.accent);
    
    // Apply enhanced color settings if they exist
    if (savedColors.gradientStart) {
      root.style.setProperty('--gradient-start', savedColors.gradientStart);
    }
    if (savedColors.gradientEnd) {
      root.style.setProperty('--gradient-end', savedColors.gradientEnd);
    }
    if (savedColors.labelColor) {
      root.style.setProperty('--label-color', savedColors.labelColor);
    }
    if (savedColors.footerDarkText) {
      root.style.setProperty('--footer-dark-text', savedColors.footerDarkText);
    }
  }

  // Load and apply saved typography
  const savedTypography = loadFromLocalStorage('website-typography');
  if (savedTypography) {
    loadGoogleFont(savedTypography.headingFont);
    if (savedTypography.bodyFont !== savedTypography.headingFont) {
      loadGoogleFont(savedTypography.bodyFont);
    }
    
    const root = document.documentElement;
    root.style.setProperty('--font-heading', `"${savedTypography.headingFont}", sans-serif`);
    root.style.setProperty('--font-body', `"${savedTypography.bodyFont}", sans-serif`);
    root.style.setProperty('--font-base-size', `${savedTypography.baseSize}px`);
    
    document.body.style.fontFamily = `"${savedTypography.bodyFont}", sans-serif`;
    document.body.style.fontSize = `${savedTypography.baseSize}px`;
  }
};

// Generate a theme CSS snippet
export const generateThemeCss = (colors: Record<string, string>, fonts: Record<string, string>) => {
  return `
:root {
  --brand-primary: ${colors.primary};
  --brand-secondary: ${colors.secondary};
  --brand-accent: ${colors.accent};
  --brand-background: ${colors.background};
  --brand-text: ${colors.text};
  
  --gradient-start: ${colors.gradientStart || colors.primary};
  --gradient-end: ${colors.gradientEnd || colors.secondary};
  --label-color: ${colors.labelColor || '#666666'};
  --footer-dark-text: ${colors.footerDarkText || '#FFFFFF'};
  
  --font-heading: "${fonts.heading}", sans-serif;
  --font-body: "${fonts.body}", sans-serif;
}

/* Base styles */
body {
  font-family: var(--font-body);
  color: var(--brand-text);
  background-color: var(--brand-background);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}

/* Button styles */
.button-primary {
  background-color: var(--brand-primary);
  color: white;
}

.button-secondary {
  background-color: var(--brand-secondary);
  color: white;
}

.button-accent {
  background-color: var(--brand-accent);
  color: white;
}

/* Gradient text styles */
.gradient-headline {
  background: linear-gradient(to right, var(--gradient-start), var(--gradient-end));
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}

/* Label styles */
.digital-agency-label {
  color: var(--label-color);
}

/* Footer styles */
.footer-dark-text {
  color: var(--footer-dark-text);
}
`;
};
