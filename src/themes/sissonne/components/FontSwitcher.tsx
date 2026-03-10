import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Type, ChevronUp, ChevronDown } from "lucide-react";

interface FontSwitcherProps {
  tenantSlug?: string;
}

export function FontSwitcher({ tenantSlug = 'sissonne' }: FontSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const themeBasePath = `/theme/${tenantSlug}`;

  const fonts = [
    {
      name: "Baskerville",
      path: `${themeBasePath}/baskerville`,
      headlineFont: "Libre Baskerville",
      bodyFont: "Inter",
    },
    {
      name: "EB Garamond",
      path: `${themeBasePath}/eb-garamond`,
      headlineFont: "EB Garamond",
      bodyFont: "Nunito Sans",
    },
    {
      name: "Lora",
      path: `${themeBasePath}/lora`,
      headlineFont: "Lora",
      bodyFont: "Work Sans",
    },
    {
      name: "Amalfi & Avenir",
      path: `${themeBasePath}/amalfi-avenir`,
      headlineFont: "Amalfi Coast",
      bodyFont: "Avenir",
    },
  ];

  const getCurrentFont = () => {
    // Handle homepage as Playfair
    if (location.pathname === themeBasePath || location.pathname === `${themeBasePath}/`) {
      return "Playfair";
    }
    const current = fonts.find((font) => location.pathname === font.path || location.pathname.startsWith(font.path));
    return current ? current.name : "Playfair";
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-dance-white rounded-2xl shadow-2xl border border-dance-gray-200 overflow-hidden">
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-3 p-4 w-full hover:bg-dance-gray-50 transition-colors duration-300"
        >
          <div className="bg-dance-pink rounded-full p-2">
            <Type className="h-4 w-4 text-dance-white" />
          </div>
          <div className="text-left">
            <div className="text-sm font-heading font-semibold text-dance-black">
              Font Tester
            </div>
            <div className="text-xs text-dance-gray-600">
              {getCurrentFont()}
            </div>
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-dance-gray-600" />
          ) : (
            <ChevronUp className="h-4 w-4 text-dance-gray-600" />
          )}
        </button>

        {/* Font Options */}
        {isOpen && (
          <div className="border-t border-dance-gray-200">
            <div className="p-2 space-y-1">
              {/* Homepage Playfair option */}
              <Link
                to={themeBasePath}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors duration-300 ${
                  location.pathname === themeBasePath || location.pathname === `${themeBasePath}/`
                    ? "bg-dance-pink text-dance-white"
                    : "text-dance-gray-700 hover:bg-dance-gray-100"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <div className="font-medium">Playfair</div>
                <div className="text-xs opacity-75">Playfair Display</div>
                <div className="text-xs opacity-75">Source Sans Pro</div>
              </Link>

              {fonts.map((font) => (
                <Link
                  key={font.path}
                  to={font.path}
                  className={`block px-3 py-2 rounded-lg text-sm transition-colors duration-300 ${
                    location.pathname === font.path || location.pathname.startsWith(font.path)
                      ? "bg-dance-pink text-dance-white"
                      : "text-dance-gray-700 hover:bg-dance-gray-100"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className="font-medium">{font.name}</div>
                  <div className="text-xs opacity-75">{font.headlineFont}</div>
                  <div className="text-xs opacity-75">{font.bodyFont}</div>
                </Link>
              ))}
            </div>

            {/* Info Footer */}
            <div className="border-t border-dance-gray-200 p-3">
              <div className="text-xs text-dance-gray-500 text-center">
                Compare different fonts for headlines
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
