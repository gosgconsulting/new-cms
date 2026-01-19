import React from "react";
import type { ComponentSchema } from "../../../types/schema";

interface BannerSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Banner Section Component
 * 
 * Simple split banner with dark left panel (marketing hook, text, CTA)
 * and background image on the right panel.
 */
const BannerSection: React.FC<BannerSectionProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  const getText = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && typeof (i as any).content === "string"
    ) as any;
    return item?.content || "";
  };

  const getButtonByKeys = (keys: string[]) => {
    const lower = keys.map((k) => k.toLowerCase());
    const item = items.find(
      (i) =>
        i.type === "button" &&
        (lower.includes(String(i.key || "").toLowerCase()) || lower.includes(""))
    ) as any;

    return {
      content: item?.content || "",
      link: item?.link || "#",
    };
  };

  const getBackgroundImage = () => {
    // Check for backgroundImage in props first
    if ((props as any).backgroundImage) {
      return (props as any).backgroundImage;
    }
    // Check for background image item in schema
    const bgImageItem = items.find(
      (i) => i.type === "image" && String(i.key || "").toLowerCase().includes("background")
    ) as any;
    if (bgImageItem?.src) {
      return bgImageItem.src;
    }
    // Fallback to placeholder
    return `/theme/master/assets/placeholder.svg`;
  };

  const title = getText("title") || props.title || "";
  const description = getText("description") || props.description || "";
  const primaryCta = getButtonByKeys(["cta", "primaryCta"]);
  const backgroundImage = getBackgroundImage();

  // Get background color from props or use default dark gray
  const backgroundColor = (props as any).backgroundColor || "#2A2C2E";

  return (
    <section
      className={`relative overflow-hidden bg-[color:var(--bg-primary)] ${className}`}
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl overflow-hidden shadow-[var(--shadow-3)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px] lg:min-h-[600px]">
              {/* Left Panel - Dark background with content */}
              <div
                className="flex flex-col justify-center p-8 sm:p-12 lg:p-16 text-white"
                style={{ backgroundColor }}
              >
                {title && (
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-6 leading-tight">
                    {title}
                  </h1>
                )}

                {description && (
                  <p className="text-lg sm:text-xl text-white/90 mb-8 leading-relaxed max-w-xl">
                    {description}
                  </p>
                )}

                {primaryCta.content && (
                  <div className="pt-2">
                    <a
                      href={primaryCta.link}
                      className="btn-cta-light inline-block"
                    >
                      {primaryCta.content}
                    </a>
                  </div>
                )}
              </div>

              {/* Right Panel - Background image */}
              <div
                className="relative min-h-[400px] lg:min-h-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('${backgroundImage}')`,
                }}
              >
                {/* Optional overlay for better text contrast if needed */}
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
