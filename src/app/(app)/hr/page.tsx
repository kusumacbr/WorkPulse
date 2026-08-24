"use client";

import React, { useState } from "react";
import { PageTransition } from "@/components/animations/PageTransition";
import { AnimatedTabContent } from "@/components/animations/AnimatedTabContent";
import { HRTopLevelSummary } from "@/features/hr/components/HRTopLevelSummary";
import { HRPeopleOperationsDeck } from "@/features/hr/components/HRPeopleOperationsDeck";
import { HRAttendanceLeaveOversightDeck } from "@/features/hr/components/HRAttendanceLeaveOversightDeck";
import { HRPolicyComplianceDeck } from "@/features/hr/components/HRPolicyComplianceDeck";
import { HRWellbeingSignalsDeck } from "@/features/hr/components/HRWellbeingSignalsDeck";
import { HRCommunicationReportingDeck } from "@/features/hr/components/HRCommunicationReportingDeck";
import { ExportReportModal } from "@/features/communication/components/ExportReportModal";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { OrgLiveExecutionMonitor } from "@/features/monitoring/components/OrgLiveExecutionMonitor";
import {
  Users,
  Calendar,
  ShieldCheck,
  HeartHandshake,
  Megaphone,
  LayoutDashboard,
  Activity,
} from "lucide-react";

export type HrMainTabKey =
  | "overview"
  | "live_monitor"
  | "people_ops"
  | "attendance_leave"
  | "compliance"
  | "wellbeing"
  | "communication";

export default function HrCommandCenterPage() {
  const [activeTab, setActiveTab] = useState<HrMainTabKey>("overview");
  const [subTabFilter, setSubTabFilter] = useState<string | undefined>(undefined);
  const [showExportModal, setShowExportModal] = useState(false);
  const { leaveRequests, wfhRequests } = useWorkpulseSharedStore();

  const pendingStage2Count =
    leaveRequests.filter((r) => r.status === "FORWARDED_TO_HR").length +
    wfhRequests.filter((r) => r.status === "FORWARDED_TO_HR").length;

  const handleNavigateTab = (tab: string, filter?: string) => {
    setActiveTab(tab as HrMainTabKey);
    setSubTabFilter(filter);
  };

  return (
    <PageTransition>
      {/* 1. TOP-LEVEL ACTIONABLE GLANCEABLE SUMMARY (At the very top of the page) */}
      <HRTopLevelSummary
        onNavigateTab={handleNavigateTab}
        onOpenExportModal={() => setShowExportModal(true)}
      />

      {/* 2. MAIN SECTION NAVIGATION BAR */}
      <div className="flex items-center p-1.5 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-xl overflow-x-auto gap-1 shadow-sm mt-6 mb-6">
        <button
          type="button"
          onClick={() => {
            setActiveTab("overview");
            setSubTabFilter(undefined);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "overview"
              ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span>Unified Command</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("live_monitor");
            setSubTabFilter(undefined);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "live_monitor"
              ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Activity className="h-3.5 w-3.5" />
          <span>Live Org Execution Radar</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("people_ops");
            setSubTabFilter(undefined);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "people_ops"
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>People Operations & Directory</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("attendance_leave");
            setSubTabFilter(undefined);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "attendance_leave"
              ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Attendance & Leave Oversight</span>
          {pendingStage2Count > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-extrabold">
              {pendingStage2Count}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("compliance");
            setSubTabFilter(undefined);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "compliance"
              ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Policy, Compliance & PIP</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("wellbeing");
            setSubTabFilter(undefined);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "wellbeing"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <HeartHandshake className="h-3.5 w-3.5" />
          <span>Wellbeing Signals</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("communication");
            setSubTabFilter(undefined);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "communication"
              ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Megaphone className="h-3.5 w-3.5" />
          <span>Broadcasts & Reporting</span>
        </button>
      </div>

      {/* 3. SECTION CONTENT */}
      <AnimatedTabContent tabKey={activeTab}>
        {/* TAB 1: UNIFIED COMMAND (Showing People Ops + Live Stage-2 + Wellbeing + Reporting Shortcuts) */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <OrgLiveExecutionMonitor />
            <HRAttendanceLeaveOversightDeck defaultSubTab="queue" />
            <HRPeopleOperationsDeck />
            <HRWellbeingSignalsDeck />
            <HRCommunicationReportingDeck onOpenExportModal={() => setShowExportModal(true)} />
          </div>
        )}

        {/* TAB 2: LIVE ORG EXECUTION RADAR */}
        {activeTab === "live_monitor" && <OrgLiveExecutionMonitor />}

        {/* TAB 3: PEOPLE OPERATIONS */}
        {activeTab === "people_ops" && <HRPeopleOperationsDeck />}

        {/* TAB 4: ATTENDANCE & LEAVE OVERSIGHT */}
        {activeTab === "attendance_leave" && (
          <HRAttendanceLeaveOversightDeck defaultSubTab={subTabFilter || "queue"} />
        )}

        {/* TAB 5: POLICY, COMPLIANCE & PIP */}
        {activeTab === "compliance" && (
          <HRPolicyComplianceDeck defaultSubTab={subTabFilter || "reviews"} />
        )}

        {/* TAB 6: WELLBEING SIGNALS */}
        {activeTab === "wellbeing" && <HRWellbeingSignalsDeck />}

        {/* TAB 7: BROADCASTS & EXECUTIVE REPORTING */}
        {activeTab === "communication" && (
          <HRCommunicationReportingDeck onOpenExportModal={() => setShowExportModal(true)} />
        )}
      </AnimatedTabContent>

      {/* Async Export Modal */}
      {showExportModal && <ExportReportModal onClose={() => setShowExportModal(false)} />}
    </PageTransition>
  );
}
