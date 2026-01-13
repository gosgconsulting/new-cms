"use client";

import React from "react";
import { ScrollArea } from "./scroll-area";
import { Button } from "./button";
import { MessageCircle } from "lucide-react";

// --- Icon Components ---
const SparklesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-emerald-400"
  >
    <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558
             a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966
             l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558
             a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594
             l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051
             a2 2 0 0 0 1.594-1.594z"
    />
    <path d="M20 2v4" />
    <path d="M22 4h-4" />
    <circle cx="4" cy="20" r="2" />
  </svg>
);

const BriefcaseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-blue-400"
  >
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const BuildingIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="text-purple-400"
  >
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
    <path d="M9 9h6v6H9z" />
    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3" />
  </svg>
);

type PricingCardProps = {
  planName: string;
  description: string;
  price: string;
  priceDescription: string;
  features: Array<{
    category?: string;
    items?: string[];
  } | string>;
  icon: React.ReactNode;
  iconBgClass: string;
  isPopular: boolean;
  buttonText: string;
  onButtonClick?: () => void;
};

// --- PricingCard Component ---
function PricingCard({
  planName,
  description,
  price,
  priceDescription,
  features,
  icon,
  iconBgClass,
  isPopular,
  buttonText,
  onButtonClick,
}: PricingCardProps) {
  const cardStyle: React.CSSProperties = {
    width: "19rem",
    height: "38rem",
    backgroundColor: "rgba(15, 23, 42, 1)",
    backgroundImage:
      "radial-gradient(at 88% 40%, rgba(15, 23, 42, 1) 0px, transparent 85%)," +
      " radial-gradient(at 49% 30%, rgba(15, 23, 42, 1) 0px, transparent 85%)," +
      " radial-gradient(at 14% 26%, rgba(15, 23, 42, 1) 0px, transparent 85%)," +
      " radial-gradient(at 0% 64%, hsla(263, 93%, 56%, 1) 0px, transparent 85%)," +
      " radial-gradient(at 41% 94%, hsla(284, 100%, 84%, 1) 0px, transparent 85%)," +
      " radial-gradient(at 100% 99%, hsla(306, 100%, 57%, 1) 0px, transparent 85%)",
    boxShadow: "0px -16px 24px 0px rgba(255, 255, 255, 0.25) inset",
  };

  return (
    <div
      className="relative hover:bg-white/[0.04] transition-all duration-300 group rounded-2xl p-6 flex flex-col"
      style={cardStyle}
    >
      <style>{`@keyframes rotate { to { transform: translate(-50%, -50%) rotate(360deg); } }`}</style>

      {/* Header section - fixed */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-xl border border-white/20 bg-gradient-to-br ${iconBgClass} flex items-center justify-center`}
          >
            {icon}
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-white">
              {planName}
            </h3>
          </div>
        </div>
        <div className="h-5 w-5 rounded-full border-2 border-white/30"></div>
      </div>

      {/* Price section - fixed */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-semibold tracking-tight text-white">
            {price}
          </span>
          <span className="text-sm text-neutral-400">
            {priceDescription}
          </span>
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          Cancel anytime
        </p>
      </div>

      {/* Scrollable content area */}
      <div className="flex-grow mb-6">
        <ScrollArea className="h-full max-h-[320px]">
          <div className="space-y-4 text-sm text-neutral-300 pr-4">
            {features.map((feature, idx) => (
              <div key={idx} className="space-y-2">
                {typeof feature === 'object' && feature.category && (
                  <h4 className="text-white font-semibold text-base">{feature.category}</h4>
                )}
                {typeof feature === 'object' && feature.items ? (
                  <ul className="space-y-1 ml-2">
                    {feature.items.map((item, itemIdx) => (
                      <li key={itemIdx} className="flex items-start gap-2">
                        <div className="flex items-center justify-center w-3 h-3 bg-violet-500 rounded-full mt-1 flex-shrink-0">
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                        <span className="text-neutral-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : typeof feature === 'string' ? (
                  <div className="flex items-start gap-2">
                    <div className="flex items-center justify-center w-3 h-3 bg-violet-500 rounded-full mt-1 flex-shrink-0">
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                    <span className="text-neutral-300">{feature}</span>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Button section - fixed at bottom */}
      <div className="mt-auto">
        <Button 
          onClick={onButtonClick}
          className="w-full h-12 bg-white rounded-xl !font-bold hover:bg-gray-100 transition-colors border-0 shadow-sm"
          style={{ color: '#000000', fontWeight: '700', fontSize: '17px' }}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}

interface PricingPageProps {
  items?: any[];
  onContactClick?: () => void;
}

// --- Main PricingPage Component ---
const PricingPage: React.FC<PricingPageProps> = ({ items = [], onContactClick }) => {
  const starterPlan: PricingCardProps = {
    planName: "✅ Starter",
    description: "",
    price: "1,000 SGD",
    priceDescription: "/ month",
    icon: <SparklesIcon />,
    iconBgClass: "from-emerald-500/20 to-teal-500/20",
    features: [
      { category: "Digital Foundation", items: ["1 high-converting landing page / month", "1 acquisition channel (SEM or Social Ads)"] },
      { category: "Creative Production", items: ["2 branded creative assets / month"] },
      { category: "Organic Growth", items: ["10 SEO backlinks / month"] },
      { category: "Perfect for", items: ["Early-stage businesses"] }
    ],
    buttonText: "Get Started",
    isPopular: false,
  };

  const proPlan: PricingCardProps = {
    planName: "🚀 Growth",
    description: "",
    price: "1,700 SGD",
    priceDescription: "/ month",
    icon: <BriefcaseIcon />,
    iconBgClass: "from-blue-500/20 to-cyan-500/20",
    features: [
      { category: "Acquisition & Conversion", items: ["1 high-converting landing page / month", "2 paid-ad channels running together (SEM + Social Ads)"] },
      { category: "Creative Production", items: ["4 branded ad/creative assets / month"] },
      { category: "Organic Growth", items: ["10 SEO backlinks / month", "6 SEO-optimized articles / month"] },
      { category: "Perfect for", items: ["Growing businesses", "Scaling operations"] }
    ],
    buttonText: "Get Started",
    isPopular: true,
  };

  const enterprisePlan: PricingCardProps = {
    planName: "💥 Accelerate",
    description: "",
    price: "3,000 SGD",
    priceDescription: "/ month",
    icon: <BuildingIcon />,
    iconBgClass: "from-purple-500/20 to-indigo-500/20",
    features: [
      { category: "Acquisition & Domination", items: ["1 high-converting landing page / month", "All advertising channels included (SEM + Social + Retargeting)"] },
      { category: "Creative Production", items: ["12 branded creative assets / month", "(full social + ad engine)"] },
      { category: "Organic Growth", items: ["10 premium SEO backlink / month"] },
      { category: "Perfect for", items: ["Established brands", "Market leaders"] }
    ],
    buttonText: "Get Started",
    isPopular: false,
  };

  const handleButtonClick = (planName: string) => {
    if (onContactClick) {
      onContactClick();
    } else if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('openContactModal'));
    }
  };

  const handleChatClick = () => {
    if (onContactClick) {
      onContactClick();
    } else if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('openContactModal'));
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-800 via-slate-700 to-indigo-800 flex flex-col items-center justify-center p-8 relative">
      <div className="text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
          Choose the Right Package for Your Business
        </h1>
        <p className="mt-4 text-lg text-neutral-400">
          All packages include our complete full-stack digital marketing services: Website, SEO, SEM, Social Ads, and Creative Design.
        </p>
      </div>
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
        <PricingCard {...starterPlan} onButtonClick={() => handleButtonClick("Starter")} />
        <PricingCard {...proPlan} onButtonClick={() => handleButtonClick("Growth")} />
        <PricingCard {...enterprisePlan} onButtonClick={() => handleButtonClick("Accelerate")} />
      </div>

      {/* Chat with us button - fixed bottom right */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={handleChatClick}
          className="group relative inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-[0_18px_45px_-10px_rgba(124,58,237,0.75)] border-2 border-violet-500 transition-all duration-300 hover:w-[180px]"
          aria-label="Chat with us"
        >
          {/* Text - slides in from the right */}
          <div className="inline-flex whitespace-nowrap opacity-0 transition-all duration-200 group-hover:-translate-x-3 group-hover:opacity-100">
            Chat with us
          </div>
          {/* Icon - stays on the right */}
          <div className="absolute right-3.5">
            <span className="relative inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/20">
              <MessageCircle className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full ring-2 ring-white" aria-hidden="true" />
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default PricingPage;
