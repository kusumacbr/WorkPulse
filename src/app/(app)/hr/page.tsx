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
  LayoutDashboard,
} from "lucide-react";

export type HrMainTabKey =
  | "overview"
  | "directory"
  | "attendance_leave"
  | "talent_compliance"
  | "culture_wellbeing";

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
      {/* 1. TOP-LEVEL ACTIONABLE GLANCEABLE SUMMARY */}
      <HRTopLevelSummary
        onNavigateTab={handleNavigateTab}
        onOpenExportModal={() => setShowExportModal(true)}
      />

      {/* 2. STREAMLINED & DISTRIBUTED HR DASHBOARD TABS */}
      <div className="flex items-center p-1.5 rounded-2xl bg-card/60 border border-border/80 backdrop-blur-xl overflow-x-auto gap-1.5 shadow-sm mt-6 mb-6">
        {/* TAB 1: UNIFIED COMMAND */}
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

        {/* TAB 2: EMPLOYEES & DIRECTORY */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("directory");
            setSubTabFilter(undefined);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "directory"
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Employees & Directory</span>
        </button>

        {/* TAB 3: ATTENDANCE & LEAVE OVERSIGHT */}
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

        {/* TAB 4: TALENT, PROBATION & COMPLIANCE */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("talent_compliance");
            setSubTabFilter(undefined);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "talent_compliance"
              ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Talent, Probation & Compliance</span>
        </button>

        {/* TAB 5: CULTURE, WELLBEING & BROADCASTS */}
        <button
          type="button"
          onClick={() => {
            setActiveTab("culture_wellbeing");
            setSubTabFilter(undefined);
          }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
            activeTab === "culture_wellbeing"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <HeartHandshake className="h-3.5 w-3.5" />
          <span>Culture, Wellbeing & Broadcasts</span>
        </button>
      </div>

      {/* 3. SECTION CONTENT */}
      <AnimatedTabContent tabKey={activeTab}>
        {/* TAB 1: UNIFIED COMMAND (High-level presence, radar, live stage-2 approvals, quick directory access) */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <OrgLiveExecutionMonitor />
            <HRAttendanceLeaveOversightDeck defaultSubTab="queue" />
            <HRPeopleOperationsDeck defaultSubTab="directory" allowedSubTabs={["directory"]} />
            <HRWellbeingSignalsDeck />
            <HRCommunicationReportingDeck onOpenExportModal={() => setShowExportModal(true)} />
          </div>
        )}

        {/* TAB 2: EMPLOYEES & DIRECTORY */}
        {activeTab === "directory" && (
          <HRPeopleOperationsDeck
            defaultSubTab={(subTabFilter as any) || "directory"}
            allowedSubTabs={["directory", "org_tree"]}
          />
        )}

        {/* TAB 3: ATTENDANCE & LEAVE OVERSIGHT */}
        {activeTab === "attendance_leave" && (
          <HRAttendanceLeaveOversightDeck defaultSubTab={subTabFilter || "queue"} />
        )}

        {/* TAB 4: TALENT, PROBATION & COMPLIANCE (Onboarding, 90-day confirmation, Lead reviews, PIP, Exits, Policies) */}
        {activeTab === "talent_compliance" && (
          <HRPolicyComplianceDeck defaultSubTab={subTabFilter || "joiners_probation"} />
        )}

        {/* TAB 5: CULTURE, WELLBEING & BROADCASTS (Celebrations, Hampers, Mood radar, Announcements & Audit reports) */}
        {activeTab === "culture_wellbeing" && (
          <div className="space-y-6">
            <HRWellbeingSignalsDeck />
            <HRCommunicationReportingDeck onOpenExportModal={() => setShowExportModal(true)} />
          </div>
        )}
      </AnimatedTabContent>

      {/* Async Export Modal */}
      {showExportModal && <ExportReportModal onClose={() => setShowExportModal(false)} />}
    </PageTransition>
  );
}
