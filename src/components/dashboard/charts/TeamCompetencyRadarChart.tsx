"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export interface CompetencyAxis {
  key: string;
  label: string;
  score: number; // 0 to 5.0 or 0 to 100
  maxScore?: number;
  benchmarkScore?: number;
}

interface TeamCompetencyRadarChartProps {
  axes: CompetencyAxis[];
  size?: number;
  title?: string;
  subtitle?: string;
  color?: string;
  benchmarkColor?: string;
  className?: string;
}

export function TeamCompetencyRadarChart({
  axes,
  size = 260,
  title = "Engineering Competency Radar",
  subtitle = "Calibrated execution matrix & skill index",
  color = "#06b6d4", // cyan
  benchmarkColor = "#a855f7", // purple
  className = "",
}: TeamCompetencyRadarChartProps) {
  const [hoveredAxis, setHoveredAxis] = useState<CompetencyAxis | null>(null);

  const center = size / 2;
  const radius = center - 38;
  const totalAxes = axes.length;
  const angleSlice = (Math.PI * 2) / totalAxes;

  // Levels for concentric polygon grid (20%, 40%, 60%, 80%, 100%)
  const levels = [0.25, 0.5, 0.75, 1.0];

  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = angleSlice * index - Math.PI / 2;
    const r = radius * valueRatio;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Generate polygon points for the user scores
  const scorePoints = axes.map((axis, i) => {
    const max = axis.maxScore || 5.0;
    const ratio = Math.min(1, Math.max(0, axis.score / max));
    return getCoordinates(i, ratio);
  });

  const scorePolygonString = scorePoints.map((p) => `${p.x},${p.y}`).join(" ");

  // Optional benchmark points
  const benchmarkPoints = axes.map((axis, i) => {
    const max = axis.maxScore || 5.0;
    const ratio = Math.min(1, Math.max(0, (axis.benchmarkScore ?? 4.0) / max));
    return getCoordinates(i, ratio);
  });
  const benchmarkPolygonString = benchmarkPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className={`space-y-3 ${className}`}>
      {(title || subtitle) && (
        <div className="flex items-center justify-between pb-2 border-b border-border/50">
          <div>
            {title && (
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                {title}
              </h4>
            )}
            {subtitle && <p className="text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-3 text-[10px] font-bold">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-foreground">Actual</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: benchmarkColor }} />
              <span className="text-muted-foreground">Lead Benchmark</span>
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* SVG Spider Radar */}
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
            {/* Concentric Polygonal Background Grid */}
            {levels.map((level) => {
              const gridPoints = axes.map((_, i) => getCoordinates(i, level));
              const gridPolygonString = gridPoints.map((p) => `${p.x},${p.y}`).join(" ");

              return (
                <polygon
                  key={level}
                  points={gridPolygonString}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-border/60"
                  strokeDasharray="2 2"
                />
              );
            })}

            {/* Radial Spokes */}
            {axes.map((_, i) => {
              const edgePoint = getCoordinates(i, 1.0);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={edgePoint.x}
                  y2={edgePoint.y}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-border/60"
                />
              );
            })}

            {/* Benchmark Polygon */}
            <polygon
              points={benchmarkPolygonString}
              fill={`${benchmarkColor}15`}
              stroke={benchmarkColor}
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.8"
            />

            {/* Actual Score Polygon */}
            <motion.polygon
              points={scorePolygonString}
              fill={`${color}30`}
              stroke={color}
              strokeWidth="2.5"
              initial={{ opacity: 0, scale: 0.5, transformOrigin: `${center}px ${center}px` }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              style={{ filter: `drop-shadow(0 0 8px ${color}60)` }}
            />

            {/* Data Points and Outer Labels */}
            {axes.map((axis, i) => {
              const pt = scorePoints[i] ?? { x: center, y: center };
              const labelPt = getCoordinates(i, 1.22);
              const isHovered = hoveredAxis?.key === axis.key;

              return (
                <g key={axis.key}>
                  {/* Point circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5 : 3.5}
                    fill={color}
                    stroke="var(--card)"
                    strokeWidth={isHovered ? 2 : 1}
                    className="cursor-pointer transition-all"
                    onMouseEnter={() => setHoveredAxis(axis)}
                    onMouseLeave={() => setHoveredAxis(null)}
                  />

                  {/* Label Text */}
                  <text
                    x={labelPt.x}
                    y={labelPt.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="currentColor"
                    className={`text-[9px] font-bold transition-colors cursor-pointer select-none ${
                      isHovered ? "text-cyan-600 dark:text-cyan-400" : "text-muted-foreground"
                    }`}
                    onMouseEnter={() => setHoveredAxis(axis)}
                    onMouseLeave={() => setHoveredAxis(null)}
                  >
                    {axis.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Axis Detail or Summary List */}
        <div className="space-y-1.5 w-full sm:w-auto min-w-[160px] text-xs">
          {axes.map((axis) => {
            const isHovered = hoveredAxis?.key === axis.key;
            return (
              <div
                key={axis.key}
                onMouseEnter={() => setHoveredAxis(axis)}
                onMouseLeave={() => setHoveredAxis(null)}
                className={`p-1.5 px-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  isHovered
                    ? "bg-card border-cyan-500/40 shadow-sm"
                    : "bg-card/40 border-border/40 hover:border-border/80"
                }`}
              >
                <span className="text-[11px] font-semibold text-foreground truncate">
                  {axis.label}
                </span>
                <span className="font-mono font-bold text-xs text-cyan-600 dark:text-cyan-400 shrink-0">
                  {axis.score.toFixed(1)} / {axis.maxScore || 5.0}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
