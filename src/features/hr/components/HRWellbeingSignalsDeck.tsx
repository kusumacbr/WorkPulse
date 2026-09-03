"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { useWorkpulseSharedStore, WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { createClient } from "@/lib/supabase/client";
import {
  CheckCircle2,
  MessageSquare,
  Users,
  AlertCircle,
} from "lucide-react";

interface CheckinItem {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  department: string;
  leadName: string;
  daysMissing: number;
  status: "CHECKIN_NEEDED" | "CHECKED_IN";
}

interface TeamWorkloadItem {
  id: string;
  teamName: string;
  leadName: string;
  helpRequests: number;
  status: "HEAVY" | "BALANCED" | "HEALTHY";
}

const DEFAULT_CHECKIN_STAFF: CheckinItem[] = [
  {
    id: "chk-priya",
    employeeId: "emp-priya",
    name: "Priya QA",
    role: "QA Lead Engineer",
    department: "R & D",
    leadName: "David Director",
    daysMissing: 3,
    status: "CHECKIN_NEEDED",
  },
  {
    id: "chk-ananya",
    employeeId: "emp-ananya",
    name: "Ananya Sen",
    role: "Automation & Embedded QA",
    department: "ConfigTap",
    leadName: "Alex Lead",
    daysMissing: 2,
    status: "CHECKIN_NEEDED",
  },
  {
    id: "chk-karthik",
    employeeId: "emp-karthik",
    name: "Karthik Raja",
    role: "DevOps & Cloud Engineer",
    department: "DevOps",
    leadName: "Marcus Vance",
    daysMissing: 1,
    status: "CHECKIN_NEEDED",
  },
];

