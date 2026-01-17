import React, { createContext, useContext } from "react";
import {
  Link,
  type LinkProps,
  NavLink,
  type NavLinkProps,
  type To,
} from "react-router-dom";

const ThemeBasePathContext = createContext<string>("/theme/e-shop");

export function ThemeBasePathProvider({
  basePath,
  children,
}: {
  basePath: string;
  children: React.ReactNode;
}) {
  return (
    <ThemeBasePathContext.Provider value={basePath}>
      {children}
    </ThemeBasePathContext.Provider>
  );
}

export function useThemeBasePath() {
  return useContext(ThemeBasePathContext);
}

function resolveTo(basePath: string, to: To): To {
  if (typeof to !== "string") return to;
  if (!to.startsWith("/")) return to;
  if (to.startsWith(basePath)) return to;
  if (to.startsWith("/theme/")) return to;
  return `${basePath}${to}`;
}

export function ThemeLink(props: LinkProps) {
  const basePath = useThemeBasePath();
  return <Link {...props} to={resolveTo(basePath, props.to)} />;
}

export function ThemeNavLink(props: NavLinkProps) {
  const basePath = useThemeBasePath();
  return <NavLink {...props} to={resolveTo(basePath, props.to)} />;
}

export function themeHref(basePath: string, href: string) {
  if (!href.startsWith("/")) return href;
  if (href.startsWith(basePath)) return href;
  if (href.startsWith("/theme/")) return href;
  return `${basePath}${href}`;
}
