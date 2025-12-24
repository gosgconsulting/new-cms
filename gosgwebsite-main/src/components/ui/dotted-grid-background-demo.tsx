"use client";

import React from "react";
import { DottedGridBackground } from "@/components/ui/dotted-grid-background";

export default function DottedGridBackgroundDemo() {
  return (
    <div className="relative w-full h-screen bg-white">
      <DottedGridBackground />
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Interactive Dotted Grid
          </h1>
          <p className="text-lg text-gray-600">
            Move your mouse around to see the dots light up!
          </p>
        </div>
      </div>
    </div>
  );
}