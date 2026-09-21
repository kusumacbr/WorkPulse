"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

export function PipManagementModal() {
  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-[10px]">
                <AlertCircle className="h-3 w-3 mr-1" />
                Active Performance Improvement Plan
              </Badge>
              <span className="text-xs text-muted-foreground font-semibold">
                Status: IMPROVING
              </span>
            </div>
            <CardTitle className="text-sm font-bold text-foreground">
              Engineering Delivery & Task Closure Acceleration Plan
            </CardTitle>
          </div>

          <Badge variant="outline" className="text-[11px] font-mono">
            Period: 2026-08-01 to 2026-09-01 (30 Days)
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-xs">
        {/* Confidential Security Banner */}
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs flex items-center gap-2 text-amber-700 dark:text-amber-300">
          <Lock className="h-4 w-4 shrink-0" />
          <span>Strict Query-Level Access Control: This record is strictly restricted to the employee, assigned manager, HR, and Admin.</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
            <span className="font-bold text-foreground block">Performance Concerns</span>
            <p className="text-muted-foreground">SOD to EOD task completion velocity fell below team target for 2 consecutive review cycles.</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
            <span className="font-bold text-foreground block">Measurable Goals & Exit Criteria</span>
            <p className="text-muted-foreground">Maintain $\ge 85\%$ SOD task completion rate and zero uncommunicated sprint carry-overs for 4 weeks.</p>
          </div>
        </div>

        {/* Checkpoint Timeline */}
        <div className="space-y-2">
          <span className="font-bold text-foreground block">Weekly Checkpoint Logs</span>
          <div className="divide-y divide-border rounded-lg border border-border">
            <div className="p-3 flex items-start justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Badge variant="brand" className="text-[10px]">Week 1 Checkpoint</Badge>
                  <span className="text-[11px] text-muted-foreground">2026-08-08</span>
                </div>
                <p className="text-foreground">Completed 92% of committed tasks. Great improvement on blocker escalation transparency.</p>
              </div>
              <span className="text-emerald-500 font-bold flex items-center gap-1 text-[11px]">
                <TrendingUp className="h-3.5 w-3.5" /> Improving
              </span>
            </div>

            <div className="p-3 flex items-start justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Badge variant="brand" className="text-[10px]">Week 2 Checkpoint</Badge>
                  <span className="text-[11px] text-muted-foreground">2026-08-15</span>
                </div>
                <p className="text-foreground">Closed 100% of SOD items on time. Conducted code review workshop with frontend team.</p>
              </div>
              <span className="text-emerald-500 font-bold flex items-center gap-1 text-[11px]">
                <TrendingUp className="h-3.5 w-3.5" /> Improving
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-border">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Employee acknowledged on Aug 01, 2026</span>
          </span>

          <Button variant="outline" size="sm" className="h-8 text-xs w-full sm:w-auto">
            Add Weekly Checkpoint Log
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
