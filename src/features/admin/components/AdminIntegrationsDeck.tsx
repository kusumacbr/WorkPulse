"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import {
  MessageSquare,
  Calendar,
  Key,
  CheckCircle2,
  Send,
  Plus,
} from "lucide-react";

interface ApiKeyRecord {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string;
  scope: string;
}

export function AdminIntegrationsDeck() {
  // Slack Webhook
  const [slackWebhookUrl, setSlackWebhookUrl] = useState("https://hooks.slack.com/services/T00/B00/X00EXAMPLE");
  const [slackChannel, setSlackChannel] = useState("#workpulse-alerts");
  const [isSlackEnabled, setIsSlackEnabled] = useState(true);

  // Teams Webhook
  const [teamsWebhookUrl, setTeamsWebhookUrl] = useState("https://xorstack.webhook.office.com/webhookb2/...");
  const [isTeamsEnabled, setIsTeamsEnabled] = useState(false);

  // Google / Exchange Calendar
  const [googleCalendarSync, setGoogleCalendarSync] = useState(true);
  const [exchangeCalendarSync, setExchangeCalendarSync] = useState(false);

  // API Keys
  const [apiKeys, setApiKeys] = useState<ApiKeyRecord[]>([
    {
      id: "key-1",
      name: "Payroll Biometric ETL Importer",
      prefix: "wp_live_89f2****",
      createdAt: "Aug 01, 2026",
      lastUsedAt: "Today (10:14 AM)",
      scope: "attendance:read, audit:read",
    },
    {
      id: "key-2",
      name: "DevOps CI/CD Deployment Hook",
      prefix: "wp_live_33a1****",
      createdAt: "Aug 15, 2026",
      lastUsedAt: "Aug 20, 2026",
      scope: "announcement:publish",
    },
  ]);

  const [newKeyName, setNewKeyName] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleTestSlack = () => {
    showToast("Test payload dispatched to Slack channel #workpulse-alerts! 💬");
  };

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const newKey: ApiKeyRecord = {
      id: `key-${Date.now()}`,
      name: newKeyName.trim(),
      prefix: `wp_live_${Math.random().toString(36).substring(2, 6)}****`,
      createdAt: "Today",
      lastUsedAt: "Never",
      scope: "read:all",
    };

    setApiKeys([...apiKeys, newKey]);
    setNewKeyName("");
    showToast(`API Key "${newKey.name}" generated with restricted scope! 🔑`);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Section 1: Enterprise Chat & Alerts (Slack / MS Teams) */}
      <Interactive3DCard className="p-6 border border-blue-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-400" />
              Enterprise Chat & Security Alert Webhooks
            </h3>
            <p className="text-xs text-muted-foreground">
              Automates real-time broadcast of biometric anomalies, daily review nudges, and urgent announcements to organizational channels.
            </p>
          </div>
          <Badge variant="outline" className="text-xs text-blue-300 border-blue-500/30">
            Outbound Webhooks
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Slack Connector */}
          <div className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <span className="text-emerald-400 font-extrabold">●</span> Slack Incoming Webhook
              </span>
              <input
                type="checkbox"
                checked={isSlackEnabled}
                onChange={(e) => setIsSlackEnabled(e.target.checked)}
                className="h-4 w-4 rounded accent-blue-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground">Webhook Endpoint URL</label>
              <Input
                value={slackWebhookUrl}
                onChange={(e) => setSlackWebhookUrl(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground">Target Notification Channel</label>
              <Input
                value={slackChannel}
                onChange={(e) => setSlackChannel(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>

            <div className="pt-2 border-t border-border/50 flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestSlack}
                className="text-xs h-7 px-3 border-blue-500/30 text-blue-300 hover:bg-blue-500/10 gap-1"
              >
                <Send className="h-3 w-3" />
                <span>Send Test Ping</span>
              </Button>
            </div>
          </div>

          {/* Microsoft Teams Connector */}
          <div className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <span className="text-muted-foreground">○</span> Microsoft 365 Teams Connector
              </span>
              <input
                type="checkbox"
                checked={isTeamsEnabled}
                onChange={(e) => setIsTeamsEnabled(e.target.checked)}
                className="h-4 w-4 rounded accent-blue-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-muted-foreground">Teams Connector URL</label>
              <Input
                value={teamsWebhookUrl}
                onChange={(e) => setTeamsWebhookUrl(e.target.value)}
                className="h-8 text-xs font-mono"
              />
            </div>

            <p className="text-[11px] text-muted-foreground pt-1">
              Supports Office 365 Connector cards for executive audit alerts and system status updates.
            </p>
          </div>
        </div>
      </Interactive3DCard>

      {/* Section 2: Enterprise Calendar Sync & Biometric API Gateway */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Calendar Sync */}
        <Interactive3DCard className="p-6 border border-emerald-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-400" />
              Calendar Sync & Out-of-Office Feeds
            </h4>
            <Badge variant="outline" className="text-xs text-emerald-300 border-emerald-500/30">
              Active Sync
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-card/60 border border-border flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block">Google Workspace Calendar</span>
                <span className="text-[11px] text-muted-foreground">Auto-pushes Company Holidays & approved leaves</span>
              </div>
              <input
                type="checkbox"
                checked={googleCalendarSync}
                onChange={(e) => setGoogleCalendarSync(e.target.checked)}
                className="h-4 w-4 rounded accent-emerald-500 cursor-pointer"
              />
            </div>

            <div className="p-3.5 rounded-xl bg-card/60 border border-border flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block">Microsoft 365 Exchange Calendar</span>
                <span className="text-[11px] text-muted-foreground">Auto-populates Outlook free/busy presence</span>
              </div>
              <input
                type="checkbox"
                checked={exchangeCalendarSync}
                onChange={(e) => setExchangeCalendarSync(e.target.checked)}
                className="h-4 w-4 rounded accent-emerald-500 cursor-pointer"
              />
            </div>
          </div>
        </Interactive3DCard>

        {/* Right: API Keys & Service Accounts */}
        <Interactive3DCard className="p-6 border border-amber-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Key className="h-4 w-4 text-amber-400" />
              Service Account & Ingestion API Keys
            </h4>
            <Badge variant="outline" className="text-xs text-amber-300 border-amber-500/30">
              {apiKeys.length} Scoped Keys
            </Badge>
          </div>

          <form onSubmit={handleCreateApiKey} className="flex items-center gap-2 text-xs">
            <Input
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="Key label (e.g. Payroll Exporter Script)"
              className="h-8 text-xs flex-1"
            />
            <Button type="submit" variant="brand" size="sm" className="h-8 text-xs px-3 font-bold gap-1">
              <Plus className="h-3.5 w-3.5" />
              <span>Generate Key</span>
            </Button>
          </form>

          <div className="space-y-2 text-xs">
            {apiKeys.map((k) => (
              <div
                key={k.id}
                className="p-3 rounded-xl bg-card/60 border border-border flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-foreground">{k.name}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {k.prefix} · Scope: {k.scope} · Last: {k.lastUsedAt}
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] font-mono border-amber-500/30 text-amber-300">
                  Active
                </Badge>
              </div>
            ))}
          </div>
        </Interactive3DCard>
      </div>
    </div>
  );
}
