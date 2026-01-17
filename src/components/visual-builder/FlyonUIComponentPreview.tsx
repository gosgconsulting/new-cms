"use client";

import React from "react";
import GenericSectionPreview from "./GenericSectionPreview";
import type { ComponentSchema } from "../../../sparti-cms/types/schema";
import FlyonUIHeroSection from "../../libraries/flyonui/components/FlyonUIHeroSection";
import FlyonUIHeader from "../../libraries/flyonui/components/FlyonUIHeader";
import FlyonUIFooter from "../../libraries/flyonui/components/FlyonUIFooter";
import FlyonUIFeaturesSection from "../../libraries/flyonui/components/FlyonUIFeaturesSection";

type Props = {
  schema: ComponentSchema;
};

const normalizeType = (t?: string) => (t || "").toLowerCase();

const FlyonUIComponentPreview: React.FC<Props> = ({ schema }) => {
  const t = normalizeType(schema.type || (schema as any).name || (schema as any).key);

  if (t.includes("herosection") || t === "herosection" || t.includes("hero")) {
    return <FlyonUIHeroSection component={schema} />;
  }

  if (t.includes("header") || t === "header" || t === "navbar") {
    return <FlyonUIHeader component={schema} />;
  }

  if (t.includes("footer") || t === "footer") {
    return <FlyonUIFooter component={schema} />;
  }

  if (t.includes("featuressection") || t.includes("features")) {
    return <FlyonUIFeaturesSection component={schema} />;
  }

  // Fallback to a simple generic preview if not matched
  return <GenericSectionPreview index={0} schema={schema} />;
};

export default FlyonUIComponentPreview;
