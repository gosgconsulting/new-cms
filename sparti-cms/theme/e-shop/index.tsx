import React, { useEffect, useMemo } from "react";
import "./theme.css";
import { ThemeBasePathProvider } from "./components/ThemeLink";

import IndexPage from "./pages/Index";
import CategoryPage from "./pages/Category";
import ProductDetailPage from "./pages/ProductDetail";
import CheckoutPage from "./pages/Checkout";
import OurStoryPage from "./pages/about/OurStory";
import SustainabilityPage from "./pages/about/Sustainability";
import SizeGuidePage from "./pages/about/SizeGuide";
import CustomerCarePage from "./pages/about/CustomerCare";
import StoreLocatorPage from "./pages/about/StoreLocator";
import PrivacyPolicyPage from "./pages/PrivacyPolicy";
import TermsOfServicePage from "./pages/TermsOfService";
import NotFoundPage from "./pages/NotFound";

interface EShopThemeProps {
  tenantName?: string;
  tenantSlug?: string;
  pageSlug?: string;
}

function normalizeSlug(slug?: string) {
  if (!slug) return "";
  return slug.replace(/^\/+/, "").replace(/\/+$/, "");
}

const EShopTheme: React.FC<EShopThemeProps> = ({
  tenantName = "E-shop",
  tenantSlug = "e-shop",
  pageSlug,
}) => {
  const basePath = useMemo(() => `/theme/${tenantSlug}`, [tenantSlug]);
  const current = normalizeSlug(pageSlug);

  // Scroll restoration for theme navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [current]);

  const renderPage = () => {
    if (!current) {
      return <IndexPage tenantName={tenantName} />;
    }

    if (current.startsWith("category/")) {
      const category = current.split("/").slice(1).join("/") || "shop";
      return <CategoryPage category={category} />;
    }

    if (current.startsWith("product/")) {
      const productId = current.split("/").slice(1).join("/") || "";
      return <ProductDetailPage productId={productId} />;
    }

    if (current === "checkout") {
      return <CheckoutPage />;
    }

    if (current === "privacy-policy") {
      return <PrivacyPolicyPage />;
    }

    if (current === "terms-of-service") {
      return <TermsOfServicePage />;
    }

    if (current === "about/our-story") {
      return <OurStoryPage />;
    }

    if (current === "about/sustainability") {
      return <SustainabilityPage />;
    }

    if (current === "about/size-guide") {
      return <SizeGuidePage />;
    }

    if (current === "about/customer-care") {
      return <CustomerCarePage />;
    }

    if (current === "about/store-locator") {
      return <StoreLocatorPage />;
    }

    return <NotFoundPage />;
  };

  return (
    <ThemeBasePathProvider basePath={basePath}>
      <div className="eshop-theme min-h-screen bg-background text-foreground">
        {renderPage()}
      </div>
    </ThemeBasePathProvider>
  );
};

export default EShopTheme;
