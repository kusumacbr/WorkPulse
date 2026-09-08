"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { useWorkpulseSharedStore, OrgDepartment } from "@/lib/stores/workpulse-shared-store";
import {
  Building2,
  Users,
  Search,
  Layers,
  Terminal,
  Database,
  Cpu,
  Compass,
  Briefcase,
  UserCheck,
} from "lucide-react";

export function CrossDepartmentOrgMatrix() {
  const { departments, allEmployees } = useWorkpulseSharedStore();
  const [selectedDeptId, setSelectedDeptId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredDepartments =
    selectedDeptId === "ALL"
      ? departments
      : departments.filter((d) => d.id === selectedDeptId);

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
      {/* Top Banner */}
      <Interactive3DCard className="p-6 md:p-7 border border-pink-500/30 bg-gradient-to-r from-card/80 via-card/60 to-pink-500/10 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="font-bold text-[10px] uppercase bg-pink-500/15 border-pink-500/30 text-pink-300">
                <Building2 className="h-3 w-3 mr-1 text-pink-400" />
                Enterprise Organizational Hierarchy
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                Xorstack · All 6 Departments Visible to HR
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-foreground">
              Cross-Department Org Tree & Leadership Matrix
            </h3>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Complete oversight across all 6 Xorstack functional departments. Each department has 1 designated Team Lead supervising direct reports, with centralized visibility and Stage-2 approval authority for HR People Ops.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0 text-xs">
            <div className="p-3 rounded-xl bg-background/60 border border-border text-right">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Departments</span>
              <strong className="text-xl font-extrabold text-pink-400">{departments.length} Units</strong>
            </div>
            <div className="p-3 rounded-xl bg-background/60 border border-border text-right">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Total Employees</span>
              <strong className="text-xl font-extrabold text-cyan-400">{allEmployees.length} Total</strong>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/60">
          {/* Department Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setSelectedDeptId("ALL")}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedDeptId === "ALL"
                  ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm"
                  : "bg-card/60 text-muted-foreground hover:text-foreground border border-border"
              }`}
            >
              All Departments ({departments.length})
            </button>

            {departments.map((dept) => (
              <button
                key={dept.id}
                type="button"
                onClick={() => setSelectedDeptId(dept.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  selectedDeptId === dept.id
                    ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm"
                    : "bg-card/60 text-muted-foreground hover:text-foreground border border-border"
                }`}
              >
                {getDeptIcon(dept.iconType)}
                <span>{dept.name}</span>
                <span className="text-[10px] opacity-75">({dept.employees.length})</span>
              </button>
            ))}
          </div>

          {/* Quick Search Input */}
          <div className="relative min-w-[200px] sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employee, lead or role..."
              className="h-8.5 pl-8 text-xs bg-background/80"
            />
          </div>
        </div>
      </Interactive3DCard>

      {/* Departments Org Grid */}
      <div className="space-y-6">
        {filteredDepartments.map((dept) => {
          const deptEmployees = searchQuery.trim()
            ? dept.employees.filter(
                (e) =>
                  e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  e.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  dept.teamLead.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : dept.employees;

          if (searchQuery.trim() && deptEmployees.length === 0 && !dept.teamLead.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return null;
          }

          return (
            <Interactive3DCard
              key={dept.id}
              className="p-6 border border-border/80 bg-card/60 space-y-5 shadow-sm"
            >
              {/* Department Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-border/60">
                <div className="space-y-1 max-w-3xl">
                  <div className="flex items-center gap-2">
                    {getDeptIcon(dept.iconType)}
                    <h4 className="text-lg font-black text-foreground">{dept.name}</h4>
                    <Badge variant="brand" className={`text-[10px] font-bold uppercase ${dept.badgeColor}`}>
                      {dept.shortName} Practice
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{dept.description}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Headcount</span>
                  <span className="text-sm font-extrabold text-foreground font-mono">
                    1 Lead + {dept.employees.length} Engineers
                  </span>
                </div>
              </div>

              {/* 1. Team Lead Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 via-indigo-500/5 to-transparent border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-black text-xs shadow-sm">
                    {dept.teamLead.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-foreground text-sm">{dept.teamLead.name}</span>
                      <Badge variant="outline" className="text-[9px] bg-purple-500/15 text-purple-300 border-purple-500/30 font-bold uppercase">
                        Designated Team Lead
                      </Badge>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {dept.teamLead.designation} · <strong className="font-mono text-purple-400">{dept.teamLead.email}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                    <UserCheck className="h-3 w-3 mr-1" />
                    Evaluating {dept.employees.length} Reports
                  </Badge>
                </div>
              </div>

              {/* 2. Direct Reports under this Team Lead */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-cyan-400" />
                    Direct Reports under {dept.teamLead.name} ({deptEmployees.length})
                  </span>
                  <span className="text-[11px] text-muted-foreground">Shift: 10:00 AM – 07:00 PM</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {deptEmployees.map((emp) => (
                    <div
                      key={emp.id}
                      className="p-3.5 rounded-xl bg-background/50 border border-border/70 hover:border-border transition-all space-y-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[var(--brand-primary)] to-cyan-400 p-[1px]">
                            <div className="h-full w-full rounded-full bg-[#0b0f19] flex items-center justify-center text-cyan-300 font-bold text-[10px]">
                              {emp.avatar}
                            </div>
                          </div>
                          <div>
                            <span className="font-bold text-foreground block">{emp.name}</span>
                            <span className="text-[10px] text-muted-foreground block truncate max-w-[130px]">
                              {emp.designation}
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant="outline"
                          className={
                            emp.workMode === "WFH"
                              ? "text-purple-300 border-purple-500/30 bg-purple-500/10 text-[9px]"
                              : "text-cyan-300 border-cyan-500/30 bg-cyan-500/10 text-[9px]"
                          }
                        >
                          {emp.workMode}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                        <div className="flex items-center justify-between">
                          <span>Today&apos;s SOD:</span>
                          <span className={emp.sodStatus === "SUBMITTED" ? "text-emerald-400 font-bold font-mono" : "text-amber-400 font-bold"}>
                            {emp.sodStatus} {emp.sodTime && `(${emp.sodTime})`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Day Execution:</span>
                          <span className="font-mono font-bold text-cyan-400">{emp.overallProgress}% Completed</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Leave Balance:</span>
                          <span className="font-mono text-foreground font-semibold">{emp.remainingLeaveBalance} Days</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Interactive3DCard>
          );
        })}
      </div>
    </div>
  );
}
