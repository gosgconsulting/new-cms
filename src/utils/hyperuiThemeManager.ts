// HyperUI doesn't have a built-in theme system, but supports dark mode
type HyperUITheme = "light" | "dark";

const STORAGE_KEY = "hyperui-theme";

export function applyHyperUITheme(theme: HyperUITheme) {
  const html = document.documentElement;
  if (theme === "dark") {
    html.classList.add("dark");
  } else {
    html.classList.remove("dark");
  }
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {}
}

export function initHyperUITheme(defaultTheme: HyperUITheme = "light") {
  let saved: HyperUITheme | null = null;
  try {
    const s = localStorage.getItem(STORAGE_KEY) as HyperUITheme | null;
    if (s) saved = s;
  } catch {}
  applyHyperUITheme(saved || defaultTheme);
}

export function getAvailableHyperUIThemes(): { id: HyperUITheme; label: string }[] {
  return [
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
  ];
}
