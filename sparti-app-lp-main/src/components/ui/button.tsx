import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: `
          bg-gradient-to-r from-primary to-primary/80 text-primary-foreground 
          hover:from-primary hover:to-primary/90 
          hover:shadow-[0_0_20px_rgba(0,212,255,0.3),0_0_40px_rgba(0,212,255,0.2),0_2px_8px_rgba(0,0,0,0.3)]
          hover:scale-[1.02]
        `,
        destructive: `
          bg-destructive text-destructive-foreground 
          hover:bg-destructive/90
          hover:shadow-[0_0_15px_rgba(239,68,68,0.3),0_2px_6px_rgba(0,0,0,0.2)]
          hover:scale-[1.01]
        `,
        outline: `
          border border-input glass hover:border-primary/40 hover:bg-primary/10
          hover:shadow-[0_0_15px_rgba(0,212,255,0.25),0_2px_6px_rgba(0,0,0,0.2)]
          hover:scale-[1.01]
        `,
        secondary: `
          bg-secondary text-secondary-foreground 
          hover:bg-secondary/80
          hover:shadow-[0_0_12px_rgba(115,115,115,0.3),0_2px_6px_rgba(0,0,0,0.2)]
          hover:scale-[1.01]
        `,
        ghost: `
          hover:bg-accent/10 hover:text-accent-foreground
          hover:shadow-[0_0_10px_rgba(0,212,255,0.2)]
        `,
        link: `
          text-primary underline-offset-4 hover:underline
          hover:shadow-[0_0_8px_rgba(0,212,255,0.2)]
        `,
        neon: `
          bg-gradient-to-r from-primary to-lead-orange text-primary-foreground border-0 
          hover:from-primary/90 hover:to-lead-orange/90
          hover:shadow-[0_0_25px_rgba(0,191,255,0.4),0_0_50px_rgba(249,115,22,0.3),0_3px_10px_rgba(0,0,0,0.3)]
          hover:scale-[1.02] font-semibold
        `,
        glass: `
          glass border border-primary/20 text-foreground 
          hover:border-primary/40 hover:bg-primary/10
          hover:shadow-[0_0_15px_rgba(0,212,255,0.25),0_2px_6px_rgba(0,0,0,0.2)]
          hover:scale-[1.01]
        `,
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8",
        xl: "h-14 rounded-xl px-12 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
