"use client";

import React from "react";
import GenericSectionPreview from "./GenericSectionPreview";
import type { ComponentSchema } from "../../../sparti-cms/types/schema";
import HyperUIHeroSection from "../../libraries/hyperui/components/HyperUIHeroSection";
import HyperUIHeader from "../../libraries/hyperui/components/HyperUIHeader";
import HyperUIFooter from "../../libraries/hyperui/components/HyperUIFooter";
import HyperUIFeaturesSection from "../../libraries/hyperui/components/HyperUIFeaturesSection";

type Props = {
  schema: ComponentSchema;
};

const normalizeType = (t?: string) => (t || "").toLowerCase();

const HyperUIComponentPreview: React.FC<Props> = ({ schema }) => {
  const t = normalizeType(schema.type || (schema as any).name || (schema as any).key);

  if (t.includes("herosection") || t === "herosection" || t.includes("hero")) {
    return <HyperUIHeroSection component={schema} />;
  }

  if (t.includes("header") || t === "header" || t === "navbar") {
    return <HyperUIHeader component={schema} />;
  }

  if (t.includes("footer") || t === "footer") {
    return <HyperUIFooter component={schema} />;
  }

  if (t.includes("featuressection") || t.includes("features")) {
    return <HyperUIFeaturesSection component={schema} />;
  }

  // Fallback to a simple generic preview if not matched
  return <GenericSectionPreview index={0} schema={schema} />;
};

export default HyperUIComponentPreview;
