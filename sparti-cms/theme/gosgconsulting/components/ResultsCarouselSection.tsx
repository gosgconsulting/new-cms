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
        "Selenightco generated 60k revenue with a ROI of x60. We developed a targeted Meta Ads strategy using Facebook and Instagram Advertising to drive revenue growth. Our focus was on optimizing campaigns for maximum ROAS, with comprehensive A/B testing on creatives and key messages to ensure peak performance.",
      metrics: [
        { value: "60x", label1: "ROAS", label2: "Return", color: "cyan" },
        { value: "60k", label1: "Revenue", label2: "Generated", color: "teal" },
        { value: "1k", label1: "Ad", label2: "Spend", color: "orange" },
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
        "Elizabeth Little achieved 19.9k revenue from 2.8k ad spend, delivering a ROAS of 7. We developed a targeted Meta Ads strategy using Facebook and Instagram Advertising to drive revenue growth. Our focus was on optimizing campaigns for maximum ROAS and efficient budget allocation.",
      metrics: [
        { value: "7x", label1: "ROAS", label2: "Return", color: "cyan" },
        { value: "19.9k", label1: "Revenue", label2: "Generated", color: "teal" },
        { value: "2.8k", label1: "Ad", label2: "Spend", color: "orange" },
      ],
      screenshot: {
        src: "/theme/gosgconsulting/assets/elizabeth-little-meta-ads-results.png",
        alt: "Elizabeth Little Meta Ads performance results",
      },
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
        <div className="relative flex items-center gap-4">
          {/* Left Arrow - Outside content */}
          {studies.length > 1 && (
            <button
              onClick={() => api?.scrollPrev()}
              disabled={!canScrollPrev}
              className="flex-shrink-0 h-12 w-12 rounded-lg bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white border-0 shadow-lg flex items-center justify-center transition-colors z-10"
              aria-label="Previous case study"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <div className="flex-1">
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                      {/* Left Column - Text Content */}
                      <div className="space-y-6">
                        {/* Company Name */}
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                          {study.companyName}
                        </h2>

                        {/* Tags */}
                        {study.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {study.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-3 py-1.5 bg-gray-800 text-white text-xs font-medium rounded-md"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Description */}
                        {study.description && (
                          <p className="text-base md:text-lg text-gray-700 leading-relaxed">
                            {study.description}
                          </p>
                        )}

                        {/* KPI Metrics */}
                        {study.metrics.length > 0 && (
                          <div className="grid grid-cols-3 gap-4 pt-4">
                            {study.metrics.map((metric, metricIndex) => {
                              const colorClass =
                                metricColors[metric.color] || metricColors.pink;
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

                      {/* Right Column - Mobile Device Frame */}
                      <div className="flex justify-center lg:justify-end">
                        <div className="relative w-full max-w-sm">
                          {/* Mobile Device Frame */}
                          <div className="relative bg-white rounded-[2.5rem] p-2 shadow-2xl border-8 border-gray-900">
                            {/* Camera/Sensor Indicator */}
                            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-gray-900 rounded-full"></div>

                            {/* Screenshot Image */}
                            <div className="rounded-[2rem] overflow-hidden bg-gray-100 aspect-[9/16]">
                              {study.screenshot.src ? (
                                <img
                                  src={study.screenshot.src}
                                  alt={study.screenshot.alt}
                                  className="w-full h-full object-contain bg-white"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "/placeholder.svg";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <span className="text-gray-400 text-sm">
                                    Screenshot
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          {/* Right Arrow - Outside content */}
          {studies.length > 1 && (
            <button
              onClick={() => api?.scrollNext()}
              disabled={!canScrollNext}
              className="flex-shrink-0 h-12 w-12 rounded-lg bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed text-white border-0 shadow-lg flex items-center justify-center transition-colors z-10"
              aria-label="Next case study"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default ResultsCarouselSection;
