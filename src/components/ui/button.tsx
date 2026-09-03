import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-sm hover:opacity-90 hover:shadow-md",
        brand:
          "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-md hover:shadow-cyan-500/25 font-bold hover:brightness-105",
        cyan:
          "bg-gradient-to-r from-cyan-500 via-sky-500 to-teal-500 text-white shadow-md hover:shadow-cyan-500/25 font-bold hover:brightness-105",
        amber:
          "bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 text-white shadow-md hover:shadow-amber-500/25 font-bold hover:brightness-105",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-border/80 bg-card/60 backdrop-blur-sm shadow-sm hover:bg-muted hover:text-foreground hover:border-border",
        secondary:
          "bg-secondary/80 text-secondary-foreground shadow-sm hover:bg-secondary",
        ghost: "hover:bg-accent/80 hover:text-accent-foreground",
        glass: "bg-white/15 dark:bg-white/5 border border-white/30 dark:border-white/10 backdrop-blur-md text-foreground hover:bg-white/25 dark:hover:bg-white/10 shadow-sm",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-2xl px-7 text-sm font-semibold",
        pill: "h-9 rounded-full px-5 text-xs font-semibold",
        icon: "h-9 w-9 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants, cn };

