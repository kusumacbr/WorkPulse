"use client";

import React from "react";
import Image from "next/image";
import { Activity } from "lucide-react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showCompany?: boolean;
  withPulseAnimation?: boolean;
  className?: string;
}

export function BrandLogo({
  size = "md",
  showCompany = true,
  withPulseAnimation = true,
  className = "",
}: BrandLogoProps) {
  const sizeMap = {
    sm: {
      logoW: 80,
      logoH: 24,
      textClass: "text-sm",
      badgeClass: "text-[9px] px-1.5 py-0.2",
      iconSize: "h-3 w-3",
    },
    md: {
      logoW: 96,
      logoH: 28,
      textClass: "text-lg",
      badgeClass: "text-[10px] px-2 py-0.5",
      iconSize: "h-3.5 w-3.5",
    },
    lg: {
      logoW: 120,
      logoH: 34,
      textClass: "text-2xl",
      badgeClass: "text-xs px-2.5 py-0.5",
      iconSize: "h-4 w-4",
    },
    xl: {
      logoW: 140,
      logoH: 40,
      textClass: "text-3xl sm:text-4xl",
      badgeClass: "text-xs px-3 py-1",
      iconSize: "h-5 w-5",
    },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Official Company Logo */}
      {showCompany && (
        <div className="relative flex items-center justify-center shrink-0">
          <Image
            src="/logo.png"
            alt="Xorstack"
            width={currentSize.logoW}
            height={currentSize.logoH}
            priority
            className="object-contain"
          />
        </div>
      )}

      {showCompany && <span className="h-4 w-[1px] bg-border/70 hidden sm:block" />}

      {/* Stylized Creative WorkPulse Brand Mark */}
      <div className="flex items-center gap-1.5">
        <div className="relative flex items-center">
          <span className={`font-black tracking-tight ${currentSize.textClass} text-foreground`}>
            Work
          </span>
          <span
            className={`font-black tracking-tight ${currentSize.textClass} text-transparent bg-clip-text bg-gradient-to-r from-[#d0ac64] via-[#f3c969] to-[#38bdf8] drop-shadow-[0_0_12px_rgba(208,172,100,0.35)]`}
          >
            Pulse
          </span>

          {/* Animated Heartbeat / Pulse Wave Dot */}
          {withPulseAnimation && (
            <span className="relative flex h-2 w-2 ml-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-[var(--brand-primary)] to-cyan-400 shadow-[0_0_8px_#38bdf8]" />
            </span>
          )}
        </div>

        {/* Pulse Frequency Icon Pill */}
        <div className="hidden lg:flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[var(--brand-primary)]/10 via-cyan-500/10 to-purple-500/10 border border-cyan-500/30 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
          <Activity className={`${currentSize.iconSize} animate-pulse`} />
        </div>
      </div>
    </div>
  );
}
