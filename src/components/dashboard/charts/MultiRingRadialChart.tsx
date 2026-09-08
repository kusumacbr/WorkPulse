"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export interface RingSegment {
  label: string;
  value: number; // percentage 0 to 100
  color: string;
  icon?: React.ReactNode;
  detail?: string;
}

interface MultiRingRadialChartProps {
  rings: RingSegment[];
  size?: number;
  strokeWidth?: number;
  centerTitle?: string;
  centerValue?: string | number;
  centerSubtitle?: string;
  className?: string;
}

export function MultiRingRadialChart({
  rings,
  size = 200,
  strokeWidth = 10,
  centerTitle,
  centerValue,
  centerSubtitle,
  className = "",
}: MultiRingRadialChartProps) {
  const [hoveredRing, setHoveredRing] = useState<RingSegment | null>(null);

  const center = size / 2;
  const gap = 5;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-center gap-6 ${className}`}>
      {/* SVG Radial Multi-Rings */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 overflow-visible"
        >
          {rings.map((ring, index) => {
            const radius = center - strokeWidth / 2 - index * (strokeWidth + gap);
            const circumference = 2 * Math.PI * radius;
            const progress = Math.min(100, Math.max(0, ring.value));
            const strokeDashoffset = circumference - (progress / 100) * circumference;
            const isHovered = hoveredRing?.label === ring.label;

            return (
              <g
                key={ring.label}
                onMouseEnter={() => setHoveredRing(ring)}
                onMouseLeave={() => setHoveredRing(null)}
                className="cursor-pointer transition-opacity duration-200"
                style={{ opacity: hoveredRing && !isHovered ? 0.4 : 1 }}
              >
                {/* Background track */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={strokeWidth}
                  className="text-muted/30 dark:text-muted/20"
                />

                {/* Progress Arc */}
                <motion.circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={ring.color}
                  strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 0.9, delay: index * 0.15, ease: "easeOut" }}
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 6px ${ring.color})` : "none",
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Center Data Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
          {hoveredRing ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="space-y-0.5"
            >
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                {hoveredRing.label}
              </span>
              <span className="text-xl font-black font-mono" style={{ color: hoveredRing.color }}>
                {Math.round(hoveredRing.value)}%
              </span>
              {hoveredRing.detail && (
                <span className="text-[9px] text-muted-foreground block truncate max-w-[90px]">
                  {hoveredRing.detail}
                </span>
              )}
            </motion.div>
          ) : (
            <div className="space-y-0.5">
              {centerTitle && (
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {centerTitle}
                </span>
              )}
              {centerValue !== undefined && (
                <span className="text-xl font-black text-foreground font-mono block">
                  {centerValue}
                </span>
              )}
              {centerSubtitle && (
                <span className="text-[9px] text-muted-foreground block truncate max-w-[100px]">
                  {centerSubtitle}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Legend Column */}
      <div className="space-y-2.5 min-w-[150px] w-full sm:w-auto">
        {rings.map((ring) => {
          const isHovered = hoveredRing?.label === ring.label;
          return (
            <div
              key={ring.label}
              onMouseEnter={() => setHoveredRing(ring)}
              onMouseLeave={() => setHoveredRing(null)}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 text-xs border ${
                isHovered
                  ? "bg-card border-border shadow-sm scale-[1.02]"
                  : "bg-card/40 border-transparent hover:border-border/60"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: ring.color,
                    boxShadow: isHovered ? `0 0 8px ${ring.color}` : "none",
                  }}
                />
                <div className="min-w-0">
                  <span className="font-semibold text-foreground block truncate text-[11px]">
                    {ring.label}
                  </span>
                  {ring.detail && (
                    <span className="text-[9px] text-muted-foreground block truncate">
                      {ring.detail}
                    </span>
                  )}
                </div>
              </div>

              <span className="font-mono font-bold text-xs" style={{ color: ring.color }}>
                {Math.round(ring.value)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
