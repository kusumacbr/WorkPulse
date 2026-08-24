"use client";

import React from "react";
import { MetricTile3D } from "@/components/3d/MetricTile3D";
import {
  Cpu,
  Users,
  ShieldCheck,
  FileCheck2,
  Share2,
  Activity,
} from "lucide-react";

interface AdminTopLevelMetricsProps {
  activeUsersCount: number;
  onlineDevicesCount: number;
  quarantineCount: number;
  auditEventsCount: number;
  activeIntegrationsCount: number;
  systemLatencyMs: number;
  onNavigateTab: (tab: string) => void;
}

export function AdminTopLevelMetrics({
  activeUsersCount,
  onlineDevicesCount,
  quarantineCount,
  auditEventsCount,
  activeIntegrationsCount,
  systemLatencyMs,
  onNavigateTab,
}: AdminTopLevelMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
      {/* 1. System Health & Latency */}
      <button
        type="button"
        onClick={() => onNavigateTab("telemetry")}
        className="text-left group cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none"
      >
        <MetricTile3D
          title="System Health"
          value={`${systemLatencyMs}ms`}
          subtitle="PostgreSQL & Cache Latency"
          icon={Activity}
          change="Optimal"
          changePositive={true}
          badgeText="99.99% Up"
          accent="emerald"
        />
      </button>

      {/* 2. User Accounts & RBAC */}
      <button
        type="button"
        onClick={() => onNavigateTab("users")}
        className="text-left group cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none"
      >
        <MetricTile3D
          title="Identity & RBAC"
          value={`${activeUsersCount} Active`}
          subtitle="4 Scoped Roles"
          icon={Users}
          change="Zero Drift"
          changePositive={true}
          badgeText="Verified"
          accent="purple"
        />
      </button>

      {/* 3. Hardware Terminals */}
      <button
        type="button"
        onClick={() => onNavigateTab("devices")}
        className="text-left group cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none"
      >
        <MetricTile3D
          title="Biometric Edge"
          value={`${onlineDevicesCount} Online`}
          subtitle="Bangalore HQ Terminals"
          icon={Cpu}
          change="Heartbeat OK"
          changePositive={true}
          badgeText="Active"
          accent="cyan"
        />
      </button>

      {/* 4. Quarantine Buffer */}
      <button
        type="button"
        onClick={() => onNavigateTab("quarantine")}
        className="text-left group cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none"
      >
        <MetricTile3D
          title="Quarantine Buffer"
          value={`${quarantineCount} Queued`}
          subtitle="Unmapped biometric punches"
          icon={ShieldCheck}
          change={quarantineCount > 0 ? "Action Req" : "Clean"}
          changePositive={quarantineCount === 0}
          badgeText={quarantineCount > 0 ? "Inspect" : "0 Errors"}
          accent={quarantineCount > 0 ? "rose" : "emerald"}
        />
      </button>

      {/* 5. Enterprise Integrations */}
      <button
        type="button"
        onClick={() => onNavigateTab("integrations")}
        className="text-left group cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none"
      >
        <MetricTile3D
          title="Integrations"
          value={`${activeIntegrationsCount} Connected`}
          subtitle="Slack · Calendar · Biometrics"
          icon={Share2}
          change="Syncing"
          changePositive={true}
          badgeText="3 Active"
          accent="cyan"
        />
      </button>

      {/* 6. Security Audit Vault */}
      <button
        type="button"
        onClick={() => onNavigateTab("audit")}
        className="text-left group cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none"
      >
        <MetricTile3D
          title="Audit Vault"
          value={`${auditEventsCount.toLocaleString()}`}
          subtitle="Immutable tamper-evident events"
          icon={FileCheck2}
          change="Encrypted"
          changePositive={true}
          badgeText="SHA-256"
          accent="rose"
        />
      </button>
    </div>
  );
}
