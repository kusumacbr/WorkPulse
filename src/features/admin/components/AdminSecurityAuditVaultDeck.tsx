"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { AuditService, AuditLogEntry } from "@/lib/audit/audit-service";
import {
  FileCheck2,
  Search,
  Download,
  CheckCircle2,
  X,
  Code2,
} from "lucide-react";

const INITIAL_MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "audit-001",
    actorId: "user-david",
    action: "role_change",
    entity: "UserRole",
    entityId: "user-rachel",
    timestamp: new Date(Date.now() - 600000),
    ipAddress: "192.168.1.10",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) WorkPulse-Admin/1.0",
    correlationId: "corr-88219-a",
    reason: "Admin updated roles for Rachel Green: [HR, EMPLOYEE]",
    beforeState: { roles: ["EMPLOYEE"] },
    afterState: { roles: ["HR", "EMPLOYEE"] },
    createdAt: new Date(Date.now() - 600000),
  },
  {
    id: "audit-002",
    actorId: "user-alex",
    action: "workday_change_requested",
    entity: "Workday",
    entityId: "wd-sarah-2026-08-20",
    timestamp: new Date(Date.now() - 1800000),
    ipAddress: "192.168.1.42",
    userAgent: "WorkPulse-Web/1.0",
    correlationId: "corr-99412-b",
    reason: "Please clarify estimated testing hours on authentication PR.",
    beforeState: { status: "EOD_SUBMITTED" },
    afterState: { status: "CHANGES_REQUESTED", requestedFields: ["tasks"] },
    createdAt: new Date(Date.now() - 1800000),
  },
  {
    id: "audit-003",
    actorId: "user-david",
    action: "workday_locked",
    entity: "Workday",
    entityId: "wd-jordan-2026-08-19",
    timestamp: new Date(Date.now() - 3600000),
    ipAddress: "192.168.1.10",
    userAgent: "WorkPulse-Admin/1.0",
    correlationId: "corr-77123-c",
    reason: "End-of-sprint admin lock and payroll finalization.",
    beforeState: { status: "EOD_SUBMITTED" },
    afterState: { status: "LOCKED", lockedById: "user-david" },
    createdAt: new Date(Date.now() - 3600000),
  },
  {
    id: "audit-004",
    actorId: "user-rachel",
    action: "leave_approved_hr",
    entity: "LeaveRequest",
    entityId: "leave-req-101",
    timestamp: new Date(Date.now() - 7200000),
    ipAddress: "192.168.1.25",
    userAgent: "WorkPulse-HR/1.0",
    correlationId: "corr-66184-d",
    reason: "Authorized with standard Casual Leave quota deduction.",
    beforeState: { status: "FORWARDED_TO_HR" },
    afterState: { status: "APPROVED" },
    createdAt: new Date(Date.now() - 7200000),
  },
  {
    id: "audit-005",
    actorId: "system-biometric-webhook",
    action: "biometric_sync",
    entity: "BiometricPunch",
    entityId: "dev-hq-floor3",
    timestamp: new Date(Date.now() - 14400000),
    ipAddress: "192.168.1.140",
    userAgent: "ZK-Teco SenseFace Webhook",
    correlationId: "corr-11204-e",
    reason: "Ingested 14 biometric punches with valid HMAC signature.",
    beforeState: null,
    afterState: { processedCount: 14, quarantinedCount: 0 },
    createdAt: new Date(Date.now() - 14400000),
  },
];

