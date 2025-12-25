import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronsUpDown, Palette, Check } from 'lucide-react';
import { Button } from '../../../src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '../../../src/components/ui/dropdown-menu';
import { api } from '../../utils/api';

interface Theme {
  id: string;
  name: string;
}

interface ThemeSelectorProps {
  currentThemeId: string;
  onThemeChange: (themeId: string) => void;
  isSuperAdmin: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentThemeId,
  onThemeChange,
  isSuperAdmin,
}) => {
  // Fetch themes from API (with fallback to file system)
  const { data: themesData = [], isLoading: themesLoading } = useQuery<Array<{ id: string; name: string; slug: string }>>({
    queryKey: ['themes'],
    queryFn: async () => {
      try {
        const response = await api.get('/api/themes');
        if (response.ok) {
          const data = await response.json();
          const themes = data.themes || [];
          return themes;
        } else {
          console.error('[testing] Failed to fetch themes from API, status:', response.status);
          return [];
        }
      } catch (error) {
        console.error('[testing] Error fetching themes:', error);
        return [];
      }
    },
    retry: 1,
    retryDelay: 500,
  });

  // Get themes formatted with "Custom" as default
  const getThemes = (): Theme[] => {
    const customTheme: Theme = { id: 'custom', name: 'Custom' };
    const dbThemes: Theme[] = themesData.map(theme => ({
      id: theme.slug || theme.id,
      name: theme.name || theme.slug
    }));
    return [customTheme, ...dbThemes];
  };

  const themes = getThemes();
  const currentTheme = themes.find(t => t.id === currentThemeId);

  if (!isSuperAdmin) {
    // For non-super-admins, just show their theme name
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md">
        <Palette className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {currentTheme?.name || 'Custom'}
        </span>
      </div>
    );
  }

  if (themesLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md">
        <Palette className="h-4 w-4 text-gray-600" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center justify-between gap-2 min-w-[200px]">
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="text-sm font-medium">
              {currentTheme?.name || 'Custom'}
            </span>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Switch Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.id}
            onClick={() => onThemeChange(theme.id)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <span className="text-sm">{theme.name}</span>
            </div>
            {currentThemeId === theme.id && (
              <Check className="h-4 w-4 text-brandTeal ml-2" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;


