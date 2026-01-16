"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"

import { cn } from "../../lib/utils"
import { Button, buttonVariants } from "./button"

type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
  className?: string
  classNames?: Record<string, string>
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  buttonVariant = "ghost",
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("bg-background p-3", className)}
      classNames={{
        months: cn("flex flex-col md:flex-row gap-4"),
        month: cn("flex flex-col w-full gap-2"),
        caption: cn("flex items-center justify-center px-2"),
        caption_label: cn("text-sm font-medium select-none"),
        nav: cn("flex items-center justify-between"),
        nav_button: cn(buttonVariants({ variant: buttonVariant }), "h-8 w-8 p-0"),
        nav_button_previous: cn(buttonVariants({ variant: buttonVariant }), "h-8 w-8 p-0"),
        nav_button_next: cn(buttonVariants({ variant: buttonVariant }), "h-8 w-8 p-0"),
        table: cn("w-full border-collapse"),
        head_row: cn("flex"),
        head_cell: cn("text-muted-foreground flex-1 text-[0.8rem] font-normal"),
        row: cn("flex w-full mt-2"),
        weeknumber: cn("text-[0.8rem] text-muted-foreground"),
        cell: cn("relative aspect-square w-full p-0 text-center"),
        day: cn("w-full h-full"),
        day_selected: cn("bg-primary text-primary-foreground rounded-md"),
        day_today: cn("bg-accent text-accent-foreground rounded-md"),
        day_outside: cn("text-muted-foreground"),
        day_disabled: cn("text-muted-foreground opacity-50"),
        ...classNames,
      }}
      {...props}
    />
  )
}

export { Calendar }