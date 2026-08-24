"use client";

import React, { useState } from "react";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Share2,
  Calendar,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";

export default function IntegrationsSettingsPage() {
  const [googleConnected, setGoogleConnected] = useState(true);
  const [slackConnected, setSlackConnected] = useState(true);
  const [teamsConnected, setTeamsConnected] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
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

        <Interactive3DCard className="p-6 md:p-8 border border-blue-500/30 bg-gradient-to-r from-card/90 via-card/70 to-blue-500/10 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="bg-blue-500/15 border-blue-500/30 text-blue-300 text-[10px] font-bold uppercase">
                <Share2 className="h-3 w-3 mr-1 text-blue-400" />
                Enterprise Connectors
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">OAuth 2.0 & Webhooks</span>
            </div>
            <h2 className="text-2xl font-black text-foreground">External Platform Integrations</h2>
            <p className="text-xs text-muted-foreground">
              Connect external enterprise tools including Google Calendar, Microsoft Outlook, Slack, and Microsoft Teams.
            </p>
          </div>
        </Interactive3DCard>

        {/* Calendar Integrations (Section 15) */}
        <Interactive3DCard className="p-6 border border-border/80 bg-card/60 space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-400" />
              Calendar Integrations (Section 15 Specification)
            </h3>
            <p className="text-xs text-muted-foreground">
              Synchronize 1-on-1 coaching meetings, sprint review checkpoints, and approved leave/WFH blocks to corporate calendars.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-card border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <strong className="text-foreground">Google Calendar Adapter</strong>
                  <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">
                    {googleConnected ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">
                  Syncing: 1-on-1s, Leave & Sprint Deadlines · OAuth 2.0 Encrypted
                </span>
              </div>

              <Button
                size="sm"
                variant={googleConnected ? "outline" : "brand"}
                onClick={() => {
                  setGoogleConnected(!googleConnected);
                  showToast(googleConnected ? "Google Calendar disconnected." : "Google Calendar connected.");
                }}
                className="text-xs h-8 px-3 shrink-0"
              >
                {googleConnected ? "Disconnect" : "Connect Google Calendar"}
              </Button>
            </div>
          </div>
        </Interactive3DCard>

        {/* Chat & Notification Integrations (Section 16) */}
        <Interactive3DCard className="p-6 border border-border/80 bg-card/60 space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-purple-400" />
              Slack & Microsoft Teams Notifications (Section 16 Specification)
            </h3>
            <p className="text-xs text-muted-foreground">
              Dispatch critical blocker escalations and morning reminders with strict confidential review redactions.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-card border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <strong className="text-foreground">Slack Enterprise Grid (#workpulse-feed)</strong>
                  <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">
                    {slackConnected ? "Active" : "Disconnected"}
                  </Badge>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">
                  Redaction Policy: Confidential PIP and private ratings omitted from channels.
                </span>
              </div>

              <Button
                size="sm"
                variant={slackConnected ? "outline" : "brand"}
                onClick={() => {
                  setSlackConnected(!slackConnected);
                  showToast(slackConnected ? "Slack webhook disconnected." : "Slack webhook connected.");
                }}
                className="text-xs h-8 px-3 shrink-0"
              >
                {slackConnected ? "Disconnect" : "Connect Slack"}
              </Button>
            </div>

            <div className="p-4 rounded-xl bg-card border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <strong className="text-foreground">Microsoft Teams Webhook</strong>
                  <Badge variant="outline" className="text-[9px] text-muted-foreground border-border/60">
                    {teamsConnected ? "Active" : "Available"}
                  </Badge>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">
                  Adaptive Card template alerts for stage approvals and SOD nudges.
                </span>
              </div>

              <Button
                size="sm"
                variant={teamsConnected ? "outline" : "brand"}
                onClick={() => {
                  setTeamsConnected(!teamsConnected);
                  showToast(teamsConnected ? "Teams disconnected." : "Microsoft Teams connected.");
                }}
                className="text-xs h-8 px-3 shrink-0"
              >
                {teamsConnected ? "Disconnect" : "Connect Teams"}
              </Button>
            </div>
          </div>
        </Interactive3DCard>
      </div>
    </PageTransition>
  );
}
