import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        <input
          type={type}
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md border bg-surface px-4 py-2 text-body text-foreground placeholder:text-muted-foreground/70 transition-colors duration-200",
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
Input.displayName = "Input";

export { Input };