export function AdminSecurityAuditVaultDeck() {
  const inMemoryLogs = AuditService.getInMemoryLogs();
  const allLogs = inMemoryLogs.length > 0 ? [...inMemoryLogs, ...INITIAL_MOCK_AUDIT_LOGS] : INITIAL_MOCK_AUDIT_LOGS;

  const [searchQuery, setSearchQuery] = useState("");
  const [filterEntity, setFilterEntity] = useState("ALL");
  const [filterAction, setFilterAction] = useState("ALL");
  const [inspectEntry, setInspectEntry] = useState<AuditLogEntry | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleExportAuditJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allLogs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `workpulse-audit-vault-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Cryptographic audit trail exported to JSON successfully! 🔐");
  };

  const filteredLogs = allLogs.filter((log) => {
    const matchesSearch =
      (log.action && log.action.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.entity && log.entity.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.actorId && log.actorId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.reason && log.reason.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesEntity = filterEntity === "ALL" || log.entity === filterEntity;
    const matchesAction = filterAction === "ALL" || log.action === filterAction;
    return matchesSearch && matchesEntity && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Audit Vault Deck */}
      <Interactive3DCard className="p-6 border border-rose-500/30 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-rose-400" />
              Immutable Security Audit Vault ({filteredLogs.length} Events)
            </h3>
            <p className="text-xs text-muted-foreground">
              Tamper-evident record of all system events, role updates, emergency overrides, biometric syncs, and session terminations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-44">
              <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit trail..."
                className="h-8 text-xs pl-8"
              />
            </div>

            <select
              value={filterEntity}
              onChange={(e) => setFilterEntity(e.target.value)}
              className="h-8 px-2 rounded-md border border-input bg-card text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="ALL">All Entities</option>
              <option value="UserRole">UserRole</option>
              <option value="Workday">Workday</option>
              <option value="LeaveRequest">LeaveRequest</option>
              <option value="BiometricPunch">BiometricPunch</option>
              <option value="Session">Session</option>
            </select>

            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="h-8 px-2 rounded-md border border-input bg-card text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="ALL">All Actions</option>
              <option value="role_change">role_change</option>
              <option value="workday_change_requested">workday_change_requested</option>
              <option value="workday_locked">workday_locked</option>
              <option value="leave_approved_hr">leave_approved_hr</option>
              <option value="biometric_sync">biometric_sync</option>
              <option value="session_revoked">session_revoked</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportAuditJson}
              className="text-xs h-8 px-3 border-rose-500/30 text-rose-300 hover:bg-rose-500/10 gap-1"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export JSON</span>
            </Button>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto rounded-xl border border-border/80 bg-card/60">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/60">
              <tr>
                <th className="p-3">Timestamp & ID</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Action & Entity</th>
                <th className="p-3">Business Reason / Context</th>
                <th className="p-3 text-right">State Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/20 transition-colors">
                  {/* Timestamp */}
                  <td className="p-3">
                    <div className="font-mono text-[11px] text-foreground">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">{log.id}</div>
                  </td>

                  {/* Actor */}
                  <td className="p-3">
                    <span className="font-mono font-bold text-cyan-300">{log.actorId || "SYSTEM"}</span>
                    <span className="text-[10px] text-muted-foreground block font-mono">{log.ipAddress || "Internal"}</span>
                  </td>

                  {/* Action & Entity */}
                  <td className="p-3">
                    <Badge variant="outline" className="text-[9px] font-mono border-rose-500/30 text-rose-300 mr-1.5">
                      {log.action}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground font-mono">[{log.entity}]</span>
                  </td>

                  {/* Reason */}
                  <td className="p-3">
                    <p className="text-[11px] text-foreground/90 leading-snug">
                      {log.reason || "Standard system event execution."}
                    </p>
                  </td>

                  {/* State Diff Inspector */}
                  <td className="p-3 text-right">
                    {(log.beforeState || log.afterState) ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInspectEntry(log)}
                        className="text-[10px] h-6 px-2 border-border hover:border-cyan-500/40 gap-1 text-cyan-300"
                      >
                        <Code2 className="h-3 w-3" />
                        <span>Inspect Diff</span>
                      </Button>
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-mono">No Diff</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Interactive3DCard>

      {/* State Diff Modal Inspector */}
      {inspectEntry && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-cyan-400" />
                  Audit State Diff Inspector ({inspectEntry.id})
                </h4>
                <p className="text-xs text-muted-foreground font-mono">
                  Action: {inspectEntry.action} · Actor: {inspectEntry.actorId}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectEntry(null)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-background/80 border border-border space-y-1">
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">Before State</span>
                <pre className="text-[11px] font-mono text-amber-300 overflow-x-auto p-2 bg-black/40 rounded-lg">
                  {inspectEntry.beforeState ? JSON.stringify(inspectEntry.beforeState, null, 2) : "null"}
                </pre>
              </div>

              <div className="p-3 rounded-xl bg-background/80 border border-border space-y-1">
                <span className="text-[10px] font-bold uppercase text-muted-foreground block">After State</span>
                <pre className="text-[11px] font-mono text-emerald-300 overflow-x-auto p-2 bg-black/40 rounded-lg">
                  {inspectEntry.afterState ? JSON.stringify(inspectEntry.afterState, null, 2) : "null"}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectEntry(null)}
                className="text-xs h-8 px-4"
              >
                <span>Close Inspector</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
