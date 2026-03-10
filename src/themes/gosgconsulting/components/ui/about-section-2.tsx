"use client";
import { TimelineContent } from "./timeline-animation";
import { Zap } from "lucide-react";
import { useRef } from "react";
import AnimatedCaseStudies from "./animated-case-studies";

interface AboutSection2Props {
  onContactClick?: () => void;
  items?: any[];
}

export default function AboutSection2({ onContactClick, items = [] }: AboutSection2Props) {
  const heroRef = useRef<HTMLDivElement>(null);
  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 1.5,
        duration: 0.7,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: 40,
      opacity: 0,
    },
  };
  const textVariants = {
    visible: (i: number) => ({
      filter: "blur(0px)",
      opacity: 1,
      transition: {
        delay: i * 0.3,
        duration: 0.7,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      opacity: 0,
    },
  };

  // NEW: detect SEO variant and optional tagline overrides
  const variant = items.find((i: any) => i?.key === 'variant')?.content;
  const taglineTitle = items.find((i: any) => i?.key === 'taglineTitle')?.content;
  const taglineAccent = items.find((i: any) => i?.key === 'taglineAccent')?.content;

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto" ref={heroRef}>
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Text Content - now first */}
          <div className="flex-1">
            <TimelineContent
              as="h1"
              animationNum={0}
              timelineRef={heroRef}
              customVariants={revealVariants}
              className="sm:text-4xl text-2xl md:text-5xl !leading-[110%] font-semibold text-gray-900 mb-8"
            >
              {variant === 'seo' ? (
                <>
                  We are{" "}
                  <TimelineContent
                    as="span"
                    animationNum={1}
                    timelineRef={heroRef}
                    customVariants={textVariants}
                    className="text-blue-600 border-2 border-blue-500 inline-block xl:h-16  border-dotted px-2 rounded-md"
                  >
                    redefining
                  </TimelineContent>{" "}
                  what an SEO partner should be. We work inside your brand as a dedicated growth engine, combining content, backlinks, and reporting into one focused system. We remove guesswork, speed up rankings, and{" "}
                  <TimelineContent
                    as="span"
                    animationNum={2}
                    timelineRef={heroRef}
                    customVariants={textVariants}
                    className="text-orange-600 border-2 border-orange-500 inline-block xl:h-16 border-dotted px-2 rounded-md"
                  >
                    change
                  </TimelineContent>{" "}
                  how SEO is executed so organic growth finally{" "}
                  <TimelineContent
                    as="span"
                    animationNum={3}
                    timelineRef={heroRef}
                    customVariants={textVariants}
                    className="text-green-600 border-2 border-green-500 inline-block xl:h-16 border-dotted px-2 rounded-md"
                  >
                    drives real business results.
                  </TimelineContent>
                </>
              ) : (
                <>
                  We are{" "}
                  <TimelineContent
                    as="span"
                    animationNum={1}
                    timelineRef={heroRef}
                    customVariants={textVariants}
                    className="text-blue-600 border-2 border-blue-500 inline-block xl:h-16  border-dotted px-2 rounded-md"
                  >
                    redefining
                  </TimelineContent>{" "}
                  what a marketing partner should be. We work inside your brand as a full‑stack growth team. We remove handovers, speed up timelines, and{" "}
                  <TimelineContent
                    as="span"
                    animationNum={2}
                    timelineRef={heroRef}
                    customVariants={textVariants}
                    className="text-orange-600 border-2 border-orange-500 inline-block xl:h-16 border-dotted px-2 rounded-md"
                  >
                    change
                  </TimelineContent>{" "}
                  how digital gets executed so growth finally{" "}
                  <TimelineContent
                    as="span"
                    animationNum={3}
                    timelineRef={heroRef}
                    customVariants={textVariants}
                    className="text-green-600 border-2 border-green-500 inline-block xl:h-16 border-dotted px-2 rounded-md"
                  >
                    works for you.
                  </TimelineContent>
                </>
              )}
            </TimelineContent>

            <div className="mt-12 flex gap-2 justify-between">
              <TimelineContent
                as="div"
                animationNum={4}
                timelineRef={heroRef}
                customVariants={textVariants}
                className="mb-4 sm:text-xl text-xs"
              >
                <div className=" font-medium text-gray-900 mb-1 capitalize">
                  {taglineTitle ?? "We Are Your Growth Team And We Will"}
                </div>
                <div className=" text-blue-600 font-semibold uppercase">
                  {taglineAccent ?? "TAKE YOU FURTHER"}
                </div>
              </TimelineContent>
            </div>
          </div>
        </div>

        {/* Animated Case Studies - now positioned below the text content with reduced spacing */}
        <div className="mt-8">
          <AnimatedCaseStudies className="mx-auto" />
        </div>
      </div>
    </section>
  );
}