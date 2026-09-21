"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmployeeCelebrationBroadcastDeck } from "@/features/hr/components/EmployeeCelebrationBroadcastDeck";
import { HRWellbeingSignalsDeck } from "@/features/hr/components/HRWellbeingSignalsDeck";
import { useCurrentUser } from "@/components/layout/UserContext";
import { createClient } from "@/lib/supabase/client";
import {
  Megaphone,
  CheckCircle2,
  Check,
  HeartHandshake,
  Plus,
  Sparkles,
  PartyPopper,
  X,
  Loader2,
  Trash2,
} from "lucide-react";

export interface AnnouncementItem {
  id: string;
  title: string;
  body: string;
  category: "COMPANY_NEWS" | "FESTIVAL" | "POLICY" | "EMERGENCY" | "GENERAL";
  priority: "HIGH" | "NORMAL" | "URGENT";
  publishDate: string;
  authorName: string;
  acknowledged: boolean;
  acknowledgedBy?: string[];
}

const INITIAL_FALLBACK_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "anc-1",
    title: "Mandatory Information Security Policy",
    body: "Please review and acknowledge the updated corporate information security protocols and data handling standards for 2026.",
    category: "POLICY",
    priority: "HIGH",
    publishDate: "September 2, 2026",
    authorName: "priya@xorstack.com",
    acknowledged: true,
    acknowledgedBy: ["emp-sarah", "hr-rachel"],
  },
  {
    id: "anc-2",
    title: "Q3 2026 Engineering All-Hands Gala",
    body: "All engineering and cross-functional teams gather for quarterly architecture showcases, milestone celebrations, and product roadmaps.",
    category: "COMPANY_NEWS",
    priority: "HIGH",
    publishDate: "September 2, 2026",
    authorName: "Rachel HR",
    acknowledged: true,
    acknowledgedBy: ["emp-sarah", "hr-rachel"],
  },
];

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
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(INITIAL_FALLBACK_ANNOUNCEMENTS);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newCategory, setNewCategory] = useState<AnnouncementItem["category"]>("COMPANY_NEWS");
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<"LIVE" | "CONNECTING">("CONNECTING");

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 1. Fetch live notices from Supabase
  const loadAnnouncementsFromSupabase = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/v1/announcements");
      if (res.ok) {
        const json = await res.json();
        const data = json.data?.announcements || json.announcements;
        if (Array.isArray(data)) {
          const currentEmpId = user.userEmail || "emp-sarah";
          const uniqueMap = new Map<string, AnnouncementItem>();

          data.forEach((item: any) => {
            const cleanTitle = (item.title || "").trim();
            const key = cleanTitle.toLowerCase();
            if (!key) return;

            const acks: string[] = Array.isArray(item.acknowledgedBy)
              ? item.acknowledgedBy
              : Array.isArray(item.receipts)
              ? item.receipts.map((r: any) => r.employeeId)
              : [];

            const isAcked =
              item.acknowledged ||
              acks.some(
                (id) =>
                  id.toLowerCase() === currentEmpId.toLowerCase() ||
                  id.toLowerCase().includes("hr") ||
                  id === "emp-sarah"
              );

            const pubDate = item.publishDate
              ? new Date(item.publishDate).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })
              : "September 2026";

            if (!uniqueMap.has(key)) {
              uniqueMap.set(key, {
                id: item.id,
                title: item.title,
                body: item.body,
                category: item.category || "COMPANY_NEWS",
                priority: item.priority || "NORMAL",
                publishDate: pubDate,
                authorName: item.authorName || "People Operations",
                acknowledged: isAcked,
                acknowledgedBy: acks,
              });
            }
          });

          // HR is the source of truth for organization broadcasts. Do not cap this
          // list, otherwise employees can receive notices that HR cannot see/manage.
          setAnnouncements(Array.from(uniqueMap.values()));
        }
      }
    } catch (err) {
      console.warn("[AnnouncementsPage] Live load error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user.userEmail]);

  // Initial load
  useEffect(() => {
    loadAnnouncementsFromSupabase();
  }, [loadAnnouncementsFromSupabase]);

  // 2. Real-Time Supabase WebSocket Subscription & Cross-Tab Broadcast Channel
  useEffect(() => {
    if (typeof window === "undefined") return;

    let supabaseChannel: any = null;
    let broadcastChannel: BroadcastChannel | null = null;

    try {
      // Connect to Supabase Realtime channel
      const supabase = createClient();
      supabaseChannel = supabase
        .channel("workpulse-culture-live")
        .on("broadcast", { event: "announcement:new" }, (payload) => {
          console.log("[Supabase Realtime] New announcement received live:", payload);
          const newAnc = payload.payload || payload;
          setAnnouncements((prev) => {
            if (prev.some((a) => a.id === newAnc.id)) return prev;
            return [newAnc, ...prev];
          });
          showToast(`📢 New Notice: "${newAnc.title}"`);
        })
        .on("broadcast", { event: "announcement:acknowledged" }, (payload) => {
          console.log("[Supabase Realtime] Acknowledge received live:", payload);
          const targetId = payload.payload?.id || payload.id;
          if (targetId) {
            setAnnouncements((prev) =>
              prev.map((a) => (a.id === targetId ? { ...a, acknowledged: true } : a))
            );
          }
        })
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setRealtimeStatus("LIVE");
          }
        });

      // Connect multi-tab BroadcastChannel
      if ("BroadcastChannel" in window) {
        broadcastChannel = new BroadcastChannel("workpulse_culture_announcements_v1");
        broadcastChannel.onmessage = (event) => {
          const { type, data } = event.data || {};
          if (type === "NEW_ANNOUNCEMENT" && data) {
            setAnnouncements((prev) => {
              if (prev.some((a) => a.id === data.id)) return prev;
              return [data, ...prev];
            });
          } else if (type === "ACKNOWLEDGE" && data?.id) {
            setAnnouncements((prev) =>
              prev.map((a) => (a.id === data.id ? { ...a, acknowledged: true } : a))
            );
          }
        };
      }
    } catch (e) {
      console.warn("[AnnouncementsPage] Realtime setup warning:", e);
    }

    return () => {
      if (supabaseChannel) supabaseChannel.unsubscribe();
      if (broadcastChannel) broadcastChannel.close();
    };
  }, []);

  // 3. Handle Acknowledge Action (Persists to Supabase in real-time)
  const handleAcknowledge = async (id: string, title: string) => {
    // Optimistic UI update
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
    showToast(`✓ Acknowledged: "${title}"`);

    // Call Supabase API endpoint
    try {
      await fetch(`/api/v1/announcements/${id}/acknowledge`, {
        method: "POST",
      });

      // Broadcast to Supabase Realtime channel
      const supabase = createClient();
      const channel = supabase.channel("workpulse-culture-live");
      await channel.send({
        type: "broadcast",
        event: "announcement:acknowledged",
        payload: { id, title },
      });

      // Multi-tab BroadcastChannel
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("workpulse_culture_announcements_v1");
        bc.postMessage({ type: "ACKNOWLEDGE", data: { id, title } });
        bc.close();
      }
    } catch (e) {
      console.warn("[AnnouncementsPage] Acknowledge sync warning:", e);
    }
  };

  const handleDeleteAnnouncement = async (id: string, title: string) => {
    if (deletingId || !window.confirm(`Delete \"${title}\"? This cannot be undone.`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/v1/announcements/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.error?.message || "Unable to delete the notice");
      }

      setAnnouncements((prev) => prev.filter((announcement) => announcement.id !== id));
      const supabase = createClient();
      const channel = supabase.channel("workpulse-supabase-live-channel");
      await channel.send({ type: "broadcast", event: "notification:deleted", payload: { announcementId: id, title } });
      await channel.send({ type: "broadcast", event: "announcement:deleted", payload: { id, title } });
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
        bc.postMessage({ type: "notification:deleted", payload: { announcementId: id, title } });
        bc.close();
      }
      showToast(`Notice deleted: \"${title}\"`);
    } catch (error: any) {
      showToast(error?.message || "Unable to delete the notice");
    } finally {
      setDeletingId(null);
    }
  };

  // 4. Handle Post Announcement (Persists to Supabase & broadcasts live)
  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const pubDate = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const newAnc: AnnouncementItem = {
      id: `anc-${Date.now()}`,
      title: newTitle.trim(),
      body: newBody.trim(),
      category: newCategory,
      priority: "NORMAL",
      publishDate: pubDate,
      authorName: user.userName || "People Operations",
      acknowledged: true,
      acknowledgedBy: [user.userEmail || "hr-rachel"],
    };

    // Optimistic UI update
    setAnnouncements((prev) => [newAnc, ...prev]);
    setNewTitle("");
    setNewBody("");
    setShowPostModal(false);
    showToast("✓ Notice published live to Supabase workspace!");

    try {
      // 1. Persist to Supabase via backend API
      const res = await fetch("/api/v1/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newAnc.title,
          body: newAnc.body,
          category: newAnc.category,
          priority: newAnc.priority,
          requiresAcknowledgement: true,
        }),
      });

      let persistedId = newAnc.id;
      if (res.ok) {
        const json = await res.json();
        if (json.data?.announcement?.id) {
          persistedId = json.data.announcement.id;
          newAnc.id = persistedId;
        }
      }

      // 2. Broadcast across Supabase Realtime channels
      const supabase = createClient();
      const mainChannel = supabase.channel("workpulse-supabase-live-channel");
      await mainChannel.send({
        type: "broadcast",
        event: "announcement:new",
        payload: newAnc,
      });
      await mainChannel.send({
        type: "broadcast",
        event: "notification:new",
        payload: {
          id: `notif-ann-${persistedId}`,
          title: newAnc.title,
          message: newAnc.body,
          type: "GENERAL",
          linkUrl: "/announcements",
        },
      });

      const cultureChannel = supabase.channel("workpulse-culture-live");
      await cultureChannel.send({
        type: "broadcast",
        event: "announcement:new",
        payload: newAnc,
      });

      // 3. Multi-tab broadcast
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("workpulse_culture_announcements_v1");
        bc.postMessage({ type: "NEW_ANNOUNCEMENT", data: newAnc });
        bc.close();

        const globalBc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
        globalBc.postMessage({
          type: "notification:new",
          payload: {
            id: `notif-ann-${persistedId}`,
            title: newAnc.title,
            message: newAnc.body,
            type: "GENERAL",
            linkUrl: "/announcements",
          },
        });
        globalBc.close();
      }
    } catch (err) {
      console.warn("[AnnouncementsPage] Post sync warning:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryMeta = (category: AnnouncementItem["category"]) => {
    switch (category) {
      case "COMPANY_NEWS":
        return { label: "Company News", style: "border-cyan-500/40 text-cyan-400 bg-cyan-500/10" };
      case "FESTIVAL":
        return { label: "Festival & Holiday", style: "border-amber-500/40 text-amber-400 bg-amber-500/10" };
      case "POLICY":
        return { label: "Corporate Policy", style: "border-purple-500/40 text-purple-400 bg-purple-500/10" };
      case "EMERGENCY":
        return { label: "Urgent Notice", style: "border-rose-500/40 text-rose-400 bg-rose-500/10" };
      default:
        return { label: "General", style: "border-border text-muted-foreground bg-muted/20" };
    }
  };

  if (!isHR) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-muted-foreground text-xs font-mono">
        <span>Redirecting to Dashboard...</span>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-5 max-w-5xl mx-auto">
        {toastMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-bold">{toastMsg}</span>
          </div>
        )}

        {/* Clean, Simple Top Header with Real-Time Supabase Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/60 p-4 sm:p-5 rounded-2xl border border-border/80">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-foreground">Broadcasts &amp; Culture</h2>
              <Badge variant="brand" className="text-[10px] font-bold bg-pink-500/15 text-pink-400 border-pink-500/30">
                HR Hub
              </Badge>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{realtimeStatus === "LIVE" ? "Supabase Realtime Live" : "Supabase Realtime Sync"}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Company announcements, cultural celebrations, and employee wellbeing synchronized across all workspaces.
            </p>
          </div>

          {isHR && (
            <Button
              variant="brand"
              size="sm"
              onClick={() => setShowPostModal(true)}
              className="w-full sm:w-auto justify-center text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-600 text-white gap-1.5 shadow-sm rounded-xl shrink-0 h-8 px-3.5 hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              <span>Post Notice</span>
            </Button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center p-1 rounded-xl bg-card/60 border border-border/80 overflow-x-auto custom-scrollbar whitespace-nowrap gap-1 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab("celebrations")}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "celebrations"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <PartyPopper className="h-3.5 w-3.5" />
            <span>Celebrations &amp; Birthdays</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("broadcasts")}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "broadcasts"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Megaphone className="h-3.5 w-3.5" />
            <span>Official Notices ({announcements.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("wellbeing")}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "wellbeing"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <HeartHandshake className="h-3.5 w-3.5" />
            <span>Team Wellbeing</span>
          </button>
        </div>

        {/* Tab 1: Celebrations */}
        {activeTab === "celebrations" && <EmployeeCelebrationBroadcastDeck />}

        {/* Tab 2: Clean Official Notices */}
        {activeTab === "broadcasts" && (
          <div className="space-y-3">
            {isLoading && (
              <div className="p-4 rounded-xl border border-border/50 bg-card/40 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-pink-400" />
                <span>Syncing live notices from Supabase...</span>
              </div>
            )}

            {announcements.map((anc) => {
              const meta = getCategoryMeta(anc.category);

              return (
                <div
                  key={anc.id}
                  className="p-4 rounded-2xl border border-border/70 bg-card/80 space-y-2 shadow-sm hover:border-border transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-sm font-bold text-foreground">{anc.title}</strong>
                      <Badge variant="outline" className={`text-[9px] font-bold ${meta.style}`}>
                        {meta.label}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        · {anc.publishDate} · by {anc.authorName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {anc.acknowledged ? (
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Acknowledged</span>
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="brand"
                          onClick={() => handleAcknowledge(anc.id, anc.title)}
                          className="text-xs h-7 px-3 bg-pink-600 hover:bg-pink-700 text-white gap-1 rounded-lg shadow-sm"
                        >
                          <Check className="h-3 w-3" />
                          <span>Acknowledge</span>
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        aria-label={`Delete ${anc.title}`}
                        disabled={deletingId === anc.id}
                        onClick={() => handleDeleteAnnouncement(anc.id, anc.title)}
                        className="h-7 px-2 text-rose-400 border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-300"
                      >
                        {deletingId === anc.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        <span className="sr-only">Delete notice</span>
                      </Button>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {anc.body}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Team Wellbeing */}
        {activeTab === "wellbeing" && <HRWellbeingSignalsDeck />}

        {/* Post Modal with Supabase Persistence */}
        {showPostModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-2xl bg-card border border-border p-4 sm:p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 custom-scrollbar">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-pink-400" />
                  <h3 className="text-sm font-bold text-foreground">Post Company Notice</h3>
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
                  <label className="text-[11px] text-muted-foreground font-semibold">Notice Title</label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Q3 All-Hands Meeting & Sprint Showcase"
                    className="h-8 text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground font-semibold">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full h-8 rounded-lg border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none"
                  >
                    <option value="COMPANY_NEWS">Company News</option>
                    <option value="FESTIVAL">Festival &amp; Holiday</option>
                    <option value="POLICY">Corporate Policy</option>
                    <option value="GENERAL">General Notice</option>
                    <option value="EMERGENCY">Urgent Notice</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground font-semibold">Message</label>
                  <textarea
                    rows={3}
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    placeholder="Type the notice message..."
                    className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:outline-none resize-none"
                    required
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPostModal(false)}
                    className="text-xs h-8 rounded-xl w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    variant="brand"
                    disabled={isSubmitting}
                    className="text-xs font-bold h-8 bg-pink-600 hover:bg-pink-700 text-white rounded-xl gap-1 shadow-sm w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3 w-3" />
                        <span>Publish to Workspace</span>
                      </>
                    )}
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
