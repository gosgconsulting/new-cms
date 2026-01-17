import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', size = 'sm' }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem('master-theme-mode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    setIsDark(shouldBeDark);
    
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('master-theme-mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('master-theme-mode', 'light');
    }
  };

  const sizeClasses =
    size === 'md' ? 'h-10 w-10' : 'h-9 w-9';

  return (
    <button
      onClick={toggleTheme}
      className={[
        'inline-flex items-center justify-center rounded-full border transition-colors',
        'bg-white/60 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10',
        'border-black/10 dark:border-white/10',
        'text-gray-900 dark:text-white',
        'focus:outline-none focus:ring-2 focus:ring-[color:var(--brand-primary)] focus:ring-offset-2 focus:ring-offset-transparent',
        sizeClasses,
        className,
      ].join(' ')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      type="button"
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  );
};

export default ThemeToggle;