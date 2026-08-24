"use client";

import React from "react";
import { AdminSystemHealthDeck } from "@/features/admin/components/AdminSystemHealthDeck";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Activity, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminSystemHealthPage() {
  return (
    <PageTransition>
      <div className="space-y-6 max-w-6xl mx-auto">
        <Link href="/admin" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Root Admin Console</span>
        </Link>

        <Interactive3DCard className="p-6 md:p-8 border border-red-500/30 bg-gradient-to-r from-card/90 via-card/70 to-red-500/10 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="bg-red-500/15 border-red-500/30 text-red-300 text-[10px] font-bold uppercase">
              <Activity className="h-3 w-3 mr-1 text-red-400" />
              Observability & Telemetry (Section 21 Specification)
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">Real-Time Heartbeats</span>
          </div>
          <h2 className="text-2xl font-black text-foreground">System Health & Hardware Telemetry</h2>
          <p className="text-xs text-muted-foreground">
            Real-time biometric device heartbeat latencies, memory footprint, background jobs, and error rate monitoring.
          </p>
        </Interactive3DCard>

        <AdminSystemHealthDeck />
      </div>
    </PageTransition>
  );
}
