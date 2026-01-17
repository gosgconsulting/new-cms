type DaisyUITheme = 
  | "light" 
  | "dark" 
  | "cupcake" 
  | "bumblebee" 
  | "emerald" 
  | "corporate" 
  | "synthwave" 
  | "retro" 
  | "cyberpunk" 
  | "valentine" 
  | "halloween" 
  | "garden" 
  | "forest" 
  | "aqua" 
  | "lofi" 
  | "pastel" 
  | "fantasy" 
  | "wireframe" 
  | "black" 
  | "luxury" 
  | "dracula" 
  | "cmyk" 
  | "autumn" 
  | "business" 
  | "acid" 
  | "lemonade" 
  | "night" 
  | "coffee" 
  | "winter";

const STORAGE_KEY = "daisyui-theme";

export function applyDaisyUITheme(theme: DaisyUITheme) {
  const html = document.documentElement;
  html.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {}
}

export function initDaisyUITheme(defaultTheme: DaisyUITheme = "light") {
  let saved: DaisyUITheme | null = null;
  try {
    const s = localStorage.getItem(STORAGE_KEY) as DaisyUITheme | null;
    if (s) saved = s;
  } catch {}
  applyDaisyUITheme(saved || defaultTheme);
}

export function getAvailableDaisyUIThemes(): { id: DaisyUITheme; label: string }[] {
  return [
    { id: "light", label: "Light" },
    { id: "dark", label: "Dark" },
    { id: "cupcake", label: "Cupcake" },
    { id: "bumblebee", label: "Bumblebee" },
    { id: "emerald", label: "Emerald" },
    { id: "corporate", label: "Corporate" },
    { id: "synthwave", label: "Synthwave" },
    { id: "retro", label: "Retro" },
    { id: "cyberpunk", label: "Cyberpunk" },
    { id: "valentine", label: "Valentine" },
    { id: "halloween", label: "Halloween" },
    { id: "garden", label: "Garden" },
    { id: "forest", label: "Forest" },
    { id: "aqua", label: "Aqua" },
    { id: "lofi", label: "Lofi" },
    { id: "pastel", label: "Pastel" },
    { id: "fantasy", label: "Fantasy" },
    { id: "wireframe", label: "Wireframe" },
    { id: "black", label: "Black" },
    { id: "luxury", label: "Luxury" },
    { id: "dracula", label: "Dracula" },
    { id: "cmyk", label: "CMYK" },
    { id: "autumn", label: "Autumn" },
    { id: "business", label: "Business" },
    { id: "acid", label: "Acid" },
    { id: "lemonade", label: "Lemonade" },
    { id: "night", label: "Night" },
    { id: "coffee", label: "Coffee" },
    { id: "winter", label: "Winter" },
  ];
}
