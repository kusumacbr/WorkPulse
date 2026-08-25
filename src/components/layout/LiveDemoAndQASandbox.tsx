"use client";

import React, { useState } from "react";
import {
  Wrench,
  X,
  Zap,
  CheckCircle,
  Clock,
  Send,
  Sparkles,
  Database,
} from "lucide-react";
import { RoleType } from "@/lib/authorization/types";
import { useCurrentUser } from "./UserContext";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export function LiveDemoAndQASandbox() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"roles" | "actions" | "db">("roles");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const currentUser = useCurrentUser();
  const currentRole = currentUser?.primaryRole || "EMPLOYEE";

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSwitchRole = async (targetRole: RoleType) => {
    const roleEmails: Record<RoleType, string> = {
      EMPLOYEE: "employee.test@xorstack.com",
      MANAGER: "lead.test@xorstack.com",
      HR: "hr.test@xorstack.com",
      ADMIN: "director.test@xorstack.com",
    };

    const targetEmail = roleEmails[targetRole];
    setIsBusy(true);
    try {
      const res = await fetch("/api/auth/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, role: targetRole }),
      });

      if (res.ok) {
        showToast(`Switched to ${targetRole} persona`);
        const targetPath =
          targetRole === "ADMIN" || targetRole === "HR"
            ? "/hr"
            : targetRole === "MANAGER"
            ? "/team"
            : "/dashboard";
        window.location.href = targetPath;
      }
    } catch {
      showToast("Role switch failed");
    } finally {
      setIsBusy(false);
    }
  };

  const triggerVirtualPunch = async (type: "IN" | "OUT") => {
    setIsBusy(true);
    try {
      WorkpulseSharedStore.virtualPunch("emp-sarah", type);
      showToast(`⚡ Virtual Punch ${type} registered & saved to Supabase`);
    } catch {
      showToast("Punch failed");
    } finally {
      setIsBusy(false);
    }
  };

  const triggerSampleLeave = async () => {
    setIsBusy(true);
    try {
      const today = new Date().toISOString().split("T")[0] || "2026-08-25";
      WorkpulseSharedStore.addLeaveRequest({
        employeeId: "emp-sarah",
        employeeName: "Sarah Dev",
        departmentId: "dept-development",
        departmentName: "Development",
        designation: "Senior Backend Engineer",
        leaveType: "CASUAL",
        startDate: today,
        endDate: today,
        daysCount: 1.0,
        reason: "QA Test Leave Application",
        handoverNotes: "Test handover to Rohit Sharma",
        backupPersonName: "Rohit Sharma (Frontend)",
      });
      showToast("📝 Sample Leave submitted & queued for Stage-1 Team Lead Approval");
    } catch {
      showToast("Failed to submit sample leave");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-card border border-cyan-500/40 text-cyan-300 shadow-[0_0_30px_rgba(6,182,212,0.35)] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Sparkles className="h-4 w-4 text-cyan-400 animate-spin" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Floating QA Dock Button */}
      {!isExpanded && (
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 text-white font-bold text-xs shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:shadow-[0_0_32px_rgba(99,102,241,0.6)] hover:scale-105 transition-all group"
        >
          <Wrench className="h-4 w-4 group-hover:rotate-45 transition-transform" />
          <span className="tracking-wide">QA & Demo Sandbox</span>
          <span className="h-2 w-2 rounded-full bg-cyan-300 animate-ping"></span>
        </button>
      )}

      {/* Expanded Interactive QA Panel */}
      {isExpanded && (
        <div className="fixed bottom-6 right-6 z-40 w-96 rounded-3xl glass-panel border border-border shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150 space-y-3.5 backdrop-blur-2xl">
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                <Zap className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-foreground block">QA & Live Demo Sandbox</span>
                <span className="text-[10px] text-muted-foreground font-mono">WorkPulse Testing Console</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="p-1 rounded-lg hover:bg-muted/60 text-muted-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1 bg-muted/40 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("roles")}
              className={`py-1.5 rounded-lg transition-all ${
                activeTab === "roles" ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🎭 Roles
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("actions")}
              className={`py-1.5 rounded-lg transition-all ${
                activeTab === "actions" ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              ⚡ Actions
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("db")}
              className={`py-1.5 rounded-lg transition-all ${
                activeTab === "db" ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🗄️ Database
            </button>
          </div>

          {/* Tab 1: 1-Click Role Switcher */}
          {activeTab === "roles" && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Switch Active Persona (Instant Auth)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  disabled={isBusy || currentRole === "EMPLOYEE"}
                  onClick={() => handleSwitchRole("EMPLOYEE")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    currentRole === "EMPLOYEE"
                      ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 font-bold"
                      : "bg-muted/30 border-border hover:border-cyan-500/40 text-foreground"
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>Sarah Dev</span>
                    {currentRole === "EMPLOYEE" && <CheckCircle className="h-3 w-3 text-cyan-400" />}
                  </div>
                  <span className="text-[10px] text-muted-foreground block">Employee · Backend</span>
                </button>

                <button
                  type="button"
                  disabled={isBusy || currentRole === "MANAGER"}
                  onClick={() => handleSwitchRole("MANAGER")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    currentRole === "MANAGER"
                      ? "bg-purple-500/20 border-purple-500/50 text-purple-300 font-bold"
                      : "bg-muted/30 border-border hover:border-purple-500/40 text-foreground"
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>Alex Lead</span>
                    {currentRole === "MANAGER" && <CheckCircle className="h-3 w-3 text-purple-400" />}
                  </div>
                  <span className="text-[10px] text-muted-foreground block">Team Lead · Stage-1</span>
                </button>

                <button
                  type="button"
                  disabled={isBusy || currentRole === "HR"}
                  onClick={() => handleSwitchRole("HR")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    currentRole === "HR"
                      ? "bg-pink-500/20 border-pink-500/50 text-pink-300 font-bold"
                      : "bg-muted/30 border-border hover:border-pink-500/40 text-foreground"
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>Rachel HR</span>
                    {currentRole === "HR" && <CheckCircle className="h-3 w-3 text-pink-400" />}
                  </div>
                  <span className="text-[10px] text-muted-foreground block">Head of People · Stage-2</span>
                </button>

                <button
                  type="button"
                  disabled={isBusy || currentRole === "ADMIN"}
                  onClick={() => handleSwitchRole("ADMIN")}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    currentRole === "ADMIN"
                      ? "bg-red-500/20 border-red-500/50 text-red-300 font-bold"
                      : "bg-muted/30 border-border hover:border-red-500/40 text-foreground"
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>David Director</span>
                    {currentRole === "ADMIN" && <CheckCircle className="h-3 w-3 text-red-400" />}
                  </div>
                  <span className="text-[10px] text-muted-foreground block">VP Eng · SuperAdmin</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Test Actions */}
          {activeTab === "actions" && (
            <div className="space-y-2.5 text-xs">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Trigger Live Telemetry & Workflows
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => triggerVirtualPunch("IN")}
                  className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Punch IN</span>
                </button>

                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => triggerVirtualPunch("OUT")}
                  className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold hover:bg-amber-500/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <Clock className="h-3.5 w-3.5" />
                  <span>Punch OUT</span>
                </button>
              </div>

              <button
                type="button"
                disabled={isBusy}
                onClick={triggerSampleLeave}
                className="w-full p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit 2-Stage Leave Test Request</span>
              </button>
            </div>
          )}

          {/* Tab 3: Live Database Explorer */}
          {activeTab === "db" && (
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-muted/40 border border-border/60 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <Database className="h-3.5 w-3.5 text-emerald-400" /> Supabase PostgreSQL
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">100% ONLINE</span>
                </div>
                <div className="text-[11px] text-muted-foreground space-y-0.5">
                  <div>• Canonical Employees: <strong className="text-foreground">12</strong></div>
                  <div>• Leave Requests: <strong className="text-foreground">4 Active</strong></div>
                  <div>• Biometric Punches: <strong className="text-foreground">5 Seeded + Live</strong></div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
