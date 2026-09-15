"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkpulseSharedStore, OrgEmployee } from "@/lib/stores/workpulse-shared-store";
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  Send,
  X,
  CheckSquare,
} from "lucide-react";

export function OrgLiveExecutionMonitor() {
  const { allEmployees, departments } = useWorkpulseSharedStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDeptId, setSelectedDeptId] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [inspectEmployee, setInspectEmployee] = useState<OrgEmployee | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Metrics calculation
  const totalEmployees = allEmployees.length;
  const sodSubmittedCount = allEmployees.filter((e) => e.sodStatus === "SUBMITTED" || e.sodStatus === "VERIFIED").length;
  const eodCompletedCount = allEmployees.filter((e) => e.eodStatus === "SUBMITTED" || e.eodStatus === "VERIFIED").length;
  const avgOrgProgress = Math.round(
    allEmployees.reduce((acc, curr) => acc + (curr.overallProgress || 0), 0) / (totalEmployees || 1)
  );

  const handleNudge = (employeeName: string) => {
    showToast(`Friendly morning SOD reminder sent to ${employeeName} via Slack! 💬`);
  };

  // Filter employees
  const filteredEmployees = allEmployees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.plannedTasks.some((t) => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = selectedDeptId === "ALL" || emp.departmentId === selectedDeptId;

    let matchesStatus = true;
    if (selectedStatus === "SOD_SUBMITTED") {
      matchesStatus = emp.sodStatus === "SUBMITTED";
    } else if (selectedStatus === "EOD_COMPLETED") {
      matchesStatus = emp.eodStatus === "SUBMITTED";
    } else if (selectedStatus === "IN_PROGRESS") {
      matchesStatus = emp.eodStatus === "IN_PROGRESS";
    } else if (selectedStatus === "MISSING_SOD") {
      matchesStatus = emp.sodStatus === "PENDING";
    }

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Top Level Pulse Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Total Org Headcount */}
        <div className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground">Total Staff</span>
          <div className="text-2xl font-black text-foreground font-mono">{totalEmployees}</div>
          <span className="text-[10px] text-cyan-400 font-bold">Across {departments.length} Departments</span>
        </div>

        {/* Morning Plans Submissions */}
        <div className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground">Morning Plans Shared</span>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            {Math.round((sodSubmittedCount / (totalEmployees || 1)) * 100)}%
          </div>
          <span className="text-[10px] text-muted-foreground">{sodSubmittedCount} of {totalEmployees} Shared</span>
        </div>

        {/* Average Org Progress */}
        <div className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground">Today&apos;s Team Progress</span>
          <div className="text-2xl font-black text-cyan-300 font-mono">{avgOrgProgress}%</div>
          <div className="progress-track-line mt-1">
            <div className="progress-track-fill-emerald" style={{ width: `${avgOrgProgress}%` }} />
          </div>
        </div>

        {/* Evening Summaries */}
        <div className="p-4 rounded-xl bg-card/60 border border-border/80 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground">Evening Summaries</span>
          <div className="text-2xl font-black text-purple-400 font-mono">{eodCompletedCount}</div>
          <span className="text-[10px] text-muted-foreground font-mono">{totalEmployees - eodCompletedCount} in progress</span>
        </div>
      </div>

      {/* Main Filter & Roster Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-card/80 border border-border/70 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-400" />
              <span>Today&apos;s Staff Work Status ({filteredEmployees.length} Staff)</span>
            </h3>
            <p className="text-xs text-muted-foreground">
              Live overview of morning plans, execution progress, and focus tasks.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-48">
              <Search className="h-3.5 w-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff or task..."
                className="h-9 text-xs pl-9 bg-background/80 border-border/70 rounded-xl"
              />
            </div>

            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="h-9 px-3 rounded-xl border border-border/70 bg-background/80 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="ALL">All Departments ({departments.length})</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.employees.length})
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-9 px-3 rounded-xl border border-border/70 bg-background/80 text-xs font-semibold text-foreground focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="SOD_SUBMITTED">Morning Plan Shared</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="EOD_COMPLETED">Evening Summary Sent</option>
            </select>
          </div>
        </div>

        {/* Live Employee Roster Table */}
        <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground font-semibold border-b border-border/60">
              <tr>
                <th className="p-3">Employee &amp; Team</th>
                <th className="p-3">Work Location</th>
                <th className="p-3">Morning Check-In</th>
                <th className="p-3">Today&apos;s Focus Task</th>
                <th className="p-3 text-center">Progress</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredEmployees.map((emp) => {
                const primaryTask = emp.plannedTasks[0];
                return (
                  <tr key={emp.id} className="hover:bg-muted/20 transition-colors">
                    {/* Employee & Team */}
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-300 text-xs shrink-0">
                          {emp.avatar}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{emp.name}</div>
                          <div className="text-[11px] text-muted-foreground">
                            <span className="text-cyan-400 font-medium">{emp.departmentName}</span> · Lead: {emp.teamLeadName}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Work Mode */}
                    <td className="p-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          emp.workMode === "OFFICE"
                            ? "border-cyan-500/40 text-cyan-300 bg-cyan-500/10"
                            : emp.workMode === "WFH"
                            ? "border-teal-500/40 text-teal-300 bg-teal-500/10"
                            : "border-purple-500/40 text-purple-300 bg-purple-500/10"
                        }`}
                      >
                        {emp.workMode}
                      </Badge>
                    </td>

                    {/* SOD Status */}
                    <td className="p-3">
                      {emp.sodStatus === "SUBMITTED" ? (
                        <div>
                          <span className="font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> SOD Logged
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">{emp.sodTime || "Logged"}</span>
                        </div>
                      ) : (
                        <div>
                          <span className="font-bold text-amber-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Missing SOD
                          </span>
                          <span className="text-[10px] text-muted-foreground">Not submitted yet</span>
                        </div>
                      )}
                    </td>

                    {/* Primary Task */}
                    <td className="p-3 max-w-xs">
                      {primaryTask ? (
                        <div className="space-y-0.5">
                          <div className="font-medium text-foreground truncate text-[11px]" title={primaryTask.title}>
                            {primaryTask.title}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            <span className="text-cyan-300 font-mono">[{primaryTask.project}]</span> · {primaryTask.estimatedMinutes}m est.
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-[11px] italic">No active task</span>
                      )}
                    </td>

                    {/* Progress */}
                    <td className="p-3 text-center">
                      <div className="font-mono font-bold text-xs text-foreground">{emp.overallProgress}%</div>
                      <div className="progress-track-line w-20 mx-auto mt-1">
                        <div
                          className="progress-track-fill-cyan"
                          style={{ width: `${emp.overallProgress}%` }}
                        />
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setInspectEmployee(emp)}
                          className="text-[10px] h-6 px-2.5 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Inspect</span>
                        </Button>

                        {emp.sodStatus === "PENDING" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleNudge(emp.name)}
                            className="text-[10px] h-6 px-2 border-amber-500/30 text-amber-300 hover:bg-amber-500/10 gap-1"
                          >
                            <Send className="h-2.5 w-2.5" />
                            <span>Nudge</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drill-Down Inspector Modal */}
      {inspectEmployee && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-card border border-border w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cyan-500/30 to-purple-500/30 border border-cyan-500/40 flex items-center justify-center font-bold text-cyan-300 text-sm">
                  {inspectEmployee.avatar}
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                    {inspectEmployee.name}
                    <Badge variant="outline" className="text-[10px] text-cyan-300 border-cyan-500/30">
                      {inspectEmployee.workMode}
                    </Badge>
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {inspectEmployee.designation} · <strong className="text-foreground">{inspectEmployee.departmentName}</strong> · Lead: {inspectEmployee.teamLeadName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectEmployee(null)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Planned Tasks List */}
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-foreground flex items-center gap-1.5">
                  <CheckSquare className="h-4 w-4 text-cyan-400" />
                  Planned Morning SOD Tasks ({inspectEmployee.plannedTasks.length})
                </h5>
                <span className="font-mono text-cyan-300 font-bold">
                  {inspectEmployee.overallProgress}% Overall Progress
                </span>
              </div>

              <div className="space-y-2">
                {inspectEmployee.plannedTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl bg-card/60 border border-border/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground text-xs">{t.title}</span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] font-bold ${
                          t.status === "COMPLETED"
                            ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                            : t.status === "IN_PROGRESS"
                            ? "border-cyan-500/40 text-cyan-300 bg-cyan-500/10"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {t.status} ({t.completionPercentage}%)
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                      <span>Project: <strong className="text-cyan-300 font-mono">{t.project}</strong></span>
                      <span>Priority: <strong className="text-amber-300">{t.priority}</strong></span>
                      <span>Estimate: <strong className="font-mono">{t.estimatedMinutes} mins</strong></span>
                    </div>

                    {t.expectedOutput && (
                      <p className="text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                        <strong>Expected Output:</strong> {t.expectedOutput}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* EOD Reflections & Blockers if available */}
            {(inspectEmployee.eodAchievements || inspectEmployee.eodBlockers) && (
              <div className="p-3.5 rounded-xl bg-background/80 border border-border space-y-2 text-xs">
                <span className="font-bold text-foreground block">EOD Reflection & Deliverables</span>
                {inspectEmployee.eodAchievements && (
                  <div className="text-[11px] text-emerald-400">
                    <strong>Achievements:</strong> {inspectEmployee.eodAchievements}
                  </div>
                )}
                {inspectEmployee.eodBlockers && (
                  <div className="text-[11px] text-amber-300">
                    <strong>Blockers / Issues:</strong> {inspectEmployee.eodBlockers}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="pt-2 flex items-center justify-between border-t border-border/60">
              <span className="text-[11px] text-muted-foreground font-mono">
                Employee ID: {inspectEmployee.id}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectEmployee(null)}
                className="text-xs h-8 px-4"
              >
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
