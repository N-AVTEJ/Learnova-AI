import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        <textarea
          ref={ref}
          className={cn(
            "flex min-h-[88px] w-full rounded-md border bg-surface px-4 py-3 text-body text-foreground placeholder:text-muted-foreground/70 transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-violet/60 focus-visible:border-accent-violet/60",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error ? "border-status-danger/60" : "border-border-strong",
            className
          )}
          {...props}
        />
        {error ? (
          <p className="text-caption text-status-danger">{error}</p>
        ) : null}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
