"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { SimpleTaskManager } from "@/features/workdays/components/SimpleTaskManager";
import { LeadTaskManager } from "@/features/workdays/components/LeadTaskManager";
import { HRTaskManager } from "@/features/workdays/components/HRTaskManager";
import { useCurrentUser } from "@/components/layout/UserContext";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { CheckSquare, Users, ShieldCheck } from "lucide-react";

export default function MyWorkPage() {
  const user = useCurrentUser();
  const { allEmployees } = useWorkpulseSharedStore();

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
    ).length || 4;

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Simple & Clean Header */}
        <Interactive3DCard className="p-6 border border-border/80 bg-gradient-to-r from-card/90 via-card/70 to-card/50">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className={`font-bold text-[10px] uppercase ${isHR ? "bg-pink-500/15 text-pink-300 border-pink-500/30" : ""}`}>
                {isHR ? (
                  <>
                    <ShieldCheck className="h-3 w-3 mr-1 text-pink-400" />
                    <span>People &amp; Staff Operations</span>
                  </>
                ) : isLead ? (
                  <>
                    <Users className="h-3 w-3 mr-1 text-indigo-400" />
                    <span>Team Work &amp; Daily Updates</span>
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-3 w-3 mr-1 text-cyan-400" />
                    <span>Workplace Tasks</span>
                  </>
                )}
              </Badge>
              {isHR ? (
                <span className="text-[11px] text-muted-foreground font-medium">
                  {allEmployees.length || 19} Total Staff
                </span>
              ) : isLead ? (
                <span className="text-[11px] text-muted-foreground font-medium">
                  Development Team · {teamMemberCount} Direct Reports
                </span>
              ) : null}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {isHR
                ? "Staff Directory & Team Operations"
                : isLead
                ? "Team Tasks & Daily Updates"
                : "My Tasks"}
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
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
