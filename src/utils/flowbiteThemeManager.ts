type FlowbiteTheme = 'default' | 'minimal' | 'enterprise' | 'playful' | 'mono';

import defaultCssUrl from '@/styles/flowbite/default.css?url';
import minimalCssUrl from '@/styles/flowbite/minimal.css?url';
import enterpriseCssUrl from '@/styles/flowbite/enterprise.css?url';
import playfulCssUrl from '@/styles/flowbite/playful.css?url';
import monoCssUrl from '@/styles/flowbite/mono.css?url';

const THEME_LINK_ID = 'flowbite-theme-link';
const STORAGE_KEY = 'flowbite-theme';

const themeUrlMap: Record<FlowbiteTheme, string> = {
  default: defaultCssUrl,
  minimal: minimalCssUrl,
  enterprise: enterpriseCssUrl,
  playful: playfulCssUrl,
  mono: monoCssUrl,
};

export function applyFlowbiteTheme(theme: FlowbiteTheme) {
  const href = themeUrlMap[theme];
  if (!href) return;

  let link = document.getElementById(THEME_LINK_ID) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = THEME_LINK_ID;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  // Swap href to new theme CSS (last one wins)
  link.href = href;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {}
}

export function initFlowbiteTheme(defaultTheme: FlowbiteTheme = 'default') {
  let saved: FlowbiteTheme | null = null;
  try {
    const s = localStorage.getItem(STORAGE_KEY) as FlowbiteTheme | null;
    if (s && themeUrlMap[s]) saved = s;
  } catch {}
  applyFlowbiteTheme(saved || defaultTheme);
}

export function getAvailableFlowbiteThemes(): { id: FlowbiteTheme; label: string }[] {
  return [
    { id: 'default', label: 'Default' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'enterprise', label: 'Enterprise' },
    { id: 'playful', label: 'Playful' },
    { id: 'mono', label: 'Mono' },
  ];
}