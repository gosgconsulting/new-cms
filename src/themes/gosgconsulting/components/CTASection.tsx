import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

type CTAConfig = {
  heading?: string;
  description?: string;
  primaryLabel?: string;
};

interface CTASectionProps {
  /**
   * Schema-driven config.
   * Expected format: [{ heading, description, primaryLabel }]
   */
  items?: any[];
  onContactClick?: () => void;
}

const CTASection: React.FC<CTASectionProps> = ({ items = [], onContactClick }) => {
  const cfg: CTAConfig = (Array.isArray(items) && items.length > 0 ? items[0] : {}) || {};

  const heading = cfg.heading || "Ready for predictable leads — not random spikes?";
  const description =
    cfg.description ||
    "Get a clear growth plan (SEO + ads + conversion) tailored to your business in a free strategy call.";
  const primaryLabel = cfg.primaryLabel || "Get free consultation";

  return (
    <section className="relative py-16 md:py-20 px-4 overflow-hidden">
      {/* Background (single gradient style, similar to pricing section) */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-indigo-800" />

      <div className="relative container mx-auto max-w-5xl">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-8 md:p-12 text-center shadow-xl">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            {heading}
          </h2>
          <p className="text-base md:text-xl text-white/85 mb-8 max-w-3xl mx-auto">
            {description}
          </p>

          <div className="flex justify-center">
            <Button
              onClick={onContactClick}
              className="h-12 md:h-14 px-8 md:px-10 rounded-full !font-bold transition-all border-0 shadow-sm"
              style={{ 
                background: 'linear-gradient(to right, #FF6B35, #FFA500)',
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "17px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #FF5722, #FF9800)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #FF6B35, #FFA500)';
              }}
            >
              {primaryLabel}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;