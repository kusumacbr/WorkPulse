"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { useCurrentUser } from "@/components/layout/UserContext";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { CheckSquare, Users, ShieldCheck } from "lucide-react";

// Lazy-load heavy task managers (136KB + 128KB + 100KB) — only the active role's manager loads
const SimpleTaskManager = dynamic(
  () => import("@/features/workdays/components/SimpleTaskManager").then((m) => ({ default: m.SimpleTaskManager })),
  { ssr: false, loading: () => <div className="space-y-3 animate-pulse"><div className="h-14 rounded-2xl bg-card/40 border border-border/40" /><div className="h-14 rounded-2xl bg-card/40 border border-border/40" /><div className="h-14 rounded-2xl bg-card/40 border border-border/40" /></div> }
);
const LeadTaskManager = dynamic(
  () => import("@/features/workdays/components/LeadTaskManager").then((m) => ({ default: m.LeadTaskManager })),
  { ssr: false, loading: () => <div className="space-y-3 animate-pulse"><div className="h-14 rounded-2xl bg-card/40 border border-border/40" /><div className="h-14 rounded-2xl bg-card/40 border border-border/40" /><div className="h-14 rounded-2xl bg-card/40 border border-border/40" /></div> }
);
const HRTaskManager = dynamic(
  () => import("@/features/workdays/components/HRTaskManager").then((m) => ({ default: m.HRTaskManager })),
  { ssr: false, loading: () => <div className="space-y-3 animate-pulse"><div className="h-14 rounded-2xl bg-card/40 border border-border/40" /><div className="h-14 rounded-2xl bg-card/40 border border-border/40" /><div className="h-14 rounded-2xl bg-card/40 border border-border/40" /></div> }
);

export default function MyWorkPage() {
  const user = useCurrentUser();
  const { allEmployees } = useWorkpulseSharedStore();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isHR =
    user.roles.includes("HR") ||
    user.primaryRole === "HR" ||
    user.userEmail.toLowerCase().includes("hr");

  const isLead =
    !isHR &&
    (user.roles.includes("MANAGER") ||
      user.primaryRole === "MANAGER" ||
      user.userEmail.toLowerCase().includes("lead"));

  const teamMemberCount =
    allEmployees.filter(
      (e) =>
        e.id !== "lead-alex" &&
        !e.email?.toLowerCase().includes("lead") &&
        (e.teamLeadId === "lead-alex" ||
          e.departmentId === "dept-development" ||
          e.departmentName?.toLowerCase().includes("development"))
    ).length || 2;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Simple & Clean Header */}
        <Interactive3DCard className="p-4 sm:p-6 border border-slate-200/90 dark:border-border/80 bg-gradient-to-r from-white via-slate-50/50 to-white dark:from-card/90 dark:via-card/70 dark:to-card/50 shadow-sm rounded-2xl sm:rounded-3xl">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border shadow-xs ${
                isHR
                  ? "bg-pink-100/90 dark:bg-pink-500/15 text-pink-800 dark:text-pink-300 border-pink-200 dark:border-pink-500/30"
                  : isLead
                  ? "bg-indigo-100/90 dark:bg-indigo-500/15 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30"
                  : "bg-cyan-100/90 dark:bg-cyan-500/15 text-cyan-800 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30"
              }`}>
                {isHR ? (
                  <>
                    <ShieldCheck className="h-3 w-3 mr-1 text-pink-600 dark:text-pink-400" />
                    <span>People &amp; Staff Operations</span>
                  </>
                ) : isLead ? (
                  <>
                    <Users className="h-3 w-3 mr-1 text-indigo-600 dark:text-indigo-400" />
                    <span>Team Work &amp; Daily Updates</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-3 w-3 mr-1 text-cyan-600 dark:text-cyan-400" />
                    <span>Workplace Tasks</span>
                  </>
                )}
              </span>
              {isHR ? (
                <span className="text-[11px] text-slate-500 dark:text-muted-foreground font-medium" suppressHydrationWarning>
                  {mounted ? allEmployees.length : 11} Total Staff
                </span>
              ) : isLead ? (
                <span className="text-[11px] text-slate-500 dark:text-muted-foreground font-medium" suppressHydrationWarning>
                  Development Team · {mounted ? teamMemberCount : 4} Direct Reports
                </span>
              ) : null}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-foreground">
              {isHR
                ? "Staff Directory & Team Operations"
                : isLead
                ? "Team Tasks & Daily Updates"
                : "My Tasks"}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-muted-foreground leading-relaxed">
              {isHR
                ? "Search employee profiles, onboard new staff, track probation periods, and view department teams."
                : isLead
                ? "Review your team's daily plans, send evening feedback, assign work, and track personal priorities."
                : "Organize your daily priorities, track progress, and check off completed work."}
            </p>
          </div>
        </Interactive3DCard>

        {/* HR vs Lead vs Member Task Manager */}
        {isHR ? (
          <HRTaskManager />
        ) : isLead ? (
          <LeadTaskManager />
        ) : (
          <SimpleTaskManager />
        )}
      </div>
    </PageTransition>
  );
}
