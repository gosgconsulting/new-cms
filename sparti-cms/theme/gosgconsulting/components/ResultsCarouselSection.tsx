"use client";

import React, { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Item = {
  key: string;
  type: string;
  content?: string;
  items?: Array<Item>;
  src?: string;
  alt?: string;
  value?: string;
  label1?: string;
  label2?: string;
  color?: string;
};

interface ResultsCarouselSectionProps {
  items?: Item[];
}

interface CaseStudy {
  companyName: string;
  tags: string[];
  description: string;
  metrics: Array<{
    value: string;
    label1: string;
    label2: string;
    color: string;
  }>;
  screenshot: {
    src: string;
    alt: string;
  };
  deviceType?: 'phone' | 'tablet'; // Optional device type, defaults to 'phone'
}

const metricColors: Record<string, { bg: string; text: string }> = {
  pink: { bg: "bg-pink-500", text: "text-white" },
  red: { bg: "bg-red-500", text: "text-white" },
  orange: { bg: "bg-orange-500", text: "text-white" },
  yellow: { bg: "bg-yellow-500", text: "text-white" },
  teal: { bg: "bg-teal-500", text: "text-white" },
  cyan: { bg: "bg-cyan-500", text: "text-white" },
  blue: { bg: "bg-blue-500", text: "text-white" },
};

const parseCaseStudies = (items: Item[]): CaseStudy[] => {
  const caseStudiesArray = items.find((i) => i.key === "caseStudies");
  if (!caseStudiesArray || !caseStudiesArray.items) return [];

  return caseStudiesArray.items.map((caseItem) => {
    const companyNameItem = caseItem.items?.find((i) => i.key === "companyName");
    const tagsItem = caseItem.items?.find((i) => i.key === "tags");
    const descriptionItem = caseItem.items?.find((i) => i.key === "description");
    const metricsItem = caseItem.items?.find((i) => i.key === "metrics");
    const screenshotItem = caseItem.items?.find((i) => i.key === "screenshot");
    const deviceTypeItem = caseItem.items?.find((i) => i.key === "deviceType");

    const tags = tagsItem?.items?.map((tag) => tag.content || tag) || [];
    const metrics =
      metricsItem?.items?.map((metric) => ({
        value: metric.value || "",
        label1: metric.label1 || "",
        label2: metric.label2 || "",
        color: metric.color || "pink",
      })) || [];

    return {
      companyName: companyNameItem?.content || "",
      tags: tags,
      description: descriptionItem?.content || "",
      metrics: metrics,
      screenshot: {
        src: screenshotItem?.src || "",
        alt: screenshotItem?.alt || "Case study screenshot",
      },
      deviceType: (deviceTypeItem?.content as 'phone' | 'tablet') || 'phone',
    };
  });
};

const ResultsCarouselSection: React.FC<ResultsCarouselSectionProps> = ({
  items = [],
}) => {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const caseStudies = parseCaseStudies(items);

  // Default case study if none provided
  const defaultCaseStudies: CaseStudy[] = [
    {
      companyName: "Selenightco",
      tags: ["META ADS", "FACEBOOK", "INSTAGRAM", "PERFORMANCE", "ROAS", "6 MONTHS"],
      description:
        "Selenightco generated incremental revenues at a Return on Ad Spend of 6.3x. That means, for every 1,000 spent, it generated 6.3k revenue. We developed a targeted Meta Ads strategy using Facebook and Instagram Advertising to drive revenue growth. Our focus was on optimizing campaigns for maximum ROAS, with comprehensive A/B testing on creatives and key messages to ensure peak performance.",
      metrics: [
        { value: "6.3x", label1: "ROAS", label2: "Return on Ad Spend", color: "cyan" },
        { value: "6.3k", label1: "Revenue", label2: "per 1k Ad Spend", color: "teal" },
      ],
      screenshot: {
        src: "/theme/gosgconsulting/assets/selenightco-meta-ads-results.png",
        alt: "Selenightco Meta Ads performance results",
      },
    },
    {
      companyName: "Elizabeth Little",
      tags: ["META ADS", "FACEBOOK", "INSTAGRAM", "PERFORMANCE", "ROAS", "2 MONTHS"],
      description:
        "Elizabeth Little generated incremental revenues at a Return on Ad Spend of 7x. That means, for every 1,000 spent, it generated 7k revenue. We developed a targeted Meta Ads strategy using Facebook and Instagram Advertising to drive revenue growth. Our focus was on optimizing campaigns for maximum ROAS and efficient budget allocation.",
      metrics: [
        { value: "7x", label1: "ROAS", label2: "Return on Ad Spend", color: "cyan" },
        { value: "7k", label1: "Revenue", label2: "per 1k Ad Spend", color: "teal" },
      ],
      screenshot: {
        src: "/theme/gosgconsulting/assets/elizabeth-little-meta-ads-results.png",
        alt: "Elizabeth Little Meta Ads performance results",
      },
      deviceType: 'tablet',
    },
    {
      companyName: "Global Modul",
      tags: ["META ADS", "LEAD GENERATION", "CONVERSIONS", "30 DAYS"],
      description:
        "Global Modul generated 63 leads within 30 days, with only 350 euros spent, with 2 conversions worth 7k euros. They are selling Modulable houses, and we helped them generate 5-10 leads everyday through targeted Meta Ads campaigns.",
      metrics: [
        { value: "63", label1: "Leads", label2: "in 30 Days", color: "cyan" },
        { value: "€5.6", label1: "Cost", label2: "per Lead", color: "teal" },
        { value: "7k€", label1: "Conversion", label2: "Value", color: "orange" },
      ],
      screenshot: {
        src: "/theme/gosgconsulting/assets/global-modul-results.png",
        alt: "Global Modul lead generation results",
      },
      deviceType: 'tablet',
    },
    {
      companyName: "Art in Bloom",
      tags: ["META ADS", "E-COMMERCE", "A/B TESTING", "COMPETITIVE MARKET"],
      description:
        "Art in Bloom, a florist shop offering flowers for grand openings, business openings, and flower gifts, operates in an extremely competitive market. Through comprehensive A/B testing of products, assets, and design, we found winning campaigns and achieved an average ROAS of 3x.",
      metrics: [
        { value: "3x", label1: "ROAS", label2: "Return on Ad Spend", color: "cyan" },
        { value: "3k", label1: "Revenue", label2: "per 1k Ad Spend", color: "teal" },
      ],
      screenshot: {
        src: "/theme/gosgconsulting/assets/art-in-bloom-results.png",
        alt: "Art in Bloom Meta Ads performance results",
      },
      deviceType: 'tablet',
    },
    {
      companyName: "Spirit Stretch",
      tags: ["META ADS", "LEAD GENERATION", "YOGA STUDIO", "PERFORMANCE"],
      description:
        "At Spirit Stretch Immersive Yoga, we guide you towards inner balance, regardless of your background or experience. We helped Spirit Stretch generate quality leads through targeted Meta Ads campaigns, achieving consistent lead generation with optimized cost per lead.",
      metrics: [
        { value: "215+", label1: "Leads", label2: "Generated", color: "cyan" },
        { value: "$14.50", label1: "Cost", label2: "per Lead", color: "teal" },
      ],
      screenshot: {
        src: "/theme/gosgconsulting/assets/spirit-stretch-results.png",
        alt: "Spirit Stretch lead generation results",
      },
      deviceType: 'tablet',
    },
  ];

  const studies = caseStudies.length > 0 ? caseStudies : defaultCaseStudies;

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());

    api.on("select", () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    });
  }, [api]);

  return (
    <section className="w-full bg-white py-16 md:py-24 px-4 md:px-6">
      <div className="mx-auto max-w-7xl">
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: false,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {studies.map((study, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-full">
                {/* Mobile Layout: Vertical Stack */}
                <div className="block lg:hidden space-y-6">
                  {/* 1. Title */}
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center">
                    {study.companyName}
                  </h2>


                  {/* 3. Image - Device Frame (Phone or Tablet) */}
                  <div className="flex justify-center">
                    {study.deviceType === 'tablet' ? (
                      // Tablet Mockup - Horizontal
                      <div className="relative w-full max-w-2xl">
                        <div className="relative bg-white rounded-2xl p-3 shadow-2xl border-4 border-gray-900">
                          {/* Tablet home button */}
                          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-900 rounded-full"></div>
                          <div className="rounded-xl overflow-hidden bg-gray-100 aspect-[16/10]">
                            {study.screenshot.src ? (
                              <img
                                src={study.screenshot.src}
                                alt={study.screenshot.alt}
                                className="w-full h-full object-contain bg-white"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <span className="text-gray-400 text-sm">Screenshot</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Phone Mockup - Vertical
                      <div className="relative w-full max-w-sm">
                        <div className="relative bg-white rounded-[2.5rem] p-2 shadow-2xl border-8 border-gray-900">
                          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-gray-900 rounded-full"></div>
                          <div className="rounded-[2rem] overflow-hidden bg-gray-100 aspect-[9/16]">
                            {study.screenshot.src ? (
                              <img
                                src={study.screenshot.src}
                                alt={study.screenshot.alt}
                                className="w-full h-full object-contain bg-white"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <span className="text-gray-400 text-sm">Screenshot</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Text/Description */}
                  {study.description && (
                    <p className="text-base text-gray-700 leading-relaxed text-center">
                      {study.description}
                    </p>
                  )}

                  {/* 5. KPI Cards */}
                  {study.metrics.length > 0 && (
                    <div className={`grid gap-3 max-w-2xl mx-auto ${study.metrics.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                      {study.metrics.map((metric, metricIndex) => {
                        const colorClass = metricColors[metric.color] || metricColors.pink;
                        return (
                          <div
                            key={metricIndex}
                            className={`${colorClass.bg} ${colorClass.text} rounded-lg p-4 text-center`}
                          >
                            <div className="text-xl font-bold mb-1">{metric.value}</div>
                            <div className="text-xs font-medium">{metric.label1}</div>
                            <div className="text-xs font-medium">{metric.label2}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Desktop Layout: Two Column */}
                <div className="hidden lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                  {/* Left Column - Text Content */}
                  <div className="space-y-6">
                    {/* Company Name */}
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                      {study.companyName}
                    </h2>


                    {/* Description */}
                    {study.description && (
                      <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                        {study.description}
                      </p>
                    )}

                    {/* KPI Metrics */}
                    {study.metrics.length > 0 && (
                      <div className={`grid gap-4 pt-4 ${study.metrics.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                        {study.metrics.map((metric, metricIndex) => {
                          const colorClass = metricColors[metric.color] || metricColors.pink;
                          return (
                            <div
                              key={metricIndex}
                              className={`${colorClass.bg} ${colorClass.text} rounded-lg p-4 text-center`}
                            >
                              <div className="text-2xl md:text-3xl font-bold mb-1">
                                {metric.value}
                              </div>
                              <div className="text-xs md:text-sm font-medium">
                                {metric.label1}
                              </div>
                              <div className="text-xs md:text-sm font-medium">
                                {metric.label2}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Right Column - Device Frame (Phone or Tablet) */}
                  <div className="flex justify-center lg:justify-end">
                    {study.deviceType === 'tablet' ? (
                      // Tablet Mockup - Horizontal
                      <div className="relative w-full max-w-2xl">
                        <div className="relative bg-white rounded-2xl p-3 shadow-2xl border-4 border-gray-900">
                          {/* Tablet home button */}
                          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-900 rounded-full"></div>
                          <div className="rounded-xl overflow-hidden bg-gray-100 aspect-[16/10]">
                            {study.screenshot.src ? (
                              <img
                                src={study.screenshot.src}
                                alt={study.screenshot.alt}
                                className="w-full h-full object-contain bg-white"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <span className="text-gray-400 text-sm">Screenshot</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Phone Mockup - Vertical
                      <div className="relative w-full max-w-sm">
                        <div className="relative bg-white rounded-[2.5rem] p-2 shadow-2xl border-8 border-gray-900">
                          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-gray-900 rounded-full"></div>
                          <div className="rounded-[2rem] overflow-hidden bg-gray-100 aspect-[9/16]">
                            {study.screenshot.src ? (
                              <img
                                src={study.screenshot.src}
                                alt={study.screenshot.alt}
                                className="w-full h-full object-contain bg-white"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <span className="text-gray-400 text-sm">Screenshot</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* 6. Arrows - All the way below */}
        {studies.length > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8 md:mt-12">
            <button
              onClick={() => api?.scrollPrev()}
              disabled={!canScrollPrev}
              className="h-12 w-12 rounded-lg bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white border-0 shadow-lg flex items-center justify-center transition-colors"
              aria-label="Previous case study"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={() => api?.scrollNext()}
              disabled={!canScrollNext}
              className="h-12 w-12 rounded-lg bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white border-0 shadow-lg flex items-center justify-center transition-colors"
              aria-label="Next case study"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ResultsCarouselSection;
