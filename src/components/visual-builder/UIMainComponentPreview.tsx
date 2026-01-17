"use client";

import React from "react";
import GenericSectionPreview from "./GenericSectionPreview";
import type { ComponentSchema } from "../../../sparti-cms/types/schema";
import UIMainHeroSection from "../../libraries/ui-main/components/UIMainHeroSection";
import UIMainHeader from "../../libraries/ui-main/components/UIMainHeader";
import UIMainFooter from "../../libraries/ui-main/components/UIMainFooter";
import UIMainFeaturesSection from "../../libraries/ui-main/components/UIMainFeaturesSection";

type Props = {
  schema: ComponentSchema;
};

const normalizeType = (t?: string) => (t || "").toLowerCase();

const UIMainComponentPreview: React.FC<Props> = ({ schema }) => {
  const t = normalizeType(schema.type || (schema as any).name || (schema as any).key);

  if (t.includes("herosection") || t === "herosection" || t.includes("hero")) {
    return <UIMainHeroSection component={schema} />;
  }

  if (t.includes("header") || t === "header" || t === "navbar") {
    return <UIMainHeader component={schema} />;
  }

  if (t.includes("footer") || t === "footer") {
    return <UIMainFooter component={schema} />;
  }

  if (t.includes("featuressection") || t.includes("features")) {
    return <UIMainFeaturesSection component={schema} />;
  }

  // Fallback to a simple generic preview if not matched
  return <GenericSectionPreview index={0} schema={schema} />;
};

export default UIMainComponentPreview;
