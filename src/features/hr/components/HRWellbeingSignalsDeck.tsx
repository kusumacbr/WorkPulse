"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import {
  HeartHandshake,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";

interface WellbeingCheckinFlag {
  id: string;
  employeeName: string;
  department: string;
  designation: string;
  leadName: string;
  consecutiveDaysMissing: number;
  lastLoggedDate: string;
  suggestedAction: string;
  status: "CHECKIN_NEEDED" | "CHECKED_IN";
}

interface PodWorkloadImbalance {
  podId: string;
  podName: string;
  leadName: string;
  activeBlockersCount: number;
  avgResolutionDays: number;
  workloadHealth: "HIGH_LOAD" | "BALANCED" | "HEALTHY";
  supportiveRecommendation: string;
}

const INITIAL_CHECKIN_FLAGS: WellbeingCheckinFlag[] = [
  {
    id: "chk-1",
    employeeName: "Priya QA",
    department: "R & D",
    designation: "QA & Automation Lead",
    leadName: "David Director",
    consecutiveDaysMissing: 3,
    lastLoggedDate: "Aug 18, 2026",
    suggestedAction: "Check in to see if CI/CD regression test executions or deep-focus work are delaying daily logs.",
    status: "CHECKIN_NEEDED",
  },
  {
    id: "chk-2",
    employeeName: "Ananya Sen",
    department: "Service Providers (ConfigTap)",
    designation: "Automation & Embedded QA Engineer",
    leadName: "Alex Lead",
    consecutiveDaysMissing: 3,
    lastLoggedDate: "Aug 18, 2026",
    suggestedAction: "Confirm if ECU Autosar conformity test vector preparation requires temporary workload adjustment.",
    status: "CHECKIN_NEEDED",
  },
];

const INITIAL_POD_WORKLOADS: PodWorkloadImbalance[] = [
  {
    podId: "pod-devops",
    podName: "Devops & Cloud Infra",
    leadName: "Marcus Vance",
    activeBlockersCount: 4,
    avgResolutionDays: 2.4,
    workloadHealth: "HIGH_LOAD",
    supportiveRecommendation: "High blocker density due to multi-cloud migration. HR recommended temporary cross-pod SRE pairing.",
  },
  {
    podId: "pod-dev",
    podName: "Development Pod",
    leadName: "Alex Lead",
    activeBlockersCount: 1,
    avgResolutionDays: 0.8,
    workloadHealth: "HEALTHY",
    supportiveRecommendation: "Stable delivery cadence. All architectural deliverables tracking within sprint budget.",
  },
  {
    podId: "pod-data",
    podName: "Data processing Pod",
    leadName: "Vikram Rao",
    activeBlockersCount: 2,
    avgResolutionDays: 1.5,
    workloadHealth: "BALANCED",
    supportiveRecommendation: "Batch ETL telemetry pipeline memory optimization in progress.",
  },
];

export function HRWellbeingSignalsDeck() {
  const [checkins, setCheckins] = useState<WellbeingCheckinFlag[]>(INITIAL_CHECKIN_FLAGS);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleMarkCheckedIn = (id: string, name: string) => {
    setCheckins((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "CHECKED_IN" } : c))
    );
    showToast(`Supportive 1-on-1 check-in logged for ${name}. 💬`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Non-Surveillance Principles Banner */}
      <Interactive3DCard className="p-6 border border-emerald-500/30 bg-gradient-to-r from-card/80 via-card/60 to-emerald-500/10 space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="brand" className="font-bold text-[10px] uppercase bg-emerald-500/15 border-emerald-500/30 text-emerald-300">
            <HeartHandshake className="h-3 w-3 mr-1 text-emerald-400" />
            Supportive Employee Wellbeing Signals
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            Pattern-Level Only · Zero Surveillance · Proactive Care
          </span>
        </div>

        <h3 className="text-xl font-bold text-foreground">
          Employee Wellbeing & Pod Workload Balance
        </h3>

        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          These signals surface gentle indicators where team members or pods might need extra support or workload balancing — never used as a surveillance or performance blacklist.
        </p>
      </Interactive3DCard>

      {/* Grid: Left (Might Need Check-In), Right (Pod Workload Imbalance) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Might Need Check-In */}
        <Interactive3DCard className="p-6 border border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-purple-400" />
                Team Members Who Might Need a Check-In
              </h4>
              <p className="text-xs text-muted-foreground">
                Flags colleagues with 3+ consecutive unlogged updates for proactive wellbeing outreach.
              </p>
            </div>
            <Badge variant="outline" className="text-xs text-purple-300 border-purple-500/30">
              {checkins.filter((c) => c.status === "CHECKIN_NEEDED").length} Gentle Flags
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            {checkins.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-2.5 hover:border-purple-500/40 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-foreground block text-sm">{item.employeeName}</span>
                    <span className="text-muted-foreground">{item.designation} · {item.department}</span>
                  </div>
                  <Badge
                    variant="brand"
                    className={`text-[9px] font-bold ${
                      item.status === "CHECKIN_NEEDED"
                        ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                        : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    }`}
                  >
                    {item.status === "CHECKIN_NEEDED" ? `${item.consecutiveDaysMissing} Days Unlogged` : "✓ Checked In"}
                  </Badge>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Supportive Context:</strong> {item.suggestedAction}
                </p>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    Lead: {item.leadName} · Last Logged: {item.lastLoggedDate}
                  </span>

                  {item.status === "CHECKIN_NEEDED" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkCheckedIn(item.id, item.employeeName)}
                      className="text-xs font-semibold h-7 border-purple-500/30 text-purple-300 hover:bg-purple-500/10 gap-1"
                    >
                      <MessageSquare className="h-3 w-3" />
                      <span>Log Check-in Sync</span>
                    </Button>
                  ) : (
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Sync Completed</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Interactive3DCard>

        {/* Right: Pod Workload & Escalated Blocker Radar */}
        <Interactive3DCard className="p-6 border border-amber-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                Pod Workload & Blocker Density Radar
              </h4>
              <p className="text-xs text-muted-foreground">
                Surfaces pods facing high blocker volume so HR can assist leads in workload rebalancing.
              </p>
            </div>
            <Badge variant="outline" className="text-xs text-amber-300 border-amber-500/30">
              3 Active Pods
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            {INITIAL_POD_WORKLOADS.map((pod) => (
              <div
                key={pod.podId}
                className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-foreground block text-sm">{pod.podName}</span>
                    <span className="text-[11px] text-muted-foreground">Designated Lead: {pod.leadName}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-bold ${
                      pod.workloadHealth === "HIGH_LOAD"
                        ? "border-rose-500/40 text-rose-400 bg-rose-500/10"
                        : pod.workloadHealth === "BALANCED"
                        ? "border-amber-500/40 text-amber-400"
                        : "border-emerald-500/40 text-emerald-400"
                    }`}
                  >
                    {pod.workloadHealth === "HIGH_LOAD" ? "⚠️ High Blocker Density" : pod.workloadHealth}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-mono">
                  <span>Open Blockers: <strong className="text-foreground">{pod.activeBlockersCount}</strong></span>
                  <span>Avg Resolution: <strong className="text-cyan-300">{pod.avgResolutionDays} days</strong></span>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed pt-1 border-t border-border/50">
                  <strong className="text-foreground">Recommendation:</strong> {pod.supportiveRecommendation}
                </p>
              </div>
            ))}
          </div>
        </Interactive3DCard>
      </div>
    </div>
  );
}
