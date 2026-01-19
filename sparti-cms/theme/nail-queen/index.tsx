import React from "react";
import { useLocation } from "react-router-dom";

import "./theme.css";

import HomePage from "./pages/HomePage";
import PricingPage from "./pages/PricingPage";
import GalleryPage from "./pages/GalleryPage";
import AboutPage from "./pages/AboutPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import FindUsPage from "./pages/FindUsPage";
import LegalPlaceholderPage from "./pages/LegalPlaceholderPage";
import NotFoundPage from "./pages/NotFoundPage";

interface NailQueenThemeProps {
  basePath?: string;
  pageSlug?: string;
  tenantName?: string;
  tenantSlug?: string;
  tenantId?: string;
}

const normalizeSlug = (slug?: string) => {
  if (!slug) return "";
  return String(slug)
    .split("?")[0]
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
};

const NailQueenTheme: React.FC<NailQueenThemeProps> = ({
  basePath,
  pageSlug,
  tenantSlug,
  tenantName = "Nail Queen",
  tenantId,
}) => {
  const location = useLocation();

  const themeSlug = tenantSlug || "nail-queen";
  const resolvedBasePath = basePath || `/theme/${themeSlug}`;

  const normalized = normalizeSlug(pageSlug);
  const slugParts = normalized.split("/").filter(Boolean);
  const topLevel = slugParts[0] || "";

  const renderRoute = () => {
    switch (topLevel) {
      case "":
        return <HomePage basePath={resolvedBasePath} />;
      case "pricing":
        return <PricingPage basePath={resolvedBasePath} />;
      case "gallery":
        return <GalleryPage basePath={resolvedBasePath} />;
      case "about":
        return <AboutPage basePath={resolvedBasePath} />;
      case "blog":
        // Check if there's a second part (blog post slug)
        if (slugParts.length > 1) {
          const postSlug = slugParts.slice(1).join("/");
          return <BlogPostPage basePath={resolvedBasePath} slug={postSlug} tenantId={tenantId} />;
        }
        return <BlogPage basePath={resolvedBasePath} tenantId={tenantId} />;
      case "find-us":
        return <FindUsPage basePath={resolvedBasePath} />;
      case "privacy":
        return (
          <LegalPlaceholderPage
            basePath={resolvedBasePath}
            title="Privacy Policy"
            description="Our privacy policy details how we handle your personal information."
          />
        );
      case "terms":
        return (
          <LegalPlaceholderPage
            basePath={resolvedBasePath}
            title="Terms & Conditions"
            description="Please read our terms and conditions carefully."
          />
        );
      default:
        return <NotFoundPage basePath={resolvedBasePath} path={location.pathname} />;
    }
  };

  return (
    <div className="nail-queen-theme">
      {/* Keeping the tenantName prop available for future integration */}
      <div data-theme-slug={themeSlug} data-tenant-name={tenantName}>
        {renderRoute()}
      </div>
    </div>
  );
};

export default NailQueenTheme;
