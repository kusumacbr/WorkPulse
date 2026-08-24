"use client";

import React from "react";
import { LucideIcon } from "lucide-react";
import { Interactive3DCard } from "./Interactive3DCard";

export type MetricAccent = "gold" | "cyan" | "purple" | "emerald" | "rose";

interface MetricTile3DProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changePositive?: boolean;
  icon: LucideIcon;
  badgeText?: string;
  accent?: MetricAccent;
  onClick?: () => void;
}

const ACCENT_STYLES: Record<
  MetricAccent,
  {
    iconBg: string;
    iconBorder: string;
    iconText: string;
    glow: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
  }
> = {
  gold: {
    iconBg: "bg-[var(--brand-primary)]/15",
    iconBorder: "border-[var(--brand-primary)]/35",
    iconText: "text-[var(--brand-primary)]",
    glow: "hover:shadow-[0_8px_30px_rgba(208,172,100,0.18)]",
    badgeBg: "bg-[var(--brand-primary)]/10",
    badgeBorder: "border-[var(--brand-primary)]/30",
    badgeText: "text-[var(--brand-primary)]",
  },
  cyan: {
    iconBg: "bg-cyan-500/15",
    iconBorder: "border-cyan-500/35",
    iconText: "text-cyan-400",
    glow: "hover:shadow-[0_8px_30px_rgba(6,182,212,0.20)]",
    badgeBg: "bg-cyan-500/10",
    badgeBorder: "border-cyan-500/30",
    badgeText: "text-cyan-400",
  },
  purple: {
    iconBg: "bg-purple-500/15",
    iconBorder: "border-purple-500/35",
    iconText: "text-purple-400",
    glow: "hover:shadow-[0_8px_30px_rgba(168,85,247,0.20)]",
    badgeBg: "bg-purple-500/10",
    badgeBorder: "border-purple-500/30",
    badgeText: "text-purple-400",
  },
  emerald: {
    iconBg: "bg-emerald-500/15",
    iconBorder: "border-emerald-500/35",
    iconText: "text-emerald-400",
    glow: "hover:shadow-[0_8px_30px_rgba(16,185,129,0.20)]",
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/30",
    badgeText: "text-emerald-400",
  },
  rose: {
    iconBg: "bg-rose-500/15",
    iconBorder: "border-rose-500/35",
    iconText: "text-rose-400",
    glow: "hover:shadow-[0_8px_30px_rgba(244,63,94,0.20)]",
    badgeBg: "bg-rose-500/10",
    badgeBorder: "border-rose-500/30",
    badgeText: "text-rose-400",
  },
};

export function MetricTile3D({
  title,
  value,
  subtitle,
  change,
  changePositive = true,
  icon: Icon,
  badgeText,
  accent = "gold",
  onClick,
}: MetricTile3DProps) {
  const style = ACCENT_STYLES[accent];

  return (
    <Interactive3DCard onClick={onClick} className={`p-5 transition-all duration-300 ${style.glow}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-muted-foreground block uppercase tracking-wider">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {value}
          </div>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground leading-tight pt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        <div className={`h-10 w-10 rounded-xl ${style.iconBg} border ${style.iconBorder} flex items-center justify-center ${style.iconText} shrink-0 shadow-inner transition-transform group-hover:scale-110`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {(change || badgeText) && (
        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-[11px]">
          {change && (
            <span
              className={`font-semibold flex items-center gap-1 ${
                changePositive ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {change}
            </span>
          )}
          {badgeText && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${style.badgeBg} ${style.badgeBorder} ${style.badgeText}`}>
              {badgeText}
            </span>
          )}
        </div>
      )}
    </Interactive3DCard>
  );
}
