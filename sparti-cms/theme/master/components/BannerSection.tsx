import React from "react";
import Reveal from "@/libraries/flowbite/components/Reveal";
import { useInViewOnce } from "@/libraries/flowbite/hooks/useInViewOnce";
import type { ComponentSchema } from "../../../types/schema";

interface BannerSectionProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Banner Section Component
 * 
 * Full-screen background hero with branding color text, abstract 3D shape,
 * and standard CTA button matching the Contact Us button style.
 */
const BannerSection: React.FC<BannerSectionProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  const { ref: sectionRef, inView: sectionInView } = useInViewOnce<HTMLElement>({
    rootMargin: "0px 0px -10% 0px",
    threshold: 0.1,
  });

  const getText = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && typeof (i as any).content === "string"
    ) as any;
    return item?.content || "";
  };

  const getImage = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "image"
    ) as any;
    return item?.src || "";
  };

  const getImageWithAlt = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "image"
    ) as any;
    return {
      src: item?.src || "",
      alt: item?.alt || "Hero image"
    };
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

  const title = getText("title") || props.title || "";
  const description = getText("description") || props.description || "";
  const subtitle = getText("subtitle") || props.subtitle || "";
  const primaryCta = getButtonByKeys(["cta", "primaryCta"]);
  const imageData = getImageWithAlt("image");
  const heroImageData = getImageWithAlt("heroImage");
  const finalImageData = (imageData?.src ? imageData : (heroImageData?.src ? heroImageData : { src: props.heroImage || "", alt: "Hero image" }));
  const heroImage = finalImageData.src || "";
  const heroImageAlt = finalImageData.alt || "Hero image";

  // Split title to apply gradient to first word
  const titleParts = title.split(" ");
  const firstWord = titleParts[0] || "";
  const restOfTitle = titleParts.slice(1).join(" ");

  // Check if we have a hero image for two-column layout
  const hasHeroImage = !!heroImage;
  const backgroundImage = props.backgroundImage || "";
  const mobileBackgroundImage = props.mobileBackgroundImage || backgroundImage || "";

  return (
    <section
      ref={sectionRef as any}
      className={`relative min-h-screen flex items-center justify-center overflow-hidden ${className}`}
      style={{
        backgroundColor: backgroundImage ? 'transparent' : '#000000',
      }}
    >
      {/* Background images - mobile and desktop */}
      {backgroundImage && (
        <>
          {/* Mobile background */}
          {mobileBackgroundImage && mobileBackgroundImage !== backgroundImage && (
            <div
              className="absolute inset-0 lg:hidden"
              style={{
                backgroundImage: `url(${mobileBackgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                zIndex: 0,
              }}
            />
          )}
          {/* Desktop background */}
          <div
            className={`absolute inset-0 ${mobileBackgroundImage && mobileBackgroundImage !== backgroundImage ? 'hidden lg:block' : ''}`}
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              zIndex: 0,
            }}
          />
        </>
      )}
      {/* Abstract 3D gradient shape on the right - only show if no hero image and no background image */}
      {!hasHeroImage && !backgroundImage && (
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] xl:w-[1000px] xl:h-[1000px] opacity-70 pointer-events-none overflow-hidden">
          {/* Multiple layered gradients for depth */}
          <div
            className="absolute inset-0 rounded-full blur-3xl animate-master-float"
            style={{
              background: `
                radial-gradient(ellipse 400px 600px at 20% 30%, 
                  color-mix(in srgb, var(--brand-secondary) 70%, transparent) 0%,
                  transparent 60%),
                radial-gradient(ellipse 500px 400px at 80% 70%, 
                  color-mix(in srgb, var(--brand-primary) 60%, transparent) 0%,
                  transparent 65%),
                radial-gradient(ellipse 300px 500px at 50% 50%, 
                  color-mix(in srgb, var(--brand-accent) 50%, transparent) 0%,
                  transparent 70%)
              `,
              filter: "blur(80px)",
              transform: "rotate(-15deg) scale(1.3)",
            }}
          />
          {/* Additional highlight layer */}
          <div
            className="absolute inset-0 rounded-full blur-2xl"
            style={{
              background: `
                radial-gradient(ellipse 300px 400px at 60% 40%, 
                  color-mix(in srgb, var(--brand-secondary-light) 40%, transparent) 0%,
                  transparent 55%)
              `,
              filter: "blur(60px)",
              transform: "rotate(25deg) scale(1.1)",
              opacity: 0.6,
            }}
          />
        </div>
      )}

      {/* Content Container */}
      <div className={`relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 ${hasHeroImage ? 'max-w-7xl' : ''}`}>
        <div className={hasHeroImage ? 'grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center' : 'max-w-5xl'}>
          {/* Left Column - Text Content */}
          <div className={hasHeroImage ? '' : ''}>
          {/* Subtitle */}
          {subtitle && (
            <Reveal direction="up" delayMs={0}>
              <p className="text-sm sm:text-base uppercase tracking-wider text-gray-300 mb-4 font-medium">
                {subtitle}
              </p>
            </Reveal>
          )}

          {/* Main Heading with Branding Color */}
          {title && (
            <Reveal direction="up" delayMs={90}>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 sm:mb-8 leading-tight">
                <span
                  style={{ color: 'var(--brand-secondary)' }}
                >
                  {firstWord}
                </span>
                {restOfTitle && (
                  <span className="text-white"> {restOfTitle}</span>
                )}
              </h1>
            </Reveal>
          )}

          {/* Description */}
          {description && (
            <Reveal direction="up" delayMs={160}>
              <p className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-8 sm:mb-10 max-w-2xl leading-relaxed">
                {description}
              </p>
            </Reveal>
          )}

          {/* CTA Button - Same as Contact Us button */}
          {primaryCta.content && (
            <Reveal direction="up" delayMs={240}>
              <div className="pt-2">
                <a
                  href={primaryCta.link}
                  className={"btn-cta " + (sectionInView ? "animate-master-cta-pulse-once" : "")}
                >
                  {primaryCta.content}
                </a>
              </div>
            </Reveal>
          )}
          </div>

          {/* Right Column - Hero Image */}
          {hasHeroImage && (
            <div className="relative flex items-center justify-center lg:justify-end lg:pr-0">
              <Reveal direction="left" delayMs={300}>
                <div className="relative w-full max-w-md lg:max-w-2xl xl:max-w-3xl">
                  <img
                    src={heroImage}
                    alt={heroImageAlt}
                    className="w-full h-auto object-contain lg:object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                </div>
              </Reveal>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BannerSection;
