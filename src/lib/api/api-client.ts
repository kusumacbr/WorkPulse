/**
 * WorkPulse Unified Backend Client SDK
 * Provides type-safe client methods for all WorkPulse REST API endpoints.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = endpoint.startsWith("/") ? endpoint : `/api/v1/${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        error: json.error || `HTTP ${res.status}: ${res.statusText}`,
        code: json.code,
      };
    }
    return json;
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Network request failed",
    };
  }
}

export const WorkpulseApi = {
  // 1. Workdays & Daily SOD/EOD Execution
  workdays: {
    getToday: (employeeId?: string, workDate?: string) => {
      const params = new URLSearchParams();
      if (employeeId) params.append("employeeId", employeeId);
      if (workDate) params.append("workDate", workDate);
      return request<{ workday: any }>(`/api/v1/workdays?${params.toString()}`);
    },
    submitSod: (data: {
      workdayId?: string;
      employeeId?: string;
      workMode: string;
      shift: string;
      plannedHours: number;
      tasks: any[];
    }) => request<{ workday: any; message: string }>(`/api/v1/workdays/sod`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
    submitEod: (data: {
      workdayId?: string;
      employeeId?: string;
      taskUpdates: any[];
      achievements?: string;
      issues?: string;
      supportNeeded?: string;
      nextDayFocus?: string;
    }) => request<{ workday: any; message: string }>(`/api/v1/workdays/eod`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
    updateTask: (data: {
      taskId: string;
      workdayId?: string;
      completionPercentage: number;
      status: string;
      delayReason?: string;
      blockerReference?: string;
    }) => request<{ task: any; message: string }>(`/api/v1/workdays/tasks`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  },

  // 2. Leave & WFH Two-Stage Authorization
  leave: {
    list: (scope: "SELF" | "TEAM" | "ALL" = "ALL", employeeId?: string) => {
      const params = new URLSearchParams({ scope });
      if (employeeId) params.append("employeeId", employeeId);
      return request<{ requests: any[]; balances: any }>(`/api/v1/leave?${params.toString()}`);
    },
    apply: (data: {
      leaveType: string;
      startDate: string;
      endDate: string;
      daysCount: number;
      reason: string;
      emergencyContact?: string;
      handoverNotes?: string;
      backupPersonName?: string;
    }) => request<{ request: any; message: string }>(`/api/v1/leave`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
    applyLeave: (data: {
      leaveType: string;
      startDate: string;
      endDate: string;
      daysCount: number;
      reason: string;
      emergencyContact?: string;
      handoverNotes?: string;
      backupPersonName?: string;
    }) => request<{ request: any; message: string }>(`/api/v1/leave`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
    approve: (id: string, stage?: string, comment?: string) =>
      request<{ result: any; message: string }>(`/api/v1/leave/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ stage, comment }),
      }),
    reject: (id: string, reason: string, stage?: string) =>
      request<{ result: any; message: string }>(`/api/v1/leave/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason, stage }),
      }),
    listWfh: () => request<{ requests: any[] }>(`/api/v1/leave/wfh`),
    applyWfh: (data: {
      date?: string;
      startDate?: string;
      endDate?: string;
      reason: string;
      deliverables?: string;
      plannedDeliverables?: string;
      availabilityHours?: string;
      contactMethod?: string;
    }) =>
      request<{ request: any; message: string }>(`/api/v1/leave/wfh`, {
        method: "POST",
        body: JSON.stringify({
          date: data.date || data.startDate || new Date().toISOString().split("T")[0],
          reason: data.reason,
          deliverables: data.deliverables || data.plannedDeliverables || "Completed remote deliverables.",
        }),
      }),
  },

  // 3. Attendance & Biometric Adherence
  attendance: {
    getMuster: (month?: string, employeeId?: string) => {
      const params = new URLSearchParams();
      if (month) params.append("month", month);
      if (employeeId) params.append("employeeId", employeeId);
      return request<{ muster: any; shiftAdherence: any }>(`/api/v1/attendance?${params.toString()}`);
    },
    recordPunch: (data: {
      punchType: "IN" | "OUT";
      terminalId?: string;
      location?: string;
      timestamp?: string;
    }) => request<{ punch: any; message: string }>(`/api/v1/attendance/punch`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
    punch: (data: {
      type: "IN" | "OUT";
      terminalId?: string;
      location?: string;
      timestamp?: string;
      employeeId?: string;
    }) => request<{ punch: any; message: string }>(`/api/v1/attendance/punch`, {
      method: "POST",
      body: JSON.stringify({
        punchType: data.type,
        terminalId: data.terminalId,
        location: data.location,
        timestamp: data.timestamp,
      }),
    }),
  },

  // 4. Goals & Weekly Sprint OKRs
  goals: {
    list: (employeeId?: string) => {
      const params = new URLSearchParams();
      if (employeeId) params.append("employeeId", employeeId);
      return request<{ goals: any[] }>(`/api/v1/goals?${params.toString()}`);
    },
    create: (data: {
      title: string;
      description?: string;
      period?: string;
      weightage?: number;
      priority?: string;
      dueDate?: string;
    }) => request<{ goal: any; message: string }>(`/api/v1/goals`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
    update: (id: string, data: { progressPercentage?: number; status?: string; notes?: string }) =>
      request<{ goal: any; message: string }>(`/api/v1/goals/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    archive: (id: string) =>
      request<{ message: string }>(`/api/v1/goals/${id}`, {
        method: "DELETE",
      }),
  },

  // 5. Performance Reviews & Appraisals
  reviews: {
    list: (employeeId?: string) => {
      const params = new URLSearchParams();
      if (employeeId) params.append("employeeId", employeeId);
      return request<{ reviews: any[] }>(`/api/v1/reviews?${params.toString()}`);
    },
    submitFeedback: (data: {
      employeeId: string;
      employeeName?: string;
      note: string;
      rating: number;
      actionItem?: string;
    }) => request<{ message: string }>(`/api/v1/reviews/feedback`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
    submitAppraisal: (data: {
      reviewId: string;
      evaluationType: "SELF" | "MANAGER";
      ratings: Record<string, number>;
      overallScore: number;
      comments?: string;
      strengths?: string;
      growthAreas?: string;
    }) => request<{ review: any; message: string }>(`/api/v1/reviews/appraisal`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  },

  // 6. HR & People Operations (Employee CRUD & Celebrations)
  hr: {
    listEmployees: () => request<{ departments: any[]; employees: any[]; totalCount: number }>(`/api/v1/hr/employees`),
    getEmployee: (id: string) => request<{ employee: any }>(`/api/v1/hr/employees/${id}`),
    createEmployee: (data: {
      name: string;
      email: string;
      designation: string;
      departmentId: string;
      workMode?: string;
      remainingLeaveBalance?: number;
      employmentType?: string;
      joiningDate?: string;
      phoneNumber?: string;
      location?: string;
    }) => request<{ employee: any; message: string }>(`/api/v1/hr/employees`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
    updateEmployee: (id: string, data: {
      name?: string;
      email?: string;
      designation?: string;
      departmentId?: string;
      workMode?: string;
      remainingLeaveBalance?: number;
    }) => request<{ employee: any; message: string }>(`/api/v1/hr/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
    deleteEmployee: (id: string) =>
      request<{ employee: any; message: string }>(`/api/v1/hr/employees/${id}`, {
        method: "DELETE",
      }),
    listProbation: () => request<{ probationRecords: any[] }>(`/api/v1/hr/probation`),
    recordProbationDecision: (id: string, decision: "CONFIRM" | "EXTEND", notes?: string) =>
      request<{ message: string }>(`/api/v1/hr/probation`, {
        method: "POST",
        body: JSON.stringify({ id, decision, notes }),
      }),
    getCelebrations: () => request<{ celebrations: any }>(`/api/v1/hr/celebrations`),
    broadcastCelebration: (data: {
      type: "BIRTHDAY" | "FESTIVAL";
      title: string;
      message: string;
      author?: string;
      targetAudience?: string;
      badge?: string;
      accentEmoji?: string;
    }) => request<{ message: string }>(`/api/v1/hr/celebrations`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  },

  // 7. Announcements & Global Broadcasts
  announcements: {
    list: () => request<{ announcements: any[] }>(`/api/v1/announcements`),
    publish: (data: {
      title: string;
      body: string;
      category?: string;
      priority?: string;
      audience?: string;
      requiresAcknowledgement?: boolean;
    }) => request<{ announcement: any; message: string }>(`/api/v1/announcements`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
    acknowledge: (id: string) =>
      request<{ result: any; message: string }>(`/api/v1/announcements/${id}/acknowledge`, {
        method: "POST",
      }),
  },

  // 8. Audit Vault & Security
  audit: {
    getLogs: (limit = 50, action?: string) => {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (action) params.append("action", action);
      return request<{ logs: any[]; count: number; isVaultTamperFree: boolean; encryptionAlgorithm: string }>(
        `/api/v1/audit?${params.toString()}`
      );
    },
  },

  // 9. Employee Enterprise Roster & CRUD
  employees: {
    list: (params?: { departmentId?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.departmentId) q.append("departmentId", params.departmentId);
      if (params?.search) q.append("search", params.search);
      return request<{ employees: any[]; total: number }>(`/api/v1/employees?${q.toString()}`);
    },
    get: (id: string) => request<{ employee: any }>(`/api/v1/employees/${id}`),
    create: (data: {
      name: string;
      email: string;
      designation: string;
      departmentId?: string;
      departmentName?: string;
      workMode?: string;
      status?: string;
      employmentType?: string;
      remainingLeaveBalance?: number;
      joiningDate?: string;
      phoneNumber?: string;
      location?: string;
      workLocation?: string;
    }) =>
      request<{ employee: any; message: string }>(`/api/v1/employees`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<{ employee: any; message: string }>(`/api/v1/employees/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ employee: any; message: string }>(`/api/v1/employees/${id}`, {
        method: "DELETE",
      }),
  },
};
