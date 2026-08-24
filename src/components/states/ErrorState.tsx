import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "../ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  code?: string;
  correlationId?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred while processing your request.",
  code = "INTERNAL_SERVER_ERROR",
  correlationId,
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center rounded-xl border border-destructive/20 bg-destructive/5 ${className}`}
      role="alert"
    >
      <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-destructive/10 text-destructive mb-4">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-md">{message}</p>
      
      <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs font-mono text-muted-foreground">
        <span className="bg-background px-2.5 py-1 rounded border border-border">
          Code: <span className="text-destructive font-semibold">{code}</span>
        </span>
        {correlationId && (
          <span className="bg-background px-2.5 py-1 rounded border border-border">
            ID: {correlationId.slice(0, 8)}...
          </span>
        )}
      </div>

      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-5 gap-1.5"
          onClick={onRetry}
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try Again
        </Button>
      )}
    </div>
  );
}
