"use client";

import React, { useState } from "react";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, UserCheck, Check } from "lucide-react";

export default function HRProbationPage() {
  const [candidates, setCandidates] = useState([
    {
      id: "prob-1",
      employeeName: "Rohit Sharma",
      designation: "Frontend Engineer (UI/UX)",
      checkpoint: "Day 30",
      workQualityScore: 5.0,
      leadRecommendation: "CONFIRM_EMPLOYMENT",
      status: "PENDING_HR_DECISION",
    },
  ]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleApproveHR = (id: string) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "CONFIRMED_PERMANENT" } : c))
    );
    setToastMsg("HR confirmation decision recorded & sent for Admin sign-off.");
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

        <Interactive3DCard className="p-6 md:p-8 border border-emerald-500/30 bg-gradient-to-r from-card/90 via-card/70 to-emerald-500/10 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="bg-emerald-500/15 border-emerald-500/30 text-emerald-300 text-[10px] font-bold uppercase">
                <UserCheck className="h-3 w-3 mr-1 text-emerald-400" />
                HR Probation Governance (Section 6.5 Specification)
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">People Operations</span>
            </div>
            <h2 className="text-2xl font-black text-foreground">Probation Review & Permanent Confirmation Queue</h2>
            <p className="text-xs text-muted-foreground">
              Review manager recommendations, evaluate 8-criterion scores, and issue permanent employment confirmation letters.
            </p>
          </div>
        </Interactive3DCard>

        <div className="space-y-3">
          {candidates.map((c) => (
            <Interactive3DCard key={c.id} className="p-5 border border-border/80 bg-card/60 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-bold text-foreground">{c.employeeName}</strong>
                    <Badge variant="outline" className="text-[10px] text-emerald-300 border-emerald-500/30 font-mono">
                      {c.checkpoint} Checkpoint
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.designation}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {c.status === "PENDING_HR_DECISION" ? (
                    <Button
                      size="sm"
                      variant="brand"
                      onClick={() => handleApproveHR(c.id)}
                      className="text-xs h-8 px-3 bg-emerald-500 hover:bg-emerald-600 text-white gap-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Confirm Employment</span>
                    </Button>
                  ) : (
                    <Badge variant="brand" className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                      ✓ Confirmed Permanent
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground">
                <span>Manager Rec: <strong className="text-foreground">{c.leadRecommendation}</strong></span>
                <span className="font-mono text-cyan-300">Score: {c.workQualityScore.toFixed(1)} / 5★</span>
              </div>
            </Interactive3DCard>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
