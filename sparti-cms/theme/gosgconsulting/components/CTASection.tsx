import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

type CTAConfig = {
  heading?: string;
  description?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

interface CTASectionProps {
  /**
   * Schema-driven config.
   * Expected format: [{ heading, description, primaryLabel, secondaryLabel, secondaryHref }]
   */
  items?: any[];
  onContactClick?: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ items = [], onContactClick }) => {
  const cfg: CTAConfig = (Array.isArray(items) && items.length > 0 ? items[0] : {}) || {};

  const heading =
    cfg.heading || "Ready for predictable leads — not random spikes?";
  const description =
    cfg.description ||
    "Get a clear growth plan (SEO + ads + conversion) tailored to your business in a free strategy call.";
  const primaryLabel = cfg.primaryLabel || "Get free consultation";
  const secondaryLabel = cfg.secondaryLabel || "See results";
  const secondaryHref = cfg.secondaryHref || "/theme/gosgconsulting/blog";

  return (
    <section className="relative py-16 md:py-20 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#9b87f5] via-[#2dd4bf] to-[#F94E40] opacity-95" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
      </div>

      <div className="relative container mx-auto max-w-5xl">
        <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md p-8 md:p-12 text-center shadow-xl">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {heading}
          </h2>
          <p className="text-base md:text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            {description}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={onContactClick}
              className="bg-white text-slate-900 hover:bg-white/90 font-semibold px-7 py-6 text-base md:text-lg rounded-xl"
            >
              {primaryLabel}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              asChild
              variant="outline"
              className="border-white/70 text-white hover:bg-white hover:text-slate-900 font-semibold px-7 py-6 text-base md:text-lg rounded-xl"
            >
              <a href={secondaryHref}>{secondaryLabel}</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;