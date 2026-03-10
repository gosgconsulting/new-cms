import React, { useMemo, useState } from "react";
import Reveal from "@/libraries/flowbite/components/Reveal";
import { useInViewOnce } from "@/libraries/flowbite/hooks/useInViewOnce";

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
        title: "Assessments",
        description:
          "World-class psychometric tools designed to diagnose talent potential, leadership capability, decision-making strength, and team dynamics. This includes personality, reasoning and judgement, multi-rater (360), sales potential and other validated assessment instruments that help organisations understand current and future talent performance.",
      },
      {
        title: "Academy",
        description:
          "Practical learning and certification programmes that equip HR professionals, consultants and organisational leaders with the skills to administer assessments, interpret profiling results and apply insights to drive performance and development. Courses include certification workshops, instrument training and leadership development modules.",
      },
      {
        title: "Services",
        description:
          "Consulting engagements that translate assessment insights into real organisational impact. This includes prediction of leadership potential and succession readiness, talent identification strategies, and tailored interventions to develop leaders and high-performing teams based on assessment results.",
      },
    ],
    []
  );

  const { ref: sectionRef, inView: sectionInView } = useInViewOnce<HTMLElement>({
    rootMargin: "0px 0px -15% 0px",
    threshold: 0.15,
  });

  const [activeIndex, setActiveIndex] = useState(-1);

  // Check if all cards are collapsed
  const allCollapsed = activeIndex === -1;

  return (
    <section
      ref={sectionRef as any}
      className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 bg-(--bg-secondary)"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="grid md:grid-cols-2 gap-10 md:gap-12 items-start">
          {/* Left column */}
          <div className="flex flex-col justify-center">
            <Reveal direction="up">
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-(--text-primary) leading-[1.05]">
                Our services
              </h2>
            </Reveal>

            <Reveal direction="up" delayMs={90}>
              <p className="mt-5 text-base sm:text-lg text-(--text-secondary) leading-relaxed max-w-xl">
                A clear, conversion‑first package that covers the full funnel — from the page to the
                pipeline.
              </p>
            </Reveal>

            <Reveal direction="up" delayMs={160}>
              <div className="mt-8 w-full max-w-xl">
                <img
                  src={`/theme/optimalconsulting/Assets/menu2.jpg`}
                  alt="Services illustration"
                  className="w-full h-auto rounded-2xl border border-black/10 bg-white shadow-sm"
                  loading="lazy"
                />
              </div>
            </Reveal>
          </div>

          {/* Right column */}
          <div className="flex flex-col">
            <div className={`flex flex-col space-y-3 transition-all duration-300 ${allCollapsed ? 'md:mt-16' : 'md:mt-0'}`}>
            {services.map((service, index) => {
              const isActive = activeIndex === index;
              const baseDelay = 120;
              const itemDelay = baseDelay + index * 90;

              if (isActive) {
                return (
                  <Reveal key={`${service.title}-active`} direction="up" delayMs={itemDelay}>
                    <div
                      className={
                        "relative overflow-hidden rounded-2xl bg-white border border-black/10 shadow-[var(--shadow-2)] " +
                        (sectionInView ? "animate-master-pop" : "")
                      }
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
                          <a
                            href="#contact"
                            className="inline-flex items-center px-6 py-2.5 text-white font-semibold bg-[#145598] rounded-full transition-all duration-300 text-sm hover:bg-[#0f3f6f] hover:scale-105 hover:shadow-lg hover:shadow-[#145598]/30 hover:-translate-y-0.5 active:scale-100"
                          >
                            Get started
                          </a>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              }

              return (
                <Reveal key={`${service.title}-collapsed`} direction="up" delayMs={itemDelay}>
                  <button
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
                </Reveal>
              );
            })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurServicesSection;
