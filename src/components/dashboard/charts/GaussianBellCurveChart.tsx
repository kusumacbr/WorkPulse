"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Award } from "lucide-react";

export interface EmployeeCalibrationPoint {
  id: string;
  name: string;
  department: string;
  score: number; // 0 to 100
  tier: "DEVELOPING" | "CORE" | "EXCEEDS";
}

interface GaussianBellCurveChartProps {
  employees: EmployeeCalibrationPoint[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function GaussianBellCurveChart({
  employees,
  title = "Organizational Bell Curve Calibration",
  subtitle = "Calibrated distribution across company performance bands",
  className = "",
}: GaussianBellCurveChartProps) {
  const [hoveredEmp, setHoveredEmp] = useState<EmployeeCalibrationPoint | null>(null);
  const [selectedTier, setSelectedTier] = useState<"ALL" | "DEVELOPING" | "CORE" | "EXCEEDS">("ALL");

  const width = 540;
  const height = 180;
  const paddingX = 30;
  const paddingY = 25;
  const effectiveWidth = width - paddingX * 2;
  const effectiveHeight = height - paddingY * 2;

  // Gaussian Curve points computation: mean = 80, stdDev = 12
  const mean = 80;
  const stdDev = 12;
  const steps = 40;
  const curvePoints: { x: number; y: number; score: number }[] = [];

  for (let i = 0; i <= steps; i++) {
    const score = 50 + (i / steps) * 50; // 50 to 100
    const x = paddingX + ((score - 50) / 50) * effectiveWidth;
    // Gaussian formula: f(x) = exp(-0.5 * ((x-mean)/stdDev)^2)
    const factor = Math.exp(-0.5 * Math.pow((score - mean) / stdDev, 2));
    const y = height - paddingY - factor * effectiveHeight;
    curvePoints.push({ x, y, score });
  }

  const firstPt = curvePoints[0] ?? { x: paddingX, y: height - paddingY, score: 50 };
  const lastPt = curvePoints[curvePoints.length - 1] ?? firstPt;

  const linePath = curvePoints.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    return `${acc} L ${pt.x},${pt.y}`;
  }, "");

  const areaPath = `${linePath} L ${lastPt.x},${height - paddingY} L ${firstPt.x},${height - paddingY} Z`;

  // Calculate tier counts
  const developingCount = employees.filter((e) => e.score < 75).length;
  const coreCount = employees.filter((e) => e.score >= 75 && e.score < 90).length;
  const exceedsCount = employees.filter((e) => e.score >= 90).length;

