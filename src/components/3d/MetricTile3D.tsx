"use client";

import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Interactive3DCard } from "./Interactive3DCard";

export type MetricAccent = "gold" | "cyan" | "purple" | "emerald" | "rose" | "indigo";

interface MetricTile3DProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  changePositive?: boolean;
  icon: LucideIcon;
  badgeText?: string;
  accent?: MetricAccent;
  progress?: number;
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
    radialLight: string;
    progressBar: string;
  }
> = {
  gold: {
    iconBg: "bg-amber-500/15",
    iconBorder: "border-amber-500/35",
    iconText: "text-amber-600 dark:text-amber-400",
    glow: "hover:shadow-[0_12px_36px_rgba(245,158,11,0.20)]",
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/30",
    badgeText: "text-amber-600 dark:text-amber-400",
    radialLight: "from-amber-500/10",
    progressBar: "bg-amber-500",
  },
  cyan: {
    iconBg: "bg-cyan-500/15",
    iconBorder: "border-cyan-500/35",
    iconText: "text-cyan-500 dark:text-cyan-400",
    glow: "hover:shadow-[0_12px_36px_rgba(6,182,212,0.20)]",
    badgeBg: "bg-cyan-500/10",
    badgeBorder: "border-cyan-500/30",
    badgeText: "text-cyan-500 dark:text-cyan-400",
    radialLight: "from-cyan-500/10",
    progressBar: "bg-cyan-500",
  },
  purple: {
    iconBg: "bg-purple-500/15",
    iconBorder: "border-purple-500/35",
    iconText: "text-purple-500 dark:text-purple-400",
    glow: "hover:shadow-[0_12px_36px_rgba(168,85,247,0.20)]",
    badgeBg: "bg-purple-500/10",
    badgeBorder: "border-purple-500/30",
    badgeText: "text-purple-500 dark:text-purple-400",
    radialLight: "from-purple-500/10",
    progressBar: "bg-purple-500",
  },
  emerald: {
    iconBg: "bg-emerald-500/15",
    iconBorder: "border-emerald-500/35",
    iconText: "text-emerald-600 dark:text-emerald-400",
    glow: "hover:shadow-[0_12px_36px_rgba(16,185,129,0.20)]",
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/30",
    badgeText: "text-emerald-600 dark:text-emerald-400",
    radialLight: "from-emerald-500/10",
    progressBar: "bg-emerald-500",
  },
  rose: {
    iconBg: "bg-rose-500/15",
    iconBorder: "border-rose-500/35",
    iconText: "text-rose-500 dark:text-rose-400",
    glow: "hover:shadow-[0_12px_36px_rgba(244,63,94,0.20)]",
    badgeBg: "bg-rose-500/10",
    badgeBorder: "border-rose-500/30",
    badgeText: "text-rose-500 dark:text-rose-400",
    radialLight: "from-rose-500/10",
    progressBar: "bg-rose-500",
  },
  indigo: {
    iconBg: "bg-indigo-500/15",
    iconBorder: "border-indigo-500/35",
    iconText: "text-indigo-500 dark:text-indigo-400",
    glow: "hover:shadow-[0_12px_36px_rgba(99,102,241,0.20)]",
    badgeBg: "bg-indigo-500/10",
    badgeBorder: "border-indigo-500/30",
    badgeText: "text-indigo-500 dark:text-indigo-400",
    radialLight: "from-indigo-500/10",
    progressBar: "bg-indigo-500",
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
  progress,
  onClick,
}: MetricTile3DProps) {
  const style = ACCENT_STYLES[accent] || ACCENT_STYLES.gold;

  return (
    <Interactive3DCard
      onClick={onClick}
      className="p-5 sm:p-6 transition-all duration-200 relative group overflow-hidden border border-border/80 bg-card/85 dark:bg-card/50 shadow-sm hover:shadow-md"
    >
      <div className="flex items-start justify-between relative z-10 gap-3">
        <div className="space-y-1 min-w-0">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-foreground tracking-tight" suppressHydrationWarning>
            {value}
          </div>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground leading-snug pt-0.5 truncate" suppressHydrationWarning>
              {subtitle}
            </p>
          )}
        </div>

        <div
          className={`h-11 w-11 rounded-2xl ${style.iconBg} border ${style.iconBorder} flex items-center justify-center ${style.iconText} shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {progress !== undefined && (
        <div className="mt-3.5 space-y-1">
          <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${style.progressBar}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      {(change || badgeText) && (
        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] relative z-10">
          {change ? (
            <span
              className={`font-semibold flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${
                changePositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              }`}
            >
              {changePositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {change}
            </span>
          ) : (
            <div />
          )}

          {badgeText && (
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${style.badgeBg} ${style.badgeBorder} ${style.badgeText}`}
            >
              {badgeText}
            </span>
          )}
        </div>
      )}
    </Interactive3DCard>
  );
}

