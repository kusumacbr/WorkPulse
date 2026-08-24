"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QualitativeRatings } from "@/lib/scoring/review-calculator";
import { Star, ShieldCheck, MessageSquare } from "lucide-react";

interface SelfVsLeadComparisonChartProps {
  managerRatings?: QualitativeRatings & { execution?: number };
  reviewerName?: string;
}

export function SelfVsLeadComparisonChart({
  managerRatings = { quality: 5, timeliness: 4.8, communication: 4.7, collaboration: 4.9, initiative: 4.8, execution: 4.9 },
  reviewerName = "Alex Lead",
}: SelfVsLeadComparisonChartProps) {
  const criteria = [
    { key: "execution", label: "Task & Goal Execution", weight: "40%", defaultScore: 4.9, color: "from-cyan-400 to-teal-400" },
    { key: "quality", label: "Quality & Technical Rigor", weight: "20%", defaultScore: 5.0, color: "from-purple-400 to-indigo-400" },
    { key: "timeliness", label: "Timely Delivery & Velocity", weight: "15%", defaultScore: 4.8, color: "from-emerald-400 to-teal-400" },
    { key: "communication", label: "Communication & Reporting", weight: "10%", defaultScore: 4.7, color: "from-amber-400 to-yellow-400" },
    { key: "collaboration", label: "Collaboration & Peer Reviews", weight: "10%", defaultScore: 4.9, color: "from-pink-400 to-rose-400" },
    { key: "initiative", label: "Initiative & Leadership", weight: "5%", defaultScore: 4.8, color: "from-blue-400 to-cyan-400" },
  ];

  return (
    <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Team Lead Competency Radar
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Calibrated engineering competency evaluation by {reviewerName}.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0">
            <Badge variant="outline" className="text-[10px] text-purple-300 border-purple-500/30 bg-purple-500/10 font-bold">
              Evaluator: {reviewerName}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/25 text-xs flex items-start gap-2.5">
          <MessageSquare className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
          <p className="text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Lead Evaluation Note:</span> Ratings are calibrated against the Platform Pod engineering matrix and updated continuously during weekly sprint sign-offs.
          </p>
        </div>

        {/* Competency Evaluated Bars */}
        <div className="space-y-3.5">
          {criteria.map((item) => {
            const mgrVal = (managerRatings as any)[item.key] || item.defaultScore;
            const percentage = Math.min(100, Math.round((mgrVal / 5) * 100));

            return (
              <div key={item.key} className="space-y-1.5 p-3 rounded-xl bg-muted/30 border border-border/60 hover:border-purple-500/30 transition-all">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{item.label}</span>
                    <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                      Weight: {item.weight}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono font-bold text-xs">
                    <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                    <span className="text-cyan-300">{mgrVal.toFixed(1)} / 5.0</span>
                  </div>
                </div>

                {/* Single High-Visibility Evaluated Progress Bar */}
                <div className="w-full h-2 rounded-full bg-background overflow-hidden border border-border/50 flex">
                  <div
                    className={`h-full bg-gradient-to-r ${item.color} transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