  const filteredEmployees = employees.filter((e) => {
    if (selectedTier === "ALL") return true;
    if (selectedTier === "DEVELOPING") return e.score < 75;
    if (selectedTier === "CORE") return e.score >= 75 && e.score < 90;
    if (selectedTier === "EXCEEDS") return e.score >= 90;
    return true;
  });

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Award className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground tracking-tight">{title}</h4>
            <p className="text-[11px] text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        {/* Tier Pills */}
        <div className="flex items-center gap-1.5 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setSelectedTier("ALL")}
            className={`px-2 py-0.5 rounded-lg border transition-all ${
              selectedTier === "ALL"
                ? "bg-card text-foreground border-border font-black shadow-sm"
                : "text-muted-foreground border-transparent hover:border-border/60"
            }`}
          >
            All ({employees.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTier("DEVELOPING")}
            className={`px-2 py-0.5 rounded-lg border transition-all ${
              selectedTier === "DEVELOPING"
                ? "bg-amber-500/20 text-amber-400 border-amber-500/30 font-black shadow-sm"
                : "text-amber-400/80 border-transparent hover:border-amber-500/30"
            }`}
          >
            Dev ({developingCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTier("CORE")}
            className={`px-2 py-0.5 rounded-lg border transition-all ${
              selectedTier === "CORE"
                ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 font-black shadow-sm"
                : "text-cyan-400/80 border-transparent hover:border-cyan-500/30"
            }`}
          >
            Core ({coreCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTier("EXCEEDS")}
            className={`px-2 py-0.5 rounded-lg border transition-all ${
              selectedTier === "EXCEEDS"
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-black shadow-sm"
                : "text-emerald-400/80 border-transparent hover:border-emerald-500/30"
            }`}
          >
            Top ({exceedsCount})
          </button>
        </div>
      </div>

      {/* SVG Bell Curve */}
      <div className="relative overflow-hidden select-none bg-card/30 rounded-2xl p-2 border border-border/40">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="bellcurve-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.45" />
            </linearGradient>
          </defs>

          {/* Vertical Tier Boundary Zones */}
          {(() => {
            const x75 = paddingX + ((75 - 50) / 50) * effectiveWidth;
            const x90 = paddingX + ((90 - 50) / 50) * effectiveWidth;
            return (
              <>
                <line
                  x1={x75}
                  y1={paddingY}
                  x2={x75}
                  y2={height - paddingY}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  className="text-border/80"
                />
                <line
                  x1={x90}
                  y1={paddingY}
                  x2={x90}
                  y2={height - paddingY}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  className="text-border/80"
                />
              </>
            );
          })()}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#bellcurve-grad)" />

          {/* Curve Stroke */}
          <motion.path
            d={linePath}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8 }}
          />

          {/* Base Axis */}
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="currentColor"
            strokeWidth="1"
            className="text-border/80"
          />

          {/* Employee Pin Markers */}
          {filteredEmployees.map((emp) => {
            const x = paddingX + ((emp.score - 50) / 50) * effectiveWidth;
            const factor = Math.exp(-0.5 * Math.pow((emp.score - mean) / stdDev, 2));
            const y = height - paddingY - factor * effectiveHeight;
            const isHovered = hoveredEmp?.id === emp.id;

            let pinColor = "#06b6d4";
            if (emp.score >= 90) pinColor = "#10b981";
            else if (emp.score < 75) pinColor = "#f59e0b";

            return (
              <g
                key={emp.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredEmp(emp)}
                onMouseLeave={() => setHoveredEmp(null)}
              >
                <line
                  x1={x}
                  y1={y}
                  x2={x}
                  y2={height - paddingY}
                  stroke={pinColor}
                  strokeWidth={isHovered ? "2" : "1"}
                  strokeDasharray={isHovered ? "none" : "2 2"}
                  opacity={isHovered ? 1 : 0.6}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill={pinColor}
                  stroke="var(--card)"
                  strokeWidth="2"
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 8px ${pinColor})` : "none",
                  }}
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip for Hovered Employee */}
        {hoveredEmp && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-2 right-2 bg-popover/95 backdrop-blur-md border border-border p-2.5 rounded-xl shadow-lg text-xs z-10 space-y-0.5 pointer-events-none"
          >
            <div className="flex items-center gap-1.5">
              <strong className="text-foreground">{hoveredEmp.name}</strong>
              <span className="text-[10px] text-muted-foreground">({hoveredEmp.department})</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">Score: {hoveredEmp.score}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-foreground font-semibold">
                {hoveredEmp.score >= 90
                  ? "Top Performer"
                  : hoveredEmp.score >= 75
                  ? "Core Contributor"
                  : "Developing"}
              </span>
            </div>
          </motion.div>
        )}

        {/* Distribution Region Labels */}
        <div className="grid grid-cols-3 text-center text-[10px] font-bold pt-1 px-4">
          <span className="text-amber-600 dark:text-amber-400">Developing (15%) &lt; 75</span>
          <span className="text-cyan-600 dark:text-cyan-400">Core Contributors (70%) 75-89</span>
          <span className="text-emerald-600 dark:text-emerald-400">Exceeds Expectations (15%) &ge; 90</span>
        </div>
      </div>
    </div>
  );
}
