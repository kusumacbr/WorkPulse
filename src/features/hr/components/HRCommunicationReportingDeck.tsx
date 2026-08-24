"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { EmployeeCelebrationBroadcastDeck } from "./EmployeeCelebrationBroadcastDeck";
import { triggerBroadcastPopup } from "@/lib/stores/broadcast-popup-store";
import {
  Megaphone,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Users,
  Calendar,
  Award,
  Lock,
  Send,
  Radio,
  Clock,
} from "lucide-react";

interface AnnouncementReadMetric {
  id: string;
  title: string;
  publishedDate: string;
  audience: string;
  totalTarget: number;
  acknowledgedCount: number;
  acknowledgementRate: number;
  priority: "URGENT" | "STANDARD" | "CULTURE";
}

const INITIAL_ANNOUNCEMENTS: AnnouncementReadMetric[] = [
  {
    id: "anc-1",
    title: "POSH 2026 Statutory Compliance & Zero-Tolerance Policy Notice",
    publishedDate: "Aug 15, 2026",
    audience: "All Organization (19 Staff)",
    totalTarget: 19,
    acknowledgedCount: 18,
    acknowledgementRate: 94.7,
    priority: "URGENT",
  },
  {
    id: "anc-2",
    title: "Bangalore HQ Floor 3 Hardware Terminal Biometric Upgrade",
    publishedDate: "Aug 18, 2026",
    audience: "All Organization (19 Staff)",
    totalTarget: 19,
    acknowledgedCount: 17,
    acknowledgementRate: 89.5,
    priority: "STANDARD",
  },
  {
    id: "anc-3",
    title: "Q3 Sprint Planning & Merit Nomination Calibration Kickoff",
    publishedDate: "Aug 19, 2026",
    audience: "Designated Team Leads (6 Staff)",
    totalTarget: 6,
    acknowledgedCount: 6,
    acknowledgementRate: 100.0,
    priority: "URGENT",
  },
];

