"use client";

import React, { useState } from "react";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useCurrentUser } from "@/components/layout/UserContext";
import {
  Settings,
  ShieldCheck,
  Bell,
  Sliders,
  Key,
  Globe,
  CheckCircle2,
  Lock,
  Laptop,
  Radio,
} from "lucide-react";

type SettingsTab = "preferences" | "appearance" | "notifications" | "security" | "integrations";

export default function SettingsPage() {
  const user = useCurrentUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>("preferences");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Preference form states
  const [timezone, setTimezone] = useState("Asia/Kolkata (IST +05:30)");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [language, setLanguage] = useState("English (US)");

  // Notification toggles
  const [emailDigest, setEmailDigest] = useState(true);
  const [inAppBadges, setInAppBadges] = useState(true);
  const [dailySodReminder, setDailySodReminder] = useState(true);
  const [leaveAlerts, setLeaveAlerts] = useState(true);

  const handleSavePreferences = () => {
    setToastMsg("System preferences updated and saved successfully! ✓");
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Toast Alert */}
        {toastMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-bold">{toastMsg}</span>
          </div>
        )}

        {/* Hero Header */}
        <Interactive3DCard className="p-6 md:p-8 border border-slate-500/30 bg-gradient-to-r from-card/90 via-card/70 to-slate-500/10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="bg-slate-500/15 border-slate-500/30 text-slate-300 text-[10px] font-bold uppercase">
                  <Settings className="h-3 w-3 mr-1 text-slate-400" />
                  Enterprise Configuration
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {user.userName} · {user.primaryRole}
                </span>
              </div>
              <h2 className="text-2xl font-black text-foreground">Settings & Preferences</h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Manage your personal work preferences, active session security, theme appearance, and notification dispatch rules.
              </p>
            </div>

            <Button
              variant="brand"
              size="sm"
              onClick={handleSavePreferences}
              className="text-xs h-9 px-4 font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white gap-1.5 shadow-md shrink-0"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Save Changes</span>
            </Button>
          </div>

          {/* Navigation Pills */}
          <div className="pt-2 flex items-center p-1.5 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-xl overflow-x-auto gap-1 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab("preferences")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === "preferences"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>General Preferences</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("appearance")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === "appearance"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Laptop className="h-3.5 w-3.5" />
              <span>Appearance & Theme</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === "notifications"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Bell className="h-3.5 w-3.5" />
              <span>Notifications & Alerts</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === "security"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Key className="h-3.5 w-3.5" />
              <span>Security & Passkeys</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("integrations")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === "integrations"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Radio className="h-3.5 w-3.5" />
              <span>Integrations & Terminals</span>
            </button>
          </div>
        </Interactive3DCard>

        {/* Tab Content 1: General Preferences */}
        {activeTab === "preferences" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Interactive3DCard className="p-6 border border-border/80 space-y-4 bg-card/60">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Globe className="h-4 w-4 text-cyan-400" />
                Localization & Regional Formatting
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-muted-foreground block mb-1 font-semibold">Display Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-border/80 bg-background/80 text-foreground text-xs font-medium focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="Asia/Kolkata (IST +05:30)">Asia/Kolkata (IST +05:30) - Primary HQ</option>
                    <option value="America/New_York (EST -05:00)">America/New_York (EST -05:00)</option>
                    <option value="Europe/London (GMT +00:00)">Europe/London (GMT +00:00)</option>
                    <option value="Asia/Singapore (SGT +08:00)">Asia/Singapore (SGT +08:00)</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1 font-semibold">Date Display Format</label>
                  <select
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-border/80 bg-background/80 text-foreground text-xs font-medium focus:outline-none focus:border-cyan-500/50"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 24/08/2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
                    <option value="MMM DD, YYYY">MMM DD, YYYY (e.g. Aug 24, 2026)</option>
                  </select>
                </div>

                <div>
                  <label className="text-muted-foreground block mb-1 font-semibold">Portal Language</label>
                  <Input
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="h-9 text-xs"
                    disabled
                  />
                </div>
              </div>
            </Interactive3DCard>

            <Interactive3DCard className="p-6 border border-border/80 space-y-4 bg-card/60">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Sliders className="h-4 w-4 text-purple-400" />
                Workday & SOD Defaults
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/60">
                  <div>
                    <strong className="text-foreground block">Default Workday Shift</strong>
                    <span className="text-[11px] text-muted-foreground">Standard 9-hour operational band</span>
                  </div>
                  <span className="font-mono text-cyan-300 font-bold">10:00 AM – 07:00 PM</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/60">
                  <div>
                    <strong className="text-foreground block">Biometric Grace Window</strong>
                    <span className="text-[11px] text-muted-foreground">Threshold before late punch mark</span>
                  </div>
                  <span className="font-mono text-emerald-400 font-bold">15 Mins (10:15 AM)</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/60">
                  <div>
                    <strong className="text-foreground block">Default Work Location</strong>
                    <span className="text-[11px] text-muted-foreground">Assigned hardware punch terminal</span>
                  </div>
                  <span className="text-foreground font-semibold">Bangalore HQ (Floor 0)</span>
                </div>
              </div>
            </Interactive3DCard>
          </div>
        )}

        {/* Tab Content 2: Appearance & Theme */}
        {activeTab === "appearance" && (
          <Interactive3DCard className="p-6 md:p-8 border border-border/80 space-y-6 bg-card/60">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Laptop className="h-4 w-4 text-cyan-400" />
                Theme & Display Customization
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Customize your visual experience with dark mode, light mode, or system automatic matching.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border/60 max-w-md space-y-4">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Active Theme Mode
              </span>
              <ThemeToggle variant="segmented" className="w-full justify-between" />
            </div>
          </Interactive3DCard>
        )}

        {/* Tab Content 3: Notifications */}
        {activeTab === "notifications" && (
          <Interactive3DCard className="p-6 md:p-8 border border-border/80 space-y-6 bg-card/60">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Bell className="h-4 w-4 text-pink-400" />
                Notification & Alert Preferences
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Configure when and how WorkPulse delivers task reminders, approval alerts, and company announcements.
              </p>
            </div>

            <div className="space-y-3 max-w-2xl text-xs">
              <label className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/60 cursor-pointer hover:border-border transition-colors">
                <div>
                  <strong className="text-foreground block text-sm">Daily Morning SOD Reminders</strong>
                  <span className="text-muted-foreground">Receive prompt at 09:45 AM if morning SOD plan is unsubmitted</span>
                </div>
                <input
                  type="checkbox"
                  checked={dailySodReminder}
                  onChange={(e) => setDailySodReminder(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-cyan-500 focus:ring-cyan-400"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/60 cursor-pointer hover:border-border transition-colors">
                <div>
                  <strong className="text-foreground block text-sm">Two-Stage Leave & WFH Updates</strong>
                  <span className="text-muted-foreground">Instant notification when Team Lead or HR acts on your requests</span>
                </div>
                <input
                  type="checkbox"
                  checked={leaveAlerts}
                  onChange={(e) => setLeaveAlerts(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-cyan-500 focus:ring-cyan-400"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/60 cursor-pointer hover:border-border transition-colors">
                <div>
                  <strong className="text-foreground block text-sm">Weekly Executive Digest Email</strong>
                  <span className="text-muted-foreground">Receive weekly sprint OKR summary and performance feedback</span>
                </div>
                <input
                  type="checkbox"
                  checked={emailDigest}
                  onChange={(e) => setEmailDigest(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-cyan-500 focus:ring-cyan-400"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl bg-card border border-border/60 cursor-pointer hover:border-border transition-colors">
                <div>
                  <strong className="text-foreground block text-sm">Real-time In-App Badges & Popups</strong>
                  <span className="text-muted-foreground">Display instant popups for team broadcasts and stage approvals</span>
                </div>
                <input
                  type="checkbox"
                  checked={inAppBadges}
                  onChange={(e) => setInAppBadges(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-cyan-500 focus:ring-cyan-400"
                />
              </label>
            </div>
          </Interactive3DCard>
        )}

        {/* Tab Content 4: Security & Passkeys */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Interactive3DCard className="p-6 border border-border/80 space-y-4 bg-card/60">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Session Security & Authentication
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/60">
                  <span className="text-muted-foreground">Account Status</span>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                    ACTIVE & VERIFIED
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/60">
                  <span className="text-muted-foreground">Two-Factor Authentication</span>
                  <span className="font-semibold text-foreground">Enabled via Organization SSO</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/60">
                  <span className="text-muted-foreground">Hardware Passkey</span>
                  <Badge variant="brand" className="bg-cyan-500/15 text-cyan-300 border-cyan-500/30 text-[10px]">
                    REGISTERED
                  </Badge>
                </div>
              </div>
            </Interactive3DCard>

            <Interactive3DCard className="p-6 border border-border/80 space-y-4 bg-card/60">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-purple-400" />
                Active Sessions
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
                  <div className="flex items-center justify-between">
                    <strong className="text-foreground">Current Browser Session</strong>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">Active Now</span>
                  </div>
                  <span className="text-muted-foreground block text-[11px]">
                    Chrome 131 · Windows 11 · IP: 127.0.0.1 (Localhost)
                  </span>
                </div>
              </div>
            </Interactive3DCard>
          </div>
        )}

        {/* Tab Content 5: Integrations */}
        {activeTab === "integrations" && (
          <Interactive3DCard className="p-6 md:p-8 border border-border/80 space-y-4 bg-card/60">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Radio className="h-4 w-4 text-cyan-400" />
              Connected Enterprise Subsystems
            </h3>
            <p className="text-xs text-muted-foreground">
              Hardware terminals, biometric ingestion webhooks, and calendar sync bridges.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-card border border-border/60 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-foreground text-xs">Bangalore HQ Terminal #1</strong>
                  <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">ONLINE</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground font-mono">ID: dev-hq-floor0 · SHA-256 Verified</p>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border/60 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-foreground text-xs">Real-Time Event Stream (SSE)</strong>
                  <Badge variant="brand" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">CONNECTED</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground font-mono">Stream: /api/v1/realtime/stream</p>
              </div>
            </div>
          </Interactive3DCard>
        )}
      </div>
    </PageTransition>
  );
}
