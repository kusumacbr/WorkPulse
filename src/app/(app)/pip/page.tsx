"use client";

import React from "react";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

export default function PipStatusPage() {
  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Interactive3DCard className="p-4 sm:p-6 md:p-8 border border-emerald-500/30 bg-gradient-to-r from-card/90 via-card/70 to-emerald-500/10 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="brand" className="bg-emerald-500/15 border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase">
                <ShieldCheck className="h-3 w-3 mr-1 text-emerald-400" />
                Performance Improvement &amp; Coaching Record
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Confidential Review</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-foreground">Performance Support &amp; Coaching Plan</h2>
            <p className="text-xs text-muted-foreground">
              Structured development support with weekly checkpoints, mentorship, and confidential HR oversight.
            </p>
          </div>
        </Interactive3DCard>

        <Interactive3DCard className="p-5 sm:p-8 border border-border/80 bg-card/60 text-center space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">Standing: High Performance &amp; Exemplary Delivery</h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              You are not enrolled in any performance improvement plan. All sprint deliverables and attendance metrics meet or exceed organizational benchmarks.
            </p>
          </div>
        </Interactive3DCard>
      </div>
    </PageTransition>
  );
}
