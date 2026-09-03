import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./button";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-150 focus:outline-none select-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        secondary:
          "border-border/80 bg-secondary/80 text-secondary-foreground hover:bg-secondary",
        destructive:
          "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-sm",
        outline: "border-border text-foreground bg-background/50",
        success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold shadow-sm",
        emerald: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold shadow-sm",
        teal: "border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300 font-semibold shadow-sm",
        brand: "border-cyan-500/35 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-semibold shadow-sm",
        cyan: "border-cyan-500/35 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 font-semibold shadow-sm",
        indigo: "border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm",
        amber: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold shadow-sm",
        rose: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold shadow-sm",
        purple: "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold shadow-sm",
        glass: "border-white/20 dark:border-white/10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md text-foreground shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

