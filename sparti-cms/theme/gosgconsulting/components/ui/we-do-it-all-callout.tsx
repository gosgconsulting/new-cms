"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "./button";
import { MessageCircle } from "lucide-react";
import { HandWrittenTitle } from "./hand-writing-text";

import member1 from "../../assets/team/member-1.png";
import member2 from "../../assets/team/member-2.jpeg";
import member3 from "../../assets/team/member-3.png";
import member4 from "../../assets/team/member-4.png";
import gregoireLiao from "../../assets/gregoire-liao.png";

type WeDoItAllCalloutProps = {
  className?: string;
  label?: string;
  subtitle?: string;
  primaryAvatarSrc?: string; // optional custom main avatar
  avatars?: string[]; // optional full override list
  onChatClick?: () => void; // new: chat button handler
  buttonLabel?: string; // NEW: allow overriding the button text
};

const WeDoItAllCallout: React.FC<WeDoItAllCalloutProps> = ({
  className = "",
  label = "We Do It All!",
  subtitle,
  primaryAvatarSrc,
  avatars,
  onChatClick,
  buttonLabel, // NEW
}) => {
  // Default team (exactly 5, no duplicates)
  const defaultTeam = [member1, member2, member3, member4, gregoireLiao];

  // Build final list: prefer full override, then primary custom + defaults, else defaults
  const initialList = Array.isArray(avatars) && avatars.length > 0
    ? avatars
    : primaryAvatarSrc
      ? [primaryAvatarSrc, member2, member3, member4, gregoireLiao]
      : defaultTeam;

  // De-duplicate and limit to 5
  const finalTeam = Array.from(new Set(initialList)).slice(0, 5);

  return (
    <div className={`flex flex-col items-start ${className}`}>
      {/* Card: title + avatars + chat button */}
      <div className="w-full rounded-2xl border border-neutral-200 bg-white/80 backdrop-blur shadow-lg p-4 md:p-5 overflow-hidden">
        {/* Title inside the card, above avatars */}
        <div className="w-full mb-2">
          <HandWrittenTitle
            title={label}
            subtitle={undefined}
            titleClassName="text-3xl md:text-5xl"
            containerClassName="py-4"
          />
        </div>

        {/* Overlapping team avatars (centered) */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-2 flex justify-center -space-x-3"
          aria-label="Team avatars"
        >
          {finalTeam.map((src, i) => (
            <img
              key={`${src}-${i}`}
              src={src}
              alt={`Team member ${i + 1}`}
              className="h-12 w-12 md:h-14 md:w-14 rounded-full ring-2 ring-white shadow-md object-cover bg-white"
            />
          ))}
        </motion.div>

        {/* Chat button (centered) */}
        <motion.div
          className="mt-4 md:mt-5 flex justify-center"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Button
            onClick={() => onChatClick && onChatClick()}
            aria-label="Chat with us"
            className="relative rounded-full bg-brandPurple text-white hover:bg-brandPurple hover:text-white border border-brandPurple px-10 md:px-12 py-5 md:py-6 text-xl md:text-2xl font-semibold transition-colors"
          >
            <span className="flex items-center gap-3">
              <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/20">
                <MessageCircle className="w-5.5 h-5.5" />
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-white" aria-hidden="true" />
              </span>
              <span>{buttonLabel || "Chat with us"}</span>
            </span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default WeDoItAllCallout;