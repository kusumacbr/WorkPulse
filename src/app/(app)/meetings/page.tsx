"use client";

import React, { useState } from "react";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { MetricTile3D } from "@/components/3d/MetricTile3D";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/components/layout/UserContext";
import {
  Video,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
} from "lucide-react";

interface MeetingItem {
  id: string;
  title: string;
  type: "ONE_ON_ONE" | "SPRINT_SYNC" | "ARCHITECTURE_REVIEW" | "ALL_HANDS";
  withPerson: string;
  role: string;
  scheduledTime: string;
  durationMinutes: number;
  agenda: string;
  status: "UPCOMING" | "IN_PROGRESS" | "COMPLETED";
  actionItems: { id: string; text: string; done: boolean }[];
}

export default function MeetingsPage() {
  const user = useCurrentUser();

  const [meetings, setMeetings] = useState<MeetingItem[]>([
    {
      id: "meet-1",
      title: "Bi-Weekly 1-on-1 Coaching & Growth Sync",
      type: "ONE_ON_ONE",
      withPerson: "Alex Lead",
      role: "Engineering Manager · Platform Pod",
      scheduledTime: "Today at 03:30 PM",
      durationMinutes: 30,
      agenda: "Review Sprint 34 deliverables, discuss Q3 technical growth goals, and align on architecture refactoring.",
      status: "UPCOMING",
      actionItems: [
        { id: "act-1", text: "Finalize PR reviews on Stage-2 Leave authorization engine", done: true },
        { id: "act-2", text: "Draft technical proposal for Redis event pub/sub caching", done: false },
      ],
    },
    {
      id: "meet-2",
      title: "Sprint 34 Mid-Cycle Alignment & Blocker Scrub",
      type: "SPRINT_SYNC",
      withPerson: "Platform Core Team",
      role: "Engineering Pod",
      scheduledTime: "Tomorrow at 11:00 AM",
      durationMinutes: 45,
      agenda: "Review daily SOD carryover trends, check in on biometric sync performance, and scrub team blockers.",
      status: "UPCOMING",
      actionItems: [
        { id: "act-3", text: "Verify biometric hardware terminal duplicate punch key hashing", done: false },
      ],
    },
    {
      id: "meet-3",
      title: "Q3 System Architecture & Microservice Review",
      type: "ARCHITECTURE_REVIEW",
      withPerson: "David Director",
      role: "VP Engineering & SuperAdmin",
      scheduledTime: "Friday, Aug 28 at 02:00 PM",
      durationMinutes: 60,
      agenda: "Demonstrate WorkPulse real-time SSE streaming architecture, multi-tab sync, and zero-downtime store persistence.",
      status: "UPCOMING",
      actionItems: [
        { id: "act-4", text: "Prepare live interactive demo with multi-tab role switching", done: true },
      ],
    },
  ]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const toggleActionItem = (meetingId: string, actionId: string) => {
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id !== meetingId) return m;
        return {
          ...m,
          actionItems: m.actionItems.map((a) =>
            a.id === actionId ? { ...a, done: !a.done } : a
          ),
        };
      })
    );
  };

  const handleJoinMeeting = (title: string) => {
    setToastMsg(`Launching secure encrypted meeting room for: "${title}" 🎥`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Toast Alert */}
        {toastMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-bold">{toastMsg}</span>
          </div>
        )}

        {/* Hero Banner */}
        <Interactive3DCard className="p-6 md:p-8 border border-purple-500/30 bg-gradient-to-r from-card/90 via-card/70 to-purple-500/10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="bg-purple-500/15 border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase">
                  <Video className="h-3 w-3 mr-1 text-purple-400" />
                  Collaboration & Alignment
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {user.userName} · {user.primaryRole}
                </span>
              </div>
              <h2 className="text-2xl font-black text-foreground">1-on-1s, Standups & Team Syncs</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Connect with reporting managers, conduct private 1-on-1 career coaching syncs, and track sprint deliverables with structured meeting action items.
              </p>
            </div>

            <Button
              variant="brand"
              size="sm"
              onClick={() => handleJoinMeeting("Instant Pod Room")}
              className="text-xs h-9 px-4 font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white gap-1.5 shadow-md shrink-0"
            >
              <Video className="h-3.5 w-3.5" />
              <span>Start Instant Pod Sync</span>
            </Button>
          </div>
        </Interactive3DCard>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricTile3D
            title="Next 1-on-1 Sync"
            value="Today 03:30 PM"
            subtitle="With Alex Lead (Manager)"
            icon={Clock}
            change="In 2 Hours"
            changePositive={true}
            badgeText="Scheduled"
            accent="purple"
          />

          <MetricTile3D
            title="Action Items"
            value="3 of 4 Open"
            subtitle="75% Pending resolution"
            icon={CheckCircle2}
            change="On Track"
            changePositive={true}
            badgeText="Active"
            accent="cyan"
          />

          <MetricTile3D
            title="Pod Velocity"
            value="98.4% Cadence"
            subtitle="Zero missed standups this sprint"
            icon={Users}
            change="High Engagement"
            changePositive={true}
            badgeText="Optimal"
            accent="emerald"
          />
        </div>

        {/* Meetings List */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-400" />
            Scheduled Meetings & Agendas
          </h3>

          <div className="space-y-4">
            {meetings.map((meet) => (
              <Interactive3DCard key={meet.id} className="p-6 border border-border/80 space-y-4 bg-card/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-foreground">{meet.title}</h4>
                      <Badge variant="outline" className="text-[10px] text-purple-300 border-purple-500/30 font-bold">
                        {meet.type.replace("_", " ")}
                      </Badge>
                      <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {meet.scheduledTime} ({meet.durationMinutes}m)
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Host: <strong className="text-foreground">{meet.withPerson}</strong> ({meet.role})
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="brand"
                    onClick={() => handleJoinMeeting(meet.title)}
                    className="text-xs font-bold h-8 px-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white gap-1.5 shrink-0 shadow-sm"
                  >
                    <Video className="h-3.5 w-3.5" />
                    <span>Join Room</span>
                  </Button>
                </div>

                {/* Agenda */}
                <div className="p-3.5 rounded-xl bg-card border border-border/60 text-xs text-muted-foreground leading-relaxed">
                  <strong className="text-foreground block mb-1">Meeting Agenda:</strong>
                  {meet.agenda}
                </div>

                {/* Action Items */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Action Items ({meet.actionItems.filter((a) => a.done).length}/{meet.actionItems.length} Resolved)
                  </span>

                  <div className="space-y-1.5">
                    {meet.actionItems.map((act) => (
                      <label
                        key={act.id}
                        onClick={() => toggleActionItem(meet.id, act.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                          act.done
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300 line-through"
                            : "bg-card border-border/60 text-foreground hover:border-border"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={act.done}
                          onChange={() => {}}
                          className="h-3.5 w-3.5 rounded text-purple-500"
                        />
                        <span>{act.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </Interactive3DCard>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
