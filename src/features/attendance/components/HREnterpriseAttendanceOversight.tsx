"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricTile3D } from "@/components/3d/MetricTile3D";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { ExportReportModal } from "@/features/communication/components/ExportReportModal";
import { UploadBiometricModal, BiometricPunchRecord } from "./UploadBiometricModal";
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
  Upload,
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
    employeeId: "emp-rohit",
    employeeName: "Rohit Sharma",
    departmentName: "Development",
    designation: "Frontend Engineer (UI/UX)",
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
  const { departments, allEmployees } = useWorkpulseSharedStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [regularizations, setRegularizations] = useState<RegularizationRequest[]>(INITIAL_REGULARIZATIONS);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [uploadedBiometricMap, setUploadedBiometricMap] = useState<Record<string, BiometricPunchRecord>>({});

  useEffect(() => {
    const loadUploadedPunches = () => {
      if (typeof window === "undefined") return;
      try {
        const raw = localStorage.getItem("workpulse_biometric_overrides_map");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed === "object") {
            setUploadedBiometricMap(parsed);
          }
        }
      } catch {}
    };

    loadUploadedPunches();

    window.addEventListener("workday:biometric_uploaded", loadUploadedPunches);
    window.addEventListener("workpulse_sync", loadUploadedPunches);
    window.addEventListener("storage", loadUploadedPunches);

    return () => {
      window.removeEventListener("workday:biometric_uploaded", loadUploadedPunches);
      window.removeEventListener("workpulse_sync", loadUploadedPunches);
      window.removeEventListener("storage", loadUploadedPunches);
    };
  }, []);

  // Flatten all employees merged with live uploaded biometric punch overrides
  const allEmployeesWithPunches = useMemo(() => {
    return departments.flatMap((dept) =>
      dept.employees.map((emp, idx) => {
        const biom =
          uploadedBiometricMap[emp.id] ||
          uploadedBiometricMap[emp.name.toLowerCase()] ||
          (emp.email ? uploadedBiometricMap[emp.email.toLowerCase()] : null);

        const isProbation = emp.id === "emp-john" || emp.id === "emp-farhan" || emp.id === "emp-nikhil";
        const isLate = biom ? biom.status === "LATE_ARRIVAL" : idx === 1 && dept.id === "dept-development";
        const firstIn = biom ? biom.firstIn : isLate ? "10:22 AM" : emp.sodTime !== "--" ? emp.sodTime || "10:05 AM" : "10:12 AM";
        const lastOut = biom ? biom.lastOut : "07:05 PM";
        const workMode = biom ? biom.workMode : emp.workMode;
        const status = biom ? biom.status : isLate ? "LATE_ARRIVAL" : emp.workMode === "WFH" ? "APPROVED_WFH" : "ON_TIME";
        const workedHours = emp.sodStatus === "SUBMITTED" ? 8.2 : 7.5;

        return {
          ...emp,
          firstIn,
          lastOut,
          workMode,
          workedHours,
          isProbation,
          status,
          punchAnomaly: isLate ? "Late arrival by 7 mins (Grace: 10:15 AM)" : null,
          hasUploadedBiometric: Boolean(biom),
        };
      })
    );
  }, [departments, uploadedBiometricMap]);

  const filteredEmployees = allEmployeesWithPunches.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.departmentName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === "ALL" || emp.departmentId === selectedDept;

    return matchesSearch && matchesDept;
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
          title="Active Today"
          value={`${onTimeCount + wfhCount} / ${totalEmployees}`}
          icon={Users}
          change="100% Present"
          changePositive={true}
          accent="emerald"
        />

        <MetricTile3D
          title="On-Time Arrival"
          value={`${totalEmployees - lateCount} / ${totalEmployees}`}
          icon={Clock}
          change={lateCount === 0 ? "All On-Time" : `${lateCount} Late`}
          changePositive={lateCount === 0}
          accent="cyan"
        />

        <MetricTile3D
          title="Remote (WFH)"
          value={`${wfhCount} Staff`}
          icon={Building2}
          change="Approved"
          changePositive={true}
          accent="purple"
        />

        <MetricTile3D
          title="Missed Punches"
          value={`${pendingRegsCount} Pending`}
          icon={AlertTriangle}
          change={pendingRegsCount === 0 ? "All Clear" : "Action Needed"}
          changePositive={pendingRegsCount === 0}
          accent="gold"
        />
      </div>

      {/* Main Grid: Biometric Muster Roll & Regularization Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left 2 Cols: Biometric Attendance Muster Roll */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-5 sm:p-6 rounded-3xl bg-card/80 border border-border/70 space-y-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Clock className="h-4 w-4 text-cyan-400" />
                  <span>Daily Attendance</span>
                </h3>
                <Badge variant="outline" className="text-[10px] text-cyan-300 border-cyan-500/30 font-semibold">
                  <Radio className="h-2.5 w-2.5 mr-1 text-cyan-400 animate-pulse" />
                  Live Sync
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowUploadModal(true)}
                  size="sm"
                  className="text-xs font-bold gap-1.5 h-8 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl shadow-sm cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Upload Biometric File</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExportModal(true)}
                  className="text-xs font-bold gap-1.5 h-8 border-border/80 bg-background/60 hover:bg-muted/40 rounded-xl"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Export Sheet</span>
                </Button>
              </div>
            </div>

            {/* Filter & Search Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search staff by name, role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 h-9 rounded-xl bg-background/80 border border-border/70 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-cyan-500/50"
                />
              </div>

              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="h-9 px-3 rounded-xl bg-background/80 border border-border/70 text-xs font-semibold text-foreground focus:outline-none focus:border-cyan-500/50"
              >
                <option value="ALL">All Departments ({departments.length})</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee Muster List */}
            <div className="divide-y divide-border/40 max-h-[540px] overflow-y-auto pr-1">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-xl bg-muted/60 border border-border/80 flex items-center justify-center font-bold text-foreground text-xs shrink-0" suppressHydrationWarning>
                      {(emp.avatar || emp.name || "WP").slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <strong className="text-foreground font-bold" suppressHydrationWarning>{emp.name}</strong>
                        <span className="text-muted-foreground text-[11px]" suppressHydrationWarning>({emp.departmentName})</span>
                        {emp.isProbation && (
                          <Badge variant="outline" className="text-[9px] text-amber-300 border-amber-500/30">
                            Probation
                          </Badge>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        <span suppressHydrationWarning>{emp.designation}</span>
                        <span className="mx-1.5">·</span>
                        <span>In: <strong className="text-foreground font-mono">{emp.firstIn}</strong></span>
                        <span className="mx-1.5">·</span>
                        <span>Out: <strong className="text-foreground font-mono">{emp.lastOut}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-[9px] font-bold ${
                        emp.status === "ON_TIME"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : emp.status === "LATE_ARRIVAL"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          : "bg-purple-500/10 text-purple-300 border-purple-500/30"
                      }`}
                    >
                      {emp.status === "LATE_ARRIVAL" ? "Late (7m)" : emp.status.replace("_", " ")}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground font-mono font-bold">
                      {emp.workedHours}h
                    </span>
                  </div>
                </div>
              ))}

              {filteredEmployees.length === 0 && (
                <div className="p-8 text-center text-muted-foreground text-xs">
                  No employee attendance records matching filters.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Missed Punches Desk */}
        <div className="space-y-4">
          <div className="p-5 sm:p-6 rounded-3xl bg-card/80 border border-border/70 space-y-4 shadow-sm">
            <div className="flex items-center justify-between pb-1 border-b border-border/40">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span>Missed Punches</span>
              </h3>
              <Badge variant="outline" className="text-[10px] text-amber-300 border-amber-500/30 font-bold">
                {pendingRegsCount} Pending
              </Badge>
            </div>

            <div className="divide-y divide-border/40 text-xs">
              {regularizations.map((reg) => {
                const matchedEmp = allEmployees.find(
                  (e) => e.id === reg.employeeId || e.name.toLowerCase() === reg.employeeName.toLowerCase()
                );
                const employeeName = matchedEmp ? matchedEmp.name : reg.employeeName;

                return (
                  <div
                    key={reg.id}
                    className="py-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-foreground font-bold" suppressHydrationWarning>{employeeName}</strong>
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-bold ${
                          reg.status === "APPROVED"
                            ? "text-emerald-400 border-emerald-500/30"
                            : reg.status === "REJECTED"
                            ? "text-rose-400 border-rose-500/30"
                            : "text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {reg.status}
                      </Badge>
                    </div>

                    <div className="text-[11px] text-muted-foreground">
                      <span className="font-mono text-cyan-400">{reg.date}</span> ·{" "}
                      <span>{reg.punchType.replace("_", " ")} ({reg.actualTime})</span>
                    </div>

                    <p className="text-[11px] text-foreground/80 italic line-clamp-2">
                      &quot;{reg.reason}&quot;
                    </p>

                    {reg.status === "PENDING" && (
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          variant="brand"
                          size="sm"
                          onClick={() => handleApproveReg(reg.id, reg.employeeName)}
                          className="flex-1 text-xs font-bold h-7 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
                        >
                          <Check className="h-3.5 w-3.5 mr-1" />
                          <span>Approve</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectReg(reg.id, reg.employeeName)}
                          className="text-xs font-semibold h-7 px-3 border-border text-muted-foreground hover:text-foreground rounded-lg"
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          <span>Reject</span>
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showExportModal && <ExportReportModal onClose={() => setShowExportModal(false)} />}
      <UploadBiometricModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={(punches) => {
          setToastMsg(`✓ Biometric attendance file uploaded successfully! ${punches.length} punch records saved & updated project-wide.`);
          setTimeout(() => setToastMsg(null), 4000);
        }}
      />
    </div>
  );
}
