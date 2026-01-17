import React, { Suspense, lazy, useMemo } from "react";
import { useLocation } from "react-router-dom";

const StorefrontTheme = lazy(() => import("../../sparti-cms/theme/storefront"));

/**
 * Template Website
 *
 * Route namespace:
 * - /theme/template is blocked (404)
 * - /theme/template/website/* renders a website template preview
 *
 * Today this reuses the Storefront theme, but keeps URLs under /theme/template/website.
 */
export default function TemplateWebsite() {
  const location = useLocation();

  const pageSlug = useMemo(() => {
    const prefix = "/theme/template/website";
    const rest = location.pathname.startsWith(prefix)
      ? location.pathname.slice(prefix.length)
      : "";

    const normalized = rest.replace(/^\/+/, "");
    return normalized || undefined;
  }, [location.pathname]);

  return (
    <Suspense fallback={null}>
      <StorefrontTheme
        tenantName="Website Template"
        tenantSlug="template/website"
        pageSlug={pageSlug}
      />
    </Suspense>
  );
}
