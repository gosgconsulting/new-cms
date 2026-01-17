"use client";

import React from "react";
import GenericSectionPreview from "./GenericSectionPreview";
import type { ComponentSchema } from "../../../sparti-cms/types/schema";
import TailgridsHeroSection from "../../libraries/tailgrids/components/TailgridsHeroSection";
import TailgridsHeader from "../../libraries/tailgrids/components/TailgridsHeader";
import TailgridsFooter from "../../libraries/tailgrids/components/TailgridsFooter";
import TailgridsFeaturesSection from "../../libraries/tailgrids/components/TailgridsFeaturesSection";

type Props = {
  schema: ComponentSchema;
};

const normalizeType = (t?: string) => (t || "").toLowerCase();

const TailgridsComponentPreview: React.FC<Props> = ({ schema }) => {
  const t = normalizeType(schema.type || (schema as any).name || (schema as any).key);

  if (t.includes("herosection") || t === "herosection" || t.includes("hero")) {
    return <TailgridsHeroSection component={schema} />;
  }

  if (t.includes("header") || t === "header" || t === "navbar") {
    return <TailgridsHeader component={schema} />;
  }

  if (t.includes("footer") || t === "footer") {
    return <TailgridsFooter component={schema} />;
  }

  if (t.includes("featuressection") || t.includes("features")) {
    return <TailgridsFeaturesSection component={schema} />;
  }

  // Fallback to a simple generic preview if not matched
  return <GenericSectionPreview index={0} schema={schema} />;
};

export default TailgridsComponentPreview;
