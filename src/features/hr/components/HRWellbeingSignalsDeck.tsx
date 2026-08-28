"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import {
  HeartHandshake,
  CheckCircle2,
  MessageSquare,
  Users,
  AlertCircle,
} from "lucide-react";

interface CheckinItem {
  id: string;
  name: string;
  role: string;
  department: string;
  leadName: string;
  daysMissing: number;
  friendlyNote: string;
  status: "CHECKIN_NEEDED" | "CHECKED_IN";
}

interface TeamWorkloadItem {
  id: string;
  teamName: string;
  leadName: string;
  helpRequests: number;
  avgWaitDays: number;
  status: "HEAVY" | "BALANCED" | "HEALTHY";
  simpleSummary: string;
}

const INITIAL_CHECKINS: CheckinItem[] = [
  {
    id: "chk-1",
    name: "Priya QA",
    role: "QA Lead",
    department: "R & D",
    leadName: "David Director",
    daysMissing: 3,
    friendlyNote: "May need assistance with heavy testing deadlines or leave coverage.",
    status: "CHECKIN_NEEDED",
  },
  {
    id: "chk-2",
    name: "Ananya Sen",
    role: "Automation Engineer",
    department: "Engineering",
    leadName: "Alex Lead",
    daysMissing: 3,
    friendlyNote: "Check in to see if she needs extra team help or timeline adjustment.",
    status: "CHECKIN_NEEDED",
  },
];

const INITIAL_TEAMS: TeamWorkloadItem[] = [
  {
    id: "team-devops",
    teamName: "DevOps & Cloud Team",
    leadName: "Marcus Vance",
    helpRequests: 4,
    avgWaitDays: 2.4,
    status: "HEAVY",
    simpleSummary: "High workload during server migration. Extra team support recommended.",
  },
  {
    id: "team-dev",
    teamName: "Software Development Pod",
    leadName: "Alex Lead",
    helpRequests: 1,
    avgWaitDays: 0.8,
    status: "HEALTHY",
    simpleSummary: "Smooth pace. All team projects are currently on schedule.",
  },
  {
    id: "team-data",
    teamName: "Data Analytics Pod",
    leadName: "Vikram Rao",
    helpRequests: 2,
    avgWaitDays: 1.5,
    status: "BALANCED",
    simpleSummary: "Normal workload. Data processing tasks progressing steadily.",
  },
];

export function HRWellbeingSignalsDeck() {
  const [checkins, setCheckins] = useState<CheckinItem[]>(INITIAL_CHECKINS);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleMarkCheckedIn = (id: string, name: string) => {
    setCheckins((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "CHECKED_IN" } : c))
    );
    showToast(`Check-in message logged for ${name} 💬`);
  };

  const pendingCount = checkins.filter((c) => c.status === "CHECKIN_NEEDED").length;

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Simplified Header */}
      <Interactive3DCard className="p-6 border border-border/80 bg-gradient-to-r from-card/90 via-card/70 to-card/50 space-y-1.5">
        <div className="flex items-center gap-2">
          <Badge variant="brand" className="font-bold text-[10px] uppercase bg-emerald-500/15 border-emerald-500/30 text-emerald-300">
            <HeartHandshake className="h-3 w-3 mr-1 text-emerald-400" />
            Support &amp; Wellbeing
          </Badge>
        </div>

        <h3 className="text-xl sm:text-2xl font-black text-foreground">
          Team Wellbeing &amp; Workload Support
        </h3>

        <p className="text-xs sm:text-sm text-muted-foreground">
          Identify colleagues who may need a friendly check-in and keep track of overall team workloads.
        </p>
      </Interactive3DCard>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Staff Needing Check-In */}
        <Interactive3DCard className="p-6 border border-border/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-400" />
                Staff Needing a Check-In
              </h4>
              <p className="text-xs text-muted-foreground">
                Colleagues with unlogged updates who may need a hand.
              </p>
            </div>

            <Badge variant="outline" className="text-xs text-purple-300 border-purple-500/30 font-bold">
              {pendingCount} {pendingCount === 1 ? "Person" : "People"}
            </Badge>
          </div>

          <div className="space-y-3 pt-1">
            {checkins.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-2.5 hover:border-purple-500/40 transition-all text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-bold text-foreground block text-sm">{item.name}</span>
                    <span className="text-muted-foreground text-[11px]">{item.role} · {item.department}</span>
                  </div>

                  <Badge
                    variant="brand"
                    className={`text-[10px] font-bold ${
                      item.status === "CHECKIN_NEEDED"
                        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    }`}
                  >
                    {item.status === "CHECKIN_NEEDED" ? `${item.daysMissing} Days Inactive` : "✓ Checked In"}
                  </Badge>
                </div>

                <p className="text-xs text-foreground/80 leading-relaxed bg-muted/30 p-2.5 rounded-lg border border-border/40">
                  💡 {item.friendlyNote}
                </p>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">
                    Team Lead: <strong className="text-foreground">{item.leadName}</strong>
                  </span>

                  {item.status === "CHECKIN_NEEDED" ? (
                    <Button
                      variant="brand"
                      size="sm"
                      onClick={() => handleMarkCheckedIn(item.id, item.name)}
                      className="text-xs font-bold h-7.5 px-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white gap-1.5 cursor-pointer shadow-sm"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Send Check-In</span>
                    </Button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Check-In Logged</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Interactive3DCard>

        {/* Right: Team Workload Levels */}
        <Interactive3DCard className="p-6 border border-border/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-400" />
                Team Workload Status
              </h4>
              <p className="text-xs text-muted-foreground">
                Overview of team pressure and help requests.
              </p>
            </div>

            <Badge variant="outline" className="text-xs text-amber-300 border-amber-500/30 font-bold">
              3 Teams
            </Badge>
          </div>

          <div className="space-y-3 pt-1">
            {INITIAL_TEAMS.map((team) => (
              <div
                key={team.id}
                className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-2.5 hover:border-amber-500/40 transition-all text-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-foreground block text-sm">{team.teamName}</span>
                    <span className="text-[11px] text-muted-foreground">Lead: {team.leadName}</span>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold ${
                      team.status === "HEAVY"
                        ? "border-rose-500/40 text-rose-400 bg-rose-500/10"
                        : team.status === "BALANCED"
                        ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                        : "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                    }`}
                  >
                    {team.status === "HEAVY"
                      ? "⚠️ Heavy Workload"
                      : team.status === "BALANCED"
                      ? "🟡 Moderate Workload"
                      : "🟢 Healthy Pace"}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-mono">
                  <span>Help Requests: <strong className="text-foreground">{team.helpRequests} pending</strong></span>
                  <span>·</span>
                  <span>Avg Wait: <strong className="text-cyan-300">{team.avgWaitDays} days</strong></span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed pt-1.5 border-t border-border/50">
                  <strong className="text-foreground">Note:</strong> {team.simpleSummary}
                </p>
              </div>
            ))}
          </div>
        </Interactive3DCard>
      </div>
    </div>
  );
}
