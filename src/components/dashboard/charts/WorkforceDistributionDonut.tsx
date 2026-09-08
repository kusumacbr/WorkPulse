"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Laptop, Calendar, Users } from "lucide-react";

export interface WorkforceSlice {
  label: string;
  count: number;
  color: string;
  gradient: string;
  icon?: "office" | "wfh" | "leave" | "custom";
}

interface WorkforceDistributionDonutProps {
  data: WorkforceSlice[];
  size?: number;
  holeSize?: number;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function WorkforceDistributionDonut({
  data,
  size = 200,
  holeSize = 64,
  title,
  subtitle,
  className = "",
}: WorkforceDistributionDonutProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((sum, item) => sum + item.count, 0) || 1;
  const center = size / 2;
  const radius = center - 12;

  // Convert slices to SVG paths using polar angles
  let accumulatedAngle = 0;
  const slicesWithAngles = data.map((item) => {
    const angle = (item.count / total) * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle += angle;
    return { ...item, startAngle, endAngle, percentage: Math.round((item.count / total) * 100) };
  });

  const getCoordinatesForAngle = (angleInDegrees: number, r: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: center + r * Math.cos(angleInRadians),
      y: center + r * Math.sin(angleInRadians),
    };
  };

  const createArcSvgPath = (startAngle: number, endAngle: number, innerR: number, outerR: number) => {
    const safeEndAngle = endAngle - startAngle >= 360 ? 359.99 : endAngle;
    const startOuter = getCoordinatesForAngle(startAngle, outerR);
    const endOuter = getCoordinatesForAngle(safeEndAngle, outerR);
    const startInner = getCoordinatesForAngle(safeEndAngle, innerR);
    const endInner = getCoordinatesForAngle(startAngle, innerR);
    const largeArc = safeEndAngle - startAngle > 180 ? 1 : 0;

    return [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
      `L ${startInner.x} ${startInner.y}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
      "Z",
    ].join(" ");
  };

  const activeSlice = hoveredIndex !== null ? slicesWithAngles[hoveredIndex] : null;

  return (
    <div className={`space-y-4 ${className}`}>
      {(title || subtitle) && (
        <div className="flex items-center justify-between pb-2 border-b border-border/50">
          <div>
            {title && <h4 className="text-xs font-bold text-foreground">{title}</h4>}
            {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
          <span className="text-xs font-mono font-bold text-foreground bg-muted/50 px-2.5 py-1 rounded-full border border-border/60">
            {total} Total Staff
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
        {/* SVG Donut */}
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
            {slicesWithAngles.map((slice, idx) => {
              if (slice.count === 0) return null;
              const isHovered = hoveredIndex === idx;
              const currentOuterRadius = isHovered ? radius + 4 : radius;
              const currentInnerRadius = isHovered ? holeSize - 2 : holeSize;
              const path = createArcSvgPath(slice.startAngle, slice.endAngle, currentInnerRadius, currentOuterRadius);

              return (
                <g key={slice.label}>
                  <motion.path
                    d={path}
                    fill={slice.color}
                    initial={{ opacity: 0.8 }}
                    animate={{
                      opacity: hoveredIndex === null || isHovered ? 1 : 0.45,
                      scale: isHovered ? 1.02 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="cursor-pointer transition-all"
                    style={{
                      filter: isHovered ? `drop-shadow(0 0 10px ${slice.color})` : "none",
                    }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Central Summary Badge */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none">
            {activeSlice ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-0.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                  {activeSlice.label}
                </span>
                <span className="text-2xl font-black font-mono block" style={{ color: activeSlice.color }}>
                  {activeSlice.count}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono font-semibold block">
                  {activeSlice.percentage}% of total
                </span>
              </motion.div>
            ) : (
              <div className="space-y-0.5">
                <Users className="h-4 w-4 text-cyan-400 mx-auto mb-0.5" />
                <span className="text-xl font-black text-foreground font-mono block">{total}</span>
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">
                  On Roster
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Legend Cards */}
        <div className="space-y-2.5 w-full sm:w-auto min-w-[170px]">
          {slicesWithAngles.map((slice, idx) => {
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={slice.label}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 text-xs ${
                  isHovered
                    ? "bg-card border-border shadow-md scale-[1.02]"
                    : "bg-card/40 border-border/40 hover:border-border/80"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="h-7 w-7 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${slice.color}20`, color: slice.color }}
                  >
                    {slice.icon === "office" ? (
                      <Building2 className="h-3.5 w-3.5" />
                    ) : slice.icon === "wfh" ? (
                      <Laptop className="h-3.5 w-3.5" />
                    ) : slice.icon === "leave" ? (
                      <Calendar className="h-3.5 w-3.5" />
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: slice.color }} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold text-foreground block text-[11px] truncate">
                      {slice.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {slice.percentage}%
                    </span>
                  </div>
                </div>

                <span className="font-mono font-black text-sm" style={{ color: slice.color }}>
                  {slice.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
