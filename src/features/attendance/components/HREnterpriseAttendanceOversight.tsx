"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { MetricTile3D } from "@/components/3d/MetricTile3D";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { ExportReportModal } from "@/features/communication/components/ExportReportModal";
import {
  Clock,
  Building2,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Check,
  X,
  Search,
  Radio,
  ShieldCheck,
  Briefcase,
  GraduationCap,
} from "lucide-react";

interface RegularizationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName: string;
  designation: string;
  date: string;
  punchType: "MISSED_IN" | "MISSED_OUT" | "BIOMETRIC_GLITCH";
  actualTime: string;
  reason: string;
  leadRecommendation: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

const INITIAL_REGULARIZATIONS: RegularizationRequest[] = [
  {
    id: "reg-1",
    employeeId: "emp-john",
    employeeName: "John UI",
    departmentName: "Development",
    designation: "Frontend Engineer",
    date: "2026-08-19",
    punchType: "MISSED_IN",
    actualTime: "10:04 AM",
    reason: "HQ Biometric Terminal #1 scanner was restarting during morning peak entry.",
    leadRecommendation: "Alex Lead verified presence in morning standup at 10:10 AM.",
    status: "PENDING",
  },
  {
    id: "reg-2",
    employeeId: "emp-sneha",
    employeeName: "Sneha Kapoor",
    departmentName: "Data Processing",
    designation: "Data Analytics Engineer",
    date: "2026-08-18",
    punchType: "MISSED_OUT",
    actualTime: "07:15 PM",
    reason: "Late client ETL deployment session ran past 7 PM, exited via rear conference door.",
    leadRecommendation: "Vikram Rao confirmed data pipeline deployment went live at 07:12 PM.",
    status: "PENDING",
  },
  {
    id: "reg-3",
    employeeId: "emp-ananya",
    employeeName: "Ananya Sen",
    departmentName: "Service Providers (ConfigTap)",
    designation: "Automation QA Engineer",
    date: "2026-08-17",
    punchType: "BIOMETRIC_GLITCH",
    actualTime: "10:10 AM",
    reason: "Badge reader timeout error code E-402 on Floor 3 reader.",
    leadRecommendation: "Suresh Menon verified presence at desk 3B.",
    status: "PENDING",
  },
];

export function HREnterpriseAttendanceOversight() {
  const { departments } = useWorkpulseSharedStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [selectedPolicyType, setSelectedPolicyType] = useState<"ALL" | "FULL_TIME" | "PROBATION">("ALL");
  const [regularizations, setRegularizations] = useState<RegularizationRequest[]>(INITIAL_REGULARIZATIONS);
  const [showExportModal, setShowExportModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Flatten all employees with simulated live punch metrics
  const allEmployeesWithPunches = departments.flatMap((dept) =>
    dept.employees.map((emp, idx) => {
      // Deterministic punch simulation
      const isProbation = emp.id === "emp-john" || emp.id === "emp-farhan" || emp.id === "emp-nikhil";
      const isLate = idx === 1 && dept.id === "dept-development";
      const firstIn = isLate ? "10:22 AM" : emp.sodTime !== "--" ? emp.sodTime || "10:05 AM" : "10:12 AM";
      const status = isLate ? "LATE_ARRIVAL" : emp.workMode === "WFH" ? "APPROVED_WFH" : "ON_TIME";
      const workedHours = emp.sodStatus === "SUBMITTED" ? 8.2 : 7.5;

      return {
        ...emp,
        firstIn,
        lastOut: "07:05 PM",
        workedHours,
        isProbation,
        status,
        punchAnomaly: isLate ? "Late arrival by 7 mins (Grace: 10:15 AM)" : null,
      };
    })
  );

  const filteredEmployees = allEmployeesWithPunches.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.departmentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === "ALL" || emp.departmentId === selectedDept;

    const matchesPolicy =
      selectedPolicyType === "ALL" ||
      (selectedPolicyType === "PROBATION" && emp.isProbation) ||
      (selectedPolicyType === "FULL_TIME" && !emp.isProbation);

    return matchesSearch && matchesDept && matchesPolicy;
  });

  const totalEmployees = allEmployeesWithPunches.length;
  const onTimeCount = allEmployeesWithPunches.filter((e) => e.status === "ON_TIME").length;
  const wfhCount = allEmployeesWithPunches.filter((e) => e.status === "APPROVED_WFH").length;
  const lateCount = allEmployeesWithPunches.filter((e) => e.status === "LATE_ARRIVAL").length;
  const pendingRegsCount = regularizations.filter((r) => r.status === "PENDING").length;

  const handleApproveReg = (id: string, name: string) => {
    setRegularizations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "APPROVED" } : r))
    );
    setToastMsg(`Biometric regularization for ${name} approved and muster roll updated! ✓`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleRejectReg = (id: string, name: string) => {
    setRegularizations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "REJECTED" } : r))
    );
    setToastMsg(`Regularization for ${name} rejected.`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* 3D Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile3D
          title="Enterprise Attendance"
          value={`${onTimeCount + wfhCount} / ${totalEmployees} Active`}
          subtitle="100% accounted for today"
          icon={Users}
          change="0 Unplanned"
          changePositive={true}
          badgeText="98.2% Rate"
          accent="emerald"
        />

        <MetricTile3D
          title="Punctuality Adherence"
          value={`${totalEmployees - lateCount} / ${totalEmployees} On-Time`}
          subtitle="Arrived before 10:15 AM grace window"
          icon={Clock}
          change={`${lateCount} Late Today`}
          changePositive={lateCount === 0}
          badgeText="10:15 AM Grace"
          accent="cyan"
        />

        <MetricTile3D
          title="Remote (WFH) Logs"
          value={`${wfhCount} Remote`}
          subtitle="Authorized Mon–Fri 10AM–7PM"
          icon={Building2}
          change="Compliant"
          changePositive={true}
          badgeText="Authorized"
          accent="purple"
        />

        <MetricTile3D
          title="Biometric Regularization"
          value={`${pendingRegsCount} Pending`}
          subtitle="Missed punch claims awaiting HR"
          icon={AlertTriangle}
          change={pendingRegsCount > 0 ? "Review Required" : "All Reviewed"}
          changePositive={pendingRegsCount === 0}
          badgeText={`Queue: ${pendingRegsCount}`}
          accent="gold"
        />
      </div>

      {/* Official Shift Policy Header Banner */}
      <Interactive3DCard className="p-5 border border-cyan-500/30 bg-gradient-to-r from-card/80 via-card/60 to-cyan-500/10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold shrink-0">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Official Company Shift & Biometric Policy Enforcer
              </h3>
              <p className="text-xs text-muted-foreground">
                Official Working Hours: <strong className="text-foreground">10:00 AM – 07:00 PM</strong> (Grace arrival window up to 10:15 AM). Sunday is official week off for all.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExportModal(true)}
            className="text-xs font-bold gap-1.5 h-8 border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 shrink-0"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Export Monthly Muster Roll</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs border-t border-border/60">
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Briefcase className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-purple-300 font-bold block">Full-Time Confirmed Employees</strong>
              <span className="text-muted-foreground text-[11px]">
                Monday to Friday (10:00 AM – 07:00 PM). If work demands, work on Saturday. Sunday Week Off.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <GraduationCap className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 font-bold block">Probationers & Interns</strong>
              <span className="text-muted-foreground text-[11px]">
                Monday to Saturday Full (10:00 AM – 07:00 PM). Sunday is the official week off.
              </span>
            </div>
          </div>
        </div>
      </Interactive3DCard>

      {/* Main Grid: Biometric Muster Roll & Regularization Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Enterprise Biometric Attendance Muster Roll */}
        <div className="lg:col-span-2 space-y-4">
          <Interactive3DCard className="p-6 space-y-4 border-border/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-cyan-400" />
                  Enterprise Biometric Ingestion & Punch Muster
                </h3>
                <p className="text-xs text-muted-foreground">
                  Synchronized from Bangalore HQ Biometric Terminals #1 & #2 (10:00 AM – 07:00 PM Shift).
                </p>
              </div>

              <Badge variant="outline" className="text-[10px] text-cyan-300 border-cyan-500/30">
                <Radio className="h-3 w-3 mr-1 text-cyan-400 animate-pulse" />
                Live Sync: Today
              </Badge>
            </div>

            {/* Filter & Search Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search employee, title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-card border border-border/80 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-card border border-border/80 text-xs text-foreground focus:outline-none focus:border-cyan-500/50"
              >
                <option value="ALL">All 6 Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedPolicyType}
                onChange={(e) => setSelectedPolicyType(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl bg-card border border-border/80 text-xs text-foreground focus:outline-none focus:border-cyan-500/50"
              >
                <option value="ALL">All Work Policies</option>
                <option value="FULL_TIME">Full-Time (Mon–Fri 10–7)</option>
                <option value="PROBATION">Probation/Intern (Mon–Sat 10–7)</option>
              </select>
            </div>

            {/* Employee Muster List */}
            <div className="space-y-2.5 pt-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="p-3.5 rounded-xl bg-card/60 border border-border/70 hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-muted/80 border border-border flex items-center justify-center font-bold text-foreground text-xs shrink-0">
                      {emp.avatar}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-xs">{emp.name}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">({emp.departmentName})</span>
                        {emp.isProbation && (
                          <Badge variant="outline" className="text-[9px] bg-amber-500/15 text-amber-300 border-amber-500/30">
                            Probation (Mon-Sat)
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <span>{emp.designation}</span>
                        <span>·</span>
                        <span>In: <strong className="text-foreground">{emp.firstIn}</strong></span>
                        <span>·</span>
                        <span>Out: <strong className="text-foreground">{emp.lastOut}</strong></span>
                      </div>
                      {emp.punchAnomaly && (
                        <span className="text-[10px] text-amber-400 font-semibold block">
                          ⚠ {emp.punchAnomaly}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:text-right shrink-0">
                    <div>
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-bold uppercase ${
                          emp.status === "ON_TIME"
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : emp.status === "LATE_ARRIVAL"
                            ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            : "bg-purple-500/15 text-purple-300 border-purple-500/30"
                        }`}
                      >
                        {emp.status.replace("_", " ")}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground block font-mono mt-0.5">
                        {emp.workedHours} hrs logged
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {filteredEmployees.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  No employee attendance records matching filters.
                </div>
              )}
            </div>
          </Interactive3DCard>
        </div>

        {/* Right Col: Biometric Regularization & Discrepancy Desk */}
        <div className="space-y-4">
          <Interactive3DCard className="p-6 space-y-4 border-border/80">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                Missed Swipe Regularization Desk
              </h3>
              <Badge variant="brand" className="text-[10px] bg-amber-500/15 text-amber-300 border-amber-500/30 font-bold">
                {pendingRegsCount} Pending
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground">
              Employees who missed biometric scans or faced hardware errors submit regularizations with Team Lead verification for HR sign-off.
            </p>

            <div className="space-y-3 pt-1">
              {regularizations.map((reg) => (
                <div
                  key={reg.id}
                  className="p-3.5 rounded-xl bg-card/60 border border-border/70 space-y-2.5 text-xs transition-all hover:border-amber-500/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{reg.employeeName}</span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] uppercase font-bold ${
                        reg.status === "APPROVED"
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : reg.status === "REJECTED"
                          ? "bg-red-500/15 text-red-400 border-red-500/30"
                          : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      }`}
                    >
                      {reg.status}
                    </Badge>
                  </div>

                  <div className="text-[11px] text-muted-foreground space-y-0.5">
                    <div>
                      <span className="font-mono text-cyan-400">{reg.date}</span> ·{" "}
                      <span className="text-foreground">{reg.punchType.replace("_", " ")}</span> at{" "}
                      <strong className="text-foreground">{reg.actualTime}</strong>
                    </div>
                    <p className="italic text-foreground/80">&quot;{reg.reason}&quot;</p>
                  </div>

                  <div className="p-2 rounded-lg bg-muted/40 text-[10px] text-muted-foreground border border-border/50">
                    <span className="font-bold text-foreground">Lead Verification:</span> {reg.leadRecommendation}
                  </div>

                  {reg.status === "PENDING" && (
                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        variant="brand"
                        size="sm"
                        onClick={() => handleApproveReg(reg.id, reg.employeeName)}
                        className="flex-1 text-xs font-bold h-7 bg-gradient-to-r from-emerald-500 to-teal-600 text-white gap-1"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Approve</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectReg(reg.id, reg.employeeName)}
                        className="text-xs font-bold h-7 border-red-500/40 text-red-400 hover:bg-red-500/10 gap-1"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Reject</span>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Interactive3DCard>
        </div>
      </div>

      {showExportModal && <ExportReportModal onClose={() => setShowExportModal(false)} />}
    </div>
  );
}
