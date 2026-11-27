import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-caption font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-surface-elevated text-foreground border border-border",
        accent:
          "bg-accent-violet/15 text-purple-300 border border-accent-violet/30",
        success:
          "bg-status-success/15 text-emerald-300 border border-status-success/30",
        warning:
          "bg-status-warning/15 text-amber-300 border border-status-warning/30",
        outline: "border border-border-strong text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
