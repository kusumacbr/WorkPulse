"use client";

import React, { use } from "react";
import Link from "next/link";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckSquare } from "lucide-react";

export default function TeamMemberDetailPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = use(params);

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link
          href="/team"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Team Dashboard</span>
        </Link>

        <Interactive3DCard className="p-6 md:p-8 border border-cyan-500/30 bg-gradient-to-r from-card/90 via-card/70 to-cyan-500/10 space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-xl">
              JD
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-foreground">Team Member Profile</h2>
                <Badge variant="outline" className="text-cyan-300 border-cyan-500/30 font-mono text-[10px]">
                  ID: {employeeId}
                </Badge>
              </div>
              <p className="text-xs text-cyan-300 font-semibold">Senior Software Engineer · Development Team</p>
            </div>
          </div>
        </Interactive3DCard>

        {/* Sprint Performance & Tasks */}
        <Interactive3DCard className="p-6 border border-border/80 bg-card/60 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-cyan-400" />
            <span>Today's SOD Plan & Deliverable Progress</span>
          </h3>

          <div className="p-4 rounded-xl bg-card border border-border/60 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <strong className="text-foreground">Weekly Architecture Implementation</strong>
              <Badge variant="brand" className="text-[9px] bg-cyan-500/15 text-cyan-300 border-cyan-500/30">
                85% Completed
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Working on route handler completion and high-coverage automated unit test suites.
            </p>
          </div>
        </Interactive3DCard>
      </div>
    </PageTransition>
  );
}
