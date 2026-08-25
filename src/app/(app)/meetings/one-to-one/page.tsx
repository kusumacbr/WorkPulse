"use client";

import React, { useState } from "react";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users2,
  Clock,
  CheckCircle2,
  Check,
} from "lucide-react";

export default function OneToOneMeetingPage() {
  const [acknowledged, setAcknowledged] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const meeting = {
    id: "121-sprint34",
    managerName: "Alex Lead (Engineering Manager)",
    employeeName: "Sara Dev",
    scheduledAt: "Today at 03:30 PM",
    duration: "30 Mins",
    agenda: "Sprint 34 deliverables, biometric edge connector architecture, and Q4 career growth",
    sharedNotes: "Agreed on prioritizing Vitest automated test suites for all 91 specification acceptance criteria. Sara will also lead the upcoming technical showcase.",
    actionItems: [
      { id: "act-1", title: "Complete biometric edge connector offline queue tests", done: true },
      { id: "act-2", title: "Schedule mentoring sync with Rohit Sharma for frontend state alignment", done: false },
    ],
  };

  const handleAcknowledge = () => {
    setAcknowledged(true);
    setToastMsg("Shared meeting notes acknowledged ✓");
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        {toastMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-bold">{toastMsg}</span>
          </div>
        )}

        <Interactive3DCard className="p-6 md:p-8 border border-purple-500/30 bg-gradient-to-r from-card/90 via-card/70 to-purple-500/10 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="bg-purple-500/15 border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase">
                <Users2 className="h-3 w-3 mr-1 text-purple-400" />
                1-on-1 Coaching & Alignment
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Bi-Weekly Sync</span>
            </div>
            <h2 className="text-2xl font-black text-foreground">1-on-1 Continuous Feedback & Sync</h2>
            <p className="text-xs text-muted-foreground">
              Review discussion agendas, shared action items, and acknowledge meeting notes. Private coaching observations are strictly isolated.
            </p>
          </div>
        </Interactive3DCard>

        {/* Active Meeting Card */}
        <Interactive3DCard className="p-6 border border-border/80 bg-card/60 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <strong className="text-base font-bold text-foreground">1-on-1 with {meeting.managerName}</strong>
                <Badge variant="outline" className="text-[10px] text-purple-300 border-purple-500/30 font-mono">
                  {meeting.duration}
                </Badge>
              </div>
              <span className="text-xs text-cyan-300 font-mono flex items-center gap-1">
                <Clock className="h-3 w-3" /> {meeting.scheduledAt}
              </span>
            </div>

            {acknowledged ? (
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 flex items-center gap-1 shrink-0">
                <CheckCircle2 className="h-3 w-3" />
                <span>Notes Acknowledged</span>
              </Badge>
            ) : (
              <Button
                size="sm"
                variant="brand"
                onClick={handleAcknowledge}
                className="text-xs h-8 px-3 bg-purple-500 hover:bg-purple-600 text-white gap-1.5 shrink-0"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Acknowledge Notes</span>
              </Button>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <strong className="text-muted-foreground block">Discussion Agenda</strong>
            <p className="p-3 rounded-xl bg-card border border-border/60 text-foreground leading-relaxed">
              {meeting.agenda}
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <strong className="text-muted-foreground block">Agreed Shared Notes & Outcomes</strong>
            <p className="p-3 rounded-xl bg-card border border-border/60 text-foreground leading-relaxed">
              {meeting.sharedNotes}
            </p>
          </div>

          {/* Action Items */}
          <div className="space-y-2 text-xs pt-2 border-t border-border/40">
            <strong className="text-foreground block">Assigned Action Items</strong>
            <div className="space-y-2">
              {meeting.actionItems.map((item) => (
                <div key={item.id} className="p-2.5 rounded-xl bg-muted/20 border border-border/50 flex items-center gap-2.5">
                  <CheckCircle2 className={`h-4 w-4 ${item.done ? "text-emerald-400" : "text-muted-foreground"}`} />
                  <span className={`${item.done ? "line-through text-muted-foreground" : "text-foreground font-medium"}`}>
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Interactive3DCard>
      </div>
    </PageTransition>
  );
}
