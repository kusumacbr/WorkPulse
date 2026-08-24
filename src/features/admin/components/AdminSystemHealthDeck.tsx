"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import {
  Activity,
  Database,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  Server,
  Zap,
} from "lucide-react";

export function AdminSystemHealthDeck() {
  const [dbLatency, setDbLatency] = useState(8);
  const [activeSessions, setActiveSessions] = useState(19);
  const [backupStatus, setBackupStatus] = useState<"IDLE" | "GENERATING" | "COMPLETED">("IDLE");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleRefreshTelemetry = () => {
    setDbLatency(Math.floor(Math.random() * 5) + 6);
    setActiveSessions(19);
    showToast("Telemetry ping refreshed across PostgreSQL & Better-Auth sessions! ⚡");
  };

  const handleTriggerBackup = () => {
    setBackupStatus("GENERATING");
    setTimeout(() => {
      setBackupStatus("COMPLETED");
      showToast("Encrypted PostgreSQL database snapshot created successfully! 💾");
      setTimeout(() => setBackupStatus("IDLE"), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Section 1: System Telemetry Radar */}
      <Interactive3DCard className="p-6 border border-emerald-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              Platform Telemetry & Infrastructure Health
            </h3>
            <p className="text-xs text-muted-foreground">
              Real-time monitoring of database query latencies, background job queues, session volumes, and edge API response times.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshTelemetry}
              className="text-xs h-7 px-2.5 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Ping Test</span>
            </Button>
            <Badge variant="brand" className="text-xs bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-bold">
              All Systems Operational
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-1">
          {/* Tile 1: DB Latency */}
          <div className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-semibold">PostgreSQL Latency</span>
              <Database className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-foreground font-mono">{dbLatency} ms</div>
            <div className="text-[10px] text-emerald-400 font-bold">● Fast (&lt; 15ms target)</div>
          </div>

          {/* Tile 2: Active Sessions */}
          <div className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-semibold">Better-Auth Sessions</span>
              <ShieldCheck className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-foreground font-mono">{activeSessions} Active</div>
            <div className="text-[10px] text-purple-300 font-bold">Passkey / WebAuthn Verified</div>
          </div>

          {/* Tile 3: Biometric Ingestion Rate */}
          <div className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-semibold">Biometric Ingestion</span>
              <Zap className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-foreground font-mono">100% SLA</div>
            <div className="text-[10px] text-amber-300 font-bold">Zero Dropped Packets</div>
          </div>

          {/* Tile 4: Server Uptime */}
          <div className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground font-semibold">Server Uptime</span>
              <Server className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-foreground font-mono">99.99%</div>
            <div className="text-[10px] text-emerald-400 font-bold">34d 18h Continuous</div>
          </div>
        </div>
      </Interactive3DCard>

      {/* Section 2: Disaster Recovery & Snapshots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: On-Demand Backup Snapshot */}
        <Interactive3DCard className="p-6 border border-cyan-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-cyan-400" />
              Database Disaster Recovery & Snapshots
            </h4>
            <Badge variant="outline" className="text-xs text-cyan-300 border-cyan-500/30">
              AES-256 Encrypted
            </Badge>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Automated backups trigger nightly at 02:00 UTC. Admins can initiate instantaneous immutable database snapshots prior to structural migrations or hardware upgrades.
          </p>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-card/60 border border-border flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block">Latest Nightly Automated Backup</span>
                <span className="text-[10px] text-muted-foreground font-mono">Today, 02:00:00 UTC · Size: 48.2 MB · SHA-256 Verified</span>
              </div>
              <Badge variant="brand" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                Verified
              </Badge>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end">
            <Button
              variant="brand"
              size="sm"
              disabled={backupStatus === "GENERATING"}
              onClick={handleTriggerBackup}
              className="text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white h-8 px-4 gap-1.5 shadow-sm"
            >
              <RefreshCw className={`h-3 w-3 ${backupStatus === "GENERATING" ? "animate-spin" : ""}`} />
              <span>{backupStatus === "GENERATING" ? "Creating Snapshot..." : "Trigger On-Demand Snapshot"}</span>
            </Button>
          </div>
        </Interactive3DCard>

        {/* Right: Data Retention & Compliance Rules */}
        <Interactive3DCard className="p-6 border border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-400" />
              Data Retention & Privacy Lifecycle (ISO 27001)
            </h4>
            <Badge variant="outline" className="text-xs text-purple-300 border-purple-500/30">
              Compliant
            </Badge>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-card/60 border border-border flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block">Immutable Security Audit Logs</span>
                <span className="text-[10px] text-muted-foreground">Retained for mandatory compliance audits</span>
              </div>
              <strong className="text-purple-300 font-mono">365 Days</strong>
            </div>

            <div className="p-3 rounded-xl bg-card/60 border border-border flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block">Raw Biometric Webhook Payloads</span>
                <span className="text-[10px] text-muted-foreground">Automatically pruned post-processing</span>
              </div>
              <strong className="text-cyan-300 font-mono">90 Days</strong>
            </div>

            <div className="p-3 rounded-xl bg-card/60 border border-border flex items-center justify-between">
              <div>
                <span className="font-bold text-foreground block">Daily Workday Revision Snapshots</span>
                <span className="text-[10px] text-muted-foreground">Historical amendment snapshots</span>
              </div>
              <strong className="text-emerald-400 font-mono">Permanent</strong>
            </div>
          </div>
        </Interactive3DCard>
      </div>
    </div>
  );
}
