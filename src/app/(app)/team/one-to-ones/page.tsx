"use client";

import React from "react";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users2, Clock, Plus } from "lucide-react";

export default function TeamOneToOnesPage() {
  const meetings = [
    {
      id: "121-team-1",
      employeeName: "Sarah Dev",
      designation: "Senior Backend Engineer",
      scheduledAt: "Today at 03:30 PM",
      duration: "30 Mins",
      status: "SCHEDULED",
      agenda: "Sprint 34 deliverables, biometric edge connector architecture, and Q4 career growth",
    },
    {
      id: "121-team-2",
      employeeName: "John UI",
      designation: "Frontend Engineer",
      scheduledAt: "Tomorrow at 11:00 AM",
      duration: "30 Mins",
      status: "SCHEDULED",
      agenda: "Design tokens, glassmorphic layout updates, and peer review progress",
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Interactive3DCard className="p-6 md:p-8 border border-purple-500/30 bg-gradient-to-r from-card/90 via-card/70 to-purple-500/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="bg-purple-500/15 border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase">
                  <Users2 className="h-3 w-3 mr-1 text-purple-400" />
                  Manager Coaching Roster
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">1-on-1 Continuous Sync</span>
              </div>
              <h2 className="text-2xl font-black text-foreground">Direct Reports 1-on-1 Coaching Desk</h2>
              <p className="text-xs text-muted-foreground">
                Manage bi-weekly 1-on-1 sessions, document private manager observations, track action item completion, and ensure transparent employee alignment.
              </p>
            </div>

            <Button size="sm" variant="brand" className="text-xs h-9 px-4 bg-purple-500 hover:bg-purple-600 text-white gap-1.5 shrink-0 shadow-lg">
              <Plus className="h-4 w-4" />
              <span>Schedule 1-on-1</span>
            </Button>
          </div>
        </Interactive3DCard>

        <div className="space-y-3">
          {meetings.map((m) => (
            <Interactive3DCard key={m.id} className="p-5 border border-border/80 bg-card/60 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <strong className="text-sm font-bold text-foreground">{m.employeeName}</strong>
                  <p className="text-xs text-cyan-300 font-mono">{m.designation}</p>
                  <span className="text-xs text-muted-foreground block pt-1">{m.agenda}</span>
                </div>

                <div className="text-right shrink-0 space-y-1">
                  <Badge variant="outline" className="text-[10px] text-purple-300 border-purple-500/30 font-mono">
                    <Clock className="h-3 w-3 mr-1" /> {m.scheduledAt}
                  </Badge>
                </div>
              </div>
            </Interactive3DCard>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
