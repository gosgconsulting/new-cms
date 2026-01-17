// Preline doesn't have a built-in theme system, but supports dark mode
type PrelineTheme = "light" | "dark";

const STORAGE_KEY = "preline-theme";

export function applyPrelineTheme(theme: PrelineTheme) {
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

export function initPrelineTheme(defaultTheme: PrelineTheme = "light") {
  let saved: PrelineTheme | null = null;
  try {
    const s = localStorage.getItem(STORAGE_KEY) as PrelineTheme | null;
    if (s) saved = s;
  } catch {}
  applyPrelineTheme(saved || defaultTheme);
}

export function getAvailablePrelineThemes(): { id: PrelineTheme; label: string }[] {
  return [
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
  ];
}
