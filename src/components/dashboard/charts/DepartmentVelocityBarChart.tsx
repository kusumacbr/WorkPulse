"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Users, CheckCircle2, UserCheck } from "lucide-react";

export interface DepartmentMetric {
  id: string;
  name: string;
  shortName: string;
  headcount: number;
  sodSubmissionRate: number; // percentage 0-100
  avgExecutionScore: number; // percentage 0-100
  attendanceRate: number; // percentage 0-100
  leadName: string;
  color: string;
}

interface DepartmentVelocityBarChartProps {
  departments: DepartmentMetric[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function DepartmentVelocityBarChart({
  departments,
  title = "Departments Overview",
  subtitle = "Team sizes, department leads, and today's attendance",
  className = "",
}: DepartmentVelocityBarChartProps) {
  const [viewMode, setViewMode] = useState<"headcount" | "attendance">("headcount");
  const [hoveredDeptId, setHoveredDeptId] = useState<string | null>(null);

  const totalStaff = departments.reduce((sum, d) => sum + d.headcount, 0);
  const maxHeadcount = Math.max(...departments.map((d) => d.headcount), 5);
  const hoveredDept = departments.find((d) => d.id === hoveredDeptId) || null;

  return (
    <div className={`space-y-5 ${className}`}>
      {/* 1. Header: Plain-language Title + Simple Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-foreground tracking-tight">{title}</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                {departments.length} Teams · {totalStaff} Staff
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">{subtitle}</p>
          </div>
        </div>

        {/* Intuitive 2-Option Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-muted/40 border border-border/60 text-[11px] font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode("headcount")}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === "headcount"
                ? "bg-card text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Users className="h-3 w-3" />
            <span>Team Size</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("attendance")}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === "attendance"
                ? "bg-card text-foreground shadow-sm font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserCheck className="h-3 w-3" />
            <span>Today's Attendance</span>
          </button>
        </div>
      </div>

      {/* 2. Visual Comparative Column Chart */}
      <div className="relative pt-6 pb-2 px-2 rounded-2xl bg-muted/20 border border-border/40">
        {/* Dynamic Hover Tooltip Banner */}
        <div className="h-6 mb-2 flex items-center justify-between px-2 text-[11px]">
          <AnimatePresence mode="wait">
            {hoveredDept ? (
              <motion.div
                key={hoveredDept.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-3 text-foreground font-semibold"
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: hoveredDept.color }} />
                <span>{hoveredDept.name}</span>
                <span className="text-muted-foreground font-normal">· Lead: {hoveredDept.leadName}</span>
                <span className="text-purple-600 dark:text-purple-400 font-bold font-mono">
                  {hoveredDept.headcount} {hoveredDept.headcount === 1 ? "staff" : "staff"} ({hoveredDept.attendanceRate}% Present)
                </span>
              </motion.div>
            ) : (
              <span className="text-muted-foreground text-[10px]">
                Hover over any column to see department details
              </span>
            )}
          </AnimatePresence>
          <span className="text-[10px] text-muted-foreground hidden sm:inline">
            Comparing {departments.length} departments
          </span>
        </div>

        {/* Columns Grid */}
        <div className="grid gap-2 sm:gap-4 items-end h-40" style={{ gridTemplateColumns: `repeat(${departments.length}, minmax(0, 1fr))` }}>
          {departments.map((dept) => {
            const isHovered = hoveredDeptId === dept.id;
            const barHeightPct =
              viewMode === "headcount"
                ? Math.max(14, (dept.headcount / maxHeadcount) * 100)
                : Math.max(14, dept.attendanceRate);

            return (
              <div
                key={dept.id}
                onMouseEnter={() => setHoveredDeptId(dept.id)}
                onMouseLeave={() => setHoveredDeptId(null)}
                className="flex flex-col items-center h-full justify-end group cursor-pointer"
              >
                {/* Value on top of bar */}
                <span className="text-[10px] sm:text-xs font-mono font-bold mb-1.5 transition-colors group-hover:scale-105" style={{ color: dept.color }}>
                  {viewMode === "headcount" ? `${dept.headcount}` : `${dept.attendanceRate}%`}
                </span>

                {/* Vertical Column Bar */}
                <div className="w-full max-w-[48px] h-full flex items-end justify-center">
                  <motion.div
                    className="w-full rounded-t-xl transition-all duration-300 relative overflow-hidden"
                    style={{
                      backgroundColor: dept.color,
                      opacity: hoveredDeptId && !isHovered ? 0.45 : 1,
                      boxShadow: isHovered ? `0 0 16px ${dept.color}80` : "none",
                    }}
                    initial={{ height: 0 }}
                    animate={{ height: `${barHeightPct}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    {/* Subtle Sheen Highlight */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/25 pointer-events-none" />
                  </motion.div>
                </div>

                {/* Department Label */}
                <div className="mt-2 text-center w-full truncate">
                  <span
                    className={`text-[10px] sm:text-[11px] font-bold block truncate transition-colors ${
                      isHovered ? "text-foreground font-black" : "text-muted-foreground"
                    }`}
                    title={dept.name}
                  >
                    {dept.shortName || dept.name.split(" ")[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Compact Department Cards Grid (3 cols on lg, 2 on sm) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {departments.map((dept) => {
          const isHovered = hoveredDeptId === dept.id;

          return (
            <div
              key={dept.id}
              onMouseEnter={() => setHoveredDeptId(dept.id)}
              onMouseLeave={() => setHoveredDeptId(null)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                isHovered
                  ? "bg-card border-border shadow-md ring-1 ring-border"
                  : "bg-card/60 border-border/50 hover:border-border hover:bg-card/90"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: dept.color }}
                  />
                  <div className="min-w-0">
                    <strong className="text-xs font-bold text-foreground block truncate">
                      {dept.name}
                    </strong>
                    <span className="text-[11px] text-muted-foreground block truncate">
                      Lead: {dept.leadName}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted text-foreground shrink-0">
                  {dept.headcount} {dept.headcount === 1 ? "staff" : "staff"}
                </span>
              </div>

              {/* Attendance & Status Pill */}
              <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[10px]">
                <span className="text-muted-foreground">Today's Presence:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {dept.attendanceRate}% Present
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
