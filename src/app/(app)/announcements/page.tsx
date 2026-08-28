"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmployeeCelebrationBroadcastDeck } from "@/features/hr/components/EmployeeCelebrationBroadcastDeck";
import { HRWellbeingSignalsDeck } from "@/features/hr/components/HRWellbeingSignalsDeck";
import { useCurrentUser } from "@/components/layout/UserContext";
import {
  Megaphone,
  CheckCircle2,
  Check,
  HeartHandshake,
  Plus,
  Sparkles,
  PartyPopper,
  X,
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
  const router = useRouter();
  const user = useCurrentUser();
  const isHR =
    user.roles.includes("HR") ||
    user.primaryRole === "HR" ||
    user.userEmail.toLowerCase().includes("hr");

  useEffect(() => {
    if (!isHR && user.userEmail) {
      router.replace("/dashboard");
    }
  }, [isHR, user.userEmail, router]);

  const [activeTab, setActiveTab] = useState<"celebrations" | "broadcasts" | "wellbeing">("celebrations");

  if (!isHR) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-muted-foreground text-xs font-mono">
        <span>Redirecting to Dashboard...</span>
      </div>
    );
  }

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
      title: "Diwali Sweet Hampers & Festive Celebration Schedule",
      body: "Official Diwali festival sweet hampers and team celebration schedule have been dispatched to all department pods! Please review the holiday calendar.",
      category: "FESTIVAL",
      priority: "HIGH",
      publishDate: "August 18, 2026",
      authorName: "Rachel HR (People Operations Lead)",
      acknowledged: true,
    },
    {
      id: "anc-3",
      title: "POSH 2026 Annual Compliance Notice & Workplace Guidelines",
      body: "Mandatory corporate policy update covering respectful workplace practices, anti-harassment safeguards, and anonymous grievance reporting procedures under DPDP guidelines.",
      category: "POLICY",
      priority: "HIGH",
      publishDate: "August 15, 2026",
      authorName: "Rachel HR (People Operations Lead)",
      acknowledged: true,
    },
    {
      id: "anc-4",
      title: "Upcoming Cultural Festival Holiday: Onam & Ganesh Chaturthi",
      body: "Please plan your sprint deliverables ahead of the upcoming regional festival holidays. Stage-1 and Stage-2 leave approvals remain open in the portal.",
      category: "FESTIVAL",
      priority: "NORMAL",
      publishDate: "August 10, 2026",
      authorName: "Rachel HR (People Operations Lead)",
      acknowledged: true,
    },
  ]);

  const [showPostModal, setShowPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCategory, setNewCategory] = useState<AnnouncementItem["category"]>("COMPANY_NEWS");
  const [newPriority, setNewPriority] = useState<AnnouncementItem["priority"]>("NORMAL");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAcknowledge = (id: string, title: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
    showToast(`Read receipt logged for: "${title}" ✓`);
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    const newAnc: AnnouncementItem = {
      id: `anc-${Date.now()}`,
      title: newTitle.trim(),
      body: newBody.trim(),
      category: newCategory,
      priority: newPriority,
      publishDate: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      authorName: user.userName || "People Operations",
      acknowledged: true,
    };

    setAnnouncements([newAnc, ...announcements]);
    setNewTitle("");
    setNewBody("");
    setShowPostModal(false);
    showToast("🎉 Official announcement broadcasted to all employees!");
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {toastMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-bold">{toastMsg}</span>
          </div>
        )}

        {/* 1. Header Banner */}
        <Interactive3DCard className="p-6 md:p-8 border border-pink-500/30 bg-gradient-to-r from-card/90 via-card/70 to-pink-500/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="bg-pink-500/15 border-pink-500/30 text-pink-300 text-[10px] font-bold uppercase">
                  <Sparkles className="h-3 w-3 mr-1 text-pink-400" />
                  Culture, Broadcasts &amp; Celebrations
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">Organization-Wide</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground">
                Announcements, Celebrations &amp; Broadcasts
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Stay connected with birthdays, cultural festivals, sweet hampers dispatch, official company notices, and team wellbeing.
              </p>
            </div>

            {isHR && (
              <Button
                variant="brand"
                size="sm"
                onClick={() => setShowPostModal(true)}
                className="text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-600 text-white gap-1.5 shadow-[0_4px_20px_rgba(244,63,94,0.3)] hover:opacity-95 shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Post Announcement</span>
              </Button>
            )}
          </div>
        </Interactive3DCard>

        {/* 2. Differentiated Navigation Tabs */}
        <div className="flex items-center p-1.5 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-xl overflow-x-auto gap-2 shadow-sm">
          {/* TAB 1: BIRTHDAYS & CULTURAL CELEBRATIONS */}
          <button
            type="button"
            onClick={() => setActiveTab("celebrations")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              activeTab === "celebrations"
                ? "bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <PartyPopper className="h-4 w-4" />
            <span>Birthdays &amp; Cultural Celebrations</span>
          </button>

          {/* TAB 2: OFFICIAL BROADCASTS */}
          <button
            type="button"
            onClick={() => setActiveTab("broadcasts")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              activeTab === "broadcasts"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <Megaphone className="h-4 w-4" />
            <span>Official Broadcasts ({announcements.length})</span>
          </button>

          {/* TAB 3: WELLBEING & CULTURE PULSE */}
          <button
            type="button"
            onClick={() => setActiveTab("wellbeing")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
              activeTab === "wellbeing"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <HeartHandshake className="h-4 w-4" />
            <span>Wellbeing Signals</span>
          </button>
        </div>

        {/* 3. Tab Contents */}

        {/* TAB 1: BIRTHDAYS, FESTIVALS & CELEBRATIONS */}
        {activeTab === "celebrations" && <EmployeeCelebrationBroadcastDeck />}

        {/* TAB 2: OFFICIAL BROADCASTS STREAM */}
        {activeTab === "broadcasts" && (
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
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-bold ${
                          anc.category === "POLICY"
                            ? "border-purple-500/40 text-purple-300 bg-purple-500/10"
                            : anc.category === "FESTIVAL"
                            ? "border-amber-500/40 text-amber-300 bg-amber-500/10"
                            : "border-cyan-500/40 text-cyan-300 bg-cyan-500/10"
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
                      className="text-xs h-8 px-3 bg-pink-500 hover:bg-pink-600 text-white shrink-0 gap-1.5 shadow-sm"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Acknowledge Notice</span>
                    </Button>
                  )}
                </div>

                <p className="text-xs text-foreground/80 leading-relaxed pt-1 border-t border-border/40">
                  {anc.body}
                </p>
              </Interactive3DCard>
            ))}
          </div>
        )}

        {/* TAB 3: WELLBEING & MOOD PULSE */}
        {activeTab === "wellbeing" && <HRWellbeingSignalsDeck />}

        {/* Post Announcement Modal */}
        {showPostModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl bg-card border border-pink-500/40 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-pink-400" />
                  <h3 className="text-sm font-bold text-foreground">Broadcast Organization Announcement</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handlePostAnnouncement} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground font-semibold">Announcement Title</label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Q3 All-Hands Meeting & Festive Holidays"
                    className="h-9 text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground font-semibold">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none"
                    >
                      <option value="COMPANY_NEWS">Company News</option>
                      <option value="FESTIVAL">Cultural / Festival</option>
                      <option value="POLICY">Policy Mandate</option>
                      <option value="EMERGENCY">Urgent / Emergency</option>
                      <option value="GENERAL">General Notice</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground font-semibold">Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as any)}
                      className="w-full h-9 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none"
                    >
                      <option value="NORMAL">Normal Priority</option>
                      <option value="HIGH">High Priority</option>
                      <option value="URGENT">Urgent Priority</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground font-semibold">Broadcast Message Content</label>
                  <textarea
                    rows={4}
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    placeholder="Type the announcement details to be published to all staff..."
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPostModal(false)}
                    className="text-xs h-8"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    variant="brand"
                    className="text-xs font-bold h-8 bg-pink-600 hover:bg-pink-700 text-white shadow-sm gap-1"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Publish Broadcast</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
