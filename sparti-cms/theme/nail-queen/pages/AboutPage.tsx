import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

import { Layout } from "../components/Layout";

// Team member data with roles and details
const teamMembersData: Record<
  string,
  { role: string; experience?: string; skills?: string[] }
> = {
  amy: {
    role: "Nail Technician",
    experience: "15 years",
    skills: [
      "Veteran technician with exceptional cuticle skills",
      "Fast, clean classic manicure & pedicure",
      "Highly trusted for precise and effective callus care",
    ],
  },
  angle: {
    role: "Senior Nail Technician",
    experience: "8 years",
    skills: [
      "Precision-focused with a perfection-driven work ethic",
      "BIAB specialist known for long-lasting results",
      "Clean, simple nail art executed quickly and neatly",
    ],
  },
  cham: {
    role: "BIAB Nail Technician",
    experience: "4 years",
    skills: [
      "Calm, steady working pace with consistent results",
      "BIAB-focused with tidy structure and shaping",
      "Communicates smoothly in Chinese with precision",
    ],
  },
  ella: {
    role: "Senior Nail Artist",
    experience: "6 years",
    skills: [
      "Fluent English consultation with strong aesthetic sense",
      "Excellent cuticle work and refined nail shaping",
      "Skilled in florals, abstract art, trending styles, and Russian nails",
    ],
  },
  Elly: {
    role: "Senior Nail Technician",
    experience: "10 years",
    skills: [
      "Clean, fast gel finishes with consistent quality",
      "Chinese-speaking consultation",
      "Skilled in corner detailing, acrylic, and dipping powder",
    ],
  },
  elyn: {
    role: "Nail Extension Specialist",
    experience: "7 years",
    skills: [
      "Chinese-speaking consultation with strong technical clarity",
      "Clean, durable nail extensions",
      "BIAB sets with well-balanced shaping",
    ],
  },
  emma: {
    role: "Senior Nail Technician & Nail Artist",
    experience: "10 years",
    skills: [
      "Gentle, client-focused bilingual consultation",
      "Creative cartoon designs and acrylic work",
      "Known for patience and accommodating preferences",
    ],
  },
  eunice: {
    role: "Senior Spa & Medical Nail Technician",
    experience: "15 years",
    skills: [
      "Specialist in spa, callus, and fungus treatments",
      "Fast, clean, and highly hygienic execution",
      "Trusted by long-term clients for corrective nail care",
    ],
  },
  evon: {
    role: "Senior BIAB Nail Artist",
    experience: "9 years",
    skills: [
      "Skilled in corner detailing and intricate nail art",
      "Confident bilingual consultation",
      "Strong acrylic application with artistic flexibility",
    ],
  },
  gem: {
    role: "Salon Manager",
    experience: "10 years",
    skills: [
      "Oversees daily operations and team coordination",
      "Ensures service consistency and workflow efficiency",
      "Maintains high standards of customer experience",
    ],
  },
  Hana: {
    role: "Senior BIAB Nail Technician",
    experience: "10 years",
    skills: [
      "Precision-driven with refined BIAB techniques",
      "Known for neat execution and long-lasting wear",
      "Ideal for clients who value structure and durability",
    ],
  },
  Hani: {
    role: "Nail Technician",
    experience: "5 years",
    skills: [
      "Friendly bilingual consultation style",
      "Efficient, clean classic hand and foot services",
      "Consistently polished finishing",
    ],
  },
  hari: {
    role: "Senior BIAB Nail Technician",
    experience: "5 years",
    skills: [
      "Highly meticulous with a perfectionist mindset",
      "Strong in BIAB (Builder in a Bottle) and clean, minimal nail designs",
      "Known for durable sets with excellent longevity",
    ],
  },
  helen: {
    role: "Nail Technician",
    experience: "5 years",
    skills: [
      "Detail-oriented with a strong hygiene standard",
      "Quick, clean classic manicure & pedicure",
      "Experienced in spa services and callus care",
    ],
  },
  Jamie: {
    role: "Nail Technician",
    experience: "4 years",
    skills: [
      "Efficient BIAB application with clean, structured results",
      "Quick and neat classic manicure & pedicure",
      "Reliable and hygienic callus treatment",
    ],
  },
  Jaslyn: {
    role: "Assistant Salon Manager",
    experience: "3 years",
    skills: [
      "Supports daily salon operations and staff coordination",
      "Assists in customer flow and service management",
      "Ensures service standards are consistently met",
    ],
  },
  kris: {
    role: "Senior Nail Extension & Art Specialist",
    experience: "10 years",
    skills: [
      "Advanced nail extension and creative art expertise",
      "Also trained in modern lash design techniques",
      "Provides relaxing hand and foot massage",
    ],
  },
  Lauren: {
    role: "BIAB Nail Artist & Extension Specialist",
    experience: "4 years",
    skills: [
      "Strong eye for nail shape and balanced proportions",
      "Skilled in both 2D and detailed 3D nail art",
      "Proficient in acrylic and dipping powder with a cheerful personality",
    ],
  },
  lily: {
    role: "Nail Technician",
    experience: "5 years",
    skills: [
      "Strong Chinese consultation with a careful, attentive style",
      "Detail-focused spa and callus services",
      "Experienced in fungus care treatments",
    ],
  },
  lisa: {
    role: "Senior Spa & Medical Nail Technician",
    experience: "15 years",
    skills: [
      "Extensive experience in spa and medical-style nail care",
      "Trusted for fungus treatment and callus services",
      "Delivers consistently clean, professional results",
    ],
  },
  mandy: {
    role: "Nail Technician & Nail Artist",
    experience: "5 years",
    skills: [
      "Confident bilingual communicator",
      "Fast in extensions and BIAB services",
      "Comfortable across a wide range of nail art styles",
    ],
  },
  may: {
    role: "Nail Technician",
    experience: "1 year",
    skills: [
      "Fast and efficient with a quiet, focused working style",
      "Chinese-speaking consultation available",
      "Solid BIAB foundation with clean execution",
    ],
  },
  meiling: {
    role: "Supervisor",
    experience: "13 years",
    skills: [
      "Oversees final service quality and consistency",
      "Ensures every set meets Nail Queen standards",
      "Extensive industry and technical experience",
    ],
  },
  mi: {
    role: "Nail Technician",
    experience: "5 years",
    skills: [
      "Fluent bilingual consultation with strong listening skills",
      "Elegant simple nail art and refined cuticle work",
      "Beautiful BIAB, clean extensions, and balanced shaping",
    ],
  },
  "min min": {
    role: "Senior Nail Technician & Nail Artist",
    experience: "8 years",
    skills: [
      "Friendly bilingual communicator with strong client rapport",
      "Skilled in corner detailing and diverse nail art styles",
      "Adaptable to both classic and creative requests",
    ],
  },
  mina: {
    role: "Nail Technician",
    experience: "4 years",
    skills: [
      "Clean and efficient classic manicure & pedicure",
      "Careful cuticle work with smooth finishing",
      "Thorough and hygienic callus treatment",
    ],
  },
  moon: {
    role: "Nail & Lash Technician",
    experience: "7 years",
    skills: [
      "Multi-skilled in lash extensions, BIAB, and nail extensions",
      "Strong in clean 2D nail art designs",
      "Flexible and reliable across multiple services",
    ],
  },
  "nancy ": {
    role: "Senior Nail Artist",
    experience: "10 years",
    skills: [
      "Exceptionally versatile across all nail styles",
      "Strong shaping with a perfectionist approach",
      "Fluent bilingual consultation with clear design guidance",
      "Meticulous, detail-oriented, and never rushed",
    ],
  },
  Olivia: {
    role: "Master Nail Extension Specialist",
    experience: "8 years",
    skills: [
      "Advanced nail extensions and artwork specialist",
      "Expert in acrylic, dipping powder, and Russian-style nails",
      "Known for speed, accuracy, and reference-photo-perfect results",
    ],
  },
  sandy: {
    role: "Nail Technician",
    experience: "4 years",
    skills: [
      "Extremely detail-oriented with high hygiene standards",
      "Quick and clean regular manicure & pedicure",
      "Experienced in spa care, fungus, and callus treatment",
    ],
  },
  shinna: {
    role: "Nail Technician & Nail Artist",
    experience: "5 years",
    skills: [
      "Creative with cartoon art and playful designs",
      "Comfortable with extensions, acrylic, and dipping powder",
      "Also trained in hand and foot massage",
    ],
  },
  susan: {
    role: "Senior BIAB Nail Technician",
    experience: "10 years",
    skills: [
      "Detail-focused with high durability standards",
      "BIAB specialist with clean, minimal aesthetics",
      "Efficient in simple yet elegant nail art",
    ],
  },
  wendy: {
    role: "Senior Nail Technician & Nail Artist",
    experience: "7 years",
    skills: [
      "Fluent bilingual consultation with strong trend awareness",
      "Fast nail extensions and BIAB services",
      "Versatile in Y2K styles, marble effects, and mixed nail art",
    ],
  },
};

