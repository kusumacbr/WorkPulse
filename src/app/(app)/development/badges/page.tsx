"use client";

import React from "react";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Award, Trophy } from "lucide-react";

export default function BadgesPage() {
  const badgeDefinitions = [
    { name: "Problem Solver", icon: "🧠", color: "from-blue-500/20 to-indigo-500/20", border: "border-blue-500/40", points: 20, desc: "Quickly isolated and fixed critical bottlenecks" },
    { name: "Team Player", icon: "🤝", color: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/40", points: 15, desc: "Unblocked peers and supported sprint teammates" },
    { name: "Quality Champion", icon: "💎", color: "from-purple-500/20 to-pink-500/20", border: "border-purple-500/40", points: 25, desc: "Delivered zero-regression code with full test suites" },
    { name: "Innovation Driver", icon: "🚀", color: "from-amber-500/20 to-orange-500/20", border: "border-amber-500/40", points: 30, desc: "Architected cutting-edge features and optimizations" },
  ];

  const recentAwards = [
    {
      id: "awd-1",
      badgeName: "Problem Solver",
      recipientName: "Sarah Dev",
      senderName: "Alex Lead",
      reason: "Exceptional architecture of the biometric offline queue with zero punch loss",
      date: "August 20, 2026",
      points: 20,
    },
    {
      id: "awd-2",
      badgeName: "Quality Champion",
      recipientName: "John UI",
      senderName: "Alex Lead",
      reason: "Flawless glassmorphic UI overhaul with full accessibility support",
      date: "August 18, 2026",
      points: 25,
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Interactive3DCard className="p-6 md:p-8 border border-amber-500/30 bg-gradient-to-r from-card/90 via-card/70 to-amber-500/10 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="bg-amber-500/15 border-amber-500/30 text-amber-300 text-[10px] font-bold uppercase">
                <Trophy className="h-3 w-3 mr-1 text-amber-400" />
                Peer & Manager Recognition
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Continuous Kudos</span>
            </div>
            <h2 className="text-2xl font-black text-foreground">Appreciation Badges & Recognition</h2>
            <p className="text-xs text-muted-foreground">
              Celebrate sprint milestones, unblocking efforts, and architectural excellence through peer kudos and manager badges.
            </p>
          </div>
        </Interactive3DCard>

        {/* Badge Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {badgeDefinitions.map((b, i) => (
            <Interactive3DCard key={i} className={`p-5 border ${b.border} bg-gradient-to-br ${b.color} space-y-3`}>
              <div className="flex items-center justify-between">
                <span className="text-3xl">{b.icon}</span>
                <Badge variant="brand" className="text-[10px] bg-amber-500/15 text-amber-300 border-amber-500/30 font-mono">
                  +{b.points} Points
                </Badge>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">{b.name}</h3>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
            </Interactive3DCard>
          ))}
        </div>

        {/* Recent Kudos Feed */}
        <Interactive3DCard className="p-6 border border-border/80 bg-card/60 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Award className="h-4 w-4 text-amber-400" />
            <span>Recent Recognition Stream</span>
          </h3>

          <div className="space-y-3 text-xs">
            {recentAwards.map((a) => (
              <div key={a.id} className="p-4 rounded-xl bg-card border border-border/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <strong className="text-foreground">{a.recipientName}</strong>
                    <span className="text-muted-foreground">received</span>
                    <Badge variant="outline" className="text-[10px] font-bold text-amber-300 border-amber-500/30">
                      {a.badgeName}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">{a.date}</span>
                </div>
                <p className="text-muted-foreground leading-relaxed italic">"{a.reason}"</p>
                <div className="text-[11px] text-muted-foreground font-mono">
                  Awarded by: <strong className="text-foreground">{a.senderName}</strong> · +{a.points} Points
                </div>
              </div>
            ))}
          </div>
        </Interactive3DCard>
      </div>
    </PageTransition>
  );
}
