"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { AnimatedTabContent } from "@/components/animations/AnimatedTabContent";
import { AdminTopLevelMetrics } from "@/features/admin/components/AdminTopLevelMetrics";
import { AdminOrgSettingsDeck } from "@/features/admin/components/AdminOrgSettingsDeck";
import { AdminUserIdentityDeck } from "@/features/admin/components/AdminUserIdentityDeck";
import { BiometricDeviceManager } from "@/features/admin/components/BiometricDeviceManager";
import { BiometricQuarantineQueue } from "@/features/admin/components/BiometricQuarantineQueue";
import { AdminIntegrationsDeck } from "@/features/admin/components/AdminIntegrationsDeck";
import { AdminSecurityAuditVaultDeck } from "@/features/admin/components/AdminSecurityAuditVaultDeck";
import { AdminSystemHealthDeck } from "@/features/admin/components/AdminSystemHealthDeck";
import { OrgLiveExecutionMonitor } from "@/features/monitoring/components/OrgLiveExecutionMonitor";
import {
  ShieldAlert,
  Building2,
  Users,
  Cpu,
  AlertOctagon,
  Share2,
  FileCheck2,
  Activity,
  Eye,
} from "lucide-react";

export type AdminTabKey =
  | "settings"
  | "monitor"
  | "users"
  | "devices"
  | "quarantine"
  | "integrations"
  | "audit"
  | "telemetry";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTabKey>("settings");

  return (
    <PageTransition>
      {/* 3D Root Security Console Header */}
      <Interactive3DCard className="p-6 md:p-8 border border-red-500/30 bg-gradient-to-r from-card/80 via-card/60 to-red-500/10 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="font-bold text-[10px] uppercase bg-red-500/15 border-red-500/30 text-red-300">
                <ShieldAlert className="h-3 w-3 mr-1 text-red-400" />
                Root Administrator Console
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                System Governance · Identity IAM · Hardware · Integrations · Audit Vault
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Enterprise System Administration
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Administer tenant configuration, manage RBAC role matrix and sessions, configure edge biometric terminals, route enterprise webhooks, and inspect the immutable security audit vault.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-background/50 border border-red-500/30 backdrop-blur-md shrink-0 text-xs shadow-sm space-y-1 text-right">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">Admin Authority</span>
            <div className="font-bold text-red-400">Organization SuperAdmin</div>
            <div className="text-[10px] text-muted-foreground font-mono">Tenant: xorstack.com</div>
          </div>
        </div>
      </Interactive3DCard>

      {/* 1. TOP-LEVEL 6-PILLAR METRICS RADAR */}
      <div className="mb-6">
        <AdminTopLevelMetrics
          activeUsersCount={19}
          onlineDevicesCount={2}
          quarantineCount={1}
          auditEventsCount={1245}
          activeIntegrationsCount={3}
          systemLatencyMs={8}
          onNavigateTab={(tab) => setActiveTab(tab as AdminTabKey)}
        />
      </div>

      {/* 2. ADMIN NAVIGATION BAR */}
      <div className="flex items-center p-1.5 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-xl overflow-x-auto gap-1 shadow-sm mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "settings"
              ? "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>System & Org Settings</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("monitor")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "monitor"
              ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Live Org Execution Radar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "users"
              ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Identity & RBAC Governance</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("devices")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "devices"
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Cpu className="h-3.5 w-3.5" />
          <span>Biometric Edge Terminals</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("quarantine")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "quarantine"
              ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <AlertOctagon className="h-3.5 w-3.5" />
          <span>Quarantine Resolution</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-extrabold">
            1
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("integrations")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "integrations"
              ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Share2 className="h-3.5 w-3.5" />
          <span>Enterprise Integrations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "audit"
              ? "bg-gradient-to-r from-rose-500 to-amber-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <FileCheck2 className="h-3.5 w-3.5" />
          <span>Security Audit Vault</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("telemetry")}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "telemetry"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Platform Health</span>
        </button>
      </div>

      {/* 3. SECTION CONTENT */}
      <AnimatedTabContent tabKey={activeTab}>
        {/* TAB 1: SYSTEM & ORG SETTINGS */}
        {activeTab === "settings" && <AdminOrgSettingsDeck />}

        {/* TAB 2: LIVE ORG EXECUTION RADAR */}
        {activeTab === "monitor" && <OrgLiveExecutionMonitor />}

        {/* TAB 3: IDENTITY, RBAC GOVERNANCE & REPORTING LINES */}
        {activeTab === "users" && <AdminUserIdentityDeck />}

        {/* TAB 4: BIOMETRIC HARDWARE TERMINALS */}
        {activeTab === "devices" && <BiometricDeviceManager />}

        {/* TAB 5: QUARANTINE RESOLUTION BUFFER */}
        {activeTab === "quarantine" && <BiometricQuarantineQueue />}

        {/* TAB 6: ENTERPRISE INTEGRATIONS & WEBHOOKS */}
        {activeTab === "integrations" && <AdminIntegrationsDeck />}

        {/* TAB 7: SECURITY AUDIT VAULT */}
        {activeTab === "audit" && <AdminSecurityAuditVaultDeck />}

        {/* TAB 8: PLATFORM TELEMETRY & HEALTH */}
        {activeTab === "telemetry" && <AdminSystemHealthDeck />}
      </AnimatedTabContent>
    </PageTransition>
  );
}
