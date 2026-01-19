import React from "react";
import EShopTheme from "../e-shop";

interface MoondkThemeProps {
  tenantName?: string;
  tenantSlug?: string;
  pageSlug?: string;
}

/**
 * Moondk theme
 * 
 * This theme is an alias of the E-shop design system.
 * Keeping a dedicated folder (sparti-cms/theme/moondk) lets you customize later,
 * while reusing the full E-shop implementation today.
 */
const MoondkTheme: React.FC<MoondkThemeProps> = ({
  tenantName = "Moondk",
  tenantSlug = "moondk",
  pageSlug,
}) => {
  return <EShopTheme tenantName={tenantName} tenantSlug={tenantSlug} pageSlug={pageSlug} />;
};

export default MoondkTheme;