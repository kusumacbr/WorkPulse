"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  Lock,
  Calendar,
  CheckCircle2,
  ListTodo,
  ShieldCheck,
  Plus,
} from "lucide-react";

export function OneToOneMeetingCard() {
  const [activeTab, setActiveTab] = useState<"shared" | "actions" | "private">("shared");
  const [sharedNotes, setSharedNotes] = useState(
    "Discussed Q3 technical milestones. Sarah proposed improving our database connection pooling and reducing biometric ingestion latency. Agreed on targeting 99.9% uptime."
  );
  const [privateNotes, setPrivateNotes] = useState(
    "Sarah is demonstrating strong leadership potential. Recommended for Tech Lead track at Q4 review if probation goals are confirmed."
  );
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="text-[10px]">
                <Calendar className="h-3 w-3 mr-1" />
                Bi-Weekly 1-on-1 Sync
              </Badge>
              <span className="text-xs text-muted-foreground font-semibold">
                Alex Lead & Sarah Dev
              </span>
            </div>
            <CardTitle className="text-sm font-bold text-foreground">
              Sprint 24 Growth & Checkpoint Review (30 min)
            </CardTitle>
          </div>

          <div className="flex items-center p-1 rounded-xl bg-muted border border-border">
            <button
              type="button"
              onClick={() => setActiveTab("shared")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "shared"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="h-3 w-3" />
              Shared Notes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("actions")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "actions"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ListTodo className="h-3 w-3" />
              Action Items (2)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("private")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "private"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lock className="h-3 w-3 text-amber-500" />
              Manager Private Notes
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-xs">
        {activeTab === "shared" && (
          <div className="space-y-3">
            <div>
              <label className="font-semibold block mb-1">Shared Discussion Notes & Goals</label>
              <Textarea
                value={sharedNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSharedNotes(e.target.value)}
                className="text-xs h-24 resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Both employee and manager can review and acknowledge shared notes.
              </span>

              <Button
                variant={acknowledged ? "secondary" : "brand"}
                size="sm"
                className="text-xs h-7 gap-1"
                onClick={() => setAcknowledged(true)}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {acknowledged ? "Acknowledged" : "Acknowledge Notes"}
              </Button>
            </div>
          </div>
        )}

        {activeTab === "actions" && (
          <div className="space-y-3">
            <div className="divide-y divide-border rounded-lg border border-border">
              <div className="p-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground block">1. Research pg_stat_activity index locking</span>
                  <span className="text-[11px] text-muted-foreground">Owner: Sarah Dev · Due: Aug 25, 2026</span>
                </div>
                <Badge variant="outline" className="text-[10px]">Open</Badge>
              </div>
              <div className="p-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground block">2. Schedule AWS DB replica sizing review</span>
                  <span className="text-[11px] text-muted-foreground">Owner: Alex Lead · Due: Aug 24, 2026</span>
                </div>
                <Badge variant="brand" className="text-[10px]">Completed</Badge>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                <Plus className="h-3 w-3" />
                Add Action Item
              </Button>
            </div>
          </div>
        )}

        {activeTab === "private" && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs flex items-center gap-2 text-amber-700 dark:text-amber-300">
              <Lock className="h-4 w-4 shrink-0" />
              <span>Query-Level Security Active: These notes are strictly invisible to the employee and accessible only to Manager Author, HR, and Admin.</span>
            </div>

            <div>
              <label className="font-semibold block mb-1">Confidential Coaching Notes</label>
              <Textarea
                value={privateNotes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrivateNotes(e.target.value)}
                className="text-xs h-24 resize-none font-mono"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
