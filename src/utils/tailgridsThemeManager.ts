// Tailgrids doesn't have a built-in theme system, but supports dark mode
type TailgridsTheme = "light" | "dark";

const STORAGE_KEY = "tailgrids-theme";

export function applyTailgridsTheme(theme: TailgridsTheme) {
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

export function initTailgridsTheme(defaultTheme: TailgridsTheme = "light") {
  let saved: TailgridsTheme | null = null;
  try {
    const s = localStorage.getItem(STORAGE_KEY) as TailgridsTheme | null;
    if (s) saved = s;
  } catch {}
  applyTailgridsTheme(saved || defaultTheme);
}

export function getAvailableTailgridsThemes(): { id: TailgridsTheme; label: string }[] {
  return [
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
  ];
}
