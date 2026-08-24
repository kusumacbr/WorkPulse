"use client";

import React, { ReactNode } from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-border bg-card/30 ${className}`}
    >
      <div className="flex items-center justify-center h-14 w-14 rounded-2xl bg-muted text-muted-foreground mb-4 shadow-inner">
        {icon || <FolderOpen className="h-7 w-7 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-md">{description}</p>

      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button variant="brand" size="sm" className="mt-5">
            {actionLabel}
          </Button>
        </Link>
      )}

      {actionLabel && !actionHref && onAction && (
        <Button variant="brand" size="sm" className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