export function HRCommunicationReportingDeck({ onOpenExportModal }: { onOpenExportModal: () => void }) {
  const [announcements, setAnnouncements] = useState<AnnouncementReadMetric[]>(INITIAL_ANNOUNCEMENTS);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newPriority, setNewPriority] = useState<"URGENT" | "STANDARD" | "CULTURE">("STANDARD");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handlePublishAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newAnc: AnnouncementReadMetric = {
      id: `anc-${Date.now()}`,
      title: newTitle.trim(),
      publishedDate: "Today",
      audience: "All Organization (19 Staff)",
      totalTarget: 19,
      acknowledgedCount: 1,
      acknowledgementRate: 5.2,
      priority: newPriority,
    };

    setAnnouncements([newAnc, ...announcements]);

    // Trigger Popup
    triggerBroadcastPopup({
      id: newAnc.id,
      type: newPriority === "URGENT" ? "URGENT_POLICY" : "ANNOUNCEMENT",
      title: newAnc.title,
      message: newBody.trim() || `Official organization notice published for all staff. Please review the details and acknowledge on the portal.`,
      author: "HR & People Operations",
      targetAudience: newAnc.audience,
      badge: newPriority === "URGENT" ? "Urgent Policy Notice" : "Company Broadcast",
      accentEmoji: newPriority === "URGENT" ? "⚠️" : "📢",
      linkUrl: "/hr",
      reactions: { "👍": 12, "✅": 16, "👀": 9, "💬": 4 },
    });

    setNewTitle("");
    setNewBody("");
    showToast(`Company-wide announcement "${newAnc.title}" broadcasted successfully! 📢`);
  };

  const handleRepush = (title: string) => {
    showToast(`Reminder nudge re-sent for "${title}" via Slack & Email! 🔔`);
  };

  return (
    <div className="space-y-8">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. EMPLOYEE BIRTHDAYS & CULTURAL FESTIVALS BROADCAST CENTER    */}
      {/* ============================================================== */}
      <EmployeeCelebrationBroadcastDeck />
      <Interactive3DCard className="p-6 border border-pink-500/30 bg-gradient-to-r from-card/80 via-card/60 to-pink-500/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-pink-400" />
              Executive Audit & Reporting Shortcuts
            </h3>
            <p className="text-xs text-muted-foreground">
              Direct 1-click access to production-formatted exports for Payroll, Finance audits, and Executive leadership reviews.
            </p>
          </div>
          <Badge variant="brand" className="text-xs bg-pink-500/15 text-pink-300 border-pink-500/30 font-bold">
            Audit Ready
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs pt-1">
          {/* Export 1: Monthly Attendance Muster */}
          <button
            type="button"
            onClick={onOpenExportModal}
            className="p-3.5 rounded-xl bg-card/60 border border-border/80 hover:border-pink-500/40 text-left transition-all group space-y-1.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <Clock className="h-4 w-4 text-cyan-400" />
              <Download className="h-3 w-3 text-muted-foreground group-hover:text-pink-400" />
            </div>
            <div className="font-bold text-foreground">Monthly Muster Roll</div>
            <div className="text-[10px] text-muted-foreground">Biometric payroll CSV</div>
          </button>

          {/* Export 2: Headcount Census */}
          <button
            type="button"
            onClick={onOpenExportModal}
            className="p-3.5 rounded-xl bg-card/60 border border-border/80 hover:border-pink-500/40 text-left transition-all group space-y-1.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <Users className="h-4 w-4 text-purple-400" />
              <Download className="h-3 w-3 text-muted-foreground group-hover:text-pink-400" />
            </div>
            <div className="font-bold text-foreground">Headcount Census</div>
            <div className="text-[10px] text-muted-foreground">6 Department roster breakdown</div>
          </button>

          {/* Export 3: Leave Quotas */}
          <button
            type="button"
            onClick={onOpenExportModal}
            className="p-3.5 rounded-xl bg-card/60 border border-border/80 hover:border-pink-500/40 text-left transition-all group space-y-1.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <Calendar className="h-4 w-4 text-emerald-400" />
              <Download className="h-3 w-3 text-muted-foreground group-hover:text-pink-400" />
            </div>
            <div className="font-bold text-foreground">Leave Quota Ledger</div>
            <div className="text-[10px] text-muted-foreground">CL & SL balance audit</div>
          </button>

          {/* Export 4: Review Turnaround */}
          <button
            type="button"
            onClick={onOpenExportModal}
            className="p-3.5 rounded-xl bg-card/60 border border-border/80 hover:border-pink-500/40 text-left transition-all group space-y-1.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <Award className="h-4 w-4 text-amber-400" />
              <Download className="h-3 w-3 text-muted-foreground group-hover:text-pink-400" />
            </div>
            <div className="font-bold text-foreground">Appraisal Audit</div>
            <div className="text-[10px] text-muted-foreground">Lead completion times</div>
          </button>

          {/* Export 5: PIP & Probation Ledger */}
          <button
            type="button"
            onClick={onOpenExportModal}
            className="p-3.5 rounded-xl bg-card/60 border border-border/80 hover:border-pink-500/40 text-left transition-all group space-y-1.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <Lock className="h-4 w-4 text-rose-400" />
              <Download className="h-3 w-3 text-muted-foreground group-hover:text-pink-400" />
            </div>
            <div className="font-bold text-foreground">Compliance Ledger</div>
            <div className="text-[10px] text-muted-foreground">Confidential governance</div>
          </button>
        </div>
      </Interactive3DCard>

      {/* ============================================================== */}
      {/* 2. ANNOUNCEMENT COMPOSER & READ-RATE SUMMARY                   */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Quick Announcement Composer */}
        <Interactive3DCard className="p-6 border border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-cyan-400" />
              Publish Company-Wide Broadcast
            </h4>
            <Badge variant="outline" className="text-xs text-cyan-300 border-cyan-500/30">
              Live Feed
            </Badge>
          </div>

          <form onSubmit={handlePublishAnnouncement} className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Announcement Title
              </label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Q3 Sprint All-Hands & Leadership Address"
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Priority Level
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as any)}
                  className="w-full h-8 px-2 rounded-md border border-input bg-card text-xs font-semibold text-foreground focus:outline-none"
                >
                  <option value="STANDARD">Standard Notice</option>
                  <option value="URGENT">Urgent (Mandatory Read)</option>
                  <option value="CULTURE">Culture & Celebration</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Target Audience
                </label>
                <select className="w-full h-8 px-2 rounded-md border border-input bg-card text-xs font-semibold text-foreground focus:outline-none">
                  <option value="ALL">All Organization (19 Staff)</option>
                  <option value="LEADS">Designated Team Leads Only</option>
                  <option value="DEV">Development Pod</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Message Body
              </label>
              <textarea
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                placeholder="Compose detailed announcement message..."
                rows={3}
                className="w-full p-2.5 rounded-lg border border-input bg-card text-xs text-foreground focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end pt-1">
              <Button
                type="submit"
                variant="brand"
                size="sm"
                className="text-xs font-bold bg-cyan-500 hover:bg-cyan-600 text-black h-8 px-4 gap-1.5"
              >
                <Send className="h-3 w-3" />
                <span>Broadcast Notice</span>
              </Button>
            </div>
          </form>
        </Interactive3DCard>

        {/* Right: Announcement Read-Rate Tracker */}
        <Interactive3DCard className="p-6 border border-border/80 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Radio className="h-4 w-4 text-emerald-400" />
              Announcement Read-Rate & Acknowledgement
            </h4>
            <span className="text-xs text-muted-foreground font-mono">Real-Time</span>
          </div>

          <div className="space-y-3 text-xs">
            {announcements.map((anc) => (
              <div
                key={anc.id}
                className="p-3.5 rounded-xl bg-card/60 border border-border/80 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground text-xs block leading-snug">{anc.title}</span>
                    <span className="text-[10px] text-muted-foreground">{anc.publishedDate} · {anc.audience}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-bold ${
                      anc.priority === "URGENT"
                        ? "border-rose-500/40 text-rose-400"
                        : "border-cyan-500/30 text-cyan-300"
                    }`}
                  >
                    {anc.priority}
                  </Badge>
                </div>

                {/* Read Rate Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">
                      Acknowledged: <strong className="text-foreground">{anc.acknowledgedCount} / {anc.totalTarget}</strong>
                    </span>
                    <strong className="text-emerald-400 font-mono">{anc.acknowledgementRate}%</strong>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                      style={{ width: `${anc.acknowledgementRate}%` }}
                    />
                  </div>
                </div>

                {anc.acknowledgementRate < 95 && (
                  <div className="pt-1 flex items-center justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRepush(anc.title)}
                      className="text-[10px] h-6 px-2 border-border text-muted-foreground hover:text-foreground"
                    >
                      <span>Re-push Nudge</span>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Interactive3DCard>
      </div>
    </div>
  );
}
