import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

// Import images
import keywordResearch1 from "@/assets/seo/keyword-research-1.png";
import keywordResearch2 from "@/assets/seo/keyword-research-2.png";
import contentStrategy1 from "@/assets/seo/content-strategy-1.png";
import contentStrategy2 from "@/assets/seo/content-strategy-2.png";
import linkBuilding1 from "@/assets/seo/link-building-1.png";
import linkBuilding2 from "@/assets/seo/link-building-2.png";

interface SEOServicesShowcaseProps {
  onContactClick?: () => void;
}

const SEOServicesShowcase = ({ onContactClick }: SEOServicesShowcaseProps) => {
  const sections = [
    {
      id: "keywords-research",
      title: "Rank on keywords with",
      highlight: "search volume",
      description: "Discover high-volume keywords with precise search data and user intent analysis. Find the perfect keywords to target for maximum organic traffic growth.",
      buttonText: "Learn More",
      images: [keywordResearch1, keywordResearch2],
      reversed: false,
    },
    {
      id: "content-strategy",
      title: "Find topics based on",
      highlight: "real google search results",
      description: "Discover content opportunities by analyzing actual Google search results and user behavior. Get real insights from search data to create content that ranks and converts.",
      buttonText: "View Analytics",
      images: [contentStrategy1, contentStrategy2],
      reversed: true,
    },
    {
      id: "link-building",
      title: "Build authority with",
      highlight: "high-quality backlinks",
      description: "Strengthen your website's authority through strategic link building campaigns. Acquire high-quality backlinks from reputable sources to boost your domain authority and rankings.",
      buttonText: "Try Link Builder",
      images: [linkBuilding1, linkBuilding2],
      reversed: false,
    },
  ];

  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto space-y-32">
        {sections.map((section, index) => (
          <div
            key={section.id}
            className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
              section.reversed ? "lg:grid-flow-dense" : ""
            }`}
          >
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, x: section.reversed ? 30 : -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className={`space-y-6 ${section.reversed ? "lg:col-start-2" : ""}`}
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                {section.title}{" "}
                <span className="bg-gradient-to-r from-brandPurple via-brandTeal to-coral bg-clip-text text-transparent">
                  {section.highlight}
                </span>
              </h2>

              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {section.description}
              </p>

              <div className="pt-4">
                <Button
                  onClick={onContactClick}
                  variant="default"
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-brandPurple to-brandTeal hover:opacity-90 text-white font-semibold px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {section.buttonText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </motion.div>

            {/* Image Carousel */}
            <motion.div
              initial={{ opacity: 0, x: section.reversed ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className={`relative ${section.reversed ? "lg:col-start-1 lg:row-start-1" : ""}`}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-border">
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent>
                    {section.images.map((image, imgIndex) => (
                      <CarouselItem key={imgIndex}>
                        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`${section.title} - Screenshot ${imgIndex + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </Carousel>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-8 -right-8 w-24 h-24 bg-brandPurple/10 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-brandTeal/10 rounded-full blur-3xl -z-10"></div>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SEOServicesShowcase;
