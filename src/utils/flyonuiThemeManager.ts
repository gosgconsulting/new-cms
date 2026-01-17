// FlyonUI has multiple themes available
type FlyonUITheme = 
  | "light"
  | "dark"
  | "corporate"
  | "luxury"
  | "soft"
  | "pastel"
  | "black"
  | "claude"
  | "ghibli"
  | "gourmet"
  | "marshmallow"
  | "mintlify"
  | "perplexity"
  | "shadcn"
  | "slack"
  | "spotify"
  | "valorant"
  | "vscode";

const STORAGE_KEY = "flyonui-theme";

export function applyFlyonUITheme(theme: FlyonUITheme) {
  const html = document.documentElement;
  html.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {}
}

export function initFlyonUITheme(defaultTheme: FlyonUITheme = "light") {
  let saved: FlyonUITheme | null = null;
  try {
    const s = localStorage.getItem(STORAGE_KEY) as FlyonUITheme | null;
    if (s) saved = s;
  } catch {}
  applyFlyonUITheme(saved || defaultTheme);
}

export function getAvailableFlyonUIThemes(): { id: FlyonUITheme; label: string }[] {
  return [
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
    { id: "corporate", label: "Corporate" },
    { id: "luxury", label: "Luxury" },
    { id: "soft", label: "Soft" },
    { id: "pastel", label: "Pastel" },
    { id: "black", label: "Black" },
    { id: "claude", label: "Claude" },
    { id: "ghibli", label: "Ghibli" },
    { id: "gourmet", label: "Gourmet" },
    { id: "marshmallow", label: "Marshmallow" },
    { id: "mintlify", label: "Mintlify" },
    { id: "perplexity", label: "Perplexity" },
    { id: "shadcn", label: "Shadcn" },
    { id: "slack", label: "Slack" },
    { id: "spotify", label: "Spotify" },
    { id: "valorant", label: "Valorant" },
    { id: "vscode", label: "VSCode" },
  ];
}
