"use client";

import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Clock, ArrowRight } from "lucide-react";
import { Badge } from "./ui/badge";
import { handleButtonLink } from "../utils/buttonLinkHandler";
import { usePopup } from "../contexts/PopupContext";
import { HeroHighlight, Highlight } from "./ui/hero-highlight";
import { MarketingBadges } from "./ui/marketing-badges";
import gosgLogo from "../assets/go-sg-logo-official.png";
import WeDoItAllCallout from "./ui/we-do-it-all-callout";
import { DottedGridBackground } from "./ui/dotted-grid-background";

interface HomeHeroSectionProps {
  items?: Array<{
    key: string;
    type: string;
    content?: string;
    level?: number;
    icon?: string;
    link?: string;
  }>;
  onContactClick?: () => void;
  onPopupOpen?: (popupName: string) => void;
}

/**
 * HomeHeroSection
 * Standalone hero for the homepage, decoupled from other pages.
 */
const HomeHeroSection = ({ items = [], onContactClick, onPopupOpen }: HomeHeroSectionProps) => {
  const { openPopup } = usePopup();

  const badge = items.find(item => item.key === 'badge');
  const highlight = items.find(item => item.key === 'highlight');
  const title = items.find(item => item.key === 'title'); // fallback
  const headingPrefix = items.find(item => item.key === 'headingPrefix');
  const headingEmphasis = items.find(item => item.key === 'headingEmphasis');
  const description = items.find(item => item.key === 'description');
  const button = items.find(item => item.key === 'button');

  return (
    <>
      <HeroHighlight containerClassName="h-[50rem] py-20 md:py-24 relative">
        {/* Dotted Grid Background */}
        <DottedGridBackground className="z-0" />
        
        <div className="container mx-auto max-w-5xl px-4 relative z-10">
          <div className="flex flex-col items-center text-center">
            {/* Top Badge */}
            {badge && (
              <motion.div
                className="mb-4 md:mb-6"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Badge variant="outline" className="px-4 py-2 text-sm font-medium border-brandPurple/20 text-brandPurple bg-brandPurple/5">
                  {badge.icon === 'clock' && <Clock className="w-4 h-4 mr-2" />}
                  {badge.content}
                </Badge>
              </motion.div>
            )}

            {/* Main Headline - improved mobile spacing */}
            <motion.div
              className="space-y-2 mt-4 md:mt-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-3xl md:text-6xl lg:text-7xl font-bold leading-tight text-neutral-800 dark:text-white mb-2">
                {headingEmphasis ? (
                  <>
                    <span className="text-neutral-900 dark:text-white">
                      {headingPrefix?.content ? `${headingPrefix.content} ` : ""}
                    </span>
                    <Highlight className="text-neutral-900 dark:text-white">
                      {headingEmphasis.content}
                    </Highlight>
                  </>
                ) : (
                  <Highlight className="text-neutral-900 dark:text-white">
                    {highlight?.content || title?.content}
                  </Highlight>
                )}
              </h1>
              {/* Subtitle intentionally omitted for homepage per request */}
            </motion.div>

            {/* Labels: more spacing above and below */}
            <div className="w-full max-w-3xl self-center mt-12 md:mt-[65px] mb-16 md:mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 items-start justify-items-center gap-8 md:gap-6">
                {/* Left column: labels */}
                <div className="flex flex-col items-center">
                  <MarketingBadges />
                </div>

                {/* Right column: We Do It All with more top spacing */}
                <div className="mt-8 md:mt-0 w-full">
                  <WeDoItAllCallout
                    className="items-center w-full"
                    onChatClick={() => {
                      if (onContactClick) {
                        onContactClick();
                      } else {
                        openPopup("contact");
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            {description && (
              <motion.p
                className="text-base md:text-lg text-muted-foreground max-w-3xl leading-relaxed mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {description.content}
              </motion.p>
            )}

            {/* CTA Button */}
            {button && (
              <motion.div
                className="mt-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Button 
                  onClick={() => {
                    if (button.link) {
                      handleButtonLink(button.link, onPopupOpen || openPopup);
                    } else if (onContactClick) {
                      onContactClick();
                    }
                  }}
                  className="bg-gradient-to-r from-purple-500 to-teal-500 hover:from-purple-600 hover:to-teal-600 text-white font-medium px-8 py-6 text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                >
                  <span className="flex items-center">
                    {button.content}
                    {button.icon === 'arrowRight' && <ArrowRight className="ml-2 h-5 w-5" />}
                  </span>
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </HeroHighlight>

      {/* Next Section Target */}
      <div id="next-section"></div>
    </>
  );
};

export default HomeHeroSection;