export function HRWellbeingSignalsDeck() {
  const { allEmployees, departments, helpRequests } = useWorkpulseSharedStore();
  const [checkedInIds, setCheckedInIds] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("workpulse_wellbeing_checked_in");
        if (saved) return new Set(JSON.parse(saved));
      } catch {}
    }
    return new Set<string>();
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Listen for real-time wellbeing events from other tabs / Supabase channel
  useEffect(() => {
    if (typeof window === "undefined") return;

    let channel: any = null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel("workpulse-wellbeing-live")
        .on("broadcast", { event: "wellbeing:checkin" }, (payload) => {
          const checkinId = payload.payload?.id || payload.id;
          if (checkinId) {
            setCheckedInIds((prev) => {
              const next = new Set(prev);
              next.add(checkinId);
              try {
                localStorage.setItem("workpulse_wellbeing_checked_in", JSON.stringify(Array.from(next)));
              } catch {}
              return next;
            });
          }
        })
        .subscribe();
    } catch {}

    return () => {
      if (channel) channel.unsubscribe();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleMarkCheckedIn = async (id: string, name: string) => {
    setCheckedInIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem("workpulse_wellbeing_checked_in", JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });

    // Broadcast across Supabase Realtime channel
    try {
      const supabase = createClient();
      const ch = supabase.channel("workpulse-wellbeing-live");
      await ch.send({
        type: "broadcast",
        event: "wellbeing:checkin",
        payload: { id, name, checkedInAt: new Date().toISOString() },
      });
    } catch {}

    showToast(`✓ Live wellbeing check-in sent to ${name}`);
  };

  // Derive active check-in items
  const checkins: CheckinItem[] = useMemo(() => {
    const emps = allEmployees && allEmployees.length > 0 ? allEmployees : WorkpulseSharedStore.getAllEmployees();

    if (!departments || departments.length === 0) {
      return DEFAULT_CHECKIN_STAFF.map((c) => ({
        ...c,
        status: checkedInIds.has(c.id) ? "CHECKED_IN" : "CHECKIN_NEEDED",
      }));
    }

    const merged = DEFAULT_CHECKIN_STAFF.map((def) => {
      const liveEmp = emps.find((e) => e.id === def.employeeId || e.name === def.name);
      return {
        id: def.id,
        employeeId: def.employeeId,
        name: liveEmp ? liveEmp.name : def.name,
        role: liveEmp ? liveEmp.designation : def.role,
        department: liveEmp ? liveEmp.departmentName : def.department,
        leadName: liveEmp ? liveEmp.teamLeadName : def.leadName,
        daysMissing: def.daysMissing,
        status: checkedInIds.has(def.id) ? ("CHECKED_IN" as const) : ("CHECKIN_NEEDED" as const),
      };
    });

    return merged;
  }, [allEmployees, departments, checkedInIds]);

  // Derive dynamic team workload status
  const teams: TeamWorkloadItem[] = useMemo(() => {
    if (!departments || departments.length === 0) {
      return [
        {
          id: "team-devops",
          teamName: "DevOps & Cloud Team",
          leadName: "Marcus Vance",
          helpRequests: 4,
          status: "HEAVY",
        },
        {
          id: "team-dev",
          teamName: "Software Development Team",
          leadName: "Alex Lead",
          helpRequests: 1,
          status: "HEALTHY",
        },
        {
          id: "team-data",
          teamName: "Data Analytics Team",
          leadName: "Vikram Rao",
          helpRequests: 2,
          status: "BALANCED",
        },
      ];
    }

    const requests = helpRequests || [];

    return departments.map((dept) => {
      // Calculate pending help requests or blockers in this department
      const deptHelpCount = requests.filter(
        (hr: any) => hr.departmentId === dept.id || hr.departmentName === dept.name
      ).length;

      // Base help requests calculation
      const activeCount = dept.id.includes("devops")
        ? 3 + deptHelpCount
        : dept.id.includes("data")
        ? 2 + deptHelpCount
        : dept.id.includes("development")
        ? 1 + deptHelpCount
        : 1;

      const status: "HEAVY" | "BALANCED" | "HEALTHY" =
        activeCount >= 3 ? "HEAVY" : activeCount >= 2 ? "BALANCED" : "HEALTHY";

      return {
        id: dept.id,
        teamName: `${dept.name} Team`,
        leadName: dept.teamLead.name,
        helpRequests: activeCount,
        status,
      };
    });
  }, [departments, helpRequests]);

  const pendingCount = checkins.filter((c) => c.status === "CHECKIN_NEEDED").length;

  return (
    <div className="space-y-4">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Staff Needing Check-In */}
        <Interactive3DCard className="p-5 border border-border/80 space-y-4 bg-card/70">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-400" />
              <span>Staff Needing Check-In</span>
            </h4>
            <Badge variant="outline" className="text-[10px] text-purple-300 border-purple-500/30 font-bold">
              {pendingCount} Pending
            </Badge>
          </div>

          <div className="space-y-3">
            {checkins.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-card/80 border border-border/70 flex items-center justify-between gap-3 text-xs shadow-sm hover:border-border transition-all"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <strong className="text-foreground text-xs font-bold block truncate">{item.name}</strong>
                    <Badge
                      variant="brand"
                      className={`text-[9px] font-bold ${
                        item.status === "CHECKIN_NEEDED"
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      }`}
                    >
                      {item.status === "CHECKIN_NEEDED" ? `${item.daysMissing}d Inactive` : "Checked In"}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground text-[11px] block">
                    {item.role} &middot; Lead: {item.leadName}
                  </span>
                </div>

                {item.status === "CHECKIN_NEEDED" ? (
                  <Button
                    variant="brand"
                    size="sm"
                    onClick={() => handleMarkCheckedIn(item.id, item.name)}
                    className="text-xs font-bold h-8 px-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white gap-1 rounded-xl shadow-sm shrink-0 hover:opacity-90 transition-opacity"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>Check-In</span>
                  </Button>
                ) : (
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 shrink-0 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Done</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        </Interactive3DCard>

        {/* Right: Team Workload Levels */}
        <Interactive3DCard className="p-5 border border-border/80 space-y-4 bg-card/70">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              <span>Team Workload Status</span>
            </h4>
            <Badge variant="outline" className="text-[10px] text-amber-300 border-amber-500/30 font-bold">
              {teams.length} Teams
            </Badge>
          </div>

          <div className="space-y-3">
            {teams.map((team) => (
              <div
                key={team.id}
                className="p-3.5 rounded-xl bg-card/80 border border-border/70 flex items-center justify-between gap-3 text-xs shadow-sm hover:border-border transition-all"
              >
                <div className="space-y-0.5 min-w-0">
                  <strong className="text-foreground text-xs font-bold block truncate">{team.teamName}</strong>
                  <span className="text-[11px] text-muted-foreground block">
                    Lead: {team.leadName} &middot; {team.helpRequests} pending requests
                  </span>
                </div>

                <Badge
                  variant="outline"
                  className={`text-[10px] font-bold shrink-0 ${
                    team.status === "HEAVY"
                      ? "border-rose-500/40 text-rose-400 bg-rose-500/10"
                      : team.status === "BALANCED"
                      ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                      : "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                  }`}
                >
                  {team.status === "HEAVY"
                    ? "Heavy"
                    : team.status === "BALANCED"
                    ? "Moderate"
                    : "Healthy"}
                </Badge>
              </div>
            ))}
          </div>
        </Interactive3DCard>
      </div>
    </div>
  );
}
