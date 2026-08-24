"use client";

import React, { use } from "react";
import Link from "next/link";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

export default function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const { taskId } = use(params);

  return (
    <PageTransition>
      <div className="space-y-6 max-w-3xl mx-auto">
        <Link
          href="/my-work"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to My Work</span>
        </Link>

        <Interactive3DCard className="p-6 md:p-8 border border-cyan-500/30 bg-card/70 backdrop-blur-xl space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-mono text-cyan-300 border-cyan-500/30">
                Task ID: {taskId}
              </Badge>
              <Badge variant="brand" className="text-[10px] bg-cyan-500/15 text-cyan-300 border-cyan-500/30 font-bold">
                IN_PROGRESS (80%)
              </Badge>
            </div>
            <h2 className="text-xl font-black text-foreground">
              Implement dedicated SOD Carryover section with rolled-over task pile-up
            </h2>
            <p className="text-xs text-muted-foreground">
              Project: <strong className="text-cyan-300 font-mono">Frontend & UI Pod</strong> · Priority: <strong className="text-amber-300">HIGH</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
              <span className="text-muted-foreground">Estimated Time</span>
              <div className="font-bold text-foreground font-mono">180 Mins (3.0h)</div>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
              <span className="text-muted-foreground">Actual Logged</span>
              <div className="font-bold text-cyan-300 font-mono">145 Mins</div>
            </div>
            <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
              <span className="text-muted-foreground">Sprint Goal Link</span>
              <div className="font-bold text-emerald-400">OKR #34-A</div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <strong className="text-foreground block">Expected Output & Definition of Done</strong>
            <p className="p-3 rounded-xl bg-muted/20 border border-border/50 text-muted-foreground leading-relaxed">
              Carryover task section seamlessly captures unfinished tasks from previous workday, retains origin dates, and updates progress without duplicating reviews.
            </p>
          </div>
        </Interactive3DCard>
      </div>
    </PageTransition>
  );
}
