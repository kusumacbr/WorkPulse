"use client";

import React from "react";
import { MetricTile3D } from "@/components/3d/MetricTile3D";
import {
  Cpu,
  Users,
  FileCheck2,
  Share2,
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
  auditEventsCount,
  activeIntegrationsCount,
  onNavigateTab,
}: AdminTopLevelMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. User Accounts & RBAC */}
      <button
        type="button"
        onClick={() => onNavigateTab("users")}
        className="text-left group cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none"
      >
        <MetricTile3D
          title="Total Members"
          value={`${activeUsersCount} Active`}
          subtitle="4 Scoped Roles"
          icon={Users}
          change="All Roles Assigned"
          changePositive={true}
          badgeText="Verified"
          accent="purple"
        />
      </button>

      {/* 2. Hardware Terminals */}
      <button
        type="button"
        onClick={() => onNavigateTab("devices")}
        className="text-left group cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none"
      >
        <MetricTile3D
          title="Biometric Devices"
          value={`${onlineDevicesCount} Online`}
          subtitle="Bangalore HQ Terminals"
          icon={Cpu}
          change="Heartbeat OK"
          changePositive={true}
          badgeText="Active"
          accent="cyan"
        />
      </button>

      {/* 3. Enterprise Integrations */}
      <button
        type="button"
        onClick={() => onNavigateTab("devices")}
        className="text-left group cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none"
      >
        <MetricTile3D
          title="Integrations"
          value={`${activeIntegrationsCount} Connected`}
          subtitle="Slack · Calendar · Biometrics"
          icon={Share2}
          change="Syncing"
          changePositive={true}
          badgeText="Active"
          accent="emerald"
        />
      </button>

      {/* 4. Security Audit Vault */}
      <button
        type="button"
        onClick={() => onNavigateTab("audit")}
        className="text-left group cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 focus:outline-none"
      >
        <MetricTile3D
          title="Security & Audit"
          value={`${auditEventsCount.toLocaleString()}`}
          subtitle="System Audit Events"
          icon={FileCheck2}
          change="Encrypted"
          changePositive={true}
          badgeText="Protected"
          accent="gold"
        />
      </button>
    </div>
  );
}
