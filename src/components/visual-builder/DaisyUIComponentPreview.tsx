"use client";

import React, { useState } from "react";
import DaisyUISection from "../../libraries/daisyui/components/DaisyUISection";
import GenericSectionPreview from "./GenericSectionPreview";
import type { ComponentSchema, SchemaItem } from "../../../sparti-cms/types/schema";
import DaisyUIHeroSection from "../../libraries/daisyui/components/DaisyUIHeroSection";
import DaisyUIHeader from "../../libraries/daisyui/components/DaisyUIHeader";
import DaisyUIFooter from "../../libraries/daisyui/components/DaisyUIFooter";
import DaisyUIFeaturesSection from "../../libraries/daisyui/components/DaisyUIFeaturesSection";
import DaisyUICardSection from "../../libraries/daisyui/components/DaisyUICardSection";
import DaisyUICTASection from "../../libraries/daisyui/components/DaisyUICTASection";
import DaisyUITestimonialsSection from "../../libraries/daisyui/components/DaisyUITestimonialsSection";
import DaisyUIFAQSection from "../../libraries/daisyui/components/DaisyUIFAQSection";
import DaisyUIServicesSection from "../../libraries/daisyui/components/DaisyUIServicesSection";
import DaisyUIAboutSection from "../../libraries/daisyui/components/DaisyUIAboutSection";

type Props = {
  schema: ComponentSchema;
};

const normalizeType = (t?: string) => (t || "").toLowerCase();

const DaisyUIComponentPreview: React.FC<Props> = ({ schema }) => {
  const t = normalizeType(schema.type || (schema as any).name || (schema as any).key);

  if (t.includes("herosection") || t === "herosection" || t.includes("hero")) {
    return <DaisyUIHeroSection component={schema} />;
  }

  if (t.includes("header") || t === "header" || t === "navbar") {
    return <DaisyUIHeader component={schema} />;
  }

  if (t.includes("footer") || t === "footer") {
    return <DaisyUIFooter component={schema} />;
  }

  if (t.includes("featuressection") || t.includes("features")) {
    return <DaisyUIFeaturesSection component={schema} />;
  }

  if (t.includes("cardsection") || t.includes("card") && !t.includes("feature")) {
    return <DaisyUICardSection component={schema} />;
  }

  if (t.includes("ctasection") || t.includes("cta") || t.includes("calltoaction")) {
    return <DaisyUICTASection component={schema} />;
  }

  if (t.includes("testimonialssection") || t.includes("testimonials") || t.includes("reviews")) {
    return <DaisyUITestimonialsSection component={schema} />;
  }

  if (t.includes("faqsection") || t.includes("faq")) {
    return <DaisyUIFAQSection component={schema} />;
  }

  if (t.includes("servicessection") || t.includes("services-grid") || t.includes("services")) {
    return <DaisyUIServicesSection component={schema} />;
  }

  if (t.includes("aboutsection") || t.includes("about")) {
    return <DaisyUIAboutSection component={schema} />;
  }

  // Fallback to a simple generic preview if not matched
  return <GenericSectionPreview index={0} schema={schema} />;
};

export default DaisyUIComponentPreview;
