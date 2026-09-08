"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

export interface DataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  meta?: string;
}

interface TrendAreaSparklineProps {
  data: DataPoint[];
  height?: number;
  width?: string | number;
  color?: "cyan" | "emerald" | "purple" | "amber" | "rose" | "indigo";
  showArea?: boolean;
  showPoints?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  targetLine?: number;
  targetLabel?: string;
}

const COLOR_MAP = {
  cyan: {
    stroke: "#06b6d4",
    gradientStart: "rgba(6, 182, 212, 0.45)",
    gradientEnd: "rgba(6, 182, 212, 0.0)",
    glow: "rgba(6, 182, 212, 0.5)",
    text: "text-cyan-400",
    bgBadge: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300",
  },
  emerald: {
    stroke: "#10b981",
    gradientStart: "rgba(16, 185, 129, 0.45)",
    gradientEnd: "rgba(16, 185, 129, 0.0)",
    glow: "rgba(16, 185, 129, 0.5)",
    text: "text-emerald-400",
    bgBadge: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  },
  purple: {
    stroke: "#a855f7",
    gradientStart: "rgba(168, 85, 247, 0.45)",
    gradientEnd: "rgba(168, 85, 247, 0.0)",
    glow: "rgba(168, 85, 247, 0.5)",
    text: "text-purple-400",
    bgBadge: "bg-purple-500/15 border-purple-500/30 text-purple-300",
  },
  amber: {
    stroke: "#f59e0b",
    gradientStart: "rgba(245, 158, 11, 0.45)",
    gradientEnd: "rgba(245, 158, 11, 0.0)",
    glow: "rgba(245, 158, 11, 0.5)",
    text: "text-amber-400",
    bgBadge: "bg-amber-500/15 border-amber-500/30 text-amber-300",
  },
  rose: {
    stroke: "#f43f5e",
    gradientStart: "rgba(244, 63, 94, 0.45)",
    gradientEnd: "rgba(244, 63, 94, 0.0)",
    glow: "rgba(244, 63, 94, 0.5)",
    text: "text-rose-400",
    bgBadge: "bg-rose-500/15 border-rose-500/30 text-rose-300",
  },
  indigo: {
    stroke: "#6366f1",
    gradientStart: "rgba(99, 102, 241, 0.45)",
    gradientEnd: "rgba(99, 102, 241, 0.0)",
    glow: "rgba(99, 102, 241, 0.5)",
    text: "text-indigo-400",
    bgBadge: "bg-indigo-500/15 border-indigo-500/30 text-indigo-300",
  },
};

