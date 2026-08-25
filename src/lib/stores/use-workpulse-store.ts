"use client";

import { useState, useEffect } from "react";
import { WorkpulseSharedStore, subscribeToSharedStore } from "./workpulse-shared-store";

export function useWorkpulseSharedStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    // Hydrate store from localStorage and sync with Supabase
    WorkpulseSharedStore.hydrateFromStorage();
    WorkpulseSharedStore.syncWithSupabase();
    return subscribeToSharedStore(() => setTick((t) => t + 1));
  }, []);

  return {
    departments: WorkpulseSharedStore.getDepartments(),
    allEmployees: WorkpulseSharedStore.getAllEmployees(),
    getDepartmentById: WorkpulseSharedStore.getDepartmentById,
    getEmployeeById: WorkpulseSharedStore.getEmployeeById,
    feedbacks: WorkpulseSharedStore.getFeedbacks(),
    updateLeadFeedback: WorkpulseSharedStore.updateLeadFeedback,
    leaveRequests: WorkpulseSharedStore.getLeaveRequests(),
    addLeaveRequest: WorkpulseSharedStore.addLeaveRequest,
    tlApproveLeave: WorkpulseSharedStore.tlApproveLeave,
    tlRejectLeave: WorkpulseSharedStore.tlRejectLeave,
    hrApproveLeave: WorkpulseSharedStore.hrApproveLeave,
    hrRejectLeave: WorkpulseSharedStore.hrRejectLeave,
    wfhRequests: WorkpulseSharedStore.getWfhRequests(),
    addWfhRequest: WorkpulseSharedStore.addWfhRequest,
    tlApproveWfh: WorkpulseSharedStore.tlApproveWfh,
    tlRejectWfh: WorkpulseSharedStore.tlRejectWfh,
    hrApproveWfh: WorkpulseSharedStore.hrApproveWfh,
    hrRejectWfh: WorkpulseSharedStore.hrRejectWfh,
    addEmployee: WorkpulseSharedStore.addEmployee,
    updateEmployee: WorkpulseSharedStore.updateEmployee,
    deleteEmployee: WorkpulseSharedStore.deleteEmployee,
    resetToDefaults: WorkpulseSharedStore.resetToDefaults,
    syncWithSupabase: WorkpulseSharedStore.syncWithSupabase,
  };
}
