"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ListTodo } from "lucide-react";

export interface TaskCategorySlice {
  label: string;
  count: number;
  completed: number;
  color: string;
}

interface TaskBreakdownDonutChartProps {
  categories: TaskCategorySlice[];
  size?: number;
  holeSize?: number;
  title?: string;
  subtitle?: string;
  className?: string;
}

export function TaskBreakdownDonutChart({
  categories,
  size = 180,
  holeSize = 58,
  title = "Task & Focus Distribution",
  subtitle = "Breakdown by technical domain and status",
  className = "",
}: TaskBreakdownDonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalTasks = categories.reduce((sum, item) => sum + item.count, 0) || 1;
  const totalCompleted = categories.reduce((sum, item) => sum + item.completed, 0);
  const completionRate = Math.round((totalCompleted / totalTasks) * 100);

  const center = size / 2;
  const radius = center - 10;

  let accumulatedAngle = 0;
  const slicesWithAngles = categories.map((item) => {
    const angle = (item.count / totalTasks) * 360;
    const startAngle = accumulatedAngle;
    const endAngle = accumulatedAngle + angle;
    accumulatedAngle += angle;
    return { ...item, startAngle, endAngle, percentage: Math.round((item.count / totalTasks) * 100) };
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
    <div className={`space-y-3 ${className}`}>
      {(title || subtitle) && (
        <div className="flex items-center justify-between pb-2 border-b border-border/50">
          <div>
            <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <ListTodo className="h-3.5 w-3.5 text-amber-400" />
              {title}
            </h4>
            <p className="text-[11px] text-muted-foreground">{subtitle}</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {completionRate}% Done
          </span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
        {/* SVG Donut */}
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
            {slicesWithAngles.map((slice, idx) => {
              if (slice.count === 0) return null;
              const isHovered = hoveredIndex === idx;
              const currentOuterRadius = isHovered ? radius + 3 : radius;
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
                    }}
                    transition={{ duration: 0.2 }}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="cursor-pointer transition-all"
                    style={{
                      filter: isHovered ? `drop-shadow(0 0 8px ${slice.color})` : "none",
                    }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Center Callout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none">
            {activeSlice ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-0.5">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider block truncate max-w-[80px]">
                  {activeSlice.label}
                </span>
                <span className="text-xl font-black font-mono block" style={{ color: activeSlice.color }}>
                  {activeSlice.count}
                </span>
                <span className="text-[9px] text-muted-foreground font-mono">
                  {activeSlice.completed}/{activeSlice.count} Done
                </span>
              </motion.div>
            ) : (
              <div className="space-y-0.5">
                <span className="text-xl font-black text-foreground font-mono block">
                  {totalCompleted}/{totalTasks}
                </span>
                <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block">
                  Executed
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 w-full sm:w-auto min-w-[160px] text-xs">
          {slicesWithAngles.map((slice) => {
            const isHovered = hoveredIndex !== null && slicesWithAngles[hoveredIndex]?.label === slice.label;
            return (
              <div
                key={slice.label}
                onMouseEnter={() => setHoveredIndex(slicesWithAngles.findIndex((s) => s.label === slice.label))}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`p-2 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  isHovered
                    ? "bg-card border-border shadow-sm scale-[1.02]"
                    : "bg-card/40 border-border/40 hover:border-border/80"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: slice.color }} />
                  <span className="font-semibold text-foreground truncate text-[11px]">
                    {slice.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-[11px] shrink-0">
                  <span className="text-foreground font-bold">{slice.count}</span>
                  <span className="text-muted-foreground">({slice.completed} done)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
