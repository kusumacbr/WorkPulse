"use client";

import { useState, useEffect } from "react";
import { WorkpulseSharedStore, subscribeToSharedStore } from "./workpulse-shared-store";

let isGlobalListenerSetup = false;

function setupGlobalWindowListeners() {
  if (typeof window === "undefined" || isGlobalListenerSetup) return;
  isGlobalListenerSetup = true;

  let debounceTimer: NodeJS.Timeout | null = null;
  const handleRealtimeUpdate = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      WorkpulseSharedStore.syncWithSupabase();
    }, 400);
  };

  const events = [
    "storage",
    "workpulse:lead_feedback_updated",
    "workpulse:task_assigned",
    "workpulse:task_acknowledged",
    "workpulse:tasks_changed",
    "workpulse:simple_tasks_updated",
    "workpulse:goals_changed",
    "workpulse:simple_goals_updated",
    "workday:sod_submitted",
    "workday:sod_verified",
    "workday:sod_changes_requested",
    "workday:eod_submitted",
    "workday:eod_verified",
    "workday:help_requested",
    "workday:help_acknowledged",
    "workday:help_resolved",
    "attendance:punched",
    "attendance:presence_verified",
    "attendance:all_presence_verified",
    "leave:status_updated",
    "leave:created",
    "leave:deleted",
    "leave:approved",
    "leave:rejected",
    "wfh:status_updated",
    "wfh:created",
    "wfh:deleted",
    "wfh:approved",
    "wfh:rejected",
    "employee:created",
    "employee:updated",
    "employee:deleted",
    "profile:query_submitted",
    "profile:query_approved",
    "profile:query_rejected",
  ];

  events.forEach((evt) => {
    try {
      window.addEventListener(evt, handleRealtimeUpdate);
    } catch {}
  });
}

export function useWorkpulseSharedStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    setupGlobalWindowListeners();
    WorkpulseSharedStore.hydrateFromStorage();
    WorkpulseSharedStore.syncWithSupabase();
    const unsubscribe = subscribeToSharedStore(() => setTick((t) => t + 1));
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    departments: WorkpulseSharedStore.getDepartments(),
    allEmployees: WorkpulseSharedStore.getAllEmployees(),
    getDepartmentById: WorkpulseSharedStore.getDepartmentById,
    getEmployeeById: WorkpulseSharedStore.getEmployeeById,
    feedbacks: WorkpulseSharedStore.getFeedbacks(),
    updateLeadFeedback: WorkpulseSharedStore.updateLeadFeedback,
    leaveRequests: WorkpulseSharedStore.getLeaveRequests(),
    setLeaveRequestsFromSupabase: WorkpulseSharedStore.setLeaveRequestsFromSupabase,
    addLeaveRequest: WorkpulseSharedStore.addLeaveRequest,
    deleteLeaveRequest: WorkpulseSharedStore.deleteLeaveRequest,
    tlApproveLeave: WorkpulseSharedStore.tlApproveLeave,
    tlRejectLeave: WorkpulseSharedStore.tlRejectLeave,
    hrApproveLeave: WorkpulseSharedStore.hrApproveLeave,
    hrRejectLeave: WorkpulseSharedStore.hrRejectLeave,
    wfhRequests: WorkpulseSharedStore.getWfhRequests(),
    setWfhRequestsFromSupabase: WorkpulseSharedStore.setWfhRequestsFromSupabase,
    addWfhRequest: WorkpulseSharedStore.addWfhRequest,
    deleteWfhRequest: WorkpulseSharedStore.deleteWfhRequest,
    tlApproveWfh: WorkpulseSharedStore.tlApproveWfh,
    tlRejectWfh: WorkpulseSharedStore.tlRejectWfh,
    hrApproveWfh: WorkpulseSharedStore.hrApproveWfh,
    hrRejectWfh: WorkpulseSharedStore.hrRejectWfh,
    addEmployee: WorkpulseSharedStore.addEmployee,
    updateEmployee: WorkpulseSharedStore.updateEmployee,
    deleteEmployee: WorkpulseSharedStore.deleteEmployee,
    profileQueries: WorkpulseSharedStore.getProfileQueries(),
    submitProfileQuery: WorkpulseSharedStore.submitProfileQuery,
    hrApproveProfileQuery: WorkpulseSharedStore.hrApproveProfileQuery,
    hrRejectProfileQuery: WorkpulseSharedStore.hrRejectProfileQuery,
    helpRequests: WorkpulseSharedStore.getHelpRequests(),
    requestLeadHelp: WorkpulseSharedStore.requestLeadHelp,
    acknowledgeHelpRequest: WorkpulseSharedStore.acknowledgeHelpRequest,
    resolveHelpRequest: WorkpulseSharedStore.resolveHelpRequest,
    cancelHelpRequest: WorkpulseSharedStore.cancelHelpRequest,
    teamPresence: WorkpulseSharedStore.getTeamPresence(),
    verifyMemberPresence: WorkpulseSharedStore.verifyMemberPresence,
    verifyAllMemberPresence: WorkpulseSharedStore.verifyAllMemberPresence,
    unverifyMemberPresence: WorkpulseSharedStore.unverifyMemberPresence,
    deleteSOD: WorkpulseSharedStore.deleteSOD,
    deleteEOD: WorkpulseSharedStore.deleteEOD,
    startNewWorkday: WorkpulseSharedStore.startNewWorkday,
    resetToDefaults: WorkpulseSharedStore.resetToDefaults,
    syncWithSupabase: WorkpulseSharedStore.syncWithSupabase,
  };
}
