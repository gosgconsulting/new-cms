"use client";

import React from "react";
import GenericSectionPreview from "./GenericSectionPreview";
import type { ComponentSchema } from "../../../sparti-cms/types/schema";
import PrelineHeroSection from "../../libraries/preline/components/PrelineHeroSection";
import PrelineHeader from "../../libraries/preline/components/PrelineHeader";
import PrelineFooter from "../../libraries/preline/components/PrelineFooter";
import PrelineFeaturesSection from "../../libraries/preline/components/PrelineFeaturesSection";

type Props = {
  schema: ComponentSchema;
};

const normalizeType = (t?: string) => (t || "").toLowerCase();

const PrelineComponentPreview: React.FC<Props> = ({ schema }) => {
  const t = normalizeType(schema.type || (schema as any).name || (schema as any).key);

  if (t.includes("herosection") || t === "herosection" || t.includes("hero")) {
    return <PrelineHeroSection component={schema} />;
  }

  if (t.includes("header") || t === "header" || t === "navbar") {
    return <PrelineHeader component={schema} />;
  }

  if (t.includes("footer") || t === "footer") {
    return <PrelineFooter component={schema} />;
  }

  if (t.includes("featuressection") || t.includes("features")) {
    return <PrelineFeaturesSection component={schema} />;
  }

  // Fallback to a simple generic preview if not matched
  return <GenericSectionPreview index={0} schema={schema} />;
};

export default PrelineComponentPreview;
