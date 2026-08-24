"use client";

import React, { useState } from "react";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Clock,
  Sparkles,
  Calendar,
  AlertTriangle,
  Award,
  Check,
} from "lucide-react";

interface InAppNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "SOD" | "REVIEW" | "LEAVE" | "BLOCKER" | "BADGE" | "ANNOUNCEMENT";
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<InAppNotification[]>([
    {
      id: "notif-1",
      title: "Appreciation Badge Awarded! 🏆",
      message: "Alex Lead awarded you the 'Problem Solver' badge with 20 recognition points for fixing the latency bottleneck.",
      time: "10 mins ago",
      type: "BADGE",
      read: false,
    },
    {
      id: "notif-2",
      title: "Stage-2 Leave Approved ✓",
      message: "Rachel HR authorized your Casual Leave application for Sep 10 - Sep 11, 2026. Leave balances updated.",
      time: "1 hour ago",
      type: "LEAVE",
      read: false,
    },
    {
      id: "notif-3",
      title: "Weekly Sprint Review Signed Off",
      message: "Your Sprint 34 performance appraisal was reviewed and approved with a 5.0★ rating.",
      time: "2 hours ago",
      type: "REVIEW",
      read: true,
    },
    {
      id: "notif-4",
      title: "1-on-1 Sync Scheduled",
      message: "Next 1-on-1 coaching sync with Alex Lead is confirmed for Today at 03:30 PM.",
      time: "4 hours ago",
      type: "REVIEW",
      read: true,
    },
    {
      id: "notif-5",
      title: "Biometric Punch Verified",
      message: "Morning punch at 10:08 AM was recorded at Bangalore HQ Main Entrance Terminal.",
      time: "Today at 10:08 AM",
      type: "SOD",
      read: true,
    },
  ]);

  const [filterType, setFilterType] = useState<string>("ALL");

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  const filtered = notifications.filter((n) => {
    if (filterType === "UNREAD") return !n.read;
    if (filterType !== "ALL") return n.type === filterType;
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case "BADGE":
        return <Award className="h-4 w-4 text-amber-400" />;
      case "LEAVE":
        return <Calendar className="h-4 w-4 text-teal-400" />;
      case "REVIEW":
        return <Sparkles className="h-4 w-4 text-purple-400" />;
      case "BLOCKER":
        return <AlertTriangle className="h-4 w-4 text-rose-400" />;
      default:
        return <Clock className="h-4 w-4 text-cyan-400" />;
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Interactive3DCard className="p-6 md:p-8 border border-cyan-500/30 bg-gradient-to-r from-card/90 via-card/70 to-cyan-500/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="bg-cyan-500/15 border-cyan-500/30 text-cyan-300 text-[10px] font-bold uppercase">
                  <Bell className="h-3 w-3 mr-1" />
                  Notifications Center
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {notifications.filter((n) => !n.read).length} Unread
                </span>
              </div>
              <h2 className="text-2xl font-black text-foreground">Activity & Notification Feed</h2>
              <p className="text-xs text-muted-foreground">
                In-app alerts for SOD/EOD status, reviews, stage approvals, appreciation badges, and blockers.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-8 px-3 border-border/80 text-foreground hover:border-cyan-500/40 shrink-0 gap-1"
            >
              <Check className="h-3.5 w-3.5 text-cyan-400" />
              <span>Mark All as Read</span>
            </Button>
          </div>
        </Interactive3DCard>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <Button
            variant={filterType === "ALL" ? "brand" : "outline"}
            size="sm"
            onClick={() => setFilterType("ALL")}
            className="h-7 px-3 text-xs"
          >
            All ({notifications.length})
          </Button>
          <Button
            variant={filterType === "UNREAD" ? "brand" : "outline"}
            size="sm"
            onClick={() => setFilterType("UNREAD")}
            className="h-7 px-3 text-xs text-amber-300"
          >
            Unread ({notifications.filter((n) => !n.read).length})
          </Button>
          <Button
            variant={filterType === "BADGE" ? "brand" : "outline"}
            size="sm"
            onClick={() => setFilterType("BADGE")}
            className="h-7 px-3 text-xs"
          >
            Badges
          </Button>
          <Button
            variant={filterType === "LEAVE" ? "brand" : "outline"}
            size="sm"
            onClick={() => setFilterType("LEAVE")}
            className="h-7 px-3 text-xs"
          >
            Leave & WFH
          </Button>
          <Button
            variant={filterType === "REVIEW" ? "brand" : "outline"}
            size="sm"
            onClick={() => setFilterType("REVIEW")}
            className="h-7 px-3 text-xs"
          >
            Reviews
          </Button>
        </div>

        {/* Notification Cards List */}
        <div className="space-y-3">
          {filtered.map((notif) => (
            <Interactive3DCard
              key={notif.id}
              onClick={() => toggleRead(notif.id)}
              className={`p-4 border transition-all cursor-pointer ${
                notif.read
                  ? "border-border/60 bg-card/40 opacity-80"
                  : "border-cyan-500/40 bg-card/80 shadow-[0_0_15px_rgba(6,182,212,0.1)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-muted/40 border border-border/60 shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-bold text-foreground">{notif.title}</strong>
                      {!notif.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{notif.message}</p>
                    <span className="text-[10px] text-muted-foreground font-mono block pt-0.5">{notif.time}</span>
                  </div>
                </div>

                <Badge variant="outline" className="text-[9px] font-mono text-muted-foreground shrink-0">
                  {notif.type}
                </Badge>
              </div>
            </Interactive3DCard>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
