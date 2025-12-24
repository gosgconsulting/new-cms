"use client";
import React from "react";
import { motion } from "motion/react";

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: typeof testimonials;
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6 bg-background"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <div className="p-10 rounded-3xl border shadow-lg shadow-primary/10 max-w-xs w-full backdrop-blur-sm bg-card/80 hover:bg-card/90 transition-all duration-300" key={i}>
                  <div className="text-foreground/90 leading-relaxed">{text}</div>
                  <div className="flex items-center gap-2 mt-5">
                    <img
                      width={40}
                      height={40}
                      src={image}
                      alt={name}
                      className="h-10 w-10 rounded-full border-2 border-primary/20"
                    />
                    <div className="flex flex-col">
                      <div className="font-medium tracking-tight leading-5">{name}</div>
                      <div className="leading-5 opacity-60 tracking-tight text-sm">{role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};

const testimonials = [
  {
    text: "Sparti transformed our SEO strategy completely. Our organic traffic increased by 300% in just 3 months with their AI-powered content automation.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
    name: "Sarah Chen",
    role: "Marketing Director",
  },
  {
    text: "The automated article generation is incredible. We went from publishing 2 articles per week to 2 per day, and our search rankings skyrocketed.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    name: "Marcus Rodriguez",
    role: "SEO Manager",
  },
  {
    text: "Best investment we made for our content strategy. The AI creates SEO-optimized articles that actually rank on page 1 of Google.",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
    name: "Emily Johnson",
    role: "Content Strategist",
  },
  {
    text: "From zero to hero in search results. Sparti's automation helped us dominate our niche with consistent, high-quality SEO content.",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    name: "David Park",
    role: "Founder & CEO",
  },
  {
    text: "The keyword research and topic suggestions are spot-on. We're now ranking for keywords we never thought possible.",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
    name: "Lisa Thompson",
    role: "Digital Marketing Lead",
  },
  {
    text: "Sparti made SEO accessible for our small team. We're competing with enterprise companies and winning in search results.",
    image: "https://randomuser.me/api/portraits/women/6.jpg",
    name: "Rachel Davis",
    role: "Growth Manager",
  },
  {
    text: "The automated backlink generation is a game-changer. Our domain authority increased significantly within months.",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    name: "James Wilson",
    role: "SEO Consultant",
  },
  {
    text: "Finally, an SEO tool that actually delivers results. Our clients are seeing massive improvements in their search visibility.",
    image: "https://randomuser.me/api/portraits/women/8.jpg",
    name: "Amanda Foster",
    role: "Agency Owner",
  },
  {
    text: "The AI understands our brand voice perfectly. Every article feels like it was written by our team, but with perfect SEO optimization.",
    image: "https://randomuser.me/api/portraits/men/9.jpg",
    name: "Michael Chang",
    role: "Brand Manager",
  },
];

export { testimonials };