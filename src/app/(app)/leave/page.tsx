"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { MetricTile3D } from "@/components/3d/MetricTile3D";
import { PageTransition } from "@/components/animations/PageTransition";
import { LeaveRequestModal } from "@/features/leave/components/LeaveRequestModal";
import { WfhRequestModal } from "@/features/leave/components/WfhRequestModal";
import { LeadLeaveManager } from "@/features/leave/components/LeadLeaveManager";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { useCurrentUser } from "@/components/layout/UserContext";
import {
  Calendar,
  Laptop,
  Plus,
  Clock,
  Sparkles,
  CheckCircle2,
  PieChart,
  ShieldCheck,
  Users,
} from "lucide-react";

type LeaveTab = "LEAVES" | "WFH" | "BALANCES";

export default function LeavePage() {
  const user = useCurrentUser();
  const isHR =
    user.roles.includes("HR") ||
    user.primaryRole === "HR" ||
    user.userEmail.toLowerCase().includes("hr");

  const isLead =
    !isHR &&
    (user.roles.includes("MANAGER") ||
      user.primaryRole === "MANAGER" ||
      user.userEmail.toLowerCase().includes("lead"));

  const [activeTab, setActiveTab] = useState<LeaveTab>("LEAVES");
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showWfhModal, setShowWfhModal] = useState(false);
  const [toastMsg] = useState<string | null>(null);

  const { allEmployees, leaveRequests, wfhRequests } = useWorkpulseSharedStore();

  const matchedEmp = allEmployees.find(
    (e) =>
      e.email.toLowerCase() === user.userEmail.toLowerCase() ||
      e.name.toLowerCase() === user.userName.toLowerCase()
  ) || allEmployees[0];

  const myLeaveRequests = leaveRequests.filter(
    (r) =>
      (matchedEmp && r.employeeId === matchedEmp.id) ||
      r.employeeName === user.userName ||
      r.employeeId === "emp-sarah"
  );

  const myWfhRequests = wfhRequests.filter(
    (r) =>
      (matchedEmp && r.employeeId === matchedEmp.id) ||
      r.employeeName === user.userName ||
      r.employeeId === "emp-sarah"
  );

  const remainingBalance =
    matchedEmp?.remainingLeaveBalance ??
    (myLeaveRequests.length > 0 ? myLeaveRequests[0]!.remainingBalance : 12.0);

  if (isHR || isLead) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <Interactive3DCard className="p-6 border border-border/80 bg-gradient-to-r from-card/90 via-card/70 to-card/50">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="font-bold text-[10px] uppercase">
                  {isHR ? (
                    <>
                      <ShieldCheck className="h-3 w-3 mr-1 text-pink-400" />
                      <span>HR Leave &amp; WFH Oversight</span>
                    </>
                  ) : (
                    <>
                      <Users className="h-3 w-3 mr-1 text-indigo-400" />
                      <span>Pod Leave &amp; WFH Operations</span>
                    </>
                  )}
                </Badge>
                <span className="text-[11px] text-muted-foreground font-medium">
                  {isHR ? "Organization-Wide Stage 2 Authorizations & Balances" : "Development Pod · 4 Direct Reports"}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                {isHR ? "Leave & WFH Oversight & Approvals" : "Pod Leave & WFH Management"}
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {isHR
                  ? "Execute Stage-2 HR leave and WFH authorizations, track organization-wide time off, and verify remaining balances."
                  : "Review direct report time-off applications, manage sprint coverage, and submit your personal leave."}
              </p>
            </div>
          </Interactive3DCard>

          <LeadLeaveManager />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Toast Feedback */}
        {toastMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-semibold">{toastMsg}</span>
          </div>
        )}

        {/* 1. Header Banner */}
        <Interactive3DCard className="p-6 border border-border/80 bg-gradient-to-r from-card/90 via-card/70 to-card/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="font-bold text-[10px] uppercase">
                  <Calendar className="h-3 w-3 mr-1 text-teal-400" />
                  Time Off &amp; Remote Work
                </Badge>
                <span className="text-[11px] text-muted-foreground font-medium">
                  Stage 1 Approver: <strong className="text-foreground">Alex Lead</strong> (Team Lead)
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Leave & Work From Home
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Apply for planned time off, submit work-from-home requests, and track your balances.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWfhModal(true)}
                className="text-xs font-semibold gap-1.5 h-9"
              >
                <Laptop className="h-3.5 w-3.5 text-cyan-400" />
                <span>Request WFH</span>
              </Button>

              <Button
                size="sm"
                variant="brand"
                onClick={() => setShowLeaveModal(true)}
                className="text-xs font-bold gap-1.5 h-9"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Apply for Leave</span>
              </Button>
            </div>
          </div>
        </Interactive3DCard>

        {/* 2. Glanceable Balance Summary Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricTile3D
            title="Casual Leave (CL)"
            value={`${remainingBalance} Days`}
            subtitle="Available balance"
            icon={Calendar}
            badgeText="Available"
            accent="emerald"
          />

          <MetricTile3D
            title="Sick Leave (SL)"
            value="8.0 Days"
            subtitle="Annual allocation"
            icon={Clock}
            badgeText="Available"
            accent="cyan"
          />

          <MetricTile3D
            title="WFH This Month"
            value={`${myWfhRequests.length} Days`}
            subtitle="Remote work sessions"
            icon={Laptop}
            badgeText="Flexible"
            accent="purple"
          />

          <MetricTile3D
            title="Next Holiday"
            value="Aug 29"
            subtitle="Ganesh Chaturthi"
            icon={Sparkles}
            badgeText="Company Holiday"
            accent="gold"
          />
        </div>

        {/* 3. Segregated Navigation Bar */}
        <Interactive3DCard className="p-4 md:p-5 border border-border/80 bg-card/60 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center p-1 rounded-xl bg-background/50 border border-border/70 overflow-x-auto gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("LEAVES")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === "LEAVES"
                    ? "bg-primary text-primary-foreground font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Leave Requests ({myLeaveRequests.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("WFH")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === "WFH"
                    ? "bg-primary text-primary-foreground font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Laptop className="h-3.5 w-3.5" />
                <span>Work From Home ({myWfhRequests.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("BALANCES")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                  activeTab === "BALANCES"
                    ? "bg-primary text-primary-foreground font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <PieChart className="h-3.5 w-3.5" />
                <span>Leave Allowances</span>
              </button>
            </div>
          </div>
        </Interactive3DCard>

        {/* 4. Tab Contents */}

        {/* TAB 1: LEAVE REQUESTS */}
        {activeTab === "LEAVES" && (
          <div className="space-y-3">
            {myLeaveRequests.length === 0 ? (
              <div className="p-12 text-center bg-card/40 rounded-2xl border border-border/60 text-xs text-muted-foreground space-y-2">
                <Calendar className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="font-semibold text-sm text-foreground">No leave applications</p>
                <p>You have not submitted any leave requests yet. Click &quot;Apply for Leave&quot; above to request time off.</p>
              </div>
            ) : (
              myLeaveRequests.map((req) => {
                const isApproved = req.status === "APPROVED";
                const isRejected = req.status === "REJECTED";
                const isStage2 = req.status === "FORWARDED_TO_HR";

                return (
                  <div
                    key={req.id}
                    className="p-4 rounded-xl border border-border/70 bg-card/70 hover:border-primary/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-xs font-bold text-foreground">
                          {req.leaveType} Leave ({req.daysCount} {req.daysCount === 1 ? "Day" : "Days"})
                        </strong>

                        <Badge
                          variant="outline"
                          className={`text-[9px] uppercase font-bold ${
                            isApproved
                              ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                              : isRejected
                              ? "border-rose-500/30 text-rose-400 bg-rose-500/10"
                              : isStage2
                              ? "border-cyan-500/30 text-cyan-300 bg-cyan-500/10"
                              : "border-amber-500/30 text-amber-300 bg-amber-500/10"
                          }`}
                        >
                          {isApproved
                            ? "✓ Fully Approved"
                            : isRejected
                            ? "Declined"
                            : isStage2
                            ? "Stage 2: Lead Approved · Awaiting HR"
                            : "Stage 1: Pending Team Lead"}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {req.startDate} {req.startDate !== req.endDate ? `→ ${req.endDate}` : ""}
                        {req.reason && ` · "${req.reason}"`}
                      </p>
                    </div>

                    <div className="text-[11px] text-muted-foreground shrink-0 font-mono">
                      Balance Remaining: {req.remainingBalance}d
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: WORK FROM HOME (WFH) REQUESTS */}
        {activeTab === "WFH" && (
          <div className="space-y-3">
            {myWfhRequests.length === 0 ? (
              <div className="p-12 text-center bg-card/40 rounded-2xl border border-border/60 text-xs text-muted-foreground space-y-2">
                <Laptop className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="font-semibold text-sm text-foreground">No WFH requests</p>
                <p>You have not logged any remote workdays. Click &quot;Request WFH&quot; above to log a remote day.</p>
              </div>
            ) : (
              myWfhRequests.map((wfh) => {
                const isApproved = wfh.status === "APPROVED";
                const isRejected = wfh.status === "REJECTED";
                const isStage2 = wfh.status === "FORWARDED_TO_HR";

                return (
                  <div
                    key={wfh.id}
                    className="p-4 rounded-xl border border-border/70 bg-card/70 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-xs font-bold text-foreground">
                          Remote Work ({wfh.startDate})
                        </strong>

                        <Badge
                          variant="outline"
                          className={`text-[9px] uppercase font-bold ${
                            isApproved
                              ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10"
                              : isRejected
                              ? "border-rose-500/30 text-rose-400 bg-rose-500/10"
                              : isStage2
                              ? "border-cyan-500/30 text-cyan-300 bg-cyan-500/10"
                              : "border-amber-500/30 text-amber-300 bg-amber-500/10"
                          }`}
                        >
                          {isApproved
                            ? "✓ Fully Approved"
                            : isRejected
                            ? "Declined"
                            : isStage2
                            ? "Stage 2: Lead Approved · Awaiting HR"
                            : "Stage 1: Pending Team Lead"}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {wfh.reason || "Remote workday"}
                      </p>
                    </div>

                    <div className="text-[11px] text-muted-foreground shrink-0">
                      Contact: <span className="font-mono text-cyan-400">{wfh.contactMethod}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: LEAVE ALLOWANCES BREAKDOWN */}
        {activeTab === "BALANCES" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-border bg-card space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground">Casual Leave (CL)</h4>
                <Badge variant="brand" className="text-[9px]">12 Days / Year</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                For personal errands, family events, and planned breaks. Available balance: <strong className="text-emerald-400">{remainingBalance} days</strong>.
              </p>
              <div className="pt-1">
                <Button size="sm" variant="outline" onClick={() => setShowLeaveModal(true)} className="w-full text-xs h-8">
                  Apply for Casual Leave
                </Button>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground">Sick Leave (SL)</h4>
                <Badge variant="secondary" className="text-[9px]">8 Days / Year</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                For medical appointments, unexpected illness, and recovery. Available balance: <strong className="text-cyan-400">8 days</strong>.
              </p>
              <div className="pt-1">
                <Button size="sm" variant="outline" onClick={() => setShowLeaveModal(true)} className="w-full text-xs h-8">
                  Apply for Sick Leave
                </Button>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-border bg-card space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-foreground">Work From Home (WFH)</h4>
                <Badge variant="outline" className="text-[9px]">Flexible</Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Work remotely when needed with prior notification. Availability during standard business hours (10:00 AM – 07:00 PM).
              </p>
              <div className="pt-1">
                <Button size="sm" variant="outline" onClick={() => setShowWfhModal(true)} className="w-full text-xs h-8">
                  Submit WFH Request
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showLeaveModal && <LeaveRequestModal onClose={() => setShowLeaveModal(false)} />}
      {showWfhModal && <WfhRequestModal onClose={() => setShowWfhModal(false)} />}
    </PageTransition>
  );
}
