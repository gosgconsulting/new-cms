import type { DesignSystemMetadata } from "./designSystemMetadata";
import type { ComponentSchema } from "../../sparti-cms/types/schema";
import { discoverComponents } from "../utils/designSystemDiscovery";
import {
  discoverFlyonUIComponents,
  discoverHyperUIComponents,
  discoverPrelineComponents,
  discoverTailgridsComponents,
  discoverUIMainComponents,
} from "../utils/designSystemComponentDiscovery";
import { getAvailableFlowbiteThemes, applyFlowbiteTheme } from "../utils/flowbiteThemeManager";
import { getAvailableDaisyUIThemes, applyDaisyUITheme } from "../utils/daisyuiThemeManager";
import { getAvailableFlyonUIThemes, applyFlyonUITheme } from "../utils/flyonuiThemeManager";
import { getAvailableHyperUIThemes, applyHyperUITheme } from "../utils/hyperuiThemeManager";
import { getAvailablePrelineThemes, applyPrelineTheme } from "../utils/prelineThemeManager";
import { getAvailableTailgridsThemes, applyTailgridsTheme } from "../utils/tailgridsThemeManager";
import { getAvailableUIMainThemes, applyUIMainTheme } from "../utils/uiMainThemeManager";
import FlowbiteComponentPreview from "../components/visual-builder/FlowbiteComponentPreview";
import DaisyUIComponentPreview from "../components/visual-builder/DaisyUIComponentPreview";
import FlyonUIComponentPreview from "../components/visual-builder/FlyonUIComponentPreview";
import HyperUIComponentPreview from "../components/visual-builder/HyperUIComponentPreview";
import PrelineComponentPreview from "../components/visual-builder/PrelineComponentPreview";
import TailgridsComponentPreview from "../components/visual-builder/TailgridsComponentPreview";
import UIMainComponentPreview from "../components/visual-builder/UIMainComponentPreview";
import FlowbiteSection from "../libraries/flowbite/components/FlowbiteSection";
import DaisyUISection from "../libraries/daisyui/components/DaisyUISection";
import FlyonUISection from "../libraries/flyonui/components/FlyonUISection";
import HyperUISection from "../libraries/hyperui/components/HyperUISection";
import PrelineSection from "../libraries/preline/components/PrelineSection";
import TailgridsSection from "../libraries/tailgrids/components/TailgridsSection";
import UIMainSection from "../libraries/ui-main/components/UIMainSection";
import { createElement } from "react";
import { loadDesignSystemStyles, unloadDesignSystemStyles } from "../utils/designSystemStyleLoader";
import {
  getFlowbiteStyleConfig,
  getDaisyUIStyleConfig,
  getFlyonUIStyleConfig,
  getHyperUIStyleConfig,
  getPrelineStyleConfig,
  getTailgridsStyleConfig,
  getUIMainStyleConfig,
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
 * DaisyUI component files (excluding base Section component)
 */
const DAISYUI_COMPONENT_FILES = [
  "DaisyUIAboutSection.tsx",
  "DaisyUICardSection.tsx",
  "DaisyUICTASection.tsx",
  "DaisyUIFAQSection.tsx",
  "DaisyUIFeaturesSection.tsx",
  "DaisyUIFooter.tsx",
  "DaisyUIHeader.tsx",
  "DaisyUIHeroSection.tsx",
  "DaisyUIServicesSection.tsx",
  "DaisyUITestimonialsSection.tsx",
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

/**
 * Get DaisyUI design system metadata
 */
export function getDaisyUIMetadata(): DesignSystemMetadata {
  const components = discoverComponents(
    DAISYUI_COMPONENT_FILES,
    "DaisyUI",
    "daisyui/components"
  );

  const styleConfig = getDaisyUIStyleConfig();

  return {
    id: "daisyui",
    label: "DaisyUI",
    description: "Reference implementation for DaisyUI-based pages and theme styling.",
    components,
    getThemes: () => getAvailableDaisyUIThemes(),
    applyTheme: (themeId: string) => {
      applyDaisyUITheme(themeId as any);
    },
    getComponentPreview: (schema: ComponentSchema) => {
      return createElement(DaisyUIComponentPreview, { schema });
    },
    getSectionComponent: () => DaisyUISection,
    techStack: styleConfig.techStack,
    styles: styleConfig.styles,
    styleConfig: styleConfig.styleConfig,
    loadStyles: async () => {
      await loadDesignSystemStyles(styleConfig.styleConfig, "daisyui");
    },
    unloadStyles: () => {
      unloadDesignSystemStyles("daisyui");
    },
  };
}

/**
 * Get FlyonUI design system metadata
 */
export function getFlyonUIMetadata(): DesignSystemMetadata {
  const components = discoverFlyonUIComponents();
  const styleConfig = getFlyonUIStyleConfig();

  return {
    id: "flyonui",
    label: "FlyonUI",
    description: "Reference implementation for FlyonUI-based pages and theme styling.",
    components,
    getThemes: () => getAvailableFlyonUIThemes(),
    applyTheme: (themeId: string) => {
      applyFlyonUITheme(themeId as any);
    },
    getComponentPreview: (schema: ComponentSchema) => {
      return createElement(FlyonUIComponentPreview, { schema });
    },
    getSectionComponent: () => FlyonUISection,
    techStack: styleConfig.techStack,
    styles: styleConfig.styles,
    styleConfig: styleConfig.styleConfig,
    loadStyles: async () => {
      await loadDesignSystemStyles(styleConfig.styleConfig, "flyonui");
    },
    unloadStyles: () => {
      unloadDesignSystemStyles("flyonui");
    },
  };
}

/**
 * Get HyperUI design system metadata
 */
export function getHyperUIMetadata(): DesignSystemMetadata {
  const components = discoverHyperUIComponents();
  const styleConfig = getHyperUIStyleConfig();

  return {
    id: "hyperui",
    label: "HyperUI",
    description: "Reference implementation for HyperUI-based pages and theme styling.",
    components,
    getThemes: () => getAvailableHyperUIThemes(),
    applyTheme: (themeId: string) => {
      applyHyperUITheme(themeId as any);
    },
    getComponentPreview: (schema: ComponentSchema) => {
      return createElement(HyperUIComponentPreview, { schema });
    },
    getSectionComponent: () => HyperUISection,
    techStack: styleConfig.techStack,
    styles: styleConfig.styles,
    styleConfig: styleConfig.styleConfig,
    loadStyles: async () => {
      await loadDesignSystemStyles(styleConfig.styleConfig, "hyperui");
    },
    unloadStyles: () => {
      unloadDesignSystemStyles("hyperui");
    },
  };
}

/**
 * Get Preline design system metadata
 */
export function getPrelineMetadata(): DesignSystemMetadata {
  const components = discoverPrelineComponents();
  const styleConfig = getPrelineStyleConfig();

  return {
    id: "preline",
    label: "Preline",
    description: "Reference implementation for Preline-based pages and theme styling.",
    components,
    getThemes: () => getAvailablePrelineThemes(),
    applyTheme: (themeId: string) => {
      applyPrelineTheme(themeId as any);
    },
    getComponentPreview: (schema: ComponentSchema) => {
      return createElement(PrelineComponentPreview, { schema });
    },
    getSectionComponent: () => PrelineSection,
    techStack: styleConfig.techStack,
    styles: styleConfig.styles,
    styleConfig: styleConfig.styleConfig,
    loadStyles: async () => {
      await loadDesignSystemStyles(styleConfig.styleConfig, "preline");
    },
    unloadStyles: () => {
      unloadDesignSystemStyles("preline");
    },
  };
}

/**
 * Get Tailgrids design system metadata
 */
export function getTailgridsMetadata(): DesignSystemMetadata {
  const components = discoverTailgridsComponents();
  const styleConfig = getTailgridsStyleConfig();

  return {
    id: "tailgrids",
    label: "Tailgrids",
    description: "Reference implementation for Tailgrids-based pages and theme styling.",
    components,
    getThemes: () => getAvailableTailgridsThemes(),
    applyTheme: (themeId: string) => {
      applyTailgridsTheme(themeId as any);
    },
    getComponentPreview: (schema: ComponentSchema) => {
      return createElement(TailgridsComponentPreview, { schema });
    },
    getSectionComponent: () => TailgridsSection,
    techStack: styleConfig.techStack,
    styles: styleConfig.styles,
    styleConfig: styleConfig.styleConfig,
    loadStyles: async () => {
      await loadDesignSystemStyles(styleConfig.styleConfig, "tailgrids");
    },
    unloadStyles: () => {
      unloadDesignSystemStyles("tailgrids");
    },
  };
}

/**
 * Get UI Main design system metadata
 */
export function getUIMainMetadata(): DesignSystemMetadata {
  const components = discoverUIMainComponents();
  const styleConfig = getUIMainStyleConfig();

  return {
    id: "ui-main",
    label: "UI Main",
    description: "Reference implementation for UI Main (shadcn/ui)-based pages and theme styling.",
    components,
    getThemes: () => getAvailableUIMainThemes(),
    applyTheme: (themeId: string) => {
      applyUIMainTheme(themeId as any);
    },
    getComponentPreview: (schema: ComponentSchema) => {
      return createElement(UIMainComponentPreview, { schema });
    },
    getSectionComponent: () => UIMainSection,
    techStack: styleConfig.techStack,
    styles: styleConfig.styles,
    styleConfig: styleConfig.styleConfig,
    loadStyles: async () => {
      await loadDesignSystemStyles(styleConfig.styleConfig, "ui-main");
    },
    unloadStyles: () => {
      unloadDesignSystemStyles("ui-main");
    },
  };
}
