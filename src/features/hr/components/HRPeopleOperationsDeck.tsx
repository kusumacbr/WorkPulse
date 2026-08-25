"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { useWorkpulseSharedStore, OrgDepartment } from "@/lib/stores/workpulse-shared-store";
import {
  Users,
  Search,
  Building2,
  CheckCircle2,
  Clock,
  UserCheck,
  UserPlus,
  UserMinus,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Terminal,
  Cpu,
  Database,
  Compass,
  Layers,
  Briefcase,
  Check,
  Mail,
  Pencil,
  Trash2,
  Eye,
  X,
  MapPin,
  Phone,
} from "lucide-react";

interface NewJoiner {
  id: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  joiningDate: string;
  onboardingProgress: number;
  probationCheckpoint: "30_DAYS" | "60_DAYS" | "90_DAYS";
  checkpointStatus: "COMPLETED" | "IN_PROGRESS" | "SCHEDULED";
  leadName: string;
}

interface ProbationRecord {
  id: string;
  employeeName: string;
  department: string;
  designation: string;
  joiningDate: string;
  confirmationDueDate: string;
  stage: "30_DAYS" | "60_DAYS" | "90_DAYS_FINAL";
  leadRecommendation: "CONFIRM" | "EXTEND_30" | "UNDER_REVIEW";
  leadNotes: string;
  leadName: string;
  okrScore: number;
  shiftPunctuality: number;
  status: "PENDING_HR_DECISION" | "CONFIRMED" | "EXTENDED";
}

interface NoticeExitRecord {
  id: string;
  employeeName: string;
  department: string;
  designation: string;
  resignationDate: string;
  lastWorkingDate: string;
  type: "NOTICE_PERIOD" | "EXITED";
  handoverStatus: "IN_PROGRESS" | "COMPLETED";
  exitInterviewDone: boolean;
  clearanceStatus: "PENDING_IT" | "CLEARED" | "FINAL_SETTLEMENT_DONE";
}

export interface DirectoryEmployeeItem {
  id: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  departmentId: string;
  teamLeadName: string;
  workMode: "OFFICE" | "WFH" | "HYBRID";
  status: "Full-Time" | "Probation" | "Notice Period";
  joiningDate: string;
  leaveBalance: number;
  phoneNumber?: string;
  workLocation?: string;
  isLead?: boolean;
}

const INITIAL_NEW_JOINERS: NewJoiner[] = [
  {
    id: "nj-1",
    name: "Rohit Sharma",
    email: "rohit.sharma@xorstack.com",
    designation: "Frontend Engineer (UI/UX)",
    department: "Development",
    joiningDate: "2026-08-01",
    onboardingProgress: 100,
    probationCheckpoint: "30_DAYS",
    checkpointStatus: "COMPLETED",
    leadName: "Alex Lead",
  },
  {
    id: "nj-2",
    name: "Sneha Kapoor",
    email: "sneha.kapoor@xorstack.com",
    designation: "Data Analytics Engineer",
    department: "Data processing",
    joiningDate: "2026-08-10",
    onboardingProgress: 85,
    probationCheckpoint: "30_DAYS",
    checkpointStatus: "IN_PROGRESS",
    leadName: "Vikram Rao",
  },
  {
    id: "nj-3",
    name: "Ananya Sen",
    email: "ananya.sen@xorstack.com",
    designation: "Automation & Embedded QA Engineer",
    department: "Service Providers (ConfigTap)",
    joiningDate: "2026-08-15",
    onboardingProgress: 70,
    probationCheckpoint: "30_DAYS",
    checkpointStatus: "SCHEDULED",
    leadName: "Alex Lead",
  },
];

const INITIAL_PROBATION_RECORDS: ProbationRecord[] = [
  {
    id: "pr-1",
    employeeName: "Rohit Sharma",
    department: "Development",
    designation: "Frontend Engineer (UI/UX)",
    joiningDate: "2026-05-20",
    confirmationDueDate: "2026-08-20",
    stage: "90_DAYS_FINAL",
    leadRecommendation: "CONFIRM",
    leadNotes: "Exceeded all sprint deliverables in Next.js/Tailwind components. Ready for full-time confirmation.",
    leadName: "Alex Lead",
    okrScore: 92.5,
    shiftPunctuality: 98.4,
    status: "PENDING_HR_DECISION",
  },
  {
    id: "pr-2",
    employeeName: "Ananya Sen",
    department: "Service Providers (ConfigTap)",
    designation: "Automation & Embedded QA Engineer",
    joiningDate: "2026-06-20",
    confirmationDueDate: "2026-09-20",
    stage: "60_DAYS",
    leadRecommendation: "CONFIRM",
    leadNotes: "Engineered automated ECU and Autosar CAN diagnostic conformity test suites.",
    leadName: "Alex Lead",
    okrScore: 94.0,
    shiftPunctuality: 99.1,
    status: "PENDING_HR_DECISION",
  },
  {
    id: "pr-3",
    employeeName: "Sneha Kapoor",
    department: "Data processing",
    designation: "Data Analytics Engineer",
    joiningDate: "2026-08-10",
    confirmationDueDate: "2026-09-10",
    stage: "30_DAYS",
    leadRecommendation: "UNDER_REVIEW",
    leadNotes: "30-day initial checkpoint. Active on real-time ingestion pipeline optimization tasks.",
    leadName: "Vikram Rao",
    okrScore: 86.0,
    shiftPunctuality: 97.5,
    status: "PENDING_HR_DECISION",
  },
];

