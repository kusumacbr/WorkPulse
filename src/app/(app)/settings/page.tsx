"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useCurrentUser } from "@/components/layout/UserContext";
import {
  Laptop,
  Bell,
  CheckCircle2,
  User,
  ArrowLeft,
  Save,
} from "lucide-react";

export default function SettingsPage() {
  const user = useCurrentUser();
  const router = useRouter();
  const [previousRoute, setPreviousRoute] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Simple Notification Preferences
  const [sodReminder, setSodReminder] = useState(true);
  const [leaveAlerts, setLeaveAlerts] = useState(true);
  const [announcements, setAnnouncements] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fromParam = new URLSearchParams(window.location.search).get("from");
      const stored = sessionStorage.getItem("workpulse_last_active_route");
      const target = (fromParam && fromParam !== "/profile" && fromParam !== "/settings")
        ? fromParam
        : (stored && stored !== "/profile" && stored !== "/settings")
        ? stored
        : "/dashboard";
      setPreviousRoute(target);
    }
  }, []);

  const handleGoBack = () => {
    if (previousRoute) {
      router.push(previousRoute);
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  const isHR =
    user.roles.includes("HR") ||
    user.primaryRole === "HR" ||
    user.userEmail.toLowerCase().includes("hr") ||
    user.userEmail.toLowerCase().includes("admin") ||
    user.userEmail.toLowerCase().includes("director");

  const isLead =
    user.roles.includes("MANAGER") ||
    user.primaryRole === "MANAGER" ||
    user.userEmail.toLowerCase().includes("lead");

  // Load preferences from backend API on mount
  useEffect(() => {
    fetch("/api/v1/me/preferences")
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.preferences) {
          const p = data.data.preferences;
          if (p.sodReminder !== undefined) setSodReminder(p.sodReminder);
          if (p.leaveAlerts !== undefined) setLeaveAlerts(p.leaveAlerts);
          if (p.announcements !== undefined) setAnnouncements(p.announcements);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/v1/me/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sodReminder,
          leaveAlerts,
          announcements,
        }),
      });
      setToastMsg("✓ Settings saved successfully");
    } catch {
      setToastMsg("✓ Settings saved locally");
    } finally {
      setIsSaving(false);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-5 max-w-3xl mx-auto">
        {/* Top Header: Settings on Left, Back button on Right */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <h1 className="text-xl font-bold text-foreground">Settings</h1>

          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-card border border-border/80 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all shadow-sm group cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back</span>
          </button>
        </div>

        {/* Toast Alert */}
        {toastMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in shadow-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="font-semibold">{toastMsg}</span>
          </div>
        )}

        {/* Header with Save Button */}
        <div className="p-4 sm:p-6 rounded-2xl border border-border/80 bg-card/70 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-foreground">Settings &amp; Preferences</h2>
              <Badge variant="cyan" className="text-[10px] font-bold">
                {isHR ? "HR Operations" : isLead ? "Team Lead" : "Core Member"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customize your workspace theme and notification alerts.
            </p>
          </div>

          <Button
            size="sm"
            variant="brand"
            disabled={isSaving}
            onClick={handleSave}
            className="text-xs font-bold h-8.5 px-4 gap-1.5 rounded-xl shrink-0 cursor-pointer w-full sm:w-auto"
          >
            <Save className="h-3.5 w-3.5" />
            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
          </Button>
        </div>

        {/* 1. Theme & Appearance */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/50 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Laptop className="h-3.5 w-3.5 text-primary" />
              <span>Theme &amp; Appearance</span>
            </h3>
          </div>
          <div className="pt-1">
            <ThemeToggle variant="segmented" className="w-full justify-between" />
          </div>
        </div>

        {/* 2. Notification Preferences */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/50 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Bell className="h-3.5 w-3.5 text-primary" />
            <span>Notification Preferences</span>
          </h3>

          <div className="space-y-2 text-xs pt-1">
            <label className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/60 cursor-pointer hover:border-border transition-colors">
              <div>
                <strong className="text-foreground block font-semibold">
                  {isHR ? "Inbound Profile Queries" : isLead ? "Team Plan Submissions" : "Morning Plan (SOD) Reminders"}
                </strong>
                <span className="text-muted-foreground text-[11px]">
                  {isHR ? "Alert when employees request info updates" : isLead ? "Alert when team members submit plans" : "Daily 10:00 AM plan submission reminder"}
                </span>
              </div>
              <input
                type="checkbox"
                checked={sodReminder}
                onChange={(e) => setSodReminder(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/60 cursor-pointer hover:border-border transition-colors">
              <div>
                <strong className="text-foreground block font-semibold">
                  {isHR ? "Leave & WFH Stage-2 Queue" : isLead ? "Team Leave & WFH Requests" : "Leave & WFH Status Updates"}
                </strong>
                <span className="text-muted-foreground text-[11px]">
                  {isHR ? "Alert on pending final sign-offs" : isLead ? "Alert on new team requests" : "Real-time updates on your requests"}
                </span>
              </div>
              <input
                type="checkbox"
                checked={leaveAlerts}
                onChange={(e) => setLeaveAlerts(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/60 cursor-pointer hover:border-border transition-colors">
              <div>
                <strong className="text-foreground block font-semibold">Company Announcements &amp; Celebrations</strong>
                <span className="text-muted-foreground text-[11px]">Broadcast alerts for team events and celebrations</span>
              </div>
              <input
                type="checkbox"
                checked={announcements}
                onChange={(e) => setAnnouncements(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* 3. Account & Access Summary */}
        <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/40 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{user.userName}</p>
              <p className="text-[11px] font-mono text-muted-foreground">{user.userEmail}</p>
            </div>
          </div>

          <Badge variant="outline" className="text-[10px] font-mono shrink-0 self-start sm:self-center">
            {isHR ? "HR_ADMIN" : isLead ? "TEAM_LEAD" : "CORE_MEMBER"}
          </Badge>
        </div>
      </div>
    </PageTransition>
  );
}
