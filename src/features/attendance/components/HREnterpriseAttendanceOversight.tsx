"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MetricTile3D } from "@/components/3d/MetricTile3D";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { UploadBiometricModal, BiometricPunchRecord } from "./UploadBiometricModal";
import { formatWorkedHours, calculateWorkedHoursFromTimeStrings } from "@/lib/ui/time-formatter";
import {
  Clock,
  Building2,
  Users,
  CheckCircle2,
  Search,
  Radio,
  Upload,
} from "lucide-react";

export function HREnterpriseAttendanceOversight() {
  const { departments } = useWorkpulseSharedStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState<string>("ALL");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [uploadedBiometricMap, setUploadedBiometricMap] = useState<Record<string, BiometricPunchRecord>>({});

  useEffect(() => {
    const loadUploadedPunches = async () => {
      try {
        const res = await fetch("/api/v1/attendance/punches");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.data?.punches)) {
            const map: Record<string, BiometricPunchRecord> = {};
            data.data.punches.forEach((p: any) => {
              const record: BiometricPunchRecord = {
                id: p.id,
                employeeId: p.employeeId || p.employee_id,
                employeeName: p.employeeName || p.employee_name || "Employee",
                date: p.date,
                firstIn: p.time || p.first_in || "10:00 AM",
                lastOut: p.last_out || "07:00 PM",
                punchType: (p.punch_type || p.direction || "IN") as any,
                workMode: (p.work_mode || "OFFICE") as any,
                terminalId: p.terminal_id || "TERM-BLR-01",
                location: p.location || "Bangalore HQ",
                status: (p.status || "ON_TIME") as any,
              };
              if (record.employeeId) map[record.employeeId] = record;
              if (record.employeeName) map[record.employeeName.toLowerCase()] = record;
            });
            setUploadedBiometricMap(map);
          }
        }
      } catch {}
    };

    loadUploadedPunches();

    const handleEvent = () => {
      loadUploadedPunches();
    };

    window.addEventListener("workday:biometric_uploaded", handleEvent);
    window.addEventListener("workpulse_sync", handleEvent);

    return () => {
      window.removeEventListener("workday:biometric_uploaded", handleEvent);
      window.removeEventListener("workpulse_sync", handleEvent);
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
        const workedHours = calculateWorkedHoursFromTimeStrings(firstIn, lastOut);

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
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
      </div>

      {/* Main Container: Biometric Attendance Muster Roll (Full Width) */}
      <div className="w-full space-y-4">
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
          <div className="divide-y divide-border/40 max-h-[560px] overflow-y-auto pr-1">
            {filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-muted/20 px-2 rounded-xl transition-colors"
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
                    {formatWorkedHours(emp.workedHours)}
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
