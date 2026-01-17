import React, { useMemo, useState } from "react";

type Service = {
  title: string;
  description: string;
};

interface OurServicesSectionProps {
  themeSlug: string;
}

const OurServicesSection: React.FC<OurServicesSectionProps> = ({ themeSlug }) => {
  const services = useMemo<Service[]>(
    () => [
      {
        title: "Website & conversion",
        description:
          "High‑converting landing pages, clear messaging, and conversion tracking so traffic turns into leads.",
      },
      {
        title: "Acquisition",
        description:
          "SEM + social ads, plus smart retargeting that reduces wasted spend and increases qualified enquiries.",
      },
      {
        title: "Creative & content",
        description:
          "Brand‑aligned creative assets and copy that build trust and move visitors to action.",
      },
      {
        title: "Analytics & reporting",
        description:
          "Clear monthly reporting with the metrics that matter — so you always know what’s working and why.",
      },
    ],
    []
  );

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-(--bg-secondary)">
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-start">
          {/* Left column */}
          <div className="flex flex-col justify-center">
            <p className="label-section mb-4">Our services</p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-(--text-primary) leading-[1.05]">
              Our services
            </h2>
            <p className="mt-5 text-base sm:text-lg text-(--text-secondary) leading-relaxed max-w-xl">
              A clear, conversion‑first package that covers the full funnel — from the page to the
              pipeline.
            </p>

            <div className="mt-8 w-full max-w-xl">
              <img
                src={`/theme/${themeSlug}/assets/placeholder.svg`}
                alt="Services illustration"
                className="w-full h-auto rounded-2xl border border-black/10 bg-white shadow-sm"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-3">
            {services.map((service, index) => {
              const isActive = activeIndex === index;

              if (isActive) {
                return (
                  <div
                    key={service.title}
                    className="relative overflow-hidden rounded-2xl bg-white border border-black/10 shadow-[var(--shadow-2)]"
                  >
                    <div
                      className="absolute inset-y-0 left-0 w-1.5"
                      style={{ backgroundColor: "var(--brand-primary)" }}
                    />
                    <div className="p-6 pl-7">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-xl sm:text-2xl font-bold text-(--text-primary)">
                          {service.title}
                        </h3>
                        <button
                          type="button"
                          className="h-10 w-10 rounded-full border border-black/10 bg-white text-(--text-primary) hover:bg-(--bg-secondary) transition-colors"
                          aria-label={`Collapse ${service.title}`}
                          onClick={() => setActiveIndex(-1)}
                        >
                          <span className="block text-lg leading-none">−</span>
                        </button>
                      </div>

                      <p className="mt-4 text-(--text-secondary) leading-relaxed">
                        {service.description}
                      </p>

                      <div className="mt-6">
                        <a href="#contact" className="btn-cta">
                          Get started
                        </a>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <button
                  key={service.title}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="w-full text-left rounded-xl border border-black/10 bg-white/60 hover:bg-white transition-colors p-5 flex items-center justify-between gap-4"
                >
                  <span className="text-base sm:text-lg font-semibold text-(--text-secondary)">
                    {service.title}
                  </span>
                  <span
                    className="h-10 w-10 rounded-full border border-black/10 bg-white text-(--text-primary) flex items-center justify-center"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurServicesSection;
