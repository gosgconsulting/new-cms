import React, { Suspense, lazy, useMemo } from "react";
import { useLocation } from "react-router-dom";

// The legacy templates folder was removed; the master template lives as a theme.
const TemplateMasterApp = lazy(() => import("../../sparti-cms/theme/master"));

/**
 * Template Master
 *
 * Route namespace:
 * - /theme/template is blocked (404)
 * - /theme/template/master/* is a reference implementation for future templates
 */
export default function TemplateMaster() {
  const location = useLocation();

  const pageSlug = useMemo(() => {
    const prefix = "/theme/template/master";
    const rest = location.pathname.startsWith(prefix)
      ? location.pathname.slice(prefix.length)
      : "";

    const normalized = rest.replace(/^\/+/, "");
    return normalized || undefined;
  }, [location.pathname]);

  return (
    <Suspense fallback={null}>
      <TemplateMasterApp basePath="/theme/template/master" pageSlug={pageSlug} />
    </Suspense>
  );
}