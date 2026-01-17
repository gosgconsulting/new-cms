// UI Main (shadcn/ui) uses CSS variables for theming
// For simplicity, we'll support light/dark modes
type UIMainTheme = "light" | "dark";

const STORAGE_KEY = "ui-main-theme";

export function applyUIMainTheme(theme: UIMainTheme) {
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

export function initUIMainTheme(defaultTheme: UIMainTheme = "light") {
  let saved: UIMainTheme | null = null;
  try {
    const s = localStorage.getItem(STORAGE_KEY) as UIMainTheme | null;
    if (s) saved = s;
  } catch {}
  applyUIMainTheme(saved || defaultTheme);
}

export function getAvailableUIMainThemes(): { id: UIMainTheme; label: string }[] {
  return [
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
  ];
}
