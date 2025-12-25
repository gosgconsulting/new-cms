import React from 'react';

interface ThemeSelectorProps {
  currentThemeId: string;
  onThemeChange: (themeId: string) => void;
  isSuperAdmin: boolean;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = () => {
  // Theme selection is disabled; only tenant selection is available.
  return null;
};

export default ThemeSelector;