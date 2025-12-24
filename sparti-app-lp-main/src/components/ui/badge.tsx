import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center border font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 rounded-full px-2.5 py-0.5 text-xs",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-full px-2.5 py-0.5 text-xs",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 rounded-full px-2.5 py-0.5 text-xs",
        outline: "text-foreground rounded-full px-2.5 py-0.5 text-xs",
        success:
          "border-transparent bg-green-500 text-white hover:bg-green-600 rounded-full px-2.5 py-0.5 text-xs",
        warning:
          "border-transparent bg-yellow-500 text-white hover:bg-yellow-600 rounded-full px-2.5 py-0.5 text-xs",
        neon:
          "border-transparent bg-gradient-to-r from-primary to-accent text-white hover:opacity-80 rounded-full px-2.5 py-0.5 text-xs",
        "pet-verified":
          "rounded-lg px-3 py-1.5 text-sm bg-gradient-to-r from-accent to-primary text-background border-accent/30 hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] backdrop-blur-md font-medium h-7",
        "pet-rating":
          "rounded-lg px-3 py-1.5 text-sm bg-gradient-to-r from-accent/20 to-primary/20 text-accent border-accent/40 hover:shadow-[0_0_15px_rgba(57,255,20,0.3)] backdrop-blur-md font-medium h-7",
        "status-open":
          "rounded-lg px-3 py-1.5 text-sm bg-accent/20 text-accent border-accent/30 hover:bg-accent/30 backdrop-blur-md font-medium h-7",
        "status-closed":
          "rounded-lg px-3 py-1.5 text-sm bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30 backdrop-blur-md font-medium h-7",
        "status-unknown":
          "rounded-lg px-3 py-1.5 text-sm bg-muted/20 text-muted-foreground border-muted/30 hover:bg-muted/30 backdrop-blur-md font-medium h-7",
        "place-type":
          "rounded-lg px-3 py-1.5 text-sm bg-background/10 text-foreground border border-foreground/20 hover:bg-background/20 backdrop-blur-md font-medium h-7",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
