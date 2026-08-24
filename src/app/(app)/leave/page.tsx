"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { MetricTile3D } from "@/components/3d/MetricTile3D";
import { PageTransition } from "@/components/animations/PageTransition";
import { LeaveRequestModal } from "@/features/leave/components/LeaveRequestModal";
import { WfhRequestModal } from "@/features/leave/components/WfhRequestModal";
import { HREnterpriseLeaveDesk } from "@/features/leave/components/HREnterpriseLeaveDesk";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { useCurrentUser } from "@/components/layout/UserContext";
import {
  Calendar,
  Laptop,
  Plus,
  Clock,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  XCircle,
} from "lucide-react";

export default function LeavePage() {
  const user = useCurrentUser();
  const isHR = user.roles.includes("HR") || user.primaryRole === "HR" || user.roles.includes("ADMIN");

  const [activeTab, setActiveTab] = useState<"hr_desk" | "my_requests">(isHR ? "hr_desk" : "my_requests");
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showWfhModal, setShowWfhModal] = useState(false);

  const { leaveRequests, wfhRequests } = useWorkpulseSharedStore();

  const myLeaveRequests = leaveRequests.filter((r) => r.employeeId === "emp-sarah" || r.employeeName === user.userName);
  const myWfhRequests = wfhRequests.filter((r) => r.employeeId === "emp-sarah" || r.employeeName === user.userName);

  const remainingBalance = myLeaveRequests.length > 0 ? myLeaveRequests[0]!.remainingBalance : 11.0;

  return (
    <PageTransition>
      {/* 3D Hero */}
      <Interactive3DCard className="p-6 md:p-8 border border-teal-500/30 bg-gradient-to-r from-card/80 via-card/60 to-teal-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="font-bold text-[10px] uppercase bg-teal-500/15 border-teal-500/30 text-teal-300">
                <ShieldCheck className="h-3 w-3 mr-1 text-teal-400" />
                Two-Stage Approval Compliance
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Stage 1: Lead Approval → Stage 2: HR Sign-off</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {isHR ? "Enterprise Leave & Remote Work Administration Desk" : "Leave & Remote Work Hub"}
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {isHR
                ? "Oversee organizational leave quotas across all 6 departments, authorize Stage-2 leave & WFH submissions, monitor remote work compliance, and audit absence trends."
                : "Submit planned time-off or remote work requests. All applications flow through Team Lead (Alex Lead) for sprint pod review and are forwarded to HR (Rachel HR) for final authorization."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {isHR && (
              <div className="flex items-center p-1 rounded-xl bg-background/50 border border-teal-500/30 backdrop-blur-md shrink-0 shadow-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab("hr_desk")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === "hr_desk"
                      ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>HR Enterprise Desk</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("my_requests")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === "my_requests"
                      ? "bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>My Personal Requests</span>
                </button>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold gap-1.5 h-9 border-border/80 hover:border-teal-500/40"
              onClick={() => setShowWfhModal(true)}
            >
              <Laptop className="h-3.5 w-3.5 text-cyan-400" />
              <span>Request WFH</span>
            </Button>
            <Button
              variant="brand"
              size="sm"
              className="text-xs font-bold gap-1.5 h-9 bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md"
              onClick={() => setShowLeaveModal(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Apply for Leave</span>
            </Button>
          </div>
        </div>
      </Interactive3DCard>

      {/* Render HR Enterprise Desk if active */}
      {activeTab === "hr_desk" && isHR ? (
        <HREnterpriseLeaveDesk />
      ) : (
        <>
          {/* 3D Metric Indicators for Personal Leaves */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricTile3D
              title="Casual Leave (CL)"
              value={`${remainingBalance} Days`}
              subtitle="12 Allotted · Available Balance"
              icon={Calendar}
              change="Available"
              changePositive={true}
              badgeText="Healthy"
              accent="emerald"
            />

            <MetricTile3D
              title="Sick Leave (SL)"
              value="8.0 Days"
              subtitle="8 Allotted · 0 Used"
              icon={Clock}
              change="Full Balance"
              changePositive={true}
              badgeText="Available"
              accent="cyan"
            />

            <MetricTile3D
              title="WFH Usage"
              value={`${myWfhRequests.length} Active`}
              subtitle="Mon–Fri (10:00 AM – 07:00 PM)"
              icon={Laptop}
              change="3 Days Left"
              changePositive={true}
              badgeText="Active"
              accent="purple"
            />

            <MetricTile3D
              title="Next Public Holiday"
              value="In 9 Days"
              subtitle="Ganesh Chaturthi (Company Holiday)"
              icon={Sparkles}
              change="Aug 29, 2026"
              changePositive={true}
              badgeText="Countdown"
              accent="gold"
            />
          </div>

          {/* Requests Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leave Requests */}
            <Interactive3DCard className="p-6 space-y-4 border-border/80">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-teal-400" />
                  My Leave Requests
                </h3>
                <span className="text-xs text-muted-foreground">{myLeaveRequests.length} Applications</span>
              </div>

              <div className="space-y-4">
                {myLeaveRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-border/70 bg-card/60 hover:border-teal-500/40 space-y-3 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-foreground block">
                          {req.leaveType} Leave ({req.daysCount} {req.daysCount === 1 ? "Day" : "Days"})
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {req.startDate} {req.startDate !== req.endDate ? `→ ${req.endDate}` : ""}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-bold ${
                          req.status === "APPROVED"
                            ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                            : req.status === "FORWARDED_TO_HR"
                            ? "border-pink-500/30 text-pink-300 bg-pink-500/10"
                            : req.status === "REJECTED"
                            ? "border-red-500/30 text-red-400 bg-red-500/10"
                            : "border-amber-500/30 text-amber-300 bg-amber-500/10"
                        }`}
                      >
                        {req.status === "APPROVED"
                          ? "Approved (Final)"
                          : req.status === "FORWARDED_TO_HR"
                          ? "Stage 2: Pending HR"
                          : req.status === "REJECTED"
                          ? "Rejected"
                          : "Stage 1: Pending TL"}
                      </Badge>
                    </div>

                    {/* Two-Stage Progress Stepper Visualizer */}
                    <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 space-y-1.5">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                        Two-Stage Approval Status
                      </span>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {/* Stage 1: TL */}
                        {req.status !== "PENDING_TL_STAGE_1" ? (
                          <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Stage 1: Lead Approved</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-amber-300 font-semibold animate-pulse">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Stage 1: In Lead Queue</span>
                          </div>
                        )}

                        <ArrowRight className="h-3 w-3 text-muted-foreground" />

                        {/* Stage 2: HR */}
                        {req.status === "APPROVED" ? (
                          <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Stage 2: HR Approved</span>
                          </div>
                        ) : req.status === "FORWARDED_TO_HR" ? (
                          <div className="flex items-center gap-1 text-pink-300 font-semibold animate-pulse">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Stage 2: In HR Queue</span>
                          </div>
                        ) : req.status === "REJECTED" ? (
                          <div className="flex items-center gap-1 text-red-400 font-semibold">
                            <XCircle className="h-3.5 w-3.5" />
                            <span>Rejected</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground font-semibold opacity-60">
                            <Clock className="h-3.5 w-3.5" />
                            <span>Stage 2: Awaiting Stage 1</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">{req.reason}</p>

                    {req.tlComment && (
                      <div className="p-2 rounded-lg bg-card/70 border border-border/50 text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">Lead Feedback:</span> &quot;{req.tlComment}&quot;
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Interactive3DCard>

            {/* WFH Requests */}
            <Interactive3DCard className="p-6 space-y-4 border-border/80">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Laptop className="h-4 w-4 text-cyan-400" />
                  My Remote Work (WFH) Logs
                </h3>
                <span className="text-xs text-muted-foreground">{myWfhRequests.length} Sessions</span>
              </div>

              <div className="space-y-3">
                {myWfhRequests.map((wfh) => (
                  <div
                    key={wfh.id}
                    className="p-4 rounded-xl border border-border/70 bg-card/60 hover:border-cyan-500/40 space-y-2.5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">
                        WFH Session ({wfh.startDate})
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] uppercase font-bold ${
                          wfh.status === "APPROVED"
                            ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                            : wfh.status === "FORWARDED_TO_HR"
                            ? "border-pink-500/30 text-pink-300 bg-pink-500/10"
                            : "border-amber-500/30 text-amber-300 bg-amber-500/10"
                        }`}
                      >
                        {wfh.status === "APPROVED"
                          ? "Approved"
                          : wfh.status === "FORWARDED_TO_HR"
                          ? "Stage 2: Pending HR"
                          : "Stage 1: Pending TL"}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground">{wfh.reason}</p>

                    {/* Stepper */}
                    <div className="p-2 rounded-lg bg-muted/30 border border-border/50 text-xs flex items-center gap-2">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <UserCheck className="h-3.5 w-3.5" />
                        Stage 1: Lead Approved
                      </span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className={wfh.status === "APPROVED" ? "text-emerald-400 font-semibold" : "text-pink-300 font-semibold"}>
                        {wfh.status === "APPROVED" ? "Stage 2: HR Final Sign-off ✓" : "Stage 2: In HR Queue"}
                      </span>
                    </div>

                    <div className="pt-1 text-[11px] text-muted-foreground flex items-center justify-between">
                      <span>Shift: {wfh.availabilityHours}</span>
                      <span className="font-mono text-cyan-400">{wfh.contactMethod}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Interactive3DCard>
          </div>
        </>
      )}

      {showLeaveModal && <LeaveRequestModal onClose={() => setShowLeaveModal(false)} />}
      {showWfhModal && <WfhRequestModal onClose={() => setShowWfhModal(false)} />}
    </PageTransition>
  );
}
