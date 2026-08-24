import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  description?: string;
  className?: string;
}

export function LoadingState({
  message = "Loading data...",
  description = "Please wait while we retrieve the latest information.",
  className = "",
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card/50 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="relative flex items-center justify-center mb-4">
        <div className="absolute h-12 w-12 rounded-full border-2 border-[var(--brand-primary)]/20 animate-ping" />
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-primary)]" />
      </div>
      <h4 className="text-base font-medium text-foreground">{message}</h4>
      {description && <p className="text-sm text-muted-foreground mt-1 max-w-sm">{description}</p>}
    </div>
  );
}