export function TrendAreaSparkline({
  data,
  height = 140,
  color = "cyan",
  showArea = true,
  showPoints = true,
  showGrid = true,
  showTooltip = true,
  valuePrefix = "",
  valueSuffix = "",
  title,
  subtitle,
  className = "",
  targetLine,
  targetLabel = "Target",
}: TrendAreaSparklineProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return <div className="h-24 flex items-center justify-center text-xs text-muted-foreground">No trend data</div>;
  }

  const values = data.map((d) => d.value);
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);

  // Provide generous vertical headroom so target line and label stay comfortably above graph peaks
  const effectiveMin = targetLine !== undefined ? Math.min(dataMin, targetLine) : dataMin;
  const effectiveMax = targetLine !== undefined ? Math.max(dataMax, targetLine) : dataMax;
  const hasPercentage = valueSuffix.includes("%") || dataMax > 60;
  const upperCeil = hasPercentage ? Math.max(effectiveMax * 1.12, 100) : effectiveMax * 1.15;
  
  const minVal = Math.max(0, effectiveMin > 0 ? effectiveMin * 0.8 : 0);
  const maxVal = upperCeil;
  const range = maxVal - minVal || 1;

  const widthSvg = 500;
  const heightSvg = height;
  const paddingX = 24;
  const paddingY = 24;
  const effectiveWidth = widthSvg - paddingX * 2;
  const effectiveHeight = heightSvg - paddingY * 2;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(1, data.length - 1)) * effectiveWidth;
    const y = paddingY + effectiveHeight - ((d.value - minVal) / range) * effectiveHeight;
    return { x, y, ...d };
  });

  const firstPoint = points[0] ?? { x: paddingX, y: heightSvg - paddingY, label: "", value: 0 };
  const lastPoint = points[points.length - 1] ?? firstPoint;

  // Calculate SVG curve path using cubic Bezier
  const linePath = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = arr[i - 1] ?? point;
    const cpX1 = prev.x + (point.x - prev.x) / 2;
    const cpY1 = prev.y;
    const cpX2 = prev.x + (point.x - prev.x) / 2;
    const cpY2 = point.y;
    return `${acc} C ${cpX1},${cpY1} ${cpX2},${cpY2} ${point.x},${point.y}`;
  }, "");

  const areaPath = `${linePath} L ${lastPoint.x},${heightSvg - paddingY} L ${firstPoint.x},${heightSvg - paddingY} Z`;

  const colorConfig = COLOR_MAP[color];
  const uniqueId = React.useId().replace(/:/g, "");

  const activePoint = activeIndex !== null && points[activeIndex] ? points[activeIndex] : lastPoint;

  return (
    <div className={`space-y-2 ${className}`}>
      {(title || subtitle) && (
        <div className="flex items-center justify-between">
          <div>
            {title && <h4 className="text-xs font-bold text-foreground tracking-tight">{title}</h4>}
            {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
          {activePoint && (
            <div className="text-right">
              <span className={`text-xs font-mono font-bold ${colorConfig.text}`}>
                {valuePrefix}
                {activePoint.value}
                {valueSuffix}
              </span>
              <span className="text-[10px] text-muted-foreground block">{activePoint.label}</span>
            </div>
          )}
        </div>
      )}

      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${widthSvg} ${heightSvg}`}
          className="w-full h-auto overflow-visible"
          preserveAspectRatio="none"
          onMouseLeave={() => setActiveIndex(null)}
        >
          <defs>
            <linearGradient id={`sparkline-grad-${uniqueId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colorConfig.gradientStart} />
              <stop offset="100%" stopColor={colorConfig.gradientEnd} />
            </linearGradient>
            <filter id={`sparkline-glow-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={colorConfig.glow} />
            </filter>
          </defs>

          {/* Background Grid Lines */}
          {showGrid && (
            <g className="stroke-border/40" strokeDasharray="3 3" strokeWidth="1">
              <line x1={paddingX} y1={paddingY} x2={widthSvg - paddingX} y2={paddingY} />
              <line
                x1={paddingX}
                y1={paddingY + effectiveHeight / 2}
                x2={widthSvg - paddingX}
                y2={paddingY + effectiveHeight / 2}
              />
              <line
                x1={paddingX}
                y1={heightSvg - paddingY}
                x2={widthSvg - paddingX}
                y2={heightSvg - paddingY}
              />
            </g>
          )}

          {/* Optional Target Baseline */}
          {targetLine !== undefined && (
            <g>
              {(() => {
                const targetY = paddingY + effectiveHeight - ((targetLine - minVal) / range) * effectiveHeight;
                return (
                  <>
                    <line
                      x1={paddingX}
                      y1={targetY}
                      x2={widthSvg - paddingX}
                      y2={targetY}
                      stroke="currentColor"
                      strokeOpacity="0.45"
                      strokeDasharray="4 4"
                      strokeWidth="1.25"
                      className="text-slate-400 dark:text-border"
                    />
                    <text
                      x={widthSvg - paddingX - 2}
                      y={targetY - 6}
                      textAnchor="end"
                      fill="currentColor"
                      className="text-slate-600 dark:text-muted-foreground text-[10px] font-bold font-mono select-none"
                    >
                      {targetLabel} ({targetLine}{valueSuffix ? valueSuffix.trim() : ""})
                    </text>
                  </>
                );
              })()}
            </g>
          )}

          {/* Area Fill */}
          {showArea && (
            <motion.path
              d={areaPath}
              fill={`url(#sparkline-grad-${uniqueId})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            />
          )}

          {/* Smooth Line */}
          <motion.path
            d={linePath}
            fill="none"
            stroke={colorConfig.stroke}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter={`url(#sparkline-glow-${uniqueId})`}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Interactive Scrubbing Columns & Points */}
          {points.map((point, idx) => {
            const isHovered = activeIndex === idx;
            const colWidth = effectiveWidth / data.length;

            return (
              <g key={idx} className="cursor-pointer">
                {/* Hit area */}
                <rect
                  x={point.x - colWidth / 2}
                  y={0}
                  width={colWidth}
                  height={heightSvg}
                  fill="transparent"
                  onMouseEnter={() => setActiveIndex(idx)}
                />

                {/* Vertical Crosshair on Hover */}
                {isHovered && (
                  <line
                    x1={point.x}
                    y1={paddingY}
                    x2={point.x}
                    y2={heightSvg - paddingY}
                    stroke={colorConfig.stroke}
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.6"
                  />
                )}

                {/* Point Circles */}
                {showPoints && (
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isHovered ? 5 : 3}
                    fill={colorConfig.stroke}
                    stroke="var(--card)"
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    className="transition-all duration-150"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Indicator */}
        {showTooltip && activeIndex !== null && points[activeIndex] && (
          <div
            className="absolute top-1 pointer-events-none transform -translate-x-1/2 bg-popover/95 backdrop-blur-md border border-border px-2.5 py-1 rounded-xl shadow-lg text-[11px] z-20 flex items-center gap-1.5 transition-all duration-75"
            style={{
              left: `${(points[activeIndex].x / widthSvg) * 100}%`,
            }}
          >
            <span className="font-bold text-foreground">{points[activeIndex].label}:</span>
            <span className={`font-mono font-black ${colorConfig.text}`}>
              {valuePrefix}
              {points[activeIndex].value}
              {valueSuffix}
            </span>
            {points[activeIndex].meta && (
              <span className="text-[10px] text-muted-foreground">({points[activeIndex].meta})</span>
            )}
          </div>
        )}
      </div>

      {/* Axis Labels */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium px-1">
        <span>{data[0]?.label}</span>
        {data.length > 2 && <span>{data[Math.floor(data.length / 2)]?.label}</span>}
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}
