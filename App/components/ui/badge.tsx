import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:     "bg-[#FFBA00]/15 text-[#8B6200] dark:bg-[#FFBA00]/20 dark:text-[#FFBA00]",
        secondary:   "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-slate-200",
        destructive: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        success:     "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        outline:     "border border-gray-200 text-gray-700 dark:border-slate-600 dark:text-slate-300",
        warning:     "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
