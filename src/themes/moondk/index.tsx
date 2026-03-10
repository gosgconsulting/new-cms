import React, { useEffect, useMemo } from "react";
import "./theme.css";
import { ThemeBasePathProvider } from "./components/ThemeLink";
import { CartProvider } from "./contexts/CartContext";

import IndexPage from "./pages/Index";
import CategoryPage from "./pages/Category";
import ProductDetailPage from "./pages/ProductDetail";
import CheckoutPage from "./pages/Checkout";
import OurStoryPage from "./pages/about/OurStory";
import SustainabilityPage from "./pages/about/Sustainability";
import SizeGuidePage from "./pages/about/SizeGuide";
import StoreLocatorPage from "./pages/about/StoreLocator";
import PrivacyPolicyPage from "./pages/PrivacyPolicy";
import TermsOfServicePage from "./pages/TermsOfService";
import NotFoundPage from "./pages/NotFound";
import RecipesPage from "./pages/Recipes";
import RecipeDetailPage from "./pages/RecipeDetail";
import BrokPrivateDinningPage from "./pages/BrokPrivateDinning";

interface MoondkThemeProps {
  tenantName?: string;
  tenantSlug?: string;
  pageSlug?: string;
}

function normalizeSlug(slug?: string) {
  if (!slug) return "";
  return slug.replace(/^\/+/, "").replace(/\/+$/, "");
}

const MoondkTheme: React.FC<MoondkThemeProps> = ({
  tenantName = "Moondk",
  tenantSlug = "moondk",
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
      return <IndexPage />;
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

    if (current === "about/store-locator") {
      return <StoreLocatorPage />;
    }

    if (current === "recipes") {
      return <RecipesPage />;
    }

    if (current.startsWith("recipes/")) {
      const recipeSlug = current.split("/").slice(1).join("/") || "";
      return <RecipeDetailPage recipeSlug={recipeSlug} />;
    }

    if (current === "beok-private-dinning") {
      return <BrokPrivateDinningPage />;
    }

    return <NotFoundPage />;
  };

  return (
    <ThemeBasePathProvider basePath={basePath}>
      <CartProvider>
        <div className="moondk-theme min-h-screen bg-background text-foreground">
          {renderPage()}
        </div>
      </CartProvider>
    </ThemeBasePathProvider>
  );
};

export default MoondkTheme;