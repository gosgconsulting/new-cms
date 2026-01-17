import type { DesignSystemMetadata } from "./designSystemMetadata";
import type { ComponentSchema } from "../../sparti-cms/types/schema";
import { discoverComponents } from "../utils/designSystemDiscovery";
import { getAvailableFlowbiteThemes, applyFlowbiteTheme } from "../utils/flowbiteThemeManager";
import FlowbiteComponentPreview from "../components/visual-builder/FlowbiteComponentPreview";
import FlowbiteSection from "../libraries/flowbite/components/FlowbiteSection";
import { createElement } from "react";
import { loadDesignSystemStyles, unloadDesignSystemStyles } from "../utils/designSystemStyleLoader";
import {
  getFlowbiteStyleConfig,
} from "./designSystemStyleProviders";

/**
 * Flowbite component files (excluding base Section component)
 */
const FLOWBITE_COMPONENT_FILES = [
  "FlowbiteAdminDashboardShell.tsx",
  "FlowbiteBlogGrid.tsx",
  "FlowbiteBlogHero.tsx",
  "FlowbiteBlogSidebar.tsx",
  "FlowbiteContent.tsx",
  "FlowbiteContentSection.tsx",
  "FlowbiteCTASection.tsx",
  "FlowbiteFAQSection.tsx",
  "FlowbiteFeaturesSection.tsx",
  "FlowbiteFooter.tsx",
  "FlowbiteHeader.tsx",
  "FlowbiteHeroSection.tsx",
  "FlowbiteNewsletter.tsx",
  "FlowbitePageTitle.tsx",
  "FlowbitePainPointSection.tsx",
  "FlowbiteProductGrid.tsx",
  "FlowbiteProductSection.tsx",
  "FlowbiteReviews.tsx",
  "FlowbiteSEOResultsSection.tsx",
  "FlowbiteServicesGrid.tsx",
  "FlowbiteShowcase.tsx",
  "FlowbiteSlider.tsx",
  "FlowbiteSocialMedia.tsx",
  "FlowbiteTestimonialsSection.tsx",
  "FlowbiteVideoSection.tsx",
  "FlowbiteWhatIsSEOSection.tsx",
  "FlowbiteWhatsIncludedSection.tsx",
  "FlowbiteWhyChooseUsSection.tsx",
];


/**
 * Get Flowbite design system metadata
 */
export function getFlowbiteMetadata(): DesignSystemMetadata {
  const components = discoverComponents(
    FLOWBITE_COMPONENT_FILES,
    "Flowbite",
    "flowbite/components"
  );

  const styleConfig = getFlowbiteStyleConfig();

  return {
    id: "flowbite",
    label: "Flowbite",
    description: "Reference implementation for Flowbite-based pages and theme styling.",
    components,
    getThemes: () => getAvailableFlowbiteThemes(),
    applyTheme: (themeId: string) => {
      applyFlowbiteTheme(themeId as any);
    },
    getComponentPreview: (schema: ComponentSchema) => {
      return createElement(FlowbiteComponentPreview, { schema });
    },
    getSectionComponent: () => FlowbiteSection,
    techStack: styleConfig.techStack,
    styles: styleConfig.styles,
    styleConfig: styleConfig.styleConfig,
    loadStyles: async () => {
      await loadDesignSystemStyles(styleConfig.styleConfig, "flowbite");
    },
    unloadStyles: () => {
      unloadDesignSystemStyles("flowbite");
    },
  };
}

