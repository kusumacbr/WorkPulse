"use client";

import React, { use } from "react";
import Link from "next/link";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Star } from "lucide-react";

export default function WeeklyReviewDetailPage({
  params,
}: {
  params: Promise<{ reviewId: string }>;
}) {
  const { reviewId } = use(params);

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Link
          href="/reviews"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Performance Reviews</span>
        </Link>

        <Interactive3DCard className="p-6 md:p-8 border border-purple-500/30 bg-gradient-to-r from-card/90 via-card/70 to-purple-500/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-mono text-purple-300 border-purple-500/30">
                  Review ID: {reviewId}
                </Badge>
                <Badge variant="brand" className="text-[10px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold">
                  APPROVED (5.0★)
                </Badge>
              </div>
              <h2 className="text-2xl font-black text-foreground">Sprint 34 Performance Appraisal</h2>
              <p className="text-xs text-muted-foreground">
                Employee: <strong className="text-foreground">Sara Dev</strong> · Lead Reviewer: <strong className="text-purple-300">Alex Lead</strong>
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-purple-400 font-mono">94.5%</div>
              <span className="text-[10px] text-muted-foreground">Weighted Execution Score</span>
            </div>
          </div>
        </Interactive3DCard>

        {/* Lead Feedback Card */}
        <Interactive3DCard className="p-6 border border-border/80 bg-card/60 space-y-4">
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span>Lead Coaching & Criterion Feedback</span>
          </h3>

          <div className="p-4 rounded-xl bg-card border border-border/60 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground">Quality & Architecture Delivery</span>
              <div className="flex items-center gap-1 text-amber-400">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                <span className="font-mono font-bold">5.0 / 5</span>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              "Outstanding work on the real-time biometric ingestion pipeline and zero-downtime store fallback. Continue mentoring junior engineers during Sprint 35."
            </p>
          </div>
        </Interactive3DCard>
      </div>
    </PageTransition>
  );
}
