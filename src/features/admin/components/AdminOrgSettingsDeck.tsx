"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { WorkdayService } from "@/server/services/workday-service";
import {
  Building2,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Save,
} from "lucide-react";

export function AdminOrgSettingsDeck() {

  // Org metadata state
  const [orgName, setOrgName] = useState("Xorstack Technologies");
  const [orgDomain, setOrgDomain] = useState("xorstack.com");
  const [timezone, setTimezone] = useState("Asia/Kolkata (IST +5:30)");
  const [defaultShift, setDefaultShift] = useState("10:00 AM - 07:00 PM");
  const [graceMinutes, setGraceMinutes] = useState(15);

  // Fallback Reviewer setting
  const [fallbackReviewerId, setFallbackReviewerId] = useState<string>(
    WorkdayService.getOrgFallbackReviewerId() || "user-david"
  );

  // Maintenance mode & Feature Flags
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState(
    "Scheduled platform maintenance in progress. Workday submissions will resume shortly."
  );
  const [enableAiAssistance, setEnableAiAssistance] = useState(true);
  const [enableBiometricSyncWebhooks, setEnableBiometricSyncWebhooks] = useState(true);
  const [strictHmacReplayEnforcement, setStrictHmacReplayEnforcement] = useState(true);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveOrgSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // Update WorkdayService fallback reviewer
    WorkdayService.setOrgFallbackReviewerId(fallbackReviewerId || null);
    showToast("Organization configuration & fallback reviewer settings saved! ✓");
  };

  // Find admin candidates for fallback reviewer
  const adminCandidates = [
    { id: "user-david", name: "David Admin (IT SuperAdmin)", email: "admin@xorstack.com" },
    { id: "user-victoria", name: "Victoria Director (Operations Lead)", email: "victoria.director@xorstack.com" },
    { id: "user-alex", name: "Alex Lead (VP of Engineering)", email: "lead.alex@xorstack.com" },
  ];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Maintenance Mode Warning Banner if active */}
      {isMaintenanceMode && (
        <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            <div>
              <strong className="font-bold block">Platform Maintenance Mode Active</strong>
              <span>{maintenanceMessage}</span>
            </div>
          </div>
          <Badge variant="destructive" className="text-[10px]">Read-Only</Badge>
        </div>
      )}

      <form onSubmit={handleSaveOrgSettings} className="space-y-6">
        {/* Section 1: Tenant & Shift Configuration */}
        <Interactive3DCard className="p-6 border border-red-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-red-400" />
                Tenant Profile & Enterprise Shift Policies
              </h3>
              <p className="text-xs text-muted-foreground">
                Configures organization domain boundaries, official core shift hours, and biometric arrival grace thresholds.
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono text-red-300 border-red-500/30">
              Primary Tenant
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground block">Organization Name</label>
              <Input
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="h-8 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground block">Primary Allowed Domain</label>
              <Input
                value={orgDomain}
                onChange={(e) => setOrgDomain(e.target.value)}
                className="h-8 text-xs font-mono font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground block">Official Timezone</label>
              <Input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="h-8 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground block">Default Core Shift</label>
              <Input
                value={defaultShift}
                onChange={(e) => setDefaultShift(e.target.value)}
                className="h-8 text-xs font-mono font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground block">
                Biometric Arrival Grace Window (Mins)
              </label>
              <Input
                type="number"
                value={graceMinutes}
                onChange={(e) => setGraceMinutes(Number(e.target.value))}
                className="h-8 text-xs font-mono font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-muted-foreground block">Saturday Work Policy</label>
              <div className="h-8 px-3 rounded-md bg-card/60 border border-input flex items-center text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Employees: On-Demand</span>
                <span className="mx-2">·</span>
                <span>Interns: 10 AM - 7 PM</span>
              </div>
            </div>
          </div>
        </Interactive3DCard>

        {/* Section 2: Global Fallback Reviewer Configuration */}
        <Interactive3DCard className="p-6 border border-purple-500/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-purple-400" />
                Global Fallback Reviewer for Unassigned Employees
              </h3>
              <p className="text-xs text-muted-foreground">
                Designates which Admin account reviews daily SOD/EOD submissions for employees who have no direct reporting manager set via ManagerAssignment (e.g. HR staff in small orgs).
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono text-purple-300 border-purple-500/30">
              orgFallbackReviewerId
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <label className="font-semibold text-muted-foreground block">
                Designated Fallback Reviewer Account
              </label>
              <select
                value={fallbackReviewerId}
                onChange={(e) => setFallbackReviewerId(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-input bg-card text-xs font-semibold text-foreground focus:outline-none"
              >
                <option value="">None (Graceful Self-Containment - No pending review step)</option>
                {adminCandidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-muted-foreground leading-relaxed block">
                When set, unassigned employees&apos; workdays are reviewable only by this selected Admin. Peer HR and non-manager Team Leads remain strictly denied access.
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-background/50 border border-border space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">Active Configuration Status</span>
                <Badge variant="brand" className="text-[10px] bg-purple-500/15 text-purple-300 border-purple-500/30 font-bold">
                  {fallbackReviewerId ? "Admin Designated" : "Self-Contained"}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Current Reviewer ID: <strong className="text-cyan-300 font-mono">{fallbackReviewerId || "null"}</strong>
              </p>
              <div className="text-[10px] text-muted-foreground pt-1 border-t border-border/50">
                Connected directly to server-side <code className="text-purple-300 font-mono">WorkdayService.setOrgFallbackReviewerId()</code>.
              </div>
            </div>
          </div>
        </Interactive3DCard>

        {/* Section 3: Feature Flags, Maintenance & Security Toggles */}
        <Interactive3DCard className="p-6 border border-border/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Sliders className="h-4 w-4 text-cyan-400" />
                Platform Feature Flags & Security Controls
              </h3>
              <p className="text-xs text-muted-foreground">
                Enable or disable operational modules and enforce strict cryptographic security policies.
              </p>
            </div>
            <Badge variant="outline" className="text-xs text-cyan-300 border-cyan-500/30">
              Live Toggles
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Toggle 1: Maintenance Mode */}
            <div className="p-4 rounded-xl bg-card/60 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">Maintenance Mode</span>
                <input
                  type="checkbox"
                  checked={isMaintenanceMode}
                  onChange={(e) => setIsMaintenanceMode(e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-red-500 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Puts the platform in read-only mode for non-admin users during database or hardware upgrades.
              </p>
              {isMaintenanceMode && (
                <Input
                  value={maintenanceMessage}
                  onChange={(e) => setMaintenanceMessage(e.target.value)}
                  placeholder="Custom broadcast banner message..."
                  className="h-7 text-[11px] mt-1"
                />
              )}
            </div>

            {/* Toggle 2: Strict HMAC Replay */}
            <div className="p-4 rounded-xl bg-card/60 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">HMAC Replay Tolerance (5m)</span>
                <input
                  type="checkbox"
                  checked={strictHmacReplayEnforcement}
                  onChange={(e) => setStrictHmacReplayEnforcement(e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-emerald-500 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Rejects any biometric webhook timestamp with greater than 300-second clock skew.
              </p>
            </div>

            {/* Toggle 3: Biometric Webhook Sync */}
            <div className="p-4 rounded-xl bg-card/60 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">Biometric Webhook Sync Engine</span>
                <input
                  type="checkbox"
                  checked={enableBiometricSyncWebhooks}
                  onChange={(e) => setEnableBiometricSyncWebhooks(e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-cyan-500 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Processes incoming real-time biometric swipe transactions into employee punches.
              </p>
            </div>

            {/* Toggle 4: AI SOD Task Estimation */}
            <div className="p-4 rounded-xl bg-card/60 border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">AI Workday SOD Assist</span>
                <input
                  type="checkbox"
                  checked={enableAiAssistance}
                  onChange={(e) => setEnableAiAssistance(e.target.checked)}
                  className="h-4 w-4 rounded border-input accent-purple-500 cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Assists employees in auto-suggesting realistic minute estimates for daily tasks.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-border/60 flex items-center justify-end">
            <Button
              type="submit"
              variant="brand"
              size="sm"
              className="text-xs font-bold bg-gradient-to-r from-red-500 to-rose-600 text-white h-8 px-5 gap-1.5 shadow-sm"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save System Settings</span>
            </Button>
          </div>
        </Interactive3DCard>
      </form>
    </div>
  );
}
