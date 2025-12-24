"use client";

import React from "react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";
import { X, Sparkles, BarChart3, Users, Zap, Target, TrendingUp, CheckCircle, UserCheck, Shield } from "lucide-react";

type Item = {
  key: string;
  type: string;
  content?: string;
  items?: Array<Item>;
  icon?: string;
};

interface ChallengeSectionProps {
  items?: Item[];
}

const iconMap: Record<string, React.ReactNode> = {
  x: <X className="h-5 w-5" />,
  sparkles: <Sparkles className="h-5 w-5" />,
  barChart3: <BarChart3 className="h-5 w-5" />,
  users: <Users className="h-5 w-5" />,
  zap: <Zap className="h-5 w-5" />,
  target: <Target className="h-5 w-5" />,
  trendingUp: <TrendingUp className="h-5 w-5" />,
  checkCircle: <CheckCircle className="h-5 w-5" />,
  userCheck: <UserCheck className="h-5 w-5" />,
  shield: <Shield className="h-5 w-5" />,
};

const defaultTimeline = [
  { id: 1, title: "Dedicated Expert", date: "", content: "Your personal marketing expert who knows your business inside out.", category: "Team", icon: UserCheck, relatedIds: [2], status: "completed" as const, energy: 100 },
  { id: 2, title: "We Execute", date: "", content: "No more guessing - we handle all marketing execution professionally.", category: "Execution", icon: Zap, relatedIds: [1,3], status: "completed" as const, energy: 90 },
  { id: 3, title: "Full-Stack Team", date: "", content: "Website, SEO, ads, design - everything under one roof.", category: "Services", icon: Users, relatedIds: [2,4], status: "in-progress" as const, energy: 60 },
  { id: 4, title: "Proven Systems", date: "", content: "Battle-tested strategies that generate leads and revenue.", category: "Systems", icon: Shield, relatedIds: [3,5], status: "pending" as const, energy: 30 },
  { id: 5, title: "Growth Focus", date: "", content: "Every decision focused on your business growth and ROI.", category: "Results", icon: TrendingUp, relatedIds: [4], status: "pending" as const, energy: 10 },
];

const ChallengeSection: React.FC<ChallengeSectionProps> = ({ items = [] }) => {
  const hint = items.find((i) => i.key === "hint")?.content || "You have a great business but struggle online?";
  const heading = items.find((i) => i.key === "heading")?.content || "Your Business Works… Your Marketing Doesn't";
  const bulletsArr = items.find((i) => i.key === "bullets");
  const bullets = bulletsArr?.items || [
    { key: "b1", type: "text", content: "You know your craft — but not SEO, ads, funnels", icon: "x" },
    { key: "b2", type: "text", content: "Leads don't grow month after month", icon: "sparkles" },
    { key: "b3", type: "text", content: "Ad money burns without profit", icon: "barChart3" },
  ];

  return (
    <section className="w-full bg-gradient-to-b from-slate-800 via-slate-700 to-indigo-800 py-20 px-2 md:px-4">
      <div className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        {/* Left: Animation (scaled) - remove overflow and padding restrictions */}
        <div className="w-full order-2 lg:order-1">
          <RadialOrbitalTimeline
            timelineData={defaultTimeline as any}
            embedded
            containerClassName="h-[400px] md:h-[520px] w-full"
          />
        </div>

        {/* Right: Problem layout - back to pain points */}
        <div className="w-full text-white order-1 lg:order-2">
          {/* Hint bubble */}
          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 backdrop-blur px-4 py-2 text-sm text-white/80 mb-6">
            {hint}
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight mb-8 text-white/90">
            {heading}
          </h2>

          {/* Bullet pills - back to pain points */}
          <div className="space-y-5">
            {bullets.map((b, idx) => (
              <div
                key={b.key || idx}
                className="flex items-center gap-4 rounded-[20px] border border-white/10 bg-white/5 px-5 py-4"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/20 text-red-300 ring-1 ring-red-400/30">
                  {iconMap[b.icon || "x"]}
                </div>
                <p className="text-base md:text-lg text-white/90">{b.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChallengeSection;