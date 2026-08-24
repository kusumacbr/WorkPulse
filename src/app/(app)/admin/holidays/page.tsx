"use client";

import React from "react";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminHolidaysPage() {
  const holidays = [
    { name: "Independence Day", date: "August 15, 2026", type: "NATIONAL" },
    { name: "Ganesh Chaturthi", date: "September 14, 2026", type: "REGIONAL" },
    { name: "Gandhi Jayanti", date: "October 02, 2026", type: "NATIONAL" },
    { name: "Diwali / Deepavali", date: "November 08, 2026", type: "FESTIVAL" },
  ];

  return (
    <PageTransition>
      <div className="space-y-6 max-w-5xl mx-auto">
        <Link href="/admin" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Root Admin Console</span>
        </Link>

        <Interactive3DCard className="p-6 md:p-8 border border-red-500/30 bg-gradient-to-r from-card/90 via-card/70 to-red-500/10 space-y-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="bg-red-500/15 border-red-500/30 text-red-300 text-[10px] font-bold uppercase">
                  <Calendar className="h-3 w-3 mr-1 text-red-400" />
                  Corporate Holiday Calendar
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">2026 Master List</span>
              </div>
              <h2 className="text-2xl font-black text-foreground">Official Holiday Master</h2>
              <p className="text-xs text-muted-foreground">
                Public holidays automatically exclude expected workday attendance requirements across the organization.
              </p>
            </div>
            <Button size="sm" variant="brand" className="text-xs h-9 px-4 bg-red-500 hover:bg-red-600 text-white gap-1.5 shrink-0">
              <Plus className="h-4 w-4" />
              <span>Add Holiday</span>
            </Button>
          </div>
        </Interactive3DCard>

        <div className="space-y-3">
          {holidays.map((h, i) => (
            <Interactive3DCard key={i} className="p-4 rounded-xl border border-border/80 bg-card/60 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <strong className="text-foreground text-sm block">{h.name}</strong>
                <Badge variant="outline" className="text-[10px] text-cyan-300 border-cyan-500/30 font-mono">{h.type}</Badge>
              </div>
              <span className="font-mono font-bold text-foreground">{h.date}</span>
            </Interactive3DCard>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