export default function AboutPage({ basePath }: { basePath: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [api, setApi] = useState<any>();
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const teamMembersList = [
    "amy",
    "angle",
    "cham",
    "ella",
    "Elly",
    "elyn",
    "emma",
    "eunice",
    "evon",
    "gem",
    "Hana",
    "Hani",
    "hari",
    "helen",
    "Jamie",
    "Jaslyn",
    "kris",
    "Lauren",
    "lily",
    "lisa",
    "mandy",
    "may",
    "meiling",
    "mi",
    "min min",
    "mina",
    "moon",
    "nancy ",
    "Olivia",
    "sandy",
    "shinna",
    "susan",
    "wendy",
  ];

  const toggleCard = (member: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(member)) newSet.delete(member);
      else newSet.add(member);
      return newSet;
    });
  };

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      setCurrentIndex(api.selectedScrollSnap());
    };

    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  const asset = (path: string) => `${basePath.replace(/\/+$/, "")}/assets/${path.replace(/^\/+/, "")}`;

  return (
    <Layout basePath={basePath}>
      <section className="pt-16 pb-6 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-6xl font-bold text-center text-nail-queen-brown mb-8">MEET OUR TEAM</h1>
          <div className="max-w-4xl mx-auto text-center mb-16">
            <p className="text-lg text-gray-600 mb-6">At Nail Queen, our team is the heart of everything we do.</p>
            <p className="text-lg text-gray-600 mb-6">
              With a <strong>large, highly skilled, and deeply experienced workforce</strong>, we proudly bring together nail artists, beauty therapists, and spa specialists who have dedicated <strong>many years</strong> to perfecting their craft.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              Each member of our team is trained to handle <strong>any request you have</strong> — from nail design, beauty care, and spa services to advanced treatments and personalised pampering experiences. Whether you're looking for something simple and elegant or bold and intricate, our experts deliver with <strong>precision, creativity, and genuine passion</strong>.
            </p>
            <p className="text-lg text-gray-600 mb-6">
              We believe beauty is personal, and our mission is to make every customer feel seen, cared for, and confidently beautiful.
            </p>
            <p className="text-lg text-gray-600">
              With Nail Queen, you are always in the hands of professionals who treat their work as art — and treat you like royalty.
            </p>
          </div>
        </div>
      </section>

      <section className="pb-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative px-4 md:px-12">
            <Carousel
              opts={{ align: "start", loop: true, slidesToScroll: 1 }}
              className="w-full"
              setApi={setApi}
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {teamMembersList.map((member) => {
                  const memberData = teamMembersData[member];
                  const displayName = member.trim();
                  const imagePath = asset(`team-members/${member}.JPG`);

                  return (
                    <CarouselItem
                      key={member}
                      className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/4"
                    >
                      <div className="group relative h-full">
                        <div
                          className={cn(
                            "h-full rounded-xl overflow-hidden transition-all duration-300 transform",
                            "bg-white border border-transparent",
                            "hover:shadow-xl hover:scale-[1.03]"
                          )}
                        >
                          <div className="aspect-square overflow-hidden">
                            <img
                              src={imagePath}
                              alt={`Team member ${displayName}`}
                              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                if (target.src.endsWith(".JPG")) {
                                  const altPath = member.includes(" ")
                                    ? asset(`team-members/${member.replace(" ", "")}.JPG`)
                                    : asset(`team-members/${member}.png`);
                                  target.src = altPath;
                                }
                              }}
                            />
                          </div>
                          <div className="p-4 bg-gradient-to-t from-white/95 to-white/70 backdrop-blur-sm">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-semibold text-nail-queen-brown capitalize">{displayName}</h3>
                                <p className="text-sm text-gray-700 font-medium mt-0.5">
                                  {memberData?.role || "Nail Technician"}
                                </p>
                                {memberData?.experience && (
                                  <p className="text-xs text-gray-500 mt-1">{memberData.experience} experience</p>
                                )}
                              </div>
                              {memberData?.skills && memberData.skills.length > 0 && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleCard(member);
                                  }}
                                  className={cn(
                                    "flex-shrink-0 p-1.5 rounded-full transition-all duration-200",
                                    "bg-nail-queen-brown/10 hover:bg-nail-queen-brown/20",
                                    "border border-nail-queen-brown/30 hover:border-nail-queen-brown/50",
                                    "hover:scale-110 active:scale-95",
                                    "shadow-sm hover:shadow-md",
                                    "cursor-pointer"
                                  )}
                                  aria-label={expandedCards.has(member) ? "Collapse details" : "Expand details"}
                                >
                                  {expandedCards.has(member) ? (
                                    <ChevronUp className="w-4 h-4 text-nail-queen-brown" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-nail-queen-brown" />
                                  )}
                                </button>
                              )}
                            </div>
                            {memberData?.skills && memberData.skills.length > 0 && (
                              <div
                                className={cn(
                                  "overflow-hidden transition-all duration-300 ease-in-out",
                                  expandedCards.has(member)
                                    ? "max-h-[500px] opacity-100 mt-2"
                                    : "max-h-0 opacity-0"
                                )}
                              >
                                <ul className="space-y-1.5">
                                  {memberData.skills.map((skill, skillIndex) => (
                                    <li
                                      key={skillIndex}
                                      className="text-xs text-gray-600 flex items-start leading-relaxed"
                                    >
                                      <span className="text-nail-queen-brown mr-1.5 mt-0.5 flex-shrink-0">•</span>
                                      <span className="flex-1">{skill}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>

              <div className="absolute -bottom-12 left-0 right-0 flex justify-center items-center gap-1.5 py-4">
                {(() => {
                  const total = teamMembersList.length;
                  const maxVisible = 7;
                  const halfVisible = Math.floor(maxVisible / 2);

                  let startIndex = Math.max(0, currentIndex - halfVisible);
                  let endIndex = Math.min(total - 1, currentIndex + halfVisible);

                  if (endIndex - startIndex < maxVisible - 1) {
                    if (startIndex === 0) {
                      endIndex = Math.min(total - 1, maxVisible - 1);
                    } else if (endIndex === total - 1) {
                      startIndex = Math.max(0, total - maxVisible);
                    }
                  }

                  const dots: React.ReactNode[] = [];

                  if (startIndex > 0) {
                    dots.push(
                      <button
                        key={0}
                        className="w-1.5 h-1.5 rounded-full bg-gray-300 hover:bg-gray-400 transition-all"
                        onClick={() => api?.scrollTo(0)}
                        aria-label="Go to first slide"
                      />
                    );
                    if (startIndex > 1) {
                      dots.push(
                        <span key="ellipsis-start" className="text-gray-400 text-xs px-1">
                          ...
                        </span>
                      );
                    }
                  }

                  for (let i = startIndex; i <= endIndex; i++) {
                    dots.push(
                      <button
                        key={i}
                        className={cn(
                          "rounded-full transition-all",
                          currentIndex === i ? "bg-nail-queen-brown w-6 h-1.5" : "bg-gray-300 hover:bg-gray-400 w-1.5 h-1.5"
                        )}
                        onClick={() => api?.scrollTo(i)}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    );
                  }

                  if (endIndex < total - 1) {
                    if (endIndex < total - 2) {
                      dots.push(
                        <span key="ellipsis-end" className="text-gray-400 text-xs px-1">
                          ...
                        </span>
                      );
                    }
                    dots.push(
                      <button
                        key={total - 1}
                        className="w-1.5 h-1.5 rounded-full bg-gray-300 hover:bg-gray-400 transition-all"
                        onClick={() => api?.scrollTo(total - 1)}
                        aria-label="Go to last slide"
                      />
                    );
                  }

                  return dots;
                })()}
              </div>

              <CarouselPrevious className="left-0 md:-left-4 h-12 w-12 border-nail-queen-brown/20 bg-white/80 hover:bg-white hover:text-nail-queen-brown transition-all" />
              <CarouselNext className="right-0 md:-right-4 h-12 w-12 border-nail-queen-brown/20 bg-white/80 hover:bg-white hover:text-nail-queen-brown transition-all" />
            </Carousel>
          </div>
        </div>
      </section>
    </Layout>
  );
}
