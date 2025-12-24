"use client";

import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import member1 from "@/assets/team/member-1.png";
import member2 from "@/assets/team/member-2.jpeg";
import member3 from "@/assets/team/member-3.png";
import member4 from "@/assets/team/member-4.png";
import gregoire from "@/assets/gregoire-liao.png";

type AvatarGroupProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const images = [member1, member2, member3, member4, gregoire];

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-14 w-14",
};

const AvatarGroup: React.FC<AvatarGroupProps> = ({ className = "", size = "md" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex items-center">
        {images.map((src, idx) => (
          <div
            key={idx}
            className={`relative ${idx > 0 ? "-ml-3" : ""} rounded-full shadow-md ring-2 ring-white`}
          >
            <Avatar className={sizeClasses[size]}>
              <AvatarImage src={src} alt="" />
              <AvatarFallback />
            </Avatar>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvatarGroup;