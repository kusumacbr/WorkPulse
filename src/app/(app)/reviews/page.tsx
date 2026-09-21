"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { SimpleReviewsManager } from "@/features/reviews/components/SimpleReviewsManager";
import { LeadReviewsManager } from "@/features/reviews/components/LeadReviewsManager";
import { useCurrentUser } from "@/components/layout/UserContext";
import { Award, Users } from "lucide-react";

export default function ReviewsPage() {
  const user = useCurrentUser();
  const isLead =
    user.roles.includes("MANAGER") ||
    user.primaryRole === "MANAGER" ||
    user.userEmail.toLowerCase().includes("lead");

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Simple & Clean Header */}
        <Interactive3DCard className="p-4 sm:p-6 border border-border/80 bg-gradient-to-r from-card/90 via-card/70 to-card/50">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="brand" className="font-bold text-[10px] uppercase">
                {isLead ? (
                  <>
                    <Users className="h-3 w-3 mr-1 text-indigo-400" />
                    <span>Team Coaching & Evaluations</span>
                  </>
                ) : (
                  <>
                    <Award className="h-3 w-3 mr-1 text-purple-400" />
                    <span>Growth & Recognition</span>
                  </>
                )}
              </Badge>
              {isLead && (
                <span className="text-[11px] text-muted-foreground font-medium">
                  Development Team · 4 Direct Reports
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-foreground">
              {isLead ? "Team Reviews & Evaluations" : "Performance & Reviews"}
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {isLead
                ? "Evaluate direct reports, provide coaching feedback notes, and schedule 1-on-1 performance syncs."
                : "View your performance score, read manager feedback, and track your career growth."}
            </p>
          </div>
        </Interactive3DCard>

        {/* Lead vs Member Reviews Manager */}
        {isLead ? <LeadReviewsManager /> : <SimpleReviewsManager />}
      </div>
    </PageTransition>
  );
}
