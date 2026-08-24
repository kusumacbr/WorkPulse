"use client";

import React, { useState } from "react";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Megaphone,
  CheckCircle2,
  Check,
} from "lucide-react";

interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  category: "POLICY" | "FESTIVAL" | "COMPANY_NEWS" | "EMERGENCY" | "GENERAL";
  priority: "HIGH" | "NORMAL" | "URGENT";
  publishDate: string;
  authorName: string;
  acknowledged: boolean;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([
    {
      id: "anc-1",
      title: "Q3 2026 Engineering All-Hands & Architecture Showcase",
      body: "All teams gather on Friday, August 28th for live demos of the WorkPulse real-time biometric muster pipeline and Sprint 34 deliverables.",
      category: "COMPANY_NEWS",
      priority: "HIGH",
      publishDate: "August 20, 2026",
      authorName: "David Director (SuperAdmin)",
      acknowledged: false,
    },
    {
      id: "anc-2",
      title: "POSH 2026 Annual Compliance Notice & Workplace Guidelines",
      body: "Mandatory corporate policy update covering respectful workplace practices, anti-harassment safeguards, and anonymous grievance reporting procedures under DPDP guidelines.",
      category: "POLICY",
      priority: "HIGH",
      publishDate: "August 15, 2026",
      authorName: "Rachel HR (People Operations Lead)",
      acknowledged: true,
    },
    {
      id: "anc-3",
      title: "Upcoming Cultural Festival Holiday: Onam & Ganesh Chaturthi",
      body: "Please plan your sprint deliverables ahead of the upcoming regional festival holidays. Stage-1 and Stage-2 leave approvals remain open in the portal.",
      category: "FESTIVAL",
      priority: "NORMAL",
      publishDate: "August 10, 2026",
      authorName: "Rachel HR (People Operations Lead)",
      acknowledged: true,
    },
  ]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleAcknowledge = (id: string, title: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
    setToastMsg(`Read receipt logged for: "${title}" ✓`);
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

        <Interactive3DCard className="p-6 md:p-8 border border-pink-500/30 bg-gradient-to-r from-card/90 via-card/70 to-pink-500/10 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="bg-pink-500/15 border-pink-500/30 text-pink-300 text-[10px] font-bold uppercase">
                <Megaphone className="h-3 w-3 mr-1 text-pink-400" />
                HR Communications & Broadcasts
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Organization-Wide</span>
            </div>
            <h2 className="text-2xl font-black text-foreground">Official Corporate Announcements</h2>
            <p className="text-xs text-muted-foreground">
              Official company notices, policy mandates, festival announcements, and executive town hall broadcasts.
            </p>
          </div>
        </Interactive3DCard>

        {/* Announcements Stream */}
        <div className="space-y-4">
          {announcements.map((anc) => (
            <Interactive3DCard
              key={anc.id}
              className={`p-6 border transition-all space-y-4 ${
                anc.priority === "HIGH"
                  ? "border-pink-500/40 bg-card/80 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
                  : "border-border/80 bg-card/60"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[9px] font-bold ${
                        anc.category === "POLICY"
                          ? "border-purple-500/40 text-purple-300"
                          : anc.category === "FESTIVAL"
                          ? "border-amber-500/40 text-amber-300"
                          : "border-cyan-500/40 text-cyan-300"
                      }`}
                    >
                      {anc.category}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground font-mono">{anc.publishDate}</span>
                  </div>
                  <h3 className="text-base font-bold text-foreground">{anc.title}</h3>
                  <span className="text-[11px] text-muted-foreground block">
                    Posted by: <strong className="text-foreground">{anc.authorName}</strong>
                  </span>
                </div>

                {anc.acknowledged ? (
                  <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Read Acknowledged</span>
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    variant="brand"
                    onClick={() => handleAcknowledge(anc.id, anc.title)}
                    className="text-xs h-8 px-3 bg-pink-500 hover:bg-pink-600 text-white shrink-0 gap-1.5"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Acknowledge Notice</span>
                  </Button>
                )}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed pt-1 border-t border-border/40">
                {anc.body}
              </p>
            </Interactive3DCard>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
