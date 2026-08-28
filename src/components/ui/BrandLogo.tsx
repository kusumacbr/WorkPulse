"use client";

import React from "react";
import { Activity } from "lucide-react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showCompany?: boolean;
  withPulseAnimation?: boolean;
}

export function BrandLogo({
  size = "md",
  className = "",
}: BrandLogoProps) {
  const sizeMap = {
    sm: {
      box: "h-8 w-8 rounded-lg",
      icon: "h-4 w-4",
      text: "text-lg font-black tracking-tight",
      dot: "h-2 w-2",
    },
    md: {
      box: "h-9 w-9 rounded-xl",
      icon: "h-5 w-5",
      text: "text-xl font-black tracking-tight",
      dot: "h-2.5 w-2.5",
    },
    lg: {
      box: "h-11 w-11 rounded-2xl",
      icon: "h-6 w-6",
      text: "text-2xl sm:text-3xl font-black tracking-tight",
      dot: "h-3 w-3",
    },
    xl: {
      box: "h-14 w-14 rounded-2xl",
      icon: "h-8 w-8",
      text: "text-4xl sm:text-5xl font-black tracking-tight",
      dot: "h-3.5 w-3.5",
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Single High-Resolution WorkPulse Emblem */}
      <div
        className={`${currentSize.box} bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-cyan-500/20 shrink-0`}
      >
        <Activity className={`${currentSize.icon} text-white animate-pulse`} />
      </div>

      {/* Single Unified Brand Name */}
      <div className="flex items-center">
        <span className={`${currentSize.text} text-foreground`}>
          Work
        </span>
        <span
          className={`${currentSize.text} text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_12px_rgba(56,189,248,0.35)]`}
        >
          Pulse
        </span>
        <span className={`relative flex ${currentSize.dot} ml-1`}>
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-full w-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
        </span>
      </div>
    </div>
  );
}
