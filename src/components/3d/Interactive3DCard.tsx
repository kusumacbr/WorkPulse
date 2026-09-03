"use client";

import React from "react";

interface Interactive3DCardProps {
  children: React.ReactNode;
  className?: string;
  tiltStrength?: number;
  glowEffect?: boolean;
  onClick?: () => void;
}

export function Interactive3DCard({
  children,
  className = "",
  onClick,
}: Interactive3DCardProps) {
  return (
    <div
      onClick={onClick}
      className={`relative rounded-2xl border border-border/80 bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-border transition-all duration-200 ${
        onClick ? "cursor-pointer select-none" : ""
      } ${className}`}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
