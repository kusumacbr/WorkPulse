"use client";

import React from "react";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Cake, Gift } from "lucide-react";

export default function HRBirthdaysPage() {
  const upcomingEvents = [
    { name: "Anita Rao", date: "August 24", department: "Data Analytics Pod", type: "BIRTHDAY", years: null },
    { name: "Vikram Mehta", date: "August 28", department: "SAP Integration Pod", type: "WORK_ANNIVERSARY", years: "3 Years" },
    { name: "Sara Dev", date: "September 02", department: "Development Pod", type: "WORK_ANNIVERSARY", years: "1 Year" },
  ];

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Interactive3DCard className="p-6 md:p-8 border border-pink-500/30 bg-gradient-to-r from-card/90 via-card/70 to-pink-500/10 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="bg-pink-500/15 border-pink-500/30 text-pink-300 text-[10px] font-bold uppercase">
                <Cake className="h-3 w-3 mr-1 text-pink-400" />
                Employee Engagement & Milestones
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Company Culture</span>
            </div>
            <h2 className="text-2xl font-black text-foreground">Upcoming Birthdays & Work Anniversaries</h2>
            <p className="text-xs text-muted-foreground">
              Celebrate team milestones and trigger automated birthday and tenure appreciation wishes.
            </p>
          </div>
        </Interactive3DCard>

        <div className="space-y-3">
          {upcomingEvents.map((evt, i) => (
            <Interactive3DCard key={i} className="p-4 rounded-xl border border-border/80 bg-card/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400">
                  {evt.type === "BIRTHDAY" ? <Cake className="h-4 w-4" /> : <Gift className="h-4 w-4" />}
                </div>
                <div>
                  <strong className="text-foreground text-sm block">{evt.name}</strong>
                  <span className="text-muted-foreground">{evt.department}</span>
                </div>
              </div>

              <div className="text-right space-y-0.5">
                <span className="font-bold text-pink-300 font-mono block">{evt.date}</span>
                <Badge variant="outline" className="text-[9px] text-muted-foreground font-mono">
                  {evt.years || "Birthday"}
                </Badge>
              </div>
            </Interactive3DCard>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
