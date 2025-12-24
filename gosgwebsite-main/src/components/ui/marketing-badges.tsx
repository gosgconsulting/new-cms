"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface Badge {
  id: string
  label: string
  color: string
  size: "sm" | "md" | "lg"
  rotation: number
  zIndex: number
  offsetX: number
  offsetY: number
}

const badges: Badge[] = [
  {
    id: "sem",
    label: "SEM",
    color: "from-sky-400 to-sky-500",
    size: "md",
    rotation: -2,
    zIndex: 1,
    offsetX: -45,
    offsetY: -50,
  },
  {
    id: "seo",
    label: "SEO",
    color: "from-orange-400 to-orange-500",
    size: "md",
    rotation: 2,
    zIndex: 2,
    offsetX: 20,
    offsetY: -45,
  },
  {
    id: "website",
    label: "Website",
    color: "from-purple-400 to-purple-500",
    size: "md",
    rotation: 0,
    zIndex: 3,
    offsetX: -25,
    offsetY: -5,
  },
  {
    id: "traffic",
    label: "Traffic",
    color: "from-teal-400 to-teal-500",
    size: "md",
    rotation: -1,
    zIndex: 4,
    offsetX: 60,
    offsetY: -5,
  },
  {
    id: "ads",
    label: "Ads",
    color: "from-rose-400 to-rose-500",
    size: "md",
    rotation: 3,
    zIndex: 5,
    offsetX: -60,
    offsetY: 40,
  },
  {
    id: "design",
    label: "Design",
    color: "from-pink-400 to-pink-500",
    size: "md",
    rotation: -2,
    zIndex: 6,
    offsetX: 0,
    offsetY: 40,
  },
  {
    id: "leads",
    label: "Leads",
    color: "from-green-400 to-green-500",
    size: "md",
    rotation: 3,
    zIndex: 7,
    offsetX: 30,
    offsetY: 65,
  },
  {
    id: "revenue",
    label: "Revenue",
    color: "from-emerald-400 to-emerald-500",
    size: "md",
    rotation: -1,
    zIndex: 8,
    offsetX: 75,
    offsetY: 70,
  },
]

const sizeClasses = {
  sm: "px-6 py-2.5 text-base",
  md: "px-8 py-3 text-lg",
  lg: "px-10 py-3.5 text-xl",
}

export function MarketingBadges() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [clickedId, setClickedId] = useState<string | null>(null)

  const handleClick = (id: string) => {
    setClickedId(clickedId === id ? null : id)
  }

  return (
    <div className="relative flex h-[160px] w-full items-center justify-center">
      {badges.map((badge) => {
        const isHovered = hoveredId === badge.id
        const isClicked = clickedId === badge.id
        const isOtherHovered = hoveredId !== null && hoveredId !== badge.id

        return (
          <div
            key={badge.id}
            className={cn(
              "absolute cursor-pointer select-none rounded-full font-semibold transition-all duration-500 ease-out",
              "bg-gradient-to-b shadow-lg",
              badge.color,
              sizeClasses[badge.size],
              "hover:shadow-2xl",
            )}
            style={{
              transform: `
                translate(${badge.offsetX}px, ${badge.offsetY}px) 
                rotate(${isHovered ? 0 : badge.rotation}deg)
                scale(${isClicked ? 1.15 : isHovered ? 1.08 : isOtherHovered ? 0.95 : 1})
                translateY(${isHovered ? -8 : 0}px)
              `,
              zIndex: isHovered || isClicked ? 100 : badge.zIndex,
              boxShadow: isHovered
                ? "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 12px 24px -8px rgba(0, 0, 0, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.3)"
                : isClicked
                  ? "0 30px 60px -15px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.4)"
                  : "0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 4px 10px -2px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(255, 255, 255, 0.2)",
              filter: isHovered
                ? "saturate(1) brightness(1) contrast(1)"
                : "saturate(0.85) brightness(0.98) contrast(0.95) blur(0.3px)",
              opacity: isHovered ? 1 : 0.95,
            }}
            onMouseEnter={() => setHoveredId(badge.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={() => handleClick(badge.id)}
          >
            <span
              className={cn(
                "relative block transition-transform duration-300",
                "text-slate-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.3)]",
              )}
              style={{
                transform: isHovered ? "translateY(-1px)" : "translateY(0)",
              }}
            >
              {badge.label}
            </span>
            {/* Inner highlight effect */}
            <div
              className="pointer-events-none absolute inset-0 rounded-full opacity-50"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%)",
              }}
            />
          </div>
        )
      })}
    </div>
  )
}