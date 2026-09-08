"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Zap } from "lucide-react";

export interface DayActivity {
  day: string; // "Mon", "Tue", "Wed", "Thu", "Fri"
  date: string; // "Sep 1"
  hours: number; // e.g. 8.5
  targetHours?: number; // default 8.0
  checkIn?: string; // "10:05 AM"
  checkOut?: string; // "07:05 PM"
  status: "PRESENT" | "WFH" | "LEAVE" | "UPCOMING" | "WEEKEND";
  tasksDone?: number;
}

interface WeeklyActivityBarChartProps {
  days: DayActivity[];
  targetDailyHours?: number;
  height?: number;
  className?: string;
}

export function WeeklyActivityBarChart({
  days,
  targetDailyHours = 8.0,
  height = 180,
  className = "",
}: WeeklyActivityBarChartProps) {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(days.findIndex((d) => d.status === "PRESENT" || d.status === "WFH"));

  const maxHours = Math.max(...days.map((d) => d.hours), 10);
  const totalWeeklyHours = days.reduce((sum, d) => sum + d.hours, 0);
  const totalWeeklyTarget = days.filter((d) => d.status !== "LEAVE" && d.status !== "WEEKEND").length * targetDailyHours;
  const activeDay = selectedDayIndex !== null && selectedDayIndex >= 0 && days[selectedDayIndex] ? days[selectedDayIndex] : days[days.length - 1];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Summary Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-border/70">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-cyan-500/15 dark:bg-cyan-500/20 border border-cyan-500/30 dark:border-cyan-500/40 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <span>Weekly Productive Hours</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-bold">
                Sprint 32
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Biometric check-in logs &amp; focus blocks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <span className="text-[10px] text-muted-foreground block">Weekly Total</span>
            <span className="font-mono font-black text-sm text-foreground">
              <strong className="text-cyan-600 dark:text-cyan-400">{totalWeeklyHours.toFixed(1)}h</strong> / {totalWeeklyTarget.toFixed(0)}h
            </span>
          </div>

          <div className="h-6 w-px bg-border/60" />

          <div>
            <span className="text-[10px] text-muted-foreground block">Pace</span>
            <span className="font-mono font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {totalWeeklyHours >= totalWeeklyTarget ? "100% Target Met" : `${Math.round((totalWeeklyHours / (totalWeeklyTarget || 1)) * 100)}% on track`}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Bar Chart */}
      <div className="relative pt-6">
        {/* Benchmark 8h Target Dashed Line */}
        <div
          className="absolute left-0 right-0 border-t border-dashed border-muted-foreground/40 z-0 flex items-center justify-end pr-1"
          style={{
            bottom: `${(targetDailyHours / maxHours) * (height - 35)}px`,
          }}
        >
          <span className="text-[9px] font-mono text-muted-foreground bg-card/90 px-1 py-0.2 rounded -translate-y-2.5">
            Target ({targetDailyHours}h)
          </span>
        </div>

        <div className="grid grid-cols-5 gap-2 sm:gap-3 items-end" style={{ height: `${height}px` }}>
          {days.map((item, idx) => {
            const isSelected = selectedDayIndex === idx;
            const barHeightPct = Math.min(100, Math.max(8, (item.hours / maxHours) * 100));
            const isOvertime = item.hours > targetDailyHours;
            const isLeave = item.status === "LEAVE";
            const isUpcoming = item.status === "UPCOMING";

            let barColor = "from-cyan-500 to-blue-600";
            if (isLeave) barColor = "from-rose-500/50 to-pink-600/50";
            else if (isOvertime) barColor = "from-emerald-400 to-teal-500";
            else if (item.status === "WFH") barColor = "from-purple-500 to-indigo-600";
            else if (isUpcoming) barColor = "from-muted/40 to-muted/20";

            return (
              <div
                key={item.day}
                onClick={() => setSelectedDayIndex(idx)}
                className="flex flex-col items-center justify-end h-full group cursor-pointer"
              >
                {/* Hours Callout Pill */}
                <span
                  className={`text-[10px] font-mono font-bold mb-1.5 transition-all duration-150 ${
                    isSelected ? "text-cyan-600 dark:text-cyan-400 scale-110" : "text-muted-foreground opacity-80 group-hover:opacity-100"
                  }`}
                >
                  {isLeave ? "Leave" : isUpcoming ? "--" : `${item.hours}h`}
                </span>

                {/* Bar Pillar */}
                <div className="w-full max-w-[48px] h-[calc(100%-35px)] flex items-end justify-center rounded-2xl bg-muted/30 dark:bg-muted/20 p-1 relative">
                  <motion.div
                    className={`w-full rounded-xl bg-gradient-to-t ${barColor} transition-all duration-200 relative overflow-hidden ${
                      isSelected ? "ring-2 ring-cyan-500 dark:ring-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]" : "group-hover:brightness-110"
                    }`}
                    initial={{ height: 0 }}
                    animate={{ height: `${barHeightPct}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.08 }}
                  >
                    {/* Gloss highlight */}
                    <div className="absolute inset-x-0 top-0 h-2 bg-white/20 rounded-t-xl" />
                  </motion.div>
                </div>

                {/* Day Label */}
                <div className="mt-2 text-center">
                  <span
                    className={`text-xs font-bold block transition-colors ${
                      isSelected ? "text-foreground font-black" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    {item.day}
                  </span>
                  <span className="text-[9px] text-muted-foreground block">{item.date}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Breakdown Card */}
      {activeDay && (
        <motion.div
          key={activeDay.day}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-2xl bg-card/90 border border-border/80 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse" />
            <strong className="text-foreground">{activeDay.day}, {activeDay.date} Detail:</strong>
            <span className="text-muted-foreground">
              {activeDay.status === "PRESENT"
                ? "In Office (Biometric)"
                : activeDay.status === "WFH"
                ? "Remote (WFH)"
                : activeDay.status === "LEAVE"
                ? "Approved Leave"
                : "Scheduled"}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px]">
            {activeDay.checkIn && (
              <span className="text-muted-foreground">
                In: <strong className="text-foreground">{activeDay.checkIn}</strong>
              </span>
            )}
            {activeDay.checkOut && (
              <span className="text-muted-foreground">
                Out: <strong className="text-foreground">{activeDay.checkOut}</strong>
              </span>
            )}
            {activeDay.tasksDone !== undefined && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
                {activeDay.tasksDone} Tasks Complete
              </span>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
