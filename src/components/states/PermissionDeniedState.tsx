import React from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

interface PermissionDeniedStateProps {
  title?: string;
  reason?: string;
  requiredRole?: string;
  backUrl?: string;
  className?: string;
}

export function PermissionDeniedState({
  title = "Access Denied",
  reason = "You do not have permission to view or manage this record.",
  requiredRole,
  backUrl = "/dashboard",
  className = "",
}: PermissionDeniedStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center rounded-xl border border-amber-500/20 bg-amber-500/5 ${className}`}
      role="alert"
    >
      <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-4 shadow-sm">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <h3 className="text-xl font-bold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2 max-w-md">{reason}</p>
      
      {requiredRole && (
        <p className="text-xs text-muted-foreground mt-3 font-medium">
          Required Capability / Scope: <span className="text-foreground font-semibold">{requiredRole}</span>
        </p>
      )}

      <div className="flex items-center gap-3 mt-6">
        <Link href={backUrl}>
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
