"use client";

import React from "react";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { UserCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export default function AdminManagerAssignmentsPage() {
  const { allEmployees } = useWorkpulseSharedStore();

  const assignments = allEmployees.map((emp) => ({
    id: `asg-${emp.id}`,
    employeeName: emp.name,
    designation: emp.designation,
    department: emp.departmentName,
    primaryManager: emp.teamLeadName || "David Director (SuperAdmin)",
    secondaryManager: "None",
    effectiveFrom: emp.joiningDate || "August 01, 2025",
  }));

  return (
    <PageTransition>
      <div className="space-y-6 max-w-5xl mx-auto">
        <Link href="/admin" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Root Admin Console</span>
        </Link>

        <Interactive3DCard className="p-6 md:p-8 border border-red-500/30 bg-gradient-to-r from-card/90 via-card/70 to-red-500/10 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="bg-red-500/15 border-red-500/30 text-red-300 text-[10px] font-bold uppercase">
              <UserCheck className="h-3 w-3 mr-1 text-red-400" />
              Manager Reporting Hierarchy (Section 2.1 & 5.1 Specification)
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">Immutable Audit Trail</span>
          </div>
          <h2 className="text-2xl font-black text-foreground">Reporting Manager Assignments</h2>
          <p className="text-xs text-muted-foreground">
            Configure line managers and dotted-line managers with effective date ranges. All historical assignments are preserved in immutable audit logs.
          </p>
        </Interactive3DCard>

        <div className="space-y-3">
          {assignments.map((asg) => (
            <Interactive3DCard key={asg.id} className="p-4 rounded-xl border border-border/80 bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <strong className="text-foreground text-sm block">{asg.employeeName}</strong>
                <span className="text-cyan-300 font-mono">{asg.designation}</span>
              </div>

              <div className="space-y-0.5 text-right">
                <span className="text-muted-foreground block">Reporting Manager: <strong className="text-foreground">{asg.primaryManager}</strong></span>
                <span className="text-[11px] text-muted-foreground font-mono">Effective: {asg.effectiveFrom}</span>
              </div>
            </Interactive3DCard>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