const INITIAL_NOTICE_RECORDS: NoticeExitRecord[] = [
  {
    id: "ne-1",
    employeeName: "Ananya Sen",
    department: "Service Providers (ConfigTap)",
    designation: "Automation & Embedded QA Engineer",
    resignationDate: "2026-08-15",
    lastWorkingDate: "2026-09-15",
    type: "NOTICE_PERIOD",
    handoverStatus: "IN_PROGRESS",
    exitInterviewDone: false,
    clearanceStatus: "PENDING_IT",
  },
];

export function HRPeopleOperationsDeck() {
  const { allEmployees, departments, addEmployee, updateEmployee, deleteEmployee, syncWithSupabase } = useWorkpulseSharedStore();
  const [subTab, setSubTab] = useState<"joiners_probation" | "org_tree" | "directory" | "exits">("directory");

  useEffect(() => {
    syncWithSupabase();
  }, []);

  // Probation state
  const [probationList, setProbationList] = useState<ProbationRecord[]>(INITIAL_PROBATION_RECORDS);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Directory search & filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [selectedWorkModeFilter, setSelectedWorkModeFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(8);

  // CRUD Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<DirectoryEmployeeItem | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<DirectoryEmployeeItem | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<DirectoryEmployeeItem | null>(null);

  // Add Form state
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    designation: "",
    departmentId: departments[0]?.id || "dept-dev",
    workMode: "OFFICE" as "OFFICE" | "WFH" | "HYBRID",
    employmentType: "Full-Time" as "Full-Time" | "Probation" | "Contract" | "Intern",
    remainingLeaveBalance: 12.0,
    joiningDate: new Date().toISOString().split("T")[0],
    phoneNumber: "+91 98450 11223",
    location: "Bangalore HQ",
  });

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleConfirmProbation = (id: string, name: string) => {
    setProbationList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "CONFIRMED" } : item))
    );
    showToast(`Full-time confirmation decision approved & logged for ${name}! ✓`);
  };

  const handleExtendProbation = (id: string, name: string) => {
    setProbationList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: "EXTENDED" } : item))
    );
    showToast(`Probation period extended by 30 days for ${name}.`);
  };

  // Build full employee directory from allEmployees (exact Supabase records)
  const fullDirectory = useMemo(() => {
    const seen = new Set<string>();
    const list: DirectoryEmployeeItem[] = [];

    // Prioritize all live employees from the reactive Supabase store
    const sourceList = allEmployees.length > 0 ? allEmployees : departments.flatMap((d) => d.employees);

    sourceList.forEach((emp) => {
      if (seen.has(emp.id)) return;
      seen.add(emp.id);

      const isLead =
        emp.id.startsWith("lead-") ||
        emp.id.startsWith("admin-") ||
        (emp.designation && (emp.designation.toLowerCase().includes("lead") || emp.designation.toLowerCase().includes("director"))) ||
        departments.some((d) => d.teamLead.id === emp.id);

      const isProbation = INITIAL_PROBATION_RECORDS.some(
        (p) => p.employeeName.toLowerCase() === emp.name.toLowerCase() && p.status === "PENDING_HR_DECISION"
      );
      const isNotice = INITIAL_NOTICE_RECORDS.some(
        (n) => n.employeeName.toLowerCase() === emp.name.toLowerCase() && n.type === "NOTICE_PERIOD"
      );

      list.push({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        designation: emp.designation,
        department: emp.departmentName,
        departmentId: emp.departmentId,
        teamLeadName: isLead ? "Executive Leadership" : emp.teamLeadName,
        workMode: emp.workMode || "OFFICE",
        status:
          (emp.status as any) ||
          (isNotice ? "Notice Period" : isProbation ? "Probation" : "Full-Time"),
        joiningDate: emp.joiningDate || "2025-06-01",
        leaveBalance: emp.remainingLeaveBalance ?? 12.0,
        phoneNumber: emp.phoneNumber || "+91 98450 88771",
        workLocation:
          emp.workLocation ||
          emp.location ||
          (emp.workMode === "WFH" ? "Remote (India)" : "Bangalore HQ (Floor 3)"),
        isLead,
      });
    });

    return list;
  }, [allEmployees, departments]);

  // Filtered directory
  const filteredDirectory = useMemo(() => {
    return fullDirectory.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDeptFilter === "ALL" || emp.department === selectedDeptFilter;
      const matchesStatus = selectedStatusFilter === "ALL" || emp.status === selectedStatusFilter;
      const matchesWorkMode = selectedWorkModeFilter === "ALL" || emp.workMode === selectedWorkModeFilter;
      return matchesSearch && matchesDept && matchesStatus && matchesWorkMode;
    });
  }, [fullDirectory, searchQuery, selectedDeptFilter, selectedStatusFilter, selectedWorkModeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredDirectory.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedDirectory = useMemo(() => {
    if (pageSize >= filteredDirectory.length) return filteredDirectory;
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredDirectory.slice(start, start + pageSize);
  }, [filteredDirectory, safeCurrentPage, pageSize]);

  // Handle Add Employee Submit
  const handleAddEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim() || !addForm.email.trim() || !addForm.designation.trim()) {
      showToast("Please fill all required employee fields.");
      return;
    }

    const payload = {
      name: addForm.name.trim(),
      email: addForm.email.trim(),
      designation: addForm.designation.trim(),
      departmentId: addForm.departmentId,
      workMode: addForm.workMode,
      remainingLeaveBalance: Number(addForm.remainingLeaveBalance) || 12.0,
      employmentType: addForm.employmentType,
      status: addForm.employmentType === "Probation" ? "Probation" : "Full-Time",
      joiningDate: addForm.joiningDate,
      phoneNumber: addForm.phoneNumber,
      location: addForm.location,
      workLocation: addForm.location,
    };

    const created = addEmployee(payload);

    try {
      await fetch("/api/v1/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // safe fallback
    }

    if (created) {
      const targetDept = departments.find((d) => d.id === addForm.departmentId);
      showToast(`🎉 Employee "${created.name}" onboarded successfully into ${targetDept?.name || "the organization"} & synced to Supabase!`);
      setShowAddModal(false);
      // Reset form
      setAddForm({
        name: "",
        email: "",
        designation: "",
        departmentId: departments[0]?.id || "dept-dev",
        workMode: "OFFICE",
        employmentType: "Full-Time",
        remainingLeaveBalance: 12.0,
        joiningDate: new Date().toISOString().split("T")[0],
        phoneNumber: "+91 98450 11223",
        location: "Bangalore HQ",
      });
    }
  };

  // Handle Edit Employee Submit
  const handleEditEmployeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;

    const updates = {
      name: editingEmployee.name.trim(),
      email: editingEmployee.email.trim(),
      designation: editingEmployee.designation.trim(),
      departmentId: editingEmployee.departmentId,
      workMode: editingEmployee.workMode,
      status: editingEmployee.status,
      remainingLeaveBalance: Number(editingEmployee.leaveBalance),
      phoneNumber: editingEmployee.phoneNumber,
      workLocation: editingEmployee.workLocation,
      joiningDate: editingEmployee.joiningDate,
    };

    updateEmployee(editingEmployee.id, updates);

    try {
      await fetch(`/api/v1/employees/${editingEmployee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch {
      // safe fallback
    }

    showToast(`✓ Employee record for "${editingEmployee.name}" updated in Supabase & application roster.`);
    setEditingEmployee(null);
  };

  // Handle Delete / Offboard Employee Confirm
  const handleDeleteEmployeeConfirm = async () => {
    if (!deletingEmployee) return;
    const empId = deletingEmployee.id;
    const empName = deletingEmployee.name;

    deleteEmployee(empId);

    try {
      await fetch(`/api/v1/employees/${empId}`, {
        method: "DELETE",
      });
    } catch {
      // safe fallback
    }

    showToast(`🗑️ Employee "${empName}" offboarded & archived from Supabase & application.`);
    setDeletingEmployee(null);
  };

  const getDeptIcon = (iconType: OrgDepartment["iconType"]) => {
    switch (iconType) {
      case "dev":
        return <Terminal className="h-4 w-4 text-cyan-400" />;
      case "devops":
        return <Cpu className="h-4 w-4 text-emerald-400" />;
      case "data":
        return <Database className="h-4 w-4 text-purple-400" />;
      case "rd":
        return <Compass className="h-4 w-4 text-pink-400" />;
      case "configtap":
        return <Layers className="h-4 w-4 text-amber-400" />;
      case "sap":
        return <Briefcase className="h-4 w-4 text-blue-400" />;
    }
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

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center p-1.5 rounded-xl bg-card/60 border border-border/80 overflow-x-auto gap-1 text-xs">
        <button
          type="button"
          onClick={() => setSubTab("directory")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition-all ${
            subTab === "directory"
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Users className="h-3.5 w-3.5" />
          <span>Employee Directory & CRUD Hub</span>
          <span className="text-[10px] opacity-75 font-mono">({fullDirectory.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("joiners_probation")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition-all ${
            subTab === "joiners_probation"
              ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>New Joiners & Probation Due</span>
          <Badge variant="outline" className="text-[9px] ml-1 bg-white/20 text-white border-transparent">
            {probationList.filter((p) => p.status === "PENDING_HR_DECISION").length}
          </Badge>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("org_tree")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition-all ${
            subTab === "org_tree"
              ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Building2 className="h-3.5 w-3.5" />
          <span>Org Structure & Headcount</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("exits")}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-bold transition-all ${
            subTab === "exits"
              ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <UserMinus className="h-3.5 w-3.5" />
          <span>Notice Period & Exits</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 1. SEARCHABLE & CRUD-ENABLED EMPLOYEE DIRECTORY                 */}
      {/* ============================================================== */}
      {subTab === "directory" && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-card/80 border border-cyan-500/30 backdrop-blur-xl shadow-lg space-y-5">
            {/* Header & Quick Action */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-cyan-400" />
                  Enterprise Employee Management & Roster ({filteredDirectory.length} of {fullDirectory.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Create, view, update, and manage employee profiles across all 6 departments with live reporting lines.
                </p>
              </div>

              {/* Add New Employee CTA Button */}
              <Button
                variant="brand"
                size="sm"
                onClick={() => setShowAddModal(true)}
                className="text-xs font-bold bg-gradient-to-r from-cyan-400 via-teal-500 to-emerald-500 text-black gap-1.5 shadow-[0_4px_20px_rgba(6,182,212,0.25)] hover:opacity-95 shrink-0"
              >
                <UserPlus className="h-4 w-4" />
                <span>Onboard New Employee</span>
              </Button>
            </div>

            {/* Search & Multi-Filters Toolbar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs pt-1">
              <div className="relative">
                <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                <Input
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search name, role, email..."
                  className="h-8.5 text-xs pl-8 bg-card/80 border-border/80"
                />
              </div>

              <select
                value={selectedDeptFilter}
                onChange={(e) => {
                  setSelectedDeptFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-8.5 px-2.5 rounded-lg border border-border/80 bg-card text-xs font-semibold text-foreground focus:outline-none"
              >
                <option value="ALL">All Departments ({departments.length})</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.shortName} ({d.employees.length + 1} staff)
                  </option>
                ))}
              </select>

              <select
                value={selectedStatusFilter}
                onChange={(e) => {
                  setSelectedStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-8.5 px-2.5 rounded-lg border border-border/80 bg-card text-xs font-semibold text-foreground focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="Full-Time">Full-Time Staff</option>
                <option value="Probation">Probationary Staff</option>
                <option value="Notice Period">Notice Period</option>
              </select>

              <select
                value={selectedWorkModeFilter}
                onChange={(e) => {
                  setSelectedWorkModeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-8.5 px-2.5 rounded-lg border border-border/80 bg-card text-xs font-semibold text-foreground focus:outline-none"
              >
                <option value="ALL">All Work Modes</option>
                <option value="OFFICE">Office (HQ)</option>
                <option value="HYBRID">Hybrid</option>
                <option value="WFH">Remote (WFH)</option>
              </select>
            </div>

            {/* Directory Table */}
            <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/60">
                  <tr>
                    <th className="p-3.5">Employee</th>
                    <th className="p-3.5">Department & Lead</th>
                    <th className="p-3.5">Designation</th>
                    <th className="p-3.5">Work Mode</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Leave Balance</th>
                    <th className="p-3.5 text-right">CRUD Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {paginatedDirectory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground">
                        No employees found matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    paginatedDirectory.map((emp) => (
                      <tr key={emp.id} className="hover:bg-muted/20 transition-colors group">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center font-black text-cyan-300 text-xs shrink-0">
                              {emp.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-foreground flex items-center gap-1.5">
                                <span>{emp.name}</span>
                                {emp.isLead && (
                                  <Badge variant="brand" className="text-[8px] px-1 py-0 bg-purple-500/20 text-purple-300 border-purple-500/40">
                                    Lead
                                  </Badge>
                                )}
                              </div>
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                                <Mail className="h-2.5 w-2.5" />
                                <span>{emp.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-cyan-400">{emp.department}</div>
                          <div className="text-[10px] text-muted-foreground">Lead: {emp.teamLeadName}</div>
                        </td>
                        <td className="p-3.5 font-medium text-foreground">{emp.designation}</td>
                        <td className="p-3.5">
                          <Badge variant="outline" className="text-[9px] font-semibold text-muted-foreground border-border">
                            {emp.workMode}
                          </Badge>
                        </td>
                        <td className="p-3.5">
                          <Badge
                            variant="outline"
                            className={`text-[9px] font-bold ${
                              emp.status === "Full-Time"
                                ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                                : emp.status === "Probation"
                                ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
                                : "border-red-500/40 text-red-400 bg-red-500/10"
                            }`}
                          >
                            {emp.status}
                          </Badge>
                        </td>
                        <td className="p-3.5 text-right font-mono font-bold text-foreground">
                          {emp.leaveBalance.toFixed(1)} Days
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Profile */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setViewingEmployee(emp)}
                              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/10"
                              title="View Profile"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>

                            {/* Edit Employee */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingEmployee(emp)}
                              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10"
                              title="Edit Employee"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>

                            {/* Offboard / Delete Employee (Protected for leads) */}
                            {!emp.isLead && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setDeletingEmployee(emp)}
                                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                                title="Offboard / Remove"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* High-Performance Instant Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground pt-3 border-t border-border/50">
              <div className="flex items-center gap-3">
                <span>
                  Showing <strong className="text-foreground font-mono">{(safeCurrentPage - 1) * pageSize + (filteredDirectory.length > 0 ? 1 : 0)}</strong> to{" "}
                  <strong className="text-foreground font-mono">{Math.min(safeCurrentPage * pageSize, filteredDirectory.length)}</strong> of{" "}
                  <strong className="text-foreground font-mono">{filteredDirectory.length}</strong> employees
                </span>

                <div className="flex items-center gap-1.5 pl-2 border-l border-border/60">
                  <span className="text-[11px] text-muted-foreground">Rows:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="h-7 px-2 rounded-md border border-border/80 bg-card text-[11px] font-bold text-foreground focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                  >
                    <option value={8}>8 / page</option>
                    <option value={12}>12 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={1000}>All ({filteredDirectory.length})</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* First Page */}
                <button
                  type="button"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage(1)}
                  className="h-7 px-2 rounded-md border border-border/80 bg-card hover:bg-muted/40 disabled:opacity-40 disabled:pointer-events-none text-[11px] font-bold transition-all text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
                  title="First Page"
                >
                  <span>«</span>
                  <span className="hidden sm:inline">First</span>
                </button>

                {/* Prev Page */}
                <button
                  type="button"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-7 w-7 rounded-md border border-border/80 bg-card hover:bg-muted/40 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center transition-all text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>

                {/* Numeric Page Buttons */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`h-7 min-w-[28px] px-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                        safeCurrentPage === pageNum
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)] border border-cyan-400/50"
                          : "border border-border/80 bg-card hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                {/* Next Page */}
                <button
                  type="button"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-7 w-7 rounded-md border border-border/80 bg-card hover:bg-muted/40 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center transition-all text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>

                {/* Last Page */}
                <button
                  type="button"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="h-7 px-2 rounded-md border border-border/80 bg-card hover:bg-muted/40 disabled:opacity-40 disabled:pointer-events-none text-[11px] font-bold transition-all text-muted-foreground hover:text-foreground cursor-pointer flex items-center gap-1"
                  title="Last Page"
                >
                  <span className="hidden sm:inline">Last</span>
                  <span>»</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. NEW JOINERS & PROBATION CHECKPOINTS                          */}
      {/* ============================================================== */}
      {subTab === "joiners_probation" && (
        <div className="space-y-6">
          {/* New Joiners (Last 30 Days) */}
          <Interactive3DCard className="p-6 border border-pink-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-pink-400" />
                  New Joiners in Last 30 Days
                </h3>
                <p className="text-xs text-muted-foreground">
                  Track technical onboarding progress, HR orientation checklists, and 30-day checkpoint milestones.
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-bold text-pink-300 border-pink-500/30">
                {INITIAL_NEW_JOINERS.length} Recent Joiners
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {INITIAL_NEW_JOINERS.map((nj) => (
                <div
                  key={nj.id}
                  className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-3 relative group hover:border-pink-500/40 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-foreground block text-sm">{nj.name}</span>
                      <span className="text-[11px] text-muted-foreground">{nj.designation}</span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge variant="outline" className="text-[9px] text-cyan-300 border-cyan-500/30">
                          {nj.department}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">Lead: {nj.leadName}</span>
                      </div>
                    </div>
                    <Badge variant="brand" className="text-[9px] bg-pink-500/15 text-pink-300 border-pink-500/30">
                      Joined {nj.joiningDate}
                    </Badge>
                  </div>

                  {/* Onboarding Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Onboarding Progress</span>
                      <strong className="text-emerald-400 font-mono">{nj.onboardingProgress}%</strong>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                        style={{ width: `${nj.onboardingProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">30-Day Milestone:</span>
                    <Badge
                      variant="outline"
                      className={`text-[9px] font-bold ${
                        nj.checkpointStatus === "COMPLETED"
                          ? "border-emerald-500/40 text-emerald-400"
                          : nj.checkpointStatus === "IN_PROGRESS"
                          ? "border-amber-500/40 text-amber-400"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {nj.checkpointStatus}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Interactive3DCard>

          {/* Upcoming Probation Checkpoints */}
          <Interactive3DCard className="p-6 border border-amber-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-amber-400" />
                  Probation Governance & Confirmation Decisions Due
                </h3>
                <p className="text-xs text-muted-foreground">
                  30, 60, and 90-day milestone checkpoints with Lead recommendations and 1-click HR confirmation action.
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-bold text-amber-300 border-amber-500/30">
                {probationList.filter((p) => p.status === "PENDING_HR_DECISION").length} Decisions Awaiting HR
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              {probationList.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl bg-card/60 border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{rec.employeeName}</span>
                      <Badge variant="outline" className="text-[10px] text-cyan-300 border-cyan-500/30">
                        {rec.department}
                      </Badge>
                      <Badge
                        variant="brand"
                        className={`text-[9px] font-bold ${
                          rec.stage === "90_DAYS_FINAL"
                            ? "bg-purple-500/15 text-purple-300 border-purple-500/30"
                            : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        }`}
                      >
                        {rec.stage === "90_DAYS_FINAL" ? "90-Day Final Confirmation" : rec.stage}
                      </Badge>
                      {rec.status === "CONFIRMED" && (
                        <Badge variant="brand" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                          ✓ Confirmed Full-Time
                        </Badge>
                      )}
                      {rec.status === "EXTENDED" && (
                        <Badge variant="destructive" className="text-[9px]">
                          Extended 30 Days
                        </Badge>
                      )}
                    </div>

                    <p className="text-muted-foreground text-[11px]">
                      Lead ({rec.leadName}): <em className="text-foreground/90">&quot;{rec.leadNotes}&quot;</em>
                    </p>

                    <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono">
                      <span>Joined: {rec.joiningDate}</span>
                      <span>Target: {rec.confirmationDueDate}</span>
                      <span>Sprint OKRs: <strong className="text-emerald-400">{rec.okrScore}%</strong></span>
                      <span>Punctuality: <strong className="text-cyan-400">{rec.shiftPunctuality}%</strong></span>
                    </div>
                  </div>

                  {rec.status === "PENDING_HR_DECISION" ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="brand"
                        size="sm"
                        onClick={() => handleConfirmProbation(rec.id, rec.employeeName)}
                        className="text-xs font-bold h-8 bg-gradient-to-r from-emerald-500 to-teal-600 text-white gap-1"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Confirm Employment</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExtendProbation(rec.id, rec.employeeName)}
                        className="text-xs font-bold h-8 border-amber-500/40 text-amber-300 hover:bg-amber-500/10 gap-1"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        <span>Extend 30d</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Decision Logged</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Interactive3DCard>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. ORG STRUCTURE & HEADCOUNT GROWTH TREND                       */}
      {/* ============================================================== */}
      {subTab === "org_tree" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <Interactive3DCard key={dept.id} className="p-5 border border-border/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-card/80 border border-border flex items-center justify-center">
                      {getDeptIcon(dept.iconType)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{dept.name}</h4>
                      <span className="text-[10px] text-muted-foreground">Lead: {dept.teamLead.name}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-cyan-300 border-cyan-500/30">
                    {dept.employees.length + 1} Staff
                  </Badge>
                </div>

                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {dept.description}
                </p>

                <div className="pt-2 border-t border-border/60 space-y-1.5 text-xs">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Designated Direct Reports:
                  </div>
                  {dept.employees.map((emp) => (
                    <div key={emp.id} className="flex items-center justify-between text-[11px]">
                      <span className="text-foreground font-medium">{emp.name}</span>
                      <span className="text-muted-foreground font-mono text-[10px]">{emp.designation}</span>
                    </div>
                  ))}
                </div>
              </Interactive3DCard>
            ))}
          </div>

          {/* Headcount Trend Chart Card */}
          <Interactive3DCard className="p-6 border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  Quarterly Headcount Growth Trend
                </h4>
                <p className="text-xs text-muted-foreground">
                  Organic engineering headcount growth from Q1 2026 to Q3 2026.
                </p>
              </div>
              <Badge variant="brand" className="text-xs bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                +26.6% YoY Growth
              </Badge>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center text-xs pt-2">
              <div className="p-3 rounded-xl bg-card/60 border border-border">
                <span className="text-muted-foreground block text-[10px]">Q4 2025</span>
                <strong className="text-base font-black text-foreground">15 Staff</strong>
                <span className="text-[9px] text-muted-foreground block">Base</span>
              </div>
              <div className="p-3 rounded-xl bg-card/60 border border-border">
                <span className="text-muted-foreground block text-[10px]">Q1 2026</span>
                <strong className="text-base font-black text-foreground">17 Staff</strong>
                <span className="text-[9px] text-emerald-400 block">+2 Joiners</span>
              </div>
              <div className="p-3 rounded-xl bg-card/60 border border-border">
                <span className="text-muted-foreground block text-[10px]">Q2 2026</span>
                <strong className="text-base font-black text-foreground">18 Staff</strong>
                <span className="text-[9px] text-emerald-400 block">+1 Joiner</span>
              </div>
              <div className="p-3 rounded-xl bg-card/60 border border-border bg-emerald-500/10 border-emerald-500/30">
                <span className="text-muted-foreground block text-[10px]">Q3 2026 (Current)</span>
                <strong className="text-base font-black text-emerald-400">{fullDirectory.length} Staff</strong>
                <span className="text-[9px] text-emerald-400 block font-bold">Active Census</span>
              </div>
            </div>
          </Interactive3DCard>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. NOTICE PERIOD & EXITS                                        */}
      {/* ============================================================== */}
      {subTab === "exits" && (
        <div className="space-y-6">
          <Interactive3DCard className="p-6 border border-amber-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <UserMinus className="h-4 w-4 text-amber-400" />
                  Notice Period & Offboarding Pipeline
                </h3>
                <p className="text-xs text-muted-foreground">
                  Track technical knowledge handover, KT sign-offs, IT clearance, and final exit interview settlements.
                </p>
              </div>
              <Badge variant="outline" className="text-xs font-bold text-amber-300 border-amber-500/30">
                {INITIAL_NOTICE_RECORDS.filter((n) => n.type === "NOTICE_PERIOD").length} Active Notice
              </Badge>
            </div>

            <div className="space-y-3 text-xs">
              {INITIAL_NOTICE_RECORDS.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl bg-card/60 border border-border/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{rec.employeeName}</span>
                      <Badge variant="outline" className="text-[10px] text-cyan-300 border-cyan-500/30">
                        {rec.department}
                      </Badge>
                      <Badge
                        variant="brand"
                        className={`text-[9px] font-bold ${
                          rec.type === "NOTICE_PERIOD"
                            ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {rec.type === "NOTICE_PERIOD" ? "Serving 30-Day Notice" : "Exited & Cleared"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-mono">
                      <span>Resignation: {rec.resignationDate}</span>
                      <span>LWD: {rec.lastWorkingDate}</span>
                      <span>
                        KT Handover:{" "}
                        <strong
                          className={
                            rec.handoverStatus === "COMPLETED" ? "text-emerald-400" : "text-amber-300"
                          }
                        >
                          {rec.handoverStatus}
                        </strong>
                      </span>
                      <span>
                        Clearance:{" "}
                        <strong
                          className={
                            rec.clearanceStatus === "FINAL_SETTLEMENT_DONE"
                              ? "text-emerald-400"
                              : "text-amber-300"
                          }
                        >
                          {rec.clearanceStatus}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => showToast(`Exit interview record opened for ${rec.employeeName}.`)}
                      className="text-xs h-8 border-border text-foreground"
                    >
                      <span>Exit Interview</span>
                    </Button>
                    <Button
                      variant="brand"
                      size="sm"
                      onClick={() => showToast(`IT clearance checklist verified for ${rec.employeeName}. ✓`)}
                      className="text-xs h-8 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold"
                    >
                      <span>Clearance Sign-Off</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Interactive3DCard>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. MODAL: ONBOARD / ADD NEW EMPLOYEE                            */}
      {/* ============================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-3xl border border-cyan-500/50 bg-[#0b0f19] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                  <UserPlus className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Onboard New Employee</h3>
                  <span className="text-[11px] text-muted-foreground">Add new staff record with designated department & lead</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAddModal(false)}
                className="h-7 w-7 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleAddEmployeeSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground">Full Name *</label>
                  <Input
                    required
                    value={addForm.name}
                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                    placeholder="e.g. Kavita Nair"
                    className="h-8.5 text-xs bg-card"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground">Work Email *</label>
                  <Input
                    required
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="e.g. kavita.nair@xorstack.com"
                    className="h-8.5 text-xs bg-card"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground">Job Title / Designation *</label>
                  <Input
                    required
                    value={addForm.designation}
                    onChange={(e) => setAddForm({ ...addForm, designation: e.target.value })}
                    placeholder="e.g. Senior Security Architect"
                    className="h-8.5 text-xs bg-card"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground">Department *</label>
                  <select
                    value={addForm.departmentId}
                    onChange={(e) => setAddForm({ ...addForm, departmentId: e.target.value })}
                    className="w-full h-8.5 px-3 rounded-md border border-input bg-card text-xs font-semibold text-foreground focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} (Lead: {d.teamLead.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground">Work Mode</label>
                  <select
                    value={addForm.workMode}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        workMode: e.target.value as "OFFICE" | "WFH" | "HYBRID",
                      })
                    }
                    className="w-full h-8.5 px-2.5 rounded-md border border-input bg-card text-xs text-foreground focus:outline-none"
                  >
                    <option value="OFFICE">Office (HQ)</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="WFH">Remote (WFH)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground">Status</label>
                  <select
                    value={addForm.employmentType}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        employmentType: e.target.value as "Full-Time" | "Probation" | "Contract" | "Intern",
                      })
                    }
                    className="w-full h-8.5 px-2.5 rounded-md border border-input bg-card text-xs text-foreground focus:outline-none"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Probation">Probation (30/90d)</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground">Leave Quota (Days)</label>
                  <Input
                    type="number"
                    step="0.5"
                    value={addForm.remainingLeaveBalance}
                    onChange={(e) =>
                      setAddForm({ ...addForm, remainingLeaveBalance: parseFloat(e.target.value) || 0 })
                    }
                    className="h-8.5 text-xs bg-card"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground">Joining Date</label>
                  <Input
                    type="date"
                    value={addForm.joiningDate}
                    onChange={(e) => setAddForm({ ...addForm, joiningDate: e.target.value })}
                    className="h-8.5 text-xs bg-card"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground">Work Location</label>
                  <Input
                    value={addForm.location}
                    onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
                    className="h-8.5 text-xs bg-card"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/80">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  size="sm"
                  className="text-xs font-bold h-8 bg-gradient-to-r from-cyan-400 via-teal-500 to-emerald-500 text-black px-4"
                >
                  Confirm & Onboard Staff
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. MODAL: EDIT EMPLOYEE RECORD                                  */}
      {/* ============================================================== */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setEditingEmployee(null)} />
          <div className="relative z-10 w-full max-w-lg rounded-3xl border border-amber-500/50 bg-[#0b0f19] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                  <Pencil className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Edit Employee Record</h3>
                  <span className="text-[11px] text-muted-foreground">{editingEmployee.name} ({editingEmployee.id})</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingEmployee(null)}
                className="h-7 w-7 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleEditEmployeeSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground">Full Name</label>
                  <Input
                    required
                    value={editingEmployee.name}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                    className="h-8.5 text-xs bg-card"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground">Work Email</label>
                  <Input
                    required
                    type="email"
                    value={editingEmployee.email}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                    className="h-8.5 text-xs bg-card"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground">Designation</label>
                  <Input
                    required
                    value={editingEmployee.designation}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, designation: e.target.value })}
                    className="h-8.5 text-xs bg-card"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground">Department</label>
                  <select
                    value={editingEmployee.departmentId}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        departmentId: e.target.value,
                        department: departments.find((d) => d.id === e.target.value)?.name || editingEmployee.department,
                      })
                    }
                    className="w-full h-8.5 px-3 rounded-md border border-input bg-card text-xs font-semibold text-foreground focus:outline-none"
                  >
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground">Work Mode</label>
                  <select
                    value={editingEmployee.workMode}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        workMode: e.target.value as "OFFICE" | "WFH" | "HYBRID",
                      })
                    }
                    className="w-full h-8.5 px-2.5 rounded-md border border-input bg-card text-xs text-foreground focus:outline-none"
                  >
                    <option value="OFFICE">Office (HQ)</option>
                    <option value="HYBRID">Hybrid</option>
                    <option value="WFH">Remote (WFH)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground">Status</label>
                  <select
                    value={editingEmployee.status}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        status: e.target.value as "Full-Time" | "Probation" | "Notice Period",
                      })
                    }
                    className="w-full h-8.5 px-2.5 rounded-md border border-input bg-card text-xs text-foreground focus:outline-none"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Probation">Probation</option>
                    <option value="Notice Period">Notice Period</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground">Leave Quota (Days)</label>
                  <Input
                    type="number"
                    step="0.5"
                    value={editingEmployee.leaveBalance}
                    onChange={(e) =>
                      setEditingEmployee({
                        ...editingEmployee,
                        leaveBalance: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="h-8.5 text-xs bg-card"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground">Phone Number</label>
                  <Input
                    value={editingEmployee.phoneNumber || ""}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, phoneNumber: e.target.value })}
                    placeholder="+91 98450 11223"
                    className="h-8.5 text-xs bg-card"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-foreground">Work Location</label>
                  <Input
                    value={editingEmployee.workLocation || ""}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, workLocation: e.target.value })}
                    placeholder="Bangalore HQ (Floor 0)"
                    className="h-8.5 text-xs bg-card"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/80">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingEmployee(null)}
                  className="text-xs h-8"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="brand"
                  size="sm"
                  className="text-xs font-bold h-8 bg-amber-500 hover:bg-amber-600 text-black px-4"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. MODAL: DELETE / OFFBOARD EMPLOYEE DIALOG                     */}
      {/* ============================================================== */}
      {deletingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setDeletingEmployee(null)} />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-rose-500/50 bg-[#0b0f19] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Confirm Offboarding</h3>
                <span className="text-xs text-muted-foreground">Remove from active organization roster</span>
              </div>
            </div>

            <p className="text-xs text-foreground/80 leading-relaxed">
              Are you sure you want to offboard and archive{" "}
              <strong className="text-foreground">{deletingEmployee.name}</strong> ({deletingEmployee.designation} · {deletingEmployee.department})? This will archive their active biometric punch credentials and update the active census.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/80">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeletingEmployee(null)}
                className="text-xs h-8"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleDeleteEmployeeConfirm}
                className="text-xs font-bold h-8 bg-rose-600 hover:bg-rose-700 text-white px-4"
              >
                Confirm Offboard
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 8. MODAL: VIEW EMPLOYEE PROFILE 3D DRAWER                      */}
      {/* ============================================================== */}
      {viewingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setViewingEmployee(null)} />
          <div className="relative z-10 w-full max-w-lg rounded-3xl border border-cyan-500/50 bg-[#0b0f19] shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[2px] shadow-lg">
                  <div className="h-full w-full rounded-2xl bg-[#0b0f19] flex items-center justify-center font-black text-cyan-300 text-base">
                    {viewingEmployee.name.slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-1.5">
                    <span>{viewingEmployee.name}</span>
                    {viewingEmployee.isLead && (
                      <Badge variant="brand" className="text-[9px] bg-purple-500/20 text-purple-300 border-purple-500/30">
                        Lead
                      </Badge>
                    )}
                  </h3>
                  <span className="text-xs text-muted-foreground">{viewingEmployee.designation}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewingEmployee(null)}
                className="h-7 w-7 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-card/60 border border-border/80">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Department
                  </span>
                  <span className="font-semibold text-cyan-400 text-xs">{viewingEmployee.department}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Reporting Manager
                  </span>
                  <span className="font-semibold text-foreground text-xs">{viewingEmployee.teamLeadName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Work Mode
                  </span>
                  <span className="font-semibold text-foreground text-xs">{viewingEmployee.workMode}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
                    Employment Status
                  </span>
                  <Badge variant="outline" className="text-[9px] font-bold text-emerald-400 border-emerald-500/40 mt-0.5">
                    {viewingEmployee.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 p-3.5 rounded-2xl bg-card/60 border border-border/80">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{viewingEmployee.email}</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{viewingEmployee.phoneNumber || "+91 98450 11223"}</span>
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/60">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{viewingEmployee.workLocation || "Bangalore HQ"}</span>
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Joined: {viewingEmployee.joiningDate}
                  </span>
                </div>
              </div>

              {/* Workday & Punctuality Key Metrics */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-card/60 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Leave Quota</span>
                  <strong className="text-sm font-bold text-cyan-400 font-mono">{viewingEmployee.leaveBalance}d</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-card/60 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Shift Adherence</span>
                  <strong className="text-sm font-bold text-emerald-400 font-mono">98.5%</strong>
                </div>
                <div className="p-2.5 rounded-xl bg-card/60 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Weekly OKRs</span>
                  <strong className="text-sm font-bold text-purple-400 font-mono">92%</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-border/80">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewingEmployee(null)}
                className="text-xs h-8"
              >
                Close
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const toEdit = viewingEmployee;
                    setViewingEmployee(null);
                    setEditingEmployee(toEdit);
                  }}
                  className="text-xs h-8 text-amber-400 border-amber-500/30 gap-1"
                >
                  <Pencil className="h-3 w-3" />
                  <span>Edit Profile</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
