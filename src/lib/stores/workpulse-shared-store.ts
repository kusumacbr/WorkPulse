// ==========================================
// 1. OFFICIAL XORSTACK DEPARTMENT & ORG ROSTER
// ==========================================

import { realtimeEventBus } from "@/server/realtime/event-bus";

export interface OrgEmployee {
  id: string;
  name: string;
  email: string;
  designation: string;
  departmentId: string;
  departmentName: string;
  teamLeadId: string;
  teamLeadName: string;
  avatar: string;
  workMode: "OFFICE" | "WFH" | "HYBRID";
  status?: "Full-Time" | "Probation" | "Notice Period" | "ACTIVE" | "PROBATION" | "RESIGNED" | "ARCHIVED" | string;
  employmentType?: "Full-Time" | "Probation" | "Contract" | "Intern" | string;
  joiningDate?: string;
  hireDate?: string;
  phoneNumber?: string;
  workLocation?: string;
  location?: string;
  sodStatus: "SUBMITTED" | "PENDING" | "VERIFIED" | "CHANGES_REQUESTED";
  sodTime?: string;
  sodVerifiedBy?: string;
  sodVerifiedAt?: string;
  sodLeadNote?: string;
  sodEmployeeNote?: string;
  eodStatus: "SUBMITTED" | "IN_PROGRESS" | "PENDING" | "VERIFIED";
  eodTime?: string;
  eodVerifiedBy?: string;
  eodVerifiedAt?: string;
  eodLeadRating?: number;
  eodLeadComment?: string;
  eodLeadActionItem?: string;
  overallProgress: number;
  remainingLeaveBalance: number;
  plannedTasks: {
    id: string;
    title: string;
    project: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    estimatedMinutes: number;
    completionPercentage: number;
    status: "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED" | "BLOCKED";
    expectedOutput: string;
    assignedBy?: string;
    assignedById?: string;
    assignedAt?: string;
    acknowledged?: boolean;
    acknowledgedAt?: string;
    acknowledgementNote?: string;
  }[];
  eodAchievements?: string;
  eodBlockers?: string;
  eodTomorrowFocus?: string;
}

export interface OrgDepartment {
  id: string;
  name: string;
  shortName: string;
  iconType: "dev" | "devops" | "data" | "rd" | "configtap" | "sap";
  description: string;
  badgeColor: string;
  accentColor: string;
  teamLead: {
    id: string;
    name: string;
    email: string;
    designation: string;
    avatar: string;
  };
  employees: OrgEmployee[];
}

export const XORSTACK_DEPARTMENTS: OrgDepartment[] = [
  // 1. Development
  {
    id: "dept-development",
    name: "Development",
    shortName: "Dev",
    iconType: "dev",
    description:
      "Software development is the creative process of designing, coding, and testing applications to meet specific user needs. Through iterative cycles and user feedback, developers craft solutions that enhance functionality and user experience.",
    badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    accentColor: "text-cyan-400",
    teamLead: {
      id: "lead-alex",
      name: "Alex Lead",
      email: "lead.test@xorstack.com",
      designation: "Engineering Lead · Development",
      avatar: "AL",
    },
    employees: [],
  },

  // 2. DevOps
  {
    id: "dept-devops",
    name: "Devops",
    shortName: "DevOps",
    iconType: "devops",
    description:
      "Bridging the gap between development and operations, DevOps fosters a culture of collaboration and automation, accelerating software delivery and ensuring reliability.",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    accentColor: "text-emerald-400",
    teamLead: {
      id: "lead-marcus",
      name: "Marcus Vance",
      email: "lead.devops@xorstack.com",
      designation: "DevOps & SRE Practice Lead",
      avatar: "MV",
    },
    employees: [],
  },

  // 3. Data Processing
  {
    id: "dept-data-processing",
    name: "Data processing",
    shortName: "Data",
    iconType: "data",
    description:
      "Data processing transforms raw data into meaningful insights, leveraging algorithms and computational tools.",
    badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    accentColor: "text-purple-400",
    teamLead: {
      id: "lead-vikram",
      name: "Vikram Rao",
      email: "lead.data@xorstack.com",
      designation: "Data Architecture & Analytics Lead",
      avatar: "VR",
    },
    employees: [],
  },

  // 4. R & D
  {
    id: "dept-rd",
    name: "R & D",
    shortName: "R&D",
    iconType: "rd",
    description:
      "R&D drives innovation by exploring novel ideas and technologies, ensuring that products and services remain cutting-edge and relevant.",
    badgeColor: "bg-pink-500/15 text-pink-300 border-pink-500/30",
    accentColor: "text-pink-400",
    teamLead: {
      id: "admin-david",
      name: "David Director",
      email: "director.test@xorstack.com",
      designation: "VP of Engineering & SuperAdmin",
      avatar: "DD",
    },
    employees: [],
  },

  // 5. Service Providers (ConfigTap)
  {
    id: "dept-configtap",
    name: "Service Providers (ConfigTap)",
    shortName: "ConfigTap",
    iconType: "configtap",
    description: "ConfigTap Innovations incubated for Autosar, 3DExperience & automotive engineering systems.",
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    accentColor: "text-amber-400",
    teamLead: {
      id: "lead-alex",
      name: "Alex Lead",
      email: "lead.test@xorstack.com",
      designation: "Engineering Lead · Development",
      avatar: "AL",
    },
    employees: [],
  },

  // 6. Human Resources
  {
    id: "dept-hr",
    name: "Human Resources",
    shortName: "HR",
    iconType: "dev",
    description: "Human Resources and People Operations driving culture, recruitment, benefits, and employee growth.",
    badgeColor: "bg-pink-500/15 text-pink-300 border-pink-500/30",
    accentColor: "text-pink-400",
    teamLead: {
      id: "hr-rachel",
      name: "Rachel HR",
      email: "hr.test@xorstack.com",
      designation: "Head of People Operations",
      avatar: "RH",
    },
    employees: [],
  },
];

// Flattened list of all employees across all 6 departments
export const ALL_XORSTACK_EMPLOYEES: OrgEmployee[] = XORSTACK_DEPARTMENTS.flatMap(
  (dept) => dept.employees
);

// ==========================================
// 2. SOD & EOD EVALUATION & FEEDBACK STORE
// ==========================================

export interface SharedEODFeedback {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName?: string;
  date: string;
  dayName: string;
  employeeEodSummary: string;
  tasksCompleted: string;
  hoursLogged: number;
  leadFeedbackTime: string;
  leadFeedbackNote: string;
  leadRating: number;
  leadSentiment: "EXCELLENT" | "GREAT" | "ON_TRACK";
  leadActionItem?: string;
  isToday?: boolean;
}

const DEFAULT_FEEDBACKS: SharedEODFeedback[] = [];

// ==========================================
// 3. 2-STAGE LEAVE & WFH REQUEST STORE
// ==========================================

export type RequestStageStatus =
  | "PENDING_TL_STAGE_1"
  | "FORWARDED_TO_HR"
  | "APPROVED"
  | "REJECTED";

export interface SharedLeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  departmentName: string;
  designation: string;
  leaveType: "CASUAL" | "SICK" | "PRIVILEGE" | "UNPAID";
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  handoverNotes: string;
  backupPersonName: string;
  remainingBalance: number;
  // Stage 1: TL Approval
  tlApproverName?: string;
  tlApprovedAt?: string;
  tlComment?: string;
  // Stage 2: HR Approval
  hrApproverName?: string;
  hrApprovedAt?: string;
  hrComment?: string;
  status: RequestStageStatus;
  rejectionReason?: string;
  createdAt: string;
  _isOptimistic?: boolean;
}

export interface SharedWfhRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  departmentName: string;
  designation: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  availabilityHours: string;
  contactMethod: string;
  plannedDeliverables: string;
  // Stage 1: TL Approval
  tlApproverName?: string;
  tlApprovedAt?: string;
  tlComment?: string;
  // Stage 2: HR Approval
  hrApproverName?: string;
  hrApprovedAt?: string;
  hrComment?: string;
  status: RequestStageStatus;
  rejectionReason?: string;
  createdAt: string;
  _isOptimistic?: boolean;
}

export const DEFAULT_LEAVE_REQUESTS: SharedLeaveRequest[] = [];
export const DEFAULT_WFH_REQUESTS: SharedWfhRequest[] = [];

// ==========================================
// 4. SHARED HR PROFILE QUERY STORE
// ==========================================

export interface SharedProfileQuery {
  id: string;
  ticketNumber: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  departmentName: string;
  category: string;
  requestedChange: string;
  reason: string;
  hrRemarks?: string;
  status: "PENDING_HR_REVIEW" | "APPROVED" | "REJECTED";
  submittedAt: string;
  resolvedAt?: string;
}

export interface SharedLeadHelpRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  leadName: string;
  topic: string;
  details?: string;
  urgency: "NORMAL" | "URGENT";
  status: "PENDING" | "ACKNOWLEDGED" | "RESOLVED";
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  leadResponse?: string;
  resolvedByEmployee?: boolean;
  resolvedByEmployeeAt?: string;
  resolvedByLead?: boolean;
  resolvedByLeadAt?: string;
}

export interface SharedTeamPresence {
  id: string;
  name: string;
  role: string;
  avatar: string;
  workMode: "OFFICE" | "WFH";
  firstIn: string;
  location: string;
  status: "ON_TIME" | "GRACE_WINDOW" | "LATE";
  grossHours: number;
  verified: boolean;
  verifiedAt?: string;
  verifiedBy?: string;
}

export const DEFAULT_SHARED_TEAM_PRESENCE: SharedTeamPresence[] = [];

const DEFAULT_HELP_REQUESTS: SharedLeadHelpRequest[] = [];

const DEFAULT_PROFILE_QUERIES: SharedProfileQuery[] = [];

// Storage keys for browser persistence across page reloads & refreshes
const STORAGE_KEYS = {
  DEPARTMENTS: "workpulse_departments_v5_supabase",
  FEEDBACKS: "workpulse_feedbacks_v5_supabase",
  LEAVE: "workpulse_leave_v6_authoritative",
  WFH: "workpulse_wfh_v6_authoritative",
  PROFILE_QUERIES: "workpulse_profile_queries_v5_supabase",
  HELP_REQUESTS: "workpulse_help_requests_v5",
  TEAM_PRESENCE: "workpulse_team_presence_v5",
  DELETED_LEAVE_IDS: "workpulse_deleted_leave_ids_v6",
  DELETED_EMPLOYEE_IDS: "workpulse_deleted_employee_ids",
};

// Safe migration cleanup: purge legacy localStorage keys from prior versions containing mock requests
if (typeof window !== "undefined") {
  try {
    const legacyKeysToPurge = [
      STORAGE_KEYS.LEAVE,
      STORAGE_KEYS.WFH,
      "workpulse_leave_v6_authoritative",
      "workpulse_wfh_v6_authoritative",
      "workpulse_leave_v5_supabase",
      "workpulse_wfh_v5_supabase",
      "workpulse_leave_v4",
      "workpulse_wfh_v4",
      "workpulse_leave_v3",
      "workpulse_wfh_v3",
      "workpulse_leave_requests",
      "workpulse_wfh_requests",
      "workpulse_deleted_leave_ids",
    ];
    for (const k of legacyKeysToPurge) {
      window.localStorage.removeItem(k);
    }
  } catch {}
}

const serverDeletedLeaveIds = new Set<string>();
const serverDeletedEmployeeIds = new Set<string>();

export function getDeletedEmployeeIds(): Set<string> {
  if (typeof window === "undefined") return serverDeletedEmployeeIds;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.DELETED_EMPLOYEE_IDS);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return serverDeletedEmployeeIds;
}

export function getDeletedLeaveIds(): Set<string> {
  if (typeof window === "undefined") return serverDeletedLeaveIds;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.DELETED_LEAVE_IDS);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return serverDeletedLeaveIds;
}


export function sanitizePodToTeam(text: string): string {
  if (typeof text !== "string") return text;
  return text
    .replace(/\bPOD\b/g, "TEAM")
    .replace(/\bPod\b/g, "Team")
    .replace(/\bpod\b/g, "team")
    .replace(/#dev-pod/g, "#dev-team")
    .replace(/#data-pod/g, "#data-team");
}

export function deepSanitizePod<T>(data: T): T {
  if (data === null || data === undefined) return data;
  if (typeof data === "string") return sanitizePodToTeam(data) as unknown as T;
  if (Array.isArray(data)) return data.map(deepSanitizePod) as unknown as T;
  if (typeof data === "object") {
    const res: any = {};
    for (const [k, v] of Object.entries(data)) {
      res[k] = deepSanitizePod(v);
    }
    return res;
  }
  return data;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined" || !window.localStorage) return deepSanitizePod(fallback);
  // Supabase is the sole authority for Leave & WFH requests. Never load them from localStorage.
  if (key === STORAGE_KEYS.LEAVE || key === STORAGE_KEYS.WFH) {
    try {
      window.localStorage.removeItem(key);
    } catch {}
    return deepSanitizePod(fallback);
  }
  try {
    const saved = window.localStorage.getItem(key);
    if (saved) {
      let parsed = JSON.parse(saved);
      // Filter out any legacy mock leave/wfh IDs that might linger
      if (Array.isArray(parsed)) {
        parsed = parsed.filter((item: any) => {
          if (!item || !item.id) return true;
          const id = String(item.id);
          if (id.startsWith("leave-req-10") || id.startsWith("wfh-req-20")) {
            return false;
          }
          return true;
        });
      }
      return deepSanitizePod(parsed);
    }
  } catch (e) {
    console.warn(`[WorkpulseStore] Error loading ${key} from localStorage:`, e);
  }
  return deepSanitizePod(fallback);
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  // Supabase is the sole authority for Leave & WFH requests. Never save them to localStorage.
  if (key === STORAGE_KEYS.LEAVE || key === STORAGE_KEYS.WFH) {
    try {
      window.localStorage.removeItem(key);
    } catch {}
    return;
  }
  // When saving departments, strip out plannedTasks so tasks are strictly loaded from Supabase daily_tasks
  if (key === STORAGE_KEYS.DEPARTMENTS && Array.isArray(value)) {
    try {
      const cleanDepts = (value as any[]).map((dept) => ({
        ...dept,
        employees: Array.isArray(dept.employees)
          ? dept.employees.map((emp: any) => ({
              ...emp,
              plannedTasks: [],
            }))
          : [],
      }));
      window.localStorage.setItem(key, JSON.stringify(deepSanitizePod(cleanDepts)));
    } catch (e) {
      console.warn(`[WorkpulseStore] Error saving ${key} to localStorage:`, e);
    }
    return;
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(deepSanitizePod(value)));
  } catch (e) {
    console.warn(`[WorkpulseStore] Error saving ${key} to localStorage:`, e);
  }
}

// Global in-memory shared state (defaults on initial SSR and initial client mount)
let globalDepartments: OrgDepartment[] = JSON.parse(JSON.stringify(XORSTACK_DEPARTMENTS));
let globalFeedbacks: SharedEODFeedback[] = [...DEFAULT_FEEDBACKS];
let globalLeaveRequests: SharedLeaveRequest[] = [];
let globalWfhRequests: SharedWfhRequest[] = [];
let globalProfileQueries: SharedProfileQuery[] = [...DEFAULT_PROFILE_QUERIES];
let globalHelpRequests: SharedLeadHelpRequest[] = [...DEFAULT_HELP_REQUESTS];
let globalTeamPresence: SharedTeamPresence[] = [...DEFAULT_SHARED_TEAM_PRESENCE];

type Listener = () => void;
const listeners = new Set<Listener>();
let activeSyncPromise: Promise<void> | null = null;
let lastSyncTimestamp = 0;
let isHydrating = false;
let supabaseHydrated = false; // True once Supabase data has been fetched — prevents hardcoded defaults from overriding
let supabaseSyncedLeave = false; // True once Supabase leave data has been fetched — prevents localStorage from overriding
let supabaseSyncedWfh = false; // True once Supabase WFH data has been fetched — prevents localStorage from overriding
let notifyTimer: any = null;

export function subscribeToSharedStore(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  if (notifyTimer) clearTimeout(notifyTimer);
  notifyTimer = setTimeout(() => {
    saveToStorage(STORAGE_KEYS.DEPARTMENTS, globalDepartments);
    saveToStorage(STORAGE_KEYS.FEEDBACKS, globalFeedbacks);
    saveToStorage(STORAGE_KEYS.LEAVE, globalLeaveRequests);
    saveToStorage(STORAGE_KEYS.WFH, globalWfhRequests);
    saveToStorage(STORAGE_KEYS.PROFILE_QUERIES, globalProfileQueries);
    saveToStorage(STORAGE_KEYS.HELP_REQUESTS, globalHelpRequests);
    saveToStorage(STORAGE_KEYS.TEAM_PRESENCE, globalTeamPresence);
    listeners.forEach((l) => l());
    if (typeof window !== "undefined") {
      try {
        window.dispatchEvent(new CustomEvent("workpulse_sync"));
      } catch {}
    }
  }, 10);
}

async function syncEmployeeToSupabase(emp: OrgEmployee): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const payload = {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      role_title: emp.designation,
      department: emp.departmentName,
      department_id: emp.departmentId,
      work_mode: emp.workMode,
      status: emp.status || "ACTIVE",
      employment_type: emp.employmentType || "Full-Time",
      manager_id: emp.teamLeadId,
      manager_name: emp.teamLeadName,
      phone_number: emp.phoneNumber,
      location: emp.workLocation || emp.location || "Bangalore HQ",
      leave_balance: emp.remainingLeaveBalance,
    };

    // Trigger server Admin endpoint with cascading updates across all Supabase tables
    // AWAIT the response to ensure persistence before any re-sync can occur
    await fetch("/api/v1/supabase/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update_employee", id: emp.id, record: payload }),
    }).catch(() => {});
  } catch {
    // Graceful offline fallback
  }
}

async function syncGoalToSupabase(goal: {
  id: string;
  title: string;
  description?: string;
  category?: string;
  measurableOutcome?: string;
  priority?: string;
  status?: string;
  progressPercentage?: number;
  employeeId?: string;
  employeeName?: string;
}) {
  if (typeof window === "undefined") return;
  try {
    fetch("/api/v1/supabase/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sync_goal", record: goal }),
    }).catch(() => {});
  } catch {}
}

async function deleteEmployeeFromSupabase(id: string, email?: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    // AWAIT the server-side Admin endpoint to ensure cascade delete completes
    // before any re-sync can fetch stale data (fixes ghost restoration)
    await fetch("/api/v1/supabase/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete_employee", id, record: { email } }),
    }).catch(() => {});
  } catch {
    // Graceful offline fallback
  }
}

async function syncLeaveRequestToSupabase(req: SharedLeaveRequest) {
  if (typeof window === "undefined") return;
  try {
    const payload = {
      id: req.id,
      employee_id: req.employeeId,
      employee_name: req.employeeName,
      department_name: req.departmentName,
      department_id: req.departmentId,
      designation: req.designation,
      leave_type: req.leaveType,
      start_date: req.startDate,
      end_date: req.endDate,
      days_count: req.daysCount,
      reason: req.reason,
      handover_notes: req.handoverNotes,
      backup_person_name: req.backupPersonName,
      remaining_balance: req.remainingBalance,
      status: req.status,
      tl_approver_name: req.tlApproverName,
      tl_approved_at: req.tlApprovedAt ? new Date().toISOString() : null,
      tl_comment: req.tlComment,
      hr_approver_name: req.hrApproverName,
      hr_approved_at: req.hrApprovedAt ? new Date().toISOString() : null,
      hr_comment: req.hrComment,
      rejection_reason: req.rejectionReason,
    };

    fetch("/api/v1/supabase/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "upsert", table: "leave_requests", record: payload }),
    }).catch(() => {});
  } catch {
    // Graceful offline fallback
  }
}

async function syncWfhRequestToSupabase(req: SharedWfhRequest) {
  if (typeof window === "undefined") return;
  try {
    const payload = {
      id: req.id,
      employee_id: req.employeeId,
      employee_name: req.employeeName,
      department_name: req.departmentName,
      department_id: req.departmentId,
      designation: req.designation,
      start_date: req.startDate,
      end_date: req.endDate,
      days_count: req.daysCount,
      reason: req.reason,
      availability_hours: req.availabilityHours,
      contact_method: req.contactMethod,
      planned_deliverables: req.plannedDeliverables,
      status: req.status,
      tl_approver_name: req.tlApproverName,
      tl_approved_at: req.tlApprovedAt ? new Date().toISOString() : null,
      tl_comment: req.tlComment,
      hr_approver_name: req.hrApproverName,
      hr_approved_at: req.hrApprovedAt ? new Date().toISOString() : null,
      hr_comment: req.hrComment,
      rejection_reason: req.rejectionReason,
    };

    fetch("/api/v1/supabase/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "upsert", table: "wfh_requests", record: payload }),
    }).catch(() => {});
  } catch {
    // Graceful offline fallback
  }
}



async function syncBiometricPunchToSupabase(punch: {
  employeeId: string;
  employeeName?: string;
  punchType: "IN" | "OUT";
  terminalId?: string;
  location?: string;
  method?: string;
}) {
  if (typeof window === "undefined") return;
  try {
    const payload = {
      employee_id: punch.employeeId,
      employee_name: punch.employeeName || "Employee",
      punch_type: punch.punchType,
      terminal_id: punch.terminalId || "HQ-GATE-01",
      location: punch.location || "Bangalore HQ",
      method: punch.method || "BIOMETRIC",
      status: "VERIFIED",
    };

    fetch("/api/v1/supabase/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "insert", table: "biometric_punches", record: payload }),
    }).catch(() => {});
  } catch {
    // Graceful offline fallback
  }
}

async function syncWorkdayToSupabase(workdayData: {
  employeeId: string;
  employeeName?: string;
  date?: string;
  workMode?: string;
  sodStatus?: string;
  sodTime?: string;
  sodVerifiedBy?: string;
  sodVerifiedAt?: string;
  sodLeadNote?: string;
  eodStatus?: string;
  eodTime?: string;
  eodVerifiedBy?: string;
  eodVerifiedAt?: string;
  eodLeadRating?: number;
  eodLeadComment?: string;
  eodLeadActionItem?: string;
  plannedTasks?: any[];
  overallProgress?: number;
  achievements?: string;
  blockers?: string;
  tomorrowFocus?: string;
}) {
  if (typeof window === "undefined") return;
  try {
    const today = workdayData.date || new Date().toISOString().split("T")[0]!;
    const emp = WorkpulseSharedStore.getEmployeeById(workdayData.employeeId);
    const empName = workdayData.employeeName || emp?.name || "Team Member";

    const payload: any = {
      id: `wd-${workdayData.employeeId}-${today}`,
      employee_id: workdayData.employeeId,
      employee_name: empName,
      date: today,
      work_mode: workdayData.workMode || emp?.workMode || "OFFICE",
    };

    if (workdayData.sodStatus !== undefined) payload.sod_status = workdayData.sodStatus;
    if (workdayData.sodTime !== undefined) payload.sod_time = workdayData.sodTime;
    if (workdayData.sodVerifiedBy !== undefined) payload.sod_verified_by = workdayData.sodVerifiedBy;
    if (workdayData.sodVerifiedAt !== undefined) payload.sod_verified_at = workdayData.sodVerifiedAt;
    if (workdayData.sodLeadNote !== undefined) payload.lead_feedback_note = workdayData.sodLeadNote;
    if (workdayData.eodStatus !== undefined) payload.eod_status = workdayData.eodStatus;
    if (workdayData.eodTime !== undefined) payload.eod_time = workdayData.eodTime;
    if (workdayData.eodVerifiedBy !== undefined) payload.eod_verified_by = workdayData.eodVerifiedBy;
    if (workdayData.eodVerifiedAt !== undefined) payload.eod_verified_at = workdayData.eodVerifiedAt;
    if (workdayData.eodLeadRating !== undefined) payload.lead_rating = workdayData.eodLeadRating;
    if (workdayData.eodLeadComment !== undefined) payload.lead_feedback_note = workdayData.eodLeadComment;
    if (workdayData.eodLeadActionItem !== undefined) payload.lead_action_item = workdayData.eodLeadActionItem;
    if (workdayData.plannedTasks !== undefined) payload.planned_tasks = workdayData.plannedTasks;
    if (workdayData.overallProgress !== undefined) payload.overall_progress = workdayData.overallProgress;
    if (workdayData.achievements !== undefined) payload.achievements = workdayData.achievements;
    if (workdayData.blockers !== undefined) payload.blockers = workdayData.blockers;
    if (workdayData.tomorrowFocus !== undefined) payload.tomorrow_focus = workdayData.tomorrowFocus;

    fetch("/api/v1/supabase/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "upsert", table: "workdays", record: payload }),
    }).catch(() => {});

    // Also sync planned tasks into daily_tasks table in Supabase
    if (Array.isArray(workdayData.plannedTasks) && workdayData.plannedTasks.length > 0) {
      for (const t of workdayData.plannedTasks) {
        if (!t.title) continue;
        const prog = Number(t.completionPercentage !== undefined ? t.completionPercentage : t.progress) || 0;
        const taskPayload = {
          id: t.id || `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          employee_id: workdayData.employeeId,
          date: today,
          title: t.title,
          category: t.project || t.category || "General",
          priority: t.priority || "MEDIUM",
          status: t.status || (prog === 100 ? "COMPLETED" : (prog > 0 ? "IN_PROGRESS" : "NOT_STARTED")),
          progress: prog,
        };
        fetch("/api/v1/supabase/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "upsert", table: "daily_tasks", record: taskPayload }),
        }).catch(() => {});
      }
    }
  } catch (e) {
    console.warn("Supabase workday sync error:", e);
  }
}

export const WorkpulseSharedStore = {
  // Virtual Biometric Punch Action
  virtualPunch: (employeeId: string, punchType: "IN" | "OUT") => {
    syncBiometricPunchToSupabase({
      employeeId: employeeId || "emp-sarah",
      employeeName: employeeId === "emp-rohit" ? "Rohit Sharma" : "Sarah Dev",
      punchType,
      location: "Bangalore HQ (Floor 4, Team Bay B)",
      method: "VIRTUAL_SIMULATOR",
    });
    notify();
  },

  // Hydration & Storage Management
  hydrateFromStorage: () => {
    if (isHydrating) return;
    isHydrating = true;
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        // Clear legacy storage keys with outdated mock data
        [
          "workpulse_departments",
          "workpulse_departments_v1",
          "workpulse_departments_v2",
          "workpulse_departments_v3",
          "workpulse_departments_v4",
        ].forEach((k) => window.localStorage.removeItem(k));
      }
      const deletedLeaveIds = getDeletedLeaveIds();
      const deletedEmployeeIds = getDeletedEmployeeIds();

      // Supabase is the sole authority for Leave & WFH requests.
      // Do NOT reload old cached requests from localStorage on page hydration,
      // as that restores phantom requests. Only preserve in-flight optimistic requests from this active session.
      globalLeaveRequests = globalLeaveRequests.filter((r) => r._isOptimistic && !deletedLeaveIds.has(r.id));
      globalWfhRequests = globalWfhRequests.filter((r) => r._isOptimistic && !deletedEmployeeIds.has(r.employeeId));

      const loadedDepartments = loadFromStorage<OrgDepartment[] | null>(STORAGE_KEYS.DEPARTMENTS, null);
      if (loadedDepartments && Array.isArray(loadedDepartments) && loadedDepartments.length > 0) {
        globalDepartments = loadedDepartments.map((dept: OrgDepartment) => ({
          ...dept,
          employees: Array.isArray(dept.employees)
            ? dept.employees
                .filter((e) => !deletedEmployeeIds.has(e.id) && !deletedEmployeeIds.has(e.email?.toLowerCase()))
                .map((e) => ({
                  ...e,
                  plannedTasks: supabaseHydrated ? (e.plannedTasks || []) : [],
                }))
            : [],
        }));
      } else if (!supabaseHydrated) {
        // Only fall back to hardcoded XORSTACK_DEPARTMENTS if Supabase has never been loaded.
        // Once supabaseHydrated is true, the globalDepartments already has authoritative Supabase data.
        globalDepartments = globalDepartments.map((dept: OrgDepartment) => ({
          ...dept,
          employees: Array.isArray(dept.employees)
            ? dept.employees
                .filter((e) => !deletedEmployeeIds.has(e.id) && !deletedEmployeeIds.has(e.email?.toLowerCase()))
                .map((e) => ({
                  ...e,
                  plannedTasks: [],
                }))
            : [],
        }));
      }

      const loadedFeedbacks = loadFromStorage<SharedEODFeedback[] | null>(STORAGE_KEYS.FEEDBACKS, null);
      if (loadedFeedbacks && Array.isArray(loadedFeedbacks)) {
        globalFeedbacks = loadedFeedbacks.filter((f) => !deletedEmployeeIds.has(f.employeeId));
      }

      globalProfileQueries = loadFromStorage(STORAGE_KEYS.PROFILE_QUERIES, globalProfileQueries);
      globalHelpRequests = loadFromStorage(STORAGE_KEYS.HELP_REQUESTS, globalHelpRequests);
      globalTeamPresence = loadFromStorage(STORAGE_KEYS.TEAM_PRESENCE, globalTeamPresence);


      listeners.forEach((l) => l());
    } finally {
      isHydrating = false;
    }
  },

  syncWithSupabase: async (force = false) => {
    if (typeof window === "undefined") return;
    if (activeSyncPromise) return activeSyncPromise;
    const now = Date.now();
    const minThreshold = force ? 1500 : 5000;
    if (now - lastSyncTimestamp < minThreshold) {
      return;
    }
    lastSyncTimestamp = now;

    activeSyncPromise = (async () => {
      try {
        // 1. Sync Employees
        const res = await fetch("/api/v1/employees");
        if (res.ok) {
          const json = await res.json();
          const employees = json.data?.employees || json.employees;
          if (Array.isArray(employees) && employees.length > 0) {
            WorkpulseSharedStore.setEmployeesFromSupabase(employees);
          }
        }

        // 2. Sync Leave, WFH Requests, Feedbacks, Workdays & Daily Tasks directly from Supabase
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const [lrRes, wfhRes, fbRes, wdRes, dtRes] = await Promise.all([
          supabase.from("leave_requests").select("*").order("created_at", { ascending: false }),
          supabase.from("wfh_requests").select("*").order("created_at", { ascending: false }),
          supabase.from("feedbacks").select("*").order("created_at", { ascending: false }),
          supabase.from("workdays").select("*").order("created_at", { ascending: false }),
          supabase.from("daily_tasks").select("*").order("created_at", { ascending: false }),
        ]);

        // Supabase is the authority — no client-side deletedIds filtering needed.
        // If a record exists in Supabase, it exists. If it was deleted, it won't be in the response.

        // Index daily_tasks by employee id and email
        const supaTasksByEmp = new Map<string, any[]>();
        if (Array.isArray(dtRes.data)) {
          for (const row of dtRes.data) {
            const rawEmpId = (row.employee_id || "").trim().toLowerCase();
            if (!rawEmpId) continue;
            if (!supaTasksByEmp.has(rawEmpId)) supaTasksByEmp.set(rawEmpId, []);
            supaTasksByEmp.get(rawEmpId)!.push({
              id: row.id,
              title: row.title,
              project: row.category || "General",
              category: row.category || "General",
              priority: row.priority || "MEDIUM",
              status: row.status || "NOT_STARTED",
              progress: Number(row.progress) || 0,
              completionPercentage: Number(row.progress) || 0,
              estimatedMinutes: 60,
              expectedOutput: row.title,
              assignedBy: row.assigned_by,
              assignedAt: row.assigned_at,
              acknowledged: Boolean(row.acknowledged),
            });
          }
        }

      if (lrRes.data && lrRes.data.length > 0) {
        supabaseSyncedLeave = true;
        const mappedLeaves: SharedLeaveRequest[] = lrRes.data
          .map((r) => ({
            id: r.id,
            employeeId: r.employee_id,
            employeeName: r.employee_name,
            departmentId: r.department_id || "dept-development",
            departmentName: r.department_name || "Development",
            designation: r.designation || "Engineer",
            leaveType: r.leave_type || "CASUAL",
            startDate: r.start_date,
            endDate: r.end_date,
            daysCount: Number(r.days_count) || 1,
            reason: r.reason,
            handoverNotes: r.handover_notes,
            backupPersonName: r.backup_person_name,
            remainingBalance: Number(r.remaining_balance) || 11.0,
            status: r.status,
            tlApproverName: r.tl_approver_name,
            tlApprovedAt: r.tl_approved_at,
            tlComment: r.tl_comment,
            hrApproverName: r.hr_approver_name,
            hrApprovedAt: r.hr_approved_at,
            hrComment: r.hr_comment,
            rejectionReason: r.rejection_reason,
            createdAt: r.created_at,
          }));
        const pendingOptimisticLeaves = globalLeaveRequests.filter(
          (l) => l._isOptimistic && !mappedLeaves.some((r) => r.id === l.id)
        );
        globalLeaveRequests = [...pendingOptimisticLeaves, ...mappedLeaves];
        saveToStorage(STORAGE_KEYS.LEAVE, globalLeaveRequests);
      } else if (lrRes.data && lrRes.data.length === 0) {
        supabaseSyncedLeave = true;
        const pendingOptimisticLeaves = globalLeaveRequests.filter((l) => l._isOptimistic);
        globalLeaveRequests = pendingOptimisticLeaves;
        saveToStorage(STORAGE_KEYS.LEAVE, globalLeaveRequests);
      }

      if (wfhRes.data && wfhRes.data.length > 0) {
        supabaseSyncedWfh = true;
        const mappedWfh: SharedWfhRequest[] = wfhRes.data
          .map((r) => ({
            id: r.id,
            employeeId: r.employee_id,
            employeeName: r.employee_name,
            departmentId: r.department_id || "dept-development",
            departmentName: r.department_name || "Development",
            designation: r.designation || "Engineer",
            startDate: r.start_date,
            endDate: r.end_date,
            daysCount: Number(r.days_count) || 1,
            reason: r.reason,
            availabilityHours: r.availability_hours || "10:00 AM – 07:00 PM",
            contactMethod: r.contact_method || "Slack & Zoom",
            plannedDeliverables: r.planned_deliverables,
            status: r.status,
            tlApproverName: r.tl_approver_name,
            tlApprovedAt: r.tl_approved_at,
            tlComment: r.tl_comment,
            hrApproverName: r.hr_approver_name,
            hrApprovedAt: r.hr_approved_at,
            hrComment: r.hr_comment,
            rejectionReason: r.rejection_reason,
            createdAt: r.created_at,
          }));
        const pendingOptimisticWfh = globalWfhRequests.filter(
          (w) => w._isOptimistic && !mappedWfh.some((r) => r.id === w.id)
        );
        globalWfhRequests = [...pendingOptimisticWfh, ...mappedWfh];
        saveToStorage(STORAGE_KEYS.WFH, globalWfhRequests);
      } else if (wfhRes.data && wfhRes.data.length === 0) {
        supabaseSyncedWfh = true;
        const pendingOptimisticWfh = globalWfhRequests.filter((w) => w._isOptimistic);
        globalWfhRequests = pendingOptimisticWfh;
        saveToStorage(STORAGE_KEYS.WFH, globalWfhRequests);
      }

      if (fbRes.data && fbRes.data.length > 0) {
        const mappedFb: SharedEODFeedback[] = fbRes.data
          .map((f) => ({
            id: f.id,
            employeeId: f.employee_id,
            employeeName: f.employee_name,
            departmentName: "Development",
            date: f.date || "Today",
            dayName: "Today",
            employeeEodSummary: f.notes || "Completed assigned sprint deliverables.",
            tasksCompleted: "Planned deliverables completed",
            hoursLogged: 8.0,
            leadFeedbackTime: f.created_at ? new Date(f.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Today",
            leadFeedbackNote: f.notes,
            leadRating: Number(f.rating) || 5.0,
            leadSentiment: f.sentiment || "EXCELLENT",
            leadActionItem: f.action_item,
            isToday: true,
          }));
        globalFeedbacks = mappedFb;
      } else if (fbRes.data && fbRes.data.length === 0) {
        globalFeedbacks = [];
      }

      // Always synchronize employee plannedTasks directly from Supabase daily_tasks
      if (Array.isArray(dtRes.data)) {
        globalDepartments = globalDepartments.map((dept) => ({
          ...dept,
          employees: dept.employees.map((emp) => {
            const empIdLower = emp.id.toLowerCase();
            const empEmailLower = emp.email?.toLowerCase() || "";
            const supaTasks = supaTasksByEmp.get(empIdLower) || supaTasksByEmp.get(empEmailLower) || [];
            return {
              ...emp,
              plannedTasks: supaTasks,
            };
          }),
        }));
      }

      // Merge Supabase workdays into employee states using a single Map pass for maximum performance
      if (wdRes.data && wdRes.data.length > 0) {
        const today = new Date().toISOString().split("T")[0]!;
        const workdaysList = wdRes.data.filter((wd) => wd.date === today && wd.id !== "wd-sarah-today");
        const wdMap = new Map<string, any>();
        for (const wd of workdaysList) {
          if (wd.employee_id) {
            wdMap.set(wd.employee_id.toLowerCase(), wd);
          }
        }

        globalDepartments = globalDepartments.map((dept) => ({
          ...dept,
          employees: dept.employees.map((emp) => {
            const empIdLower = emp.id.toLowerCase();
            const empEmailLower = emp.email?.toLowerCase() || "";
            const wd = wdMap.get(empIdLower) || wdMap.get(empEmailLower);
            if (!wd) return emp;

            const supaTasks = supaTasksByEmp.get(empIdLower) || supaTasksByEmp.get(empEmailLower) || [];
            const finalTasks = supaTasks;

            return {
              ...emp,
              sodStatus: wd.sod_status === "VERIFIED" ? "VERIFIED" : wd.sod_status === "SUBMITTED" ? "SUBMITTED" : emp.sodStatus,
              sodTime: wd.sod_time || emp.sodTime,
              sodVerifiedBy: wd.sod_verified_by || emp.sodVerifiedBy,
              sodVerifiedAt: wd.sod_verified_at || emp.sodVerifiedAt,
              sodLeadNote: wd.sod_lead_note || wd.lead_feedback_note || emp.sodLeadNote,
              eodStatus: wd.eod_status === "VERIFIED" ? "VERIFIED" : wd.eod_status === "SUBMITTED" ? "SUBMITTED" : emp.eodStatus,
              eodTime: wd.eod_time || emp.eodTime,
              eodVerifiedBy: wd.eod_verified_by || emp.eodVerifiedBy,
              eodVerifiedAt: wd.eod_verified_at || emp.eodVerifiedAt,
              eodLeadRating: Number(wd.lead_rating) || emp.eodLeadRating,
              eodLeadComment: wd.lead_feedback_note || emp.eodLeadComment,
              eodLeadActionItem: wd.lead_action_item || emp.eodLeadActionItem,
              plannedTasks: finalTasks,
              overallProgress: typeof wd.overall_progress === "number" ? wd.overall_progress : emp.overallProgress,
              eodAchievements: wd.achievements || emp.eodAchievements,
              eodBlockers: wd.blockers || emp.eodBlockers,
              eodTomorrowFocus: wd.tomorrow_focus || emp.eodTomorrowFocus,
            };
          }),
        }));
      }

      supabaseHydrated = true;
      notify();
    } catch {
      // Graceful offline fallback
    }
  })();

  try {
    await activeSyncPromise;
  } finally {
    activeSyncPromise = null;
  }
},

  setEmployeesFromSupabase: (supaEmployees: any[]) => {
    if (!Array.isArray(supaEmployees) || supaEmployees.length === 0) return;
    supabaseHydrated = true;

    const deletedEmployeeIds = getDeletedEmployeeIds();
    const filteredSupa = supaEmployees.filter(
      (se) => !deletedEmployeeIds.has(se.id?.toLowerCase()) && !deletedEmployeeIds.has(se.email?.toLowerCase())
    );

    const allMapped: OrgEmployee[] = filteredSupa
      .map((se) => {
        const name = se.name || "Employee";
        const avatar = name
          .split(" ")
          .map((w: string) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();

        const deptName = se.departmentName || se.department || "Development";
        const deptId =
          se.departmentId ||
          se.department_id ||
          (deptName.toLowerCase().includes("devops")
            ? "dept-devops"
            : deptName.toLowerCase().includes("data")
            ? "dept-data-processing"
            : deptName.toLowerCase().includes("r & d") || deptName.toLowerCase().includes("rd")
            ? "dept-rd"
            : deptName.toLowerCase().includes("configtap") || deptName.toLowerCase().includes("service")
            ? "dept-configtap"
            : deptName.toLowerCase().includes("hr") || deptName.toLowerCase().includes("human")
            ? "dept-hr"
            : "dept-development");

        const teamLeadId =
          se.teamLeadId ||
          se.manager_id ||
          (deptId === "dept-devops"
            ? "lead-marcus"
            : deptId === "dept-data-processing"
            ? "lead-vikram"
            : deptId === "dept-rd"
            ? "admin-david"
            : deptId === "dept-configtap"
            ? "lead-alex"
            : deptId === "dept-hr"
            ? "admin-david"
            : "lead-alex");

        const matchingLead = supaEmployees.find((s) => s.id === teamLeadId || (s.email && s.email.toLowerCase() === teamLeadId?.toLowerCase()));
        const teamLeadName =
          se.teamLeadName ||
          se.manager_name ||
          matchingLead?.name ||
          (teamLeadId === "lead-marcus"
            ? "Marcus Vance"
            : teamLeadId === "lead-vikram"
            ? "Vikram Rao"
            : teamLeadId === "admin-david"
            ? "David Director"
            : "Alex Lead");

        return {
          id: se.id,
          name,
          email: se.email,
          designation: se.designation || se.role_title || "Engineer",
          departmentId: deptId,
          departmentName: deptName,
          teamLeadId,
          teamLeadName,
          avatar,
          workMode: se.workMode || se.work_mode || "OFFICE",
          status: se.status || "ACTIVE",
          employmentType: se.employmentType || se.employment_type || "Full-Time",
          sodStatus: se.sodStatus || "PENDING",
          sodTime: se.sodTime,
          eodStatus: se.eodStatus || "PENDING",
          overallProgress: typeof se.overallProgress === "number" ? se.overallProgress : 0,
          remainingLeaveBalance: Number(se.remainingLeaveBalance ?? se.leave_balance) || 12.0,
          phoneNumber: se.phoneNumber || se.phone_number || "+91 98450 11223",
          location: se.location || se.workLocation || "Bangalore HQ",
          workLocation: se.workLocation || se.location || "Bangalore HQ",
          joiningDate: se.joiningDate || se.joining_date || "2025-06-01",
          plannedTasks: se.plannedTasks || [],
        };
      });

    // Populate each department cleanly with mapped employees and latest teamLead
    globalDepartments = globalDepartments.map((baseDept) => {
      const deptEmployees = allMapped.filter(
        (emp) =>
          emp.departmentId === baseDept.id ||
          emp.departmentName.toLowerCase() === baseDept.name.toLowerCase()
      );
      const leadFromSupa = allMapped.find(
        (emp) => emp.id === baseDept.teamLead.id || emp.email.toLowerCase() === baseDept.teamLead.email.toLowerCase()
      );
      const updatedTeamLead = leadFromSupa
        ? {
            id: leadFromSupa.id,
            name: leadFromSupa.name,
            email: leadFromSupa.email,
            designation: leadFromSupa.designation,
            avatar: leadFromSupa.avatar,
          }
        : baseDept.teamLead;

      return {
        ...baseDept,
        teamLead: updatedTeamLead,
        employees: deptEmployees,
      };
    });

    notify();
  },

  addOrUpdateEmployeeFromSupabase: (emp: any) => {
    const empId = emp.id;
    const empName = emp.name;
    const empEmail = emp.email;
    const empDesignation = emp.designation || emp.role_title || "Engineer";
    const empDeptName = emp.departmentName || emp.department || "Development";
    const empWorkMode = emp.workMode || emp.work_mode || "OFFICE";
    const empStatus = emp.status || "ACTIVE";
    const empLeaveBalance = emp.remainingLeaveBalance ?? emp.leave_balance ?? 12.0;
    const empAvatar = empName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

    let found = false;
    globalDepartments = globalDepartments.map((dept) => {
      const isLead = dept.teamLead.id === empId || dept.teamLead.email.toLowerCase() === empEmail.toLowerCase();
      const updatedLead = isLead
        ? { ...dept.teamLead, name: empName, email: empEmail, designation: empDesignation, avatar: empAvatar }
        : dept.teamLead;

      if (dept.name.toLowerCase() === empDeptName.toLowerCase() || dept.id === emp.departmentId || dept.id === emp.department_id) {
        const existingEmp = dept.employees.find((e) => e.id === empId || e.email.toLowerCase() === empEmail.toLowerCase());
        if (existingEmp) {
          found = true;
          return {
            ...dept,
            teamLead: updatedLead,
            employees: dept.employees.map((e) =>
              e.id === existingEmp.id
                ? {
                    ...e,
                    name: empName,
                    email: empEmail,
                    designation: empDesignation,
                    workMode: empWorkMode,
                    status: empStatus,
                    remainingLeaveBalance: empLeaveBalance,
                    avatar: empAvatar,
                  }
                : isLead
                ? { ...e, teamLeadName: empName }
                : e
            ),
          };
        } else if (!dept.employees.some((e) => e.id === empId)) {
          found = true;
          return {
            ...dept,
            teamLead: updatedLead,
            employees: [
              {
                id: empId,
                name: empName,
                email: empEmail,
                designation: empDesignation,
                departmentId: dept.id,
                departmentName: dept.name,
                teamLeadId: dept.teamLead.id,
                teamLeadName: dept.teamLead.name,
                avatar: empAvatar,
                workMode: empWorkMode,
                status: empStatus,
                sodStatus: "SUBMITTED",
                eodStatus: "IN_PROGRESS",
                overallProgress: 80,
                remainingLeaveBalance: empLeaveBalance,
                plannedTasks: [],
              },
              ...dept.employees,
            ],
          };
        }
      }
      return isLead
        ? {
            ...dept,
            teamLead: updatedLead,
            employees: dept.employees.map((e) => ({ ...e, teamLeadName: empName })),
          }
        : dept;
    });

    if (!found && globalDepartments.length > 0) {
      const targetDept = globalDepartments[0]!;
      if (!targetDept.employees.some((e) => e.id === empId)) {
        targetDept.employees.unshift({
          id: empId,
          name: empName,
          email: empEmail,
          designation: empDesignation,
          departmentId: targetDept.id,
          departmentName: targetDept.name,
          teamLeadId: targetDept.teamLead.id,
          teamLeadName: targetDept.teamLead.name,
          avatar: empAvatar,
          workMode: empWorkMode,
          status: empStatus,
          sodStatus: "SUBMITTED",
          eodStatus: "IN_PROGRESS",
          overallProgress: 80,
          remainingLeaveBalance: empLeaveBalance,
          plannedTasks: [],
        });
      }
    }
  },
  resetToDefaults: () => {
    globalDepartments = JSON.parse(JSON.stringify(XORSTACK_DEPARTMENTS));
    globalFeedbacks = [];
    globalLeaveRequests = [];
    globalWfhRequests = [];
    globalProfileQueries = [];
    globalHelpRequests = [];
    globalTeamPresence = [];
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEYS.DEPARTMENTS);
      window.localStorage.removeItem(STORAGE_KEYS.FEEDBACKS);
      window.localStorage.removeItem(STORAGE_KEYS.LEAVE);
      window.localStorage.removeItem(STORAGE_KEYS.WFH);
      window.localStorage.removeItem(STORAGE_KEYS.PROFILE_QUERIES);
      window.localStorage.removeItem(STORAGE_KEYS.HELP_REQUESTS);
      window.localStorage.removeItem(STORAGE_KEYS.TEAM_PRESENCE);
      window.localStorage.removeItem(STORAGE_KEYS.DELETED_EMPLOYEE_IDS);
      window.localStorage.removeItem(STORAGE_KEYS.DELETED_LEAVE_IDS);
    }
    notify();
  },

  // Departments & Org CRUD
  getDepartments: () => {
    const deletedEmployeeIds = getDeletedEmployeeIds();
    return globalDepartments.map((dept) => ({
      ...dept,
      employees: dept.employees.filter((e) => !deletedEmployeeIds.has(e.id) && !deletedEmployeeIds.has(e.email?.toLowerCase())),
    }));
  },
  getAllEmployees: () => {
    const deletedEmployeeIds = getDeletedEmployeeIds();
    const seen = new Set<string>();
    const list: OrgEmployee[] = [];

    for (const dept of globalDepartments) {
      // 1. Department team lead if not in employees list and not deleted
      if (
        dept.teamLead &&
        !deletedEmployeeIds.has(dept.teamLead.id) &&
        !deletedEmployeeIds.has(dept.teamLead.email?.toLowerCase())
      ) {
        const leadInEmployees = dept.employees.find(
          (e) => e.id === dept.teamLead.id || e.email.toLowerCase() === dept.teamLead.email.toLowerCase()
        );
        if (leadInEmployees) {
          if (!seen.has(leadInEmployees.id) && !deletedEmployeeIds.has(leadInEmployees.id)) {
            seen.add(leadInEmployees.id);
            list.push(leadInEmployees);
          }
        } else if (!seen.has(dept.teamLead.id)) {
          seen.add(dept.teamLead.id);
          list.push({
            id: dept.teamLead.id,
            name: dept.teamLead.name,
            email: dept.teamLead.email,
            designation: dept.teamLead.designation,
            departmentId: dept.id,
            departmentName: dept.name,
            teamLeadId: "exec-root",
            teamLeadName: "Executive Leadership",
            avatar: dept.teamLead.avatar,
            workMode: "OFFICE",
            status: "Full-Time",
            sodStatus: "SUBMITTED",
            eodStatus: "SUBMITTED",
            overallProgress: 100,
            remainingLeaveBalance: 14.5,
            phoneNumber: "+91 98450 11000",
            location: "Bangalore HQ (Floor 3)",
            workLocation: "Bangalore HQ (Floor 3)",
            joiningDate: "2024-01-01",
            plannedTasks: [],
          });
        }
      }

      // 2. Department direct employees
      for (const emp of dept.employees) {
        if (!deletedEmployeeIds.has(emp.id) && !deletedEmployeeIds.has(emp.email?.toLowerCase()) && !seen.has(emp.id)) {
          seen.add(emp.id);
          list.push(emp);
        }
      }
    }
    return list;
  },
  getDepartmentById: (id: string) => globalDepartments.find((d) => d.id === id),
  getEmployeeById: (id: string): OrgEmployee | undefined => {
    const targetId = String(id).trim().toLowerCase();
    const deletedEmployeeIds = getDeletedEmployeeIds();
    if (deletedEmployeeIds.has(targetId)) return undefined;

    for (const dept of globalDepartments) {
      const emp = dept.employees.find(
        (e) =>
          !deletedEmployeeIds.has(e.id) &&
          (e.id.toLowerCase() === targetId || e.email.toLowerCase() === targetId)
      );
      if (emp) return emp;

      if (
        dept.teamLead &&
        !deletedEmployeeIds.has(dept.teamLead.id) &&
        (dept.teamLead.id.toLowerCase() === targetId || dept.teamLead.email.toLowerCase() === targetId)
      ) {
        return {
          id: dept.teamLead.id,
          name: dept.teamLead.name,
          email: dept.teamLead.email,
          designation: dept.teamLead.designation,
          departmentId: dept.id,
          departmentName: dept.name,
          teamLeadId: "exec-root",
          teamLeadName: "Executive Leadership",
          avatar: dept.teamLead.avatar,
          workMode: "OFFICE",
          status: "Full-Time",
          sodStatus: "SUBMITTED",
          eodStatus: "SUBMITTED",
          overallProgress: 100,
          remainingLeaveBalance: 14.5,
          phoneNumber: "+91 98450 11000",
          location: "Bangalore HQ (Floor 3)",
          workLocation: "Bangalore HQ (Floor 3)",
          joiningDate: "2024-01-01",
          plannedTasks: [],
        };
      }
    }
    return undefined;
  },

  addEmployee: (employee: {
    id?: string;
    name: string;
    email: string;
    designation: string;
    departmentId?: string;
    departmentName?: string;
    workMode?: "OFFICE" | "WFH" | "HYBRID";
    remainingLeaveBalance?: number;
    employmentType?: "Full-Time" | "Probation" | "Contract" | "Intern" | string;
    status?: "Full-Time" | "Probation" | "Notice Period" | "ACTIVE" | "PROBATION" | string;
    joiningDate?: string;
    phoneNumber?: string;
    location?: string;
    workLocation?: string;
  }) => {
    const empId = employee.id || `emp-${Date.now()}`;
    const empEmail = employee.email.trim().toLowerCase();

    // If ID was in deleted set, un-delete it
    const deletedEmployeeIds = getDeletedEmployeeIds();
    if (deletedEmployeeIds.has(empId) || deletedEmployeeIds.has(empEmail)) {
      deletedEmployeeIds.delete(empId);
      deletedEmployeeIds.delete(empEmail);
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEYS.DELETED_EMPLOYEE_IDS, JSON.stringify(Array.from(deletedEmployeeIds)));
      }
      serverDeletedEmployeeIds.delete(empId);
      serverDeletedEmployeeIds.delete(empEmail);
    }

    const targetDeptId = employee.departmentId || globalDepartments[0]?.id;
    const dept =
      globalDepartments.find(
        (d) =>
          d.id === targetDeptId ||
          d.name.toLowerCase() === employee.departmentName?.toLowerCase()
      ) || globalDepartments[0];
    if (!dept) return;

    const newEmp: OrgEmployee = {
      id: empId,
      name: employee.name,
      email: employee.email,
      designation: employee.designation,
      departmentId: dept.id,
      departmentName: dept.name,
      teamLeadId: dept.teamLead.id,
      teamLeadName: dept.teamLead.name,
      avatar:
        employee.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "EP",
      workMode: employee.workMode || "OFFICE",
      status:
        employee.status ||
        (employee.employmentType === "Probation" ? "Probation" : "Full-Time"),
      employmentType: employee.employmentType || "Full-Time",
      joiningDate: employee.joiningDate || new Date().toISOString().split("T")[0],
      phoneNumber: employee.phoneNumber || "+91 98450 11223",
      workLocation:
        employee.workLocation ||
        employee.location ||
        (employee.workMode === "WFH" ? "Remote (India)" : "Bangalore HQ (Floor 0)"),
      location: employee.location || employee.workLocation || (employee.workMode === "WFH" ? "Remote (India)" : "Bangalore HQ (Floor 0)"),
      sodStatus: "PENDING",
      sodTime: "--",
      eodStatus: "PENDING",
      overallProgress: 0,
      remainingLeaveBalance: employee.remainingLeaveBalance ?? 12.0,
      plannedTasks: [],
    };

    // Remove any existing instance of this employee across all departments, then add to target dept
    globalDepartments = globalDepartments.map((d) => {
      const filtered = d.employees.filter((e) => e.id !== newEmp.id && e.email.toLowerCase() !== empEmail);
      if (d.id === dept.id) {
        return { ...d, employees: [newEmp, ...filtered] };
      }
      return { ...d, employees: filtered };
    });

    notify();
    try {
      syncEmployeeToSupabase(newEmp);
      realtimeEventBus.emit("employee:created", newEmp);
    } catch {
      // safe fallback
    }
    return newEmp;
  },

  updateEmployee: (
    id: string,
    updates: Partial<OrgEmployee>
  ): OrgEmployee | undefined => {
    let updatedEmployee: OrgEmployee | undefined = undefined;
    const targetId = String(id).trim().toLowerCase();

    // Find current employee in dept.employees or dept.teamLead
    let existing: OrgEmployee | undefined;
    let currentDept = globalDepartments.find((d) =>
      d.employees.some((e) => e.id.toLowerCase() === targetId || e.email.toLowerCase() === targetId)
    );

    if (currentDept) {
      existing = currentDept.employees.find((e) => e.id.toLowerCase() === targetId || e.email.toLowerCase() === targetId);
    } else {
      // Check if it's a team lead
      const leadDept = globalDepartments.find(
        (d) => d.teamLead.id.toLowerCase() === targetId || d.teamLead.email.toLowerCase() === targetId
      );
      if (leadDept) {
        currentDept = leadDept;
        existing = {
          id: leadDept.teamLead.id,
          name: leadDept.teamLead.name,
          email: leadDept.teamLead.email,
          designation: leadDept.teamLead.designation,
          departmentId: leadDept.id,
          departmentName: leadDept.name,
          teamLeadId: "exec-root",
          teamLeadName: "Executive Leadership",
          avatar: leadDept.teamLead.avatar,
          workMode: "OFFICE",
          status: "Full-Time",
          sodStatus: "SUBMITTED",
          eodStatus: "SUBMITTED",
          overallProgress: 100,
          remainingLeaveBalance: 14.5,
          phoneNumber: "+91 98450 11000",
          location: "Bangalore HQ (Floor 3)",
          workLocation: "Bangalore HQ (Floor 3)",
          joiningDate: "2024-01-01",
          plannedTasks: [],
        };
      }
    }

    if (!currentDept || !existing) return undefined;

    const targetDeptId = updates.departmentId || currentDept.id;
    const targetDept =
      globalDepartments.find((d) => d.id === targetDeptId) || currentDept;

    const newName = updates.name ?? existing.name;
    const oldName = existing.name;
    const isNameChanged = updates.name !== undefined && updates.name !== oldName;

    const newAvatar = isNameChanged
      ? newName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
      : (updates.avatar ?? existing.avatar);

    const updated: OrgEmployee = {
      ...existing,
      ...updates,
      name: newName,
      email: updates.email ?? existing.email,
      designation: updates.designation ?? existing.designation,
      workMode: updates.workMode ?? existing.workMode,
      status: updates.status ?? existing.status ?? "Full-Time",
      employmentType: updates.employmentType ?? existing.employmentType,
      remainingLeaveBalance:
        updates.remainingLeaveBalance !== undefined
          ? Number(updates.remainingLeaveBalance)
          : existing.remainingLeaveBalance,
      phoneNumber: updates.phoneNumber ?? existing.phoneNumber,
      workLocation:
        updates.workLocation ?? updates.location ?? existing.workLocation,
      location: updates.location ?? updates.workLocation ?? existing.location,
      joiningDate: updates.joiningDate ?? existing.joiningDate,
      departmentId: targetDept.id,
      departmentName: targetDept.name,
      teamLeadId: targetDept.teamLead.id,
      teamLeadName: targetDept.teamLead.name,
      avatar: newAvatar,
    };

    updatedEmployee = updated;

    // Update globalDepartments
    if (targetDeptId !== currentDept.id) {
      // Department transfer: remove from old department and prepend to new department
      globalDepartments = globalDepartments.map((d) => {
        if (d.id === currentDept.id) {
          return {
            ...d,
            employees: d.employees.filter((e) => e.id.toLowerCase() !== targetId && e.email.toLowerCase() !== targetId),
          };
        }
        if (d.id === targetDept.id) {
          const filtered = d.employees.filter((e) => e.id.toLowerCase() !== targetId && e.email.toLowerCase() !== targetId);
          return {
            ...d,
            employees: [updated, ...filtered],
          };
        }
        return d;
      });
    } else {
      // In-place department update
      let foundInDept = false;
      globalDepartments = globalDepartments.map((d) => {
        if (d.id !== currentDept.id) return d;
        const mappedEmployees = d.employees.map((e) => {
          if (e.id.toLowerCase() === targetId || e.email.toLowerCase() === targetId) {
            foundInDept = true;
            return updated;
          }
          return e;
        });
        if (!foundInDept && (d.teamLead.id.toLowerCase() === targetId || d.teamLead.email.toLowerCase() === targetId)) {
          return {
            ...d,
            employees: [updated, ...mappedEmployees],
          };
        }
        return {
          ...d,
          employees: mappedEmployees,
        };
      });
    }

    // Cascade update to department Team Leads and ALL reportees across the entire organization
    globalDepartments = globalDepartments.map((d) => {
      const isThisLead = d.teamLead.id.toLowerCase() === targetId || d.teamLead.email.toLowerCase() === targetId;
      const updatedLead = isThisLead
        ? {
            ...d.teamLead,
            name: updated.name,
            designation: updated.designation,
            email: updated.email,
            avatar: newAvatar,
          }
        : d.teamLead;

      const updatedEmployees = d.employees.map((emp) => {
        if (emp.id.toLowerCase() === targetId) return updated;
        let empModified = false;
        let leadName = emp.teamLeadName;
        if (isThisLead || emp.teamLeadId?.toLowerCase() === targetId || (oldName && emp.teamLeadName?.toLowerCase() === oldName.toLowerCase())) {
          leadName = updated.name;
          empModified = true;
        }
        let sodVerified = emp.sodVerifiedBy;
        if (oldName && sodVerified?.toLowerCase() === oldName.toLowerCase()) {
          sodVerified = updated.name;
          empModified = true;
        }
        let eodVerified = emp.eodVerifiedBy;
        if (oldName && eodVerified?.toLowerCase() === oldName.toLowerCase()) {
          eodVerified = updated.name;
          empModified = true;
        }
        let tasks = emp.plannedTasks;
        if (oldName && tasks?.some((t) => t.assignedBy?.toLowerCase() === oldName.toLowerCase())) {
          tasks = tasks.map((t) => t.assignedBy?.toLowerCase() === oldName.toLowerCase() ? { ...t, assignedBy: updated.name } : t);
          empModified = true;
        }
        return empModified ? { ...emp, teamLeadName: leadName, sodVerifiedBy: sodVerified, eodVerifiedBy: eodVerified, plannedTasks: tasks } : emp;
      });

      return {
        ...d,
        teamLead: updatedLead,
        employees: updatedEmployees,
      };
    });

    // Cascade update to global feedbacks
    globalFeedbacks = globalFeedbacks.map((f) => {
      if (f.employeeId.toLowerCase() === targetId || (oldName && f.employeeName?.toLowerCase() === oldName.toLowerCase())) {
        return {
          ...f,
          employeeName: updated.name,
          departmentName: updated.departmentName,
        };
      }
      return f;
    });

    // Cascade update to global leave requests
    globalLeaveRequests = globalLeaveRequests.map((r) => {
      let rModified = false;
      let empName = r.employeeName;
      let deptName = r.departmentName;
      let desig = r.designation;
      let remBal = r.remainingBalance;
      let backupPerson = r.backupPersonName;
      let tlApprover = r.tlApproverName;
      let hrApprover = r.hrApproverName;

      if (r.employeeId.toLowerCase() === targetId || (oldName && r.employeeName?.toLowerCase() === oldName.toLowerCase())) {
        empName = updated.name;
        deptName = updated.departmentName;
        desig = updated.designation;
        remBal = updated.remainingLeaveBalance;
        rModified = true;
      }
      if (oldName && backupPerson?.toLowerCase() === oldName.toLowerCase()) {
        backupPerson = updated.name;
        rModified = true;
      }
      if (oldName && tlApprover && tlApprover.includes(oldName)) {
        tlApprover = tlApprover.replace(oldName, updated.name);
        rModified = true;
      }
      if (oldName && hrApprover && hrApprover.includes(oldName)) {
        hrApprover = hrApprover.replace(oldName, updated.name);
        rModified = true;
      }

      return rModified
        ? {
            ...r,
            employeeName: empName,
            departmentName: deptName,
            designation: desig,
            remainingBalance: remBal,
            backupPersonName: backupPerson,
            tlApproverName: tlApprover,
            hrApproverName: hrApprover,
          }
        : r;
    });

    // Cascade update to global WFH requests
    globalWfhRequests = globalWfhRequests.map((r) => {
      let rModified = false;
      let empName = r.employeeName;
      let deptName = r.departmentName;
      let desig = r.designation;
      let tlApprover = r.tlApproverName;
      let hrApprover = r.hrApproverName;

      if (r.employeeId.toLowerCase() === targetId || (oldName && r.employeeName?.toLowerCase() === oldName.toLowerCase())) {
        empName = updated.name;
        deptName = updated.departmentName;
        desig = updated.designation;
        rModified = true;
      }
      if (oldName && tlApprover && tlApprover.includes(oldName)) {
        tlApprover = tlApprover.replace(oldName, updated.name);
        rModified = true;
      }
      if (oldName && hrApprover && hrApprover.includes(oldName)) {
        hrApprover = hrApprover.replace(oldName, updated.name);
        rModified = true;
      }

      return rModified
        ? {
            ...r,
            employeeName: empName,
            departmentName: deptName,
            designation: desig,
            tlApproverName: tlApprover,
            hrApproverName: hrApprover,
          }
        : r;
    });

    // Cascade update to global Profile Queries
    globalProfileQueries = globalProfileQueries.map((q) => {
      if (q.employeeId.toLowerCase() === targetId || (oldName && q.employeeName?.toLowerCase() === oldName.toLowerCase())) {
        return {
          ...q,
          employeeName: updated.name,
          departmentName: updated.departmentName,
        };
      }
      return q;
    });

    // Cascade update to global Help Requests
    globalHelpRequests = globalHelpRequests.map((h) => {
      let hModified = false;
      let empName = h.employeeName;
      let leadName = h.leadName;
      if (h.employeeId.toLowerCase() === targetId || (oldName && h.employeeName?.toLowerCase() === oldName.toLowerCase())) {
        empName = updated.name;
        hModified = true;
      }
      if (oldName && leadName?.toLowerCase() === oldName.toLowerCase()) {
        leadName = updated.name;
        hModified = true;
      }
      return hModified ? { ...h, employeeName: empName, leadName } : h;
    });

    // Cascade update to global Team Presence
    globalTeamPresence = globalTeamPresence.map((p) => {
      let pModified = false;
      let pName = p.name;
      let pAvatar = p.avatar;
      let pVerifiedBy = p.verifiedBy;
      if (p.id.toLowerCase() === targetId || (oldName && p.name?.toLowerCase() === oldName.toLowerCase())) {
        pName = updated.name;
        pAvatar = newAvatar;
        pModified = true;
      }
      if (oldName && pVerifiedBy?.toLowerCase() === oldName.toLowerCase()) {
        pVerifiedBy = updated.name;
        pModified = true;
      }
      return pModified ? { ...p, name: pName, avatar: pAvatar, verifiedBy: pVerifiedBy } : p;
    });

    notify();
    try {
      realtimeEventBus.emit("employee:updated", updatedEmployee);
    } catch {
      // safe fallback
    }

    // Only sync to Supabase employees table if actual DB columns were modified
    const hasDbFieldChanges =
      updates.name !== undefined ||
      updates.email !== undefined ||
      updates.designation !== undefined ||
      updates.departmentId !== undefined ||
      updates.workMode !== undefined ||
      updates.status !== undefined ||
      updates.employmentType !== undefined ||
      updates.teamLeadId !== undefined ||
      updates.phoneNumber !== undefined ||
      updates.location !== undefined ||
      updates.workLocation !== undefined ||
      updates.remainingLeaveBalance !== undefined;

    if (hasDbFieldChanges) {
      syncEmployeeToSupabase(updated);
    }
    return updatedEmployee;
  },

  deleteEmployee: (id: string): OrgEmployee | undefined => {
    let removedEmployee: OrgEmployee | undefined = undefined;
    const targetId = String(id).trim().toLowerCase();

    // 1. Record ID in deletedEmployeeIds set permanently
    const deleted = getDeletedEmployeeIds();
    deleted.add(id);
    deleted.add(targetId);
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(STORAGE_KEYS.DELETED_EMPLOYEE_IDS, JSON.stringify(Array.from(deleted)));
    }
    serverDeletedEmployeeIds.add(id);
    serverDeletedEmployeeIds.add(targetId);

    // Find the employee before deletion
    for (const dept of globalDepartments) {
      const emp = dept.employees.find((e) => e.id.toLowerCase() === targetId || e.email.toLowerCase() === targetId);
      if (emp) {
        removedEmployee = emp;
        deleted.add(emp.email.toLowerCase());
        break;
      }
      if (dept.teamLead && (dept.teamLead.id.toLowerCase() === targetId || dept.teamLead.email.toLowerCase() === targetId)) {
        removedEmployee = {
          id: dept.teamLead.id,
          name: dept.teamLead.name,
          email: dept.teamLead.email,
          designation: dept.teamLead.designation,
          departmentId: dept.id,
          departmentName: dept.name,
          teamLeadId: "exec-root",
          teamLeadName: "Executive Leadership",
          avatar: dept.teamLead.avatar,
          workMode: "OFFICE",
          status: "Full-Time",
          sodStatus: "SUBMITTED",
          eodStatus: "SUBMITTED",
          overallProgress: 100,
          remainingLeaveBalance: 14.5,
          plannedTasks: [],
        };
        deleted.add(dept.teamLead.email.toLowerCase());
        break;
      }
    }

    // Filter out from all departments and reassign team leads if deleted
    globalDepartments = globalDepartments.map((d) => {
      const isLead = d.teamLead && (d.teamLead.id.toLowerCase() === targetId || d.teamLead.email.toLowerCase() === targetId);
      const fallbackLead = {
        id: "admin-david",
        name: "David Director",
        email: "director.test@xorstack.com",
        designation: "VP of Engineering & SuperAdmin",
        avatar: "DD",
      };
      return {
        ...d,
        teamLead: isLead ? fallbackLead : d.teamLead,
        employees: d.employees
          .filter((e) => e.id.toLowerCase() !== targetId && e.email.toLowerCase() !== targetId)
          .map((e) =>
            e.teamLeadId?.toLowerCase() === targetId
              ? { ...e, teamLeadId: "admin-david", teamLeadName: "David Director" }
              : e
          ),
      };
    });

    // Cascade remove from feedbacks, leave, wfh requests, profile queries, help requests, team presence
    globalFeedbacks = globalFeedbacks.filter((f) => f.employeeId.toLowerCase() !== targetId);
    globalLeaveRequests = globalLeaveRequests.filter((r) => r.employeeId.toLowerCase() !== targetId);
    globalWfhRequests = globalWfhRequests.filter((r) => r.employeeId.toLowerCase() !== targetId);
    globalProfileQueries = globalProfileQueries.filter((q) => q.employeeId.toLowerCase() !== targetId && q.employeeEmail?.toLowerCase() !== targetId);
    globalHelpRequests = globalHelpRequests.filter((h) => h.employeeId.toLowerCase() !== targetId && h.employeeEmail?.toLowerCase() !== targetId);
    globalTeamPresence = globalTeamPresence.filter((p) => p.id.toLowerCase() !== targetId);

    notify();
    try {
      realtimeEventBus.emit("employee:deleted", removedEmployee || { id });
    } catch {
      // safe fallback
    }
    deleteEmployeeFromSupabase(id, removedEmployee?.email);
    return removedEmployee;
  },
  getDeletedEmployeeIds: () => getDeletedEmployeeIds(),

  // Feedbacks
  getFeedbacks: () => globalFeedbacks,
  updateLeadFeedback: (feedback: {
    employeeId: string;
    employeeName: string;
    note: string;
    rating: number;
    actionItem?: string;
  }) => {
    const existingIndex = globalFeedbacks.findIndex(
      (f) => f.employeeId === feedback.employeeId && f.isToday
    );

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (existingIndex >= 0) {
      globalFeedbacks = globalFeedbacks.map((f, i) =>
        i === existingIndex
          ? {
              ...f,
              leadFeedbackNote: feedback.note,
              leadRating: feedback.rating,
              leadFeedbackTime: timeString,
              leadActionItem: feedback.actionItem || f.leadActionItem,
              leadSentiment: feedback.rating >= 5 ? "EXCELLENT" : feedback.rating >= 4 ? "GREAT" : "ON_TRACK",
            }
          : f
      );
    } else {
      const emp = ALL_XORSTACK_EMPLOYEES.find((e) => e.id === feedback.employeeId);
      const newFeedback: SharedEODFeedback = {
        id: `df-${Date.now()}`,
        employeeId: feedback.employeeId,
        employeeName: feedback.employeeName,
        departmentName: emp?.departmentName || "Development",
        date: "Today (Aug 20, 2026)",
        dayName: "Thursday",
        employeeEodSummary: "Completed assigned deliverables and logged daily workday execution.",
        tasksCompleted: "Planned deliverables completed",
        hoursLogged: 8.5,
        leadFeedbackTime: timeString,
        leadFeedbackNote: feedback.note,
        leadRating: feedback.rating,
        leadSentiment: feedback.rating >= 5 ? "EXCELLENT" : feedback.rating >= 4 ? "GREAT" : "ON_TRACK",
        leadActionItem: feedback.actionItem,
        isToday: true,
      };
      globalFeedbacks = [newFeedback, ...globalFeedbacks];
    }
    notify();
  },

  // Morning Plan & Start-of-Day (SOD) Methods
  submitEmployeeMorningPlan: (
    employeeId: string,
    tasks: Array<{
      id?: string;
      title: string;
      project?: string;
      priority?: "HIGH" | "MEDIUM" | "LOW";
      estimatedMinutes?: number;
      completionPercentage?: number;
      status?: "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED" | "BLOCKED";
      expectedOutput?: string;
    }>,
    morningNote?: string
  ) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const seenIds = new Set<string>();
    const seenKeys = new Set<string>();
    const formattedTasks: any[] = [];

    for (const t of (tasks || [])) {
      if (!t || !t.title) continue;
      const id = String(t.id || "").trim();
      const title = String(t.title || "").trim();
      const proj = String(t.project || "General").trim();
      const key = `${title.toLowerCase()}__${proj.toLowerCase()}`;

      if (id && seenIds.has(id)) continue;
      if (key && seenKeys.has(key)) continue;

      if (id) seenIds.add(id);
      if (key) seenKeys.add(key);

      const prog = Number(t.completionPercentage !== undefined ? t.completionPercentage : (t as any).progress) || 0;
      formattedTasks.push({
        id: id || `task-sod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        project: proj,
        priority: t.priority || "MEDIUM",
        estimatedMinutes: t.estimatedMinutes || 60,
        completionPercentage: prog,
        status: t.status || (prog === 100 ? "COMPLETED" : prog > 0 ? "IN_PROGRESS" : "NOT_STARTED"),
        expectedOutput: t.expectedOutput || title,
      });
    }

    const targetId = String(employeeId).trim().toLowerCase();
    let updatedEmp: OrgEmployee | undefined;

    globalDepartments = globalDepartments.map((dept) => ({
      ...dept,
      employees: dept.employees.map((emp) => {
        if (emp.id.toLowerCase() === targetId || emp.email.toLowerCase() === targetId) {
          updatedEmp = {
            ...emp,
            sodStatus: "SUBMITTED",
            sodTime: timeStr,
            sodEmployeeNote: morningNote || emp.sodEmployeeNote,
            sodVerifiedBy: undefined,
            sodVerifiedAt: undefined,
            sodLeadNote: undefined,
            eodStatus: "IN_PROGRESS",
            eodTime: undefined,
            eodVerifiedBy: undefined,
            eodVerifiedAt: undefined,
            plannedTasks: formattedTasks,
            overallProgress: 0,
          };
          return updatedEmp;
        }
        return emp;
      }),
    }));

    notify();

    // Persist to Supabase
    syncWorkdayToSupabase({
      employeeId,
      sodStatus: "SUBMITTED",
      sodTime: timeStr,
      eodStatus: "IN_PROGRESS",
      plannedTasks: formattedTasks,
      overallProgress: 0,
    });

    // Also call API endpoint for full server route logging
    if (typeof window !== "undefined") {
      fetch("/api/v1/workdays/sod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          workDate: new Date().toISOString().split("T")[0],
          tasks: formattedTasks,
        }),
      }).catch((e) => console.warn("SOD API sync error:", e));

      try {
        localStorage.setItem(`workpulse_morning_plan_submitted_${employeeId}`, JSON.stringify(true));
        localStorage.setItem(`workpulse_morning_plan_timestamp_${employeeId}`, String(Date.now()));
        localStorage.removeItem(`workpulse_evening_wrapup_submitted_${employeeId}`);
        localStorage.removeItem(`workpulse_eod_timestamp_${employeeId}`);
        
        // Save official SOD submitted tasks snapshot
        localStorage.setItem(`workpulse_sod_submitted_tasks_${employeeId}`, JSON.stringify(formattedTasks));
        if (updatedEmp?.email) {
          localStorage.setItem(`workpulse_sod_submitted_tasks_${updatedEmp.email.toLowerCase()}`, JSON.stringify(formattedTasks));
        }
        if (targetId.includes("sarah") || targetId.includes("employee.test")) {
          localStorage.setItem("workpulse_sod_submitted_tasks_emp-sarah", JSON.stringify(formattedTasks));
          localStorage.setItem("workpulse_sod_submitted_tasks_employee.test@xorstack.com", JSON.stringify(formattedTasks));
          localStorage.setItem("workpulse_sod_submitted_tasks", JSON.stringify(formattedTasks));
        }

        localStorage.setItem("workpulse_simple_tasks", JSON.stringify(formattedTasks.map(t => ({
          id: t.id,
          title: t.title,
          category: t.project,
          priority: t.priority,
          status: t.status === "COMPLETED" ? "COMPLETED" : t.status === "IN_PROGRESS" ? "IN_PROGRESS" : "NOT_STARTED",
          progress: t.completionPercentage,
          dueDate: "Today",
        }))));

        localStorage.setItem(`workpulse_simple_tasks_${employeeId}`, JSON.stringify(tasks.map((t, idx) => ({
          id: t.id || `task-${Date.now()}-${idx}`,
          title: t.title,
          category: t.project || "General",
          priority: t.priority || "MEDIUM",
          status: t.status === "COMPLETED" ? "COMPLETED" : t.status === "IN_PROGRESS" ? "IN_PROGRESS" : "NOT_STARTED",
          progress: t.completionPercentage || 0,
          dueDate: "Today",
        }))));
        if (updatedEmp?.email) {
          const emailKey = updatedEmp.email.toLowerCase();
          localStorage.removeItem(`workpulse_evening_wrapup_submitted_${emailKey}`);
          localStorage.removeItem(`workpulse_eod_timestamp_${emailKey}`);
          localStorage.setItem(`workpulse_simple_tasks_${emailKey}`, JSON.stringify(tasks.map((t, idx) => ({
            id: t.id || `task-${Date.now()}-${idx}`,
            title: t.title,
            category: t.project || "General",
            priority: t.priority || "MEDIUM",
            status: t.status === "COMPLETED" ? "COMPLETED" : t.status === "IN_PROGRESS" ? "IN_PROGRESS" : "NOT_STARTED",
            progress: t.completionPercentage || 0,
            dueDate: "Today",
          }))));
        }

        if (targetId.includes("sarah") || targetId.includes("employee.test")) {
          localStorage.removeItem("workpulse_evening_wrapup_submitted_emp-sarah");
          localStorage.removeItem("workpulse_evening_wrapup_submitted_employee.test@xorstack.com");
          localStorage.removeItem("workpulse_eod_timestamp_emp-sarah");
          localStorage.removeItem("workpulse_eod_timestamp_employee.test@xorstack.com");
        }

        const savedFeedback = JSON.parse(localStorage.getItem("workpulse_lead_daily_feedback") || "{}");
        if (savedFeedback[employeeId]) {
          savedFeedback[employeeId].sodAcknowledged = false;
          savedFeedback[employeeId].eodAcknowledged = false;
          savedFeedback[employeeId].eodSubmittedTime = undefined;
          savedFeedback[employeeId].eodTimestamp = undefined;
        }
        if (updatedEmp?.email && savedFeedback[updatedEmp.email.toLowerCase()]) {
          savedFeedback[updatedEmp.email.toLowerCase()].sodAcknowledged = false;
          savedFeedback[updatedEmp.email.toLowerCase()].eodAcknowledged = false;
          savedFeedback[updatedEmp.email.toLowerCase()].eodSubmittedTime = undefined;
          savedFeedback[updatedEmp.email.toLowerCase()].eodTimestamp = undefined;
        }
        if (targetId.includes("sarah") || targetId.includes("employee.test")) {
          if (savedFeedback["emp-sarah"]) {
            savedFeedback["emp-sarah"].sodAcknowledged = false;
            savedFeedback["emp-sarah"].eodAcknowledged = false;
            savedFeedback["emp-sarah"].eodSubmittedTime = undefined;
            savedFeedback["emp-sarah"].eodTimestamp = undefined;
          }
          if (savedFeedback["employee.test@xorstack.com"]) {
            savedFeedback["employee.test@xorstack.com"].sodAcknowledged = false;
            savedFeedback["employee.test@xorstack.com"].eodAcknowledged = false;
            savedFeedback["employee.test@xorstack.com"].eodSubmittedTime = undefined;
            savedFeedback["employee.test@xorstack.com"].eodTimestamp = undefined;
          }
        }
        localStorage.setItem("workpulse_lead_daily_feedback", JSON.stringify(savedFeedback));
        window.dispatchEvent(new CustomEvent("workpulse:lead_feedback_updated", { detail: { employeeId, type: "sod_submitted" } }));
        window.dispatchEvent(new CustomEvent("workpulse_sync"));
      } catch {}
    }

    try {
      realtimeEventBus.emit("workday:sod_submitted", { employeeId, tasks: formattedTasks, morningNote });
    } catch {}

    return updatedEmp;
  },

  leadVerifyMorningPlan: (employeeId: string, leadName: string, note?: string) => {
    const now = new Date();
    const timeStr = `Today at ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    const targetId = String(employeeId).trim().toLowerCase();
    const verifiedNote = note?.trim() || "Morning plan verified & approved by Team Lead.";

    let updatedEmp: OrgEmployee | undefined;
    globalDepartments = globalDepartments.map((dept) => ({
      ...dept,
      employees: dept.employees.map((emp) => {
        if (emp.id.toLowerCase() === targetId || emp.email.toLowerCase() === targetId) {
          updatedEmp = {
            ...emp,
            sodStatus: "VERIFIED",
            sodVerifiedBy: leadName || "Alex Lead",
            sodVerifiedAt: timeStr,
            sodLeadNote: verifiedNote,
          };
          return updatedEmp;
        }
        return emp;
      }),
    }));

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`workpulse_evening_wrapup_submitted_${employeeId}`);
        localStorage.removeItem(`workpulse_eod_timestamp_${employeeId}`);
        if (updatedEmp?.email) {
          const emailKey = updatedEmp.email.toLowerCase();
          localStorage.removeItem(`workpulse_evening_wrapup_submitted_${emailKey}`);
          localStorage.removeItem(`workpulse_eod_timestamp_${emailKey}`);
        }
        if (targetId.includes("sarah") || targetId.includes("employee.test")) {
          localStorage.removeItem("workpulse_evening_wrapup_submitted_emp-sarah");
          localStorage.removeItem("workpulse_evening_wrapup_submitted_employee.test@xorstack.com");
          localStorage.removeItem("workpulse_eod_timestamp_emp-sarah");
          localStorage.removeItem("workpulse_eod_timestamp_employee.test@xorstack.com");
        }

        const savedFeedback = JSON.parse(localStorage.getItem("workpulse_lead_daily_feedback") || "{}");
        const entry = {
          ...savedFeedback[employeeId],
          sodAcknowledged: true,
          leadName: leadName || "Alex Lead",
          sodNote: verifiedNote,
          sodTime: timeStr,
          sodTimestampMs: Date.now(),
          eodAcknowledged: false,
          eodSubmittedTime: undefined,
          eodTimestamp: undefined,
          eodReviewed: false,
        };
        savedFeedback[employeeId] = entry;
        if (updatedEmp?.email) {
          savedFeedback[updatedEmp.email.toLowerCase()] = entry;
        }
        if (targetId.includes("sarah") || targetId.includes("employee.test")) {
          savedFeedback["emp-sarah"] = entry;
          savedFeedback["employee.test@xorstack.com"] = entry;
        }
        localStorage.setItem("workpulse_lead_daily_feedback", JSON.stringify(savedFeedback));
        window.dispatchEvent(new CustomEvent("workpulse:lead_feedback_updated", { detail: { employeeId, verifiedNote, timeStr } }));
        window.dispatchEvent(new CustomEvent("workpulse_sync"));
      } catch {}
    }

    notify();

    // Persist to Supabase
    syncWorkdayToSupabase({
      employeeId,
      sodStatus: "VERIFIED",
      sodVerifiedBy: leadName || "Alex Lead",
      sodVerifiedAt: timeStr,
      sodLeadNote: verifiedNote,
    });

    try {
      realtimeEventBus.emit("workday:sod_verified", { employeeId, leadName, note: verifiedNote });
    } catch {}

    return updatedEmp;
  },

  leadRequestMorningPlanChanges: (employeeId: string, leadName: string, reason: string) => {
    const targetId = String(employeeId).trim().toLowerCase();
    let updatedEmp: OrgEmployee | undefined;

    globalDepartments = globalDepartments.map((dept) => ({
      ...dept,
      employees: dept.employees.map((emp) => {
        if (emp.id.toLowerCase() === targetId || emp.email.toLowerCase() === targetId) {
          updatedEmp = {
            ...emp,
            sodStatus: "CHANGES_REQUESTED",
            sodLeadNote: reason,
          };
          return updatedEmp;
        }
        return emp;
      }),
    }));

    notify();

    syncWorkdayToSupabase({
      employeeId,
      sodStatus: "CHANGES_REQUESTED",
      sodLeadNote: reason,
    });

    try {
      realtimeEventBus.emit("workday:sod_changes_requested", { employeeId, leadName, reason });
    } catch {}

    return updatedEmp;
  },

  assignTaskToEmployee: (
    employeeId: string,
    task: {
      id?: string;
      title: string;
      category?: string;
      project?: string;
      priority?: "HIGH" | "MEDIUM" | "LOW";
      estimatedMinutes?: number;
      assignedBy?: string;
      assignedById?: string;
      assignedAt?: string;
    }
  ) => {
    const targetId = String(employeeId).trim().toLowerCase();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const dateStr = now.toLocaleDateString([], { month: "short", day: "numeric" });
    const assignedTimestamp = task.assignedAt || `${dateStr} at ${timeStr}`;
    const taskCategory = task.category || task.project || "General";

    const newTask = {
      id: task.id || `atask-${Date.now()}`,
      title: task.title,
      project: taskCategory,
      category: taskCategory,
      priority: task.priority || "MEDIUM",
      estimatedMinutes: task.estimatedMinutes || 60,
      completionPercentage: 0,
      progress: 0,
      status: "NOT_STARTED" as const,
      expectedOutput: task.title,
      dueDate: "Today",
      assignedBy: task.assignedBy || "Alex Lead",
      assignedById: task.assignedById || "lead-alex",
      assignedAt: assignedTimestamp,
      acknowledged: false,
    };

    let updatedEmp: OrgEmployee | undefined;

    globalDepartments = globalDepartments.map((dept) => ({
      ...dept,
      employees: dept.employees.map((emp) => {
        if (emp.id.toLowerCase() === targetId || emp.email.toLowerCase() === targetId) {
          const updatedPlanned = [newTask, ...(emp.plannedTasks || [])];
          updatedEmp = {
            ...emp,
            plannedTasks: updatedPlanned,
          };
          return updatedEmp;
        }
        return emp;
      }),
    }));

    notify();

    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const simpleNew = {
          id: newTask.id,
          title: newTask.title,
          category: taskCategory,
          priority: newTask.priority,
          status: "NOT_STARTED",
          progress: 0,
          dueDate: "Today",
          assignedBy: newTask.assignedBy,
          assignedById: newTask.assignedById,
          assignedAt: newTask.assignedAt,
          acknowledged: false,
        };

        // 1. Employee-specific keys
        const empKeys = [
          `workpulse_simple_tasks_${targetId}`,
          updatedEmp?.email ? `workpulse_simple_tasks_${updatedEmp.email.toLowerCase()}` : null,
          targetId === "emp-sarah" || targetId === "employee.test@xorstack.com" ? "workpulse_simple_tasks" : null,
        ].filter(Boolean) as string[];

        empKeys.forEach((key) => {
          let currentSaved: any[] = [];
          try {
            const raw = window.localStorage.getItem(key);
            if (raw) currentSaved = JSON.parse(raw);
          } catch {}
          const filtered = (Array.isArray(currentSaved) ? currentSaved : []).filter(
            (t: any) => t.id !== simpleNew.id && String(t.title || "").toLowerCase() !== simpleNew.title.toLowerCase()
          );
          window.localStorage.setItem(key, JSON.stringify([simpleNew, ...filtered]));
        });

        // 2. Global assigned tasks log for leads
        const currentLog = JSON.parse(window.localStorage.getItem("workpulse_assigned_tasks_log") || "[]");
        const logEntry = {
          ...simpleNew,
          targetEmployeeId: updatedEmp?.id || targetId,
          targetEmployeeName: updatedEmp?.name || "Team Member",
          targetEmployeeEmail: updatedEmp?.email || "",
          targetEmployeeAvatar: updatedEmp?.avatar || "SD",
          targetEmployeeDesignation: updatedEmp?.designation || "Engineer",
        };
        window.localStorage.setItem("workpulse_assigned_tasks_log", JSON.stringify([logEntry, ...currentLog]));

        // Dispatch events
        window.dispatchEvent(
          new CustomEvent("workpulse:task_assigned", { detail: { employeeId: targetId, task: simpleNew } })
        );
        window.dispatchEvent(new CustomEvent("workpulse_sync"));
        window.dispatchEvent(new CustomEvent("workpulse:lead_feedback_updated"));
      } catch {}
    }

    try {
      realtimeEventBus.emit("workday:task_assigned", { employeeId: targetId, task: newTask });
    } catch {}

    return updatedEmp;
  },

  acknowledgeAssignedTask: (
    employeeId: string,
    taskId: string,
    note?: string
  ) => {
    const targetId = String(employeeId).trim().toLowerCase();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const dateStr = now.toLocaleDateString([], { month: "short", day: "numeric" });
    const ackTime = `${dateStr} at ${timeStr}`;
    const ackNote = note?.trim() || "Understood & accepted. Starting work on this deliverable.";

    let updatedTask: any = null;
    let empName = "Team Member";

    globalDepartments = globalDepartments.map((dept) => ({
      ...dept,
      employees: dept.employees.map((emp) => {
        if (emp.id.toLowerCase() === targetId || emp.email.toLowerCase() === targetId) {
          empName = emp.name;
          const updatedPlanned = (emp.plannedTasks || []).map((t) => {
            if (t.id === taskId) {
              updatedTask = {
                ...t,
                acknowledged: true,
                acknowledgedAt: ackTime,
                acknowledgementNote: ackNote,
                status: t.status === "NOT_STARTED" ? "IN_PROGRESS" : t.status,
                completionPercentage: t.completionPercentage > 0 ? t.completionPercentage : 20,
              };
              return updatedTask;
            }
            return t;
          });
          return {
            ...emp,
            plannedTasks: updatedPlanned,
          };
        }
        return emp;
      }),
    }));

    notify();

    if (typeof window !== "undefined" && window.localStorage) {
      try {
        // Find the employee's email for email-based key coverage
        let empEmail = "";
        for (const dept of globalDepartments) {
          for (const emp of dept.employees) {
            if (emp.id.toLowerCase() === targetId || emp.email.toLowerCase() === targetId) {
              empEmail = emp.email.toLowerCase();
              break;
            }
          }
          if (empEmail) break;
        }

        // Update employee storage keys — all possible key variants
        const keysToUpdate = [
          `workpulse_simple_tasks_${targetId}`,
          "workpulse_simple_tasks",
          empEmail ? `workpulse_simple_tasks_${empEmail}` : null,
          `workpulse_sod_submitted_tasks_${targetId}`,
          empEmail ? `workpulse_sod_submitted_tasks_${empEmail}` : null,
          targetId === "emp-sarah" || empEmail === "employee.test@xorstack.com" ? "workpulse_simple_tasks_emp-sarah" : null,
          targetId === "emp-sarah" || empEmail === "employee.test@xorstack.com" ? "workpulse_sod_submitted_tasks_emp-sarah" : null,
          targetId === "emp-sarah" || empEmail === "employee.test@xorstack.com" ? "workpulse_sod_submitted_tasks" : null,
        ].filter(Boolean) as string[];
        keysToUpdate.forEach((key) => {
          const raw = window.localStorage.getItem(key);
          if (raw) {
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                const updated = parsed.map((t: any) => {
                  if (t.id === taskId) {
                    return {
                      ...t,
                      acknowledged: true,
                      acknowledgedAt: ackTime,
                      acknowledgementNote: ackNote,
                      status: t.status === "NOT_STARTED" ? "IN_PROGRESS" : t.status,
                      progress: t.progress > 0 ? t.progress : 20,
                    };
                  }
                  return t;
                });
                window.localStorage.setItem(key, JSON.stringify(updated));
              }
            } catch {}
          }
        });

        // Update assigned tasks log
        const logRaw = window.localStorage.getItem("workpulse_assigned_tasks_log");
        if (logRaw) {
          try {
            const logParsed = JSON.parse(logRaw);
            if (Array.isArray(logParsed)) {
              const updatedLog = logParsed.map((item: any) => {
                if (item.id === taskId) {
                  return {
                    ...item,
                    acknowledged: true,
                    acknowledgedAt: ackTime,
                    acknowledgementNote: ackNote,
                    status: item.status === "NOT_STARTED" ? "IN_PROGRESS" : item.status,
                    progress: item.progress > 0 ? item.progress : 20,
                  };
                }
                return item;
              });
              window.localStorage.setItem("workpulse_assigned_tasks_log", JSON.stringify(updatedLog));
            }
          } catch {}
        }

        window.dispatchEvent(
          new CustomEvent("workpulse:task_acknowledged", {
            detail: { employeeId: targetId, employeeName: empName, taskId, note: ackNote, time: ackTime },
          })
        );
        window.dispatchEvent(new CustomEvent("workpulse_sync"));
        window.dispatchEvent(new CustomEvent("workpulse:lead_feedback_updated"));
      } catch {}
    }

    try {
      realtimeEventBus.emit("workday:task_acknowledged", {
        employeeId: targetId,
        employeeName: empName,
        taskId,
        note: ackNote,
        time: ackTime,
      });
    } catch {}

    return updatedTask;
  },

  deleteAssignedTask: (taskId: string) => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const logRaw = window.localStorage.getItem("workpulse_assigned_tasks_log");
        if (logRaw) {
          const logParsed = JSON.parse(logRaw);
          if (Array.isArray(logParsed)) {
            const updatedLog = logParsed.filter((item: any) => item.id !== taskId);
            window.localStorage.setItem("workpulse_assigned_tasks_log", JSON.stringify(updatedLog));
          }
        }
        window.dispatchEvent(new CustomEvent("workpulse_sync"));
        window.dispatchEvent(new CustomEvent("workpulse:lead_feedback_updated"));
      } catch {}
    }
  },

  // Evening Wrap-Up & End-of-Day (EOD) Methods
  submitEmployeeEveningWrapup: (
    employeeId: string,
    tasks: Array<{
      id?: string;
      title: string;
      project?: string;
      category?: string;
      priority?: "HIGH" | "MEDIUM" | "LOW";
      estimatedMinutes?: number;
      completionPercentage?: number;
      status?: "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED" | "BLOCKED";
      expectedOutput?: string;
    }>,
    summary: {
      achievements: string;
      blockers?: string;
      tomorrowFocus?: string;
    }
  ) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const timestampMs = Date.now();
    const targetId = String(employeeId).trim().toLowerCase();

    let totalProgress = 0;
    const formattedTasks = tasks.map((t, idx) => {
      const progress = Number(t.completionPercentage) || (t.status === "COMPLETED" ? 100 : 0);
      totalProgress += progress;
      return {
        id: t.id || `task-eod-${Date.now()}-${idx}`,
        title: t.title,
        project: t.project || t.category || "General",
        category: t.category || t.project || "General",
        priority: t.priority || "MEDIUM",
        estimatedMinutes: t.estimatedMinutes || 60,
        completionPercentage: progress,
        progress: progress,
        status: progress === 100 ? ("COMPLETED" as const) : progress > 0 ? ("IN_PROGRESS" as const) : ("NOT_STARTED" as const),
        expectedOutput: t.expectedOutput || t.title,
      };
    });

    const avgProgress = formattedTasks.length > 0 ? Math.round(totalProgress / formattedTasks.length) : 100;

    // Split completed vs partially completed (rollover) tasks
    const completedTasks = formattedTasks.filter((t) => t.completionPercentage === 100 || t.status === "COMPLETED");
    const rolloverTasks = formattedTasks.filter((t) => (t.completionPercentage || 0) < 100 && t.status !== "COMPLETED");

    let updatedEmp: OrgEmployee | undefined;
    globalDepartments = globalDepartments.map((dept) => ({
      ...dept,
      employees: dept.employees.map((emp) => {
        if (emp.id.toLowerCase() === targetId || emp.email.toLowerCase() === targetId) {
          updatedEmp = {
            ...emp,
            sodStatus: emp.sodStatus || "VERIFIED",
            sodTime: emp.sodTime,
            sodVerifiedBy: emp.sodVerifiedBy,
            sodVerifiedAt: emp.sodVerifiedAt,
            sodLeadNote: emp.sodLeadNote,
            eodStatus: "SUBMITTED",
            eodTime: timeStr,
            eodAchievements: summary.achievements,
            eodBlockers: summary.blockers || "None",
            eodTomorrowFocus: summary.tomorrowFocus || "",
            plannedTasks: formattedTasks,
            overallProgress: avgProgress,
            eodVerifiedBy: undefined,
            eodVerifiedAt: undefined,
          };
          return updatedEmp;
        }
        return emp;
      }),
    }));

    notify();

    // Persist to Supabase
    syncWorkdayToSupabase({
      employeeId,
      sodStatus: updatedEmp?.sodStatus || "VERIFIED",
      eodStatus: "SUBMITTED",
      eodTime: timeStr,
      achievements: summary.achievements,
      blockers: summary.blockers || "None",
      tomorrowFocus: summary.tomorrowFocus || "",
      plannedTasks: formattedTasks,
      overallProgress: avgProgress,
    });

    // Also call API endpoint
    if (typeof window !== "undefined") {
      fetch("/api/v1/workdays/eod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          achievements: summary.achievements,
          issues: summary.blockers,
          nextDayFocus: summary.tomorrowFocus,
          tasks: formattedTasks,
        }),
      }).catch((e) => console.warn("EOD API sync error:", e));

      try {
        const todayKey = new Date().toISOString().split("T")[0]; // e.g. "2026-09-02"
        localStorage.removeItem(`workpulse_morning_plan_submitted_${employeeId}`);
        // Save full submitted EOD tasks snapshot
        localStorage.setItem(`workpulse_eod_submitted_tasks_${employeeId}`, JSON.stringify(formattedTasks));
        if (updatedEmp?.email) {
          localStorage.setItem(`workpulse_eod_submitted_tasks_${updatedEmp.email.toLowerCase()}`, JSON.stringify(formattedTasks));
        }
        if (targetId.includes("sarah") || targetId.includes("employee.test")) {
          localStorage.setItem("workpulse_eod_submitted_tasks_emp-sarah", JSON.stringify(formattedTasks));
          localStorage.setItem("workpulse_eod_submitted_tasks_employee.test@xorstack.com", JSON.stringify(formattedTasks));
        }

        // Date-scoped EOD flag — automatically expires on a new day (different key)
        localStorage.setItem(`workpulse_eod_submitted_${employeeId}_${todayKey}`, "true");
        localStorage.setItem(`workpulse_eod_submitted_timestamp_${employeeId}`, String(timestampMs));
        
        // Archive completed tasks in history
        const existingHistory = JSON.parse(localStorage.getItem(`workpulse_completed_tasks_history_${employeeId}`) || "[]");
        const newHistory = [...existingHistory, ...completedTasks.map((t) => ({ ...t, completedDate: new Date().toISOString() }))];
        localStorage.setItem(`workpulse_completed_tasks_history_${employeeId}`, JSON.stringify(newHistory));

        // Keep all tasks (completed + rollover) in active task queue while EOD is pending Lead review
        localStorage.setItem(`workpulse_simple_tasks_${employeeId}`, JSON.stringify(formattedTasks.map((t) => ({
          id: t.id,
          title: t.title,
          category: t.category || t.project || "General",
          priority: t.priority || "MEDIUM",
          status: t.status === "COMPLETED" ? "COMPLETED" : (t.completionPercentage || 0) > 0 ? "IN_PROGRESS" : "NOT_STARTED",
          progress: t.completionPercentage || 0,
          dueDate: "Today",
        }))));
        localStorage.setItem("workpulse_simple_tasks", JSON.stringify(formattedTasks.map((t) => ({
          id: t.id,
          title: t.title,
          category: t.category || t.project || "General",
          priority: t.priority || "MEDIUM",
          status: t.status === "COMPLETED" ? "COMPLETED" : (t.completionPercentage || 0) > 0 ? "IN_PROGRESS" : "NOT_STARTED",
          progress: t.completionPercentage || 0,
          dueDate: "Today",
        }))));

        if (updatedEmp?.email) {
          const emailKey = updatedEmp.email.toLowerCase();
          localStorage.removeItem(`workpulse_morning_plan_submitted_${emailKey}`);
          localStorage.setItem(`workpulse_eod_submitted_${emailKey}_${todayKey}`, "true");
          localStorage.setItem(`workpulse_eod_timestamp_${emailKey}`, String(timestampMs));
          localStorage.setItem(`workpulse_simple_tasks_${emailKey}`, JSON.stringify(rolloverTasks.map((t) => ({
            id: t.id,
            title: t.title,
            category: t.category || t.project || "General",
            priority: t.priority || "MEDIUM",
            status: (t.completionPercentage || 0) > 0 ? "IN_PROGRESS" : "NOT_STARTED",
            progress: t.completionPercentage || 0,
            dueDate: "Today",
          }))));
        }

        if (targetId.includes("sarah") || targetId.includes("employee.test")) {
          localStorage.removeItem("workpulse_morning_plan_submitted_emp-sarah");
          localStorage.removeItem("workpulse_morning_plan_submitted_employee.test@xorstack.com");
          // Set date-scoped alias flags for both known sarah keys
          localStorage.setItem(`workpulse_eod_submitted_emp-sarah_${todayKey}`, "true");
          localStorage.setItem(`workpulse_eod_submitted_employee.test@xorstack.com_${todayKey}`, "true");
        }

        const savedFeedback = JSON.parse(localStorage.getItem("workpulse_lead_daily_feedback") || "{}");
        const entry = {
          ...savedFeedback[employeeId],
          sodAcknowledged: false,
          eodAcknowledged: false,
          eodReviewed: false,
          eodSubmittedTime: timeStr,
          eodTimestamp: timestampMs,
          achievements: summary.achievements,
          blockers: summary.blockers,
          tomorrowFocus: summary.tomorrowFocus,
        };
        savedFeedback[employeeId] = entry;
        if (updatedEmp?.email) {
          savedFeedback[updatedEmp.email.toLowerCase()] = entry;
        }
        if (targetId.includes("sarah") || targetId.includes("employee.test")) {
          savedFeedback["emp-sarah"] = entry;
          savedFeedback["employee.test@xorstack.com"] = entry;
        }
        localStorage.setItem("workpulse_lead_daily_feedback", JSON.stringify(savedFeedback));
        window.dispatchEvent(new CustomEvent("workpulse:lead_feedback_updated", { detail: { employeeId, type: "eod_submitted" } }));
        window.dispatchEvent(new CustomEvent("workpulse_sync"));
      } catch {}
    }

    try {
      realtimeEventBus.emit("workday:eod_submitted", { employeeId, tasks: formattedTasks, summary });
    } catch {}

    return updatedEmp;
  },

  // Reset workday for a fresh next day (resets SOD & EOD, preserves partially completed rollover tasks with exact percentage)
  startNewWorkday: (employeeId: string) => {
    const targetId = String(employeeId).trim().toLowerCase();
    let updatedEmp: OrgEmployee | undefined;
    let carriedOverTasks: any[] = [];

    globalDepartments = globalDepartments.map((dept) => ({
      ...dept,
      employees: dept.employees.map((emp) => {
        if (emp.id.toLowerCase() === targetId || emp.email.toLowerCase() === targetId) {
          // Keep only tasks that are NOT completed (< 100% and status !== COMPLETED)
          carriedOverTasks = (emp.plannedTasks || [])
            .filter((t: any) => {
              const p = Number(t.progress !== undefined ? t.progress : t.completionPercentage) || 0;
              return p < 100 && t.status !== "COMPLETED";
            })
            .map((t: any) => {
              const p = Number(t.progress !== undefined ? t.progress : t.completionPercentage) || 0;
              return {
                ...t,
                progress: p,
                completionPercentage: p,
                status: p > 0 ? ("IN_PROGRESS" as const) : ("NOT_STARTED" as const),
              };
            });

          updatedEmp = {
            ...emp,
            sodStatus: "PENDING",
            sodTime: undefined,
            sodVerifiedBy: undefined,
            sodVerifiedAt: undefined,
            sodLeadNote: undefined,
            eodStatus: "PENDING",
            eodTime: undefined,
            eodVerifiedBy: undefined,
            eodVerifiedAt: undefined,
            eodLeadRating: undefined,
            eodLeadComment: undefined,
            eodLeadActionItem: undefined,
            plannedTasks: carriedOverTasks,
            overallProgress: 0,
          };
          return updatedEmp;
        }
        return emp;
      }),
    }));

    // Persist fresh new workday reset to Supabase
    syncWorkdayToSupabase({
      employeeId,
      sodStatus: "PENDING",
      eodStatus: "PENDING",
      plannedTasks: carriedOverTasks,
      overallProgress: 0,
    });
    if (updatedEmp?.email) {
      syncWorkdayToSupabase({
        employeeId: updatedEmp.email,
        sodStatus: "PENDING",
        eodStatus: "PENDING",
        plannedTasks: carriedOverTasks,
        overallProgress: 0,
      });
    }
    if (targetId.includes("sarah") || targetId.includes("employee.test")) {
      syncWorkdayToSupabase({ employeeId: "emp-sarah", sodStatus: "PENDING", eodStatus: "PENDING", plannedTasks: carriedOverTasks, overallProgress: 0 });
      syncWorkdayToSupabase({ employeeId: "employee.test@xorstack.com", sodStatus: "PENDING", eodStatus: "PENDING", plannedTasks: carriedOverTasks, overallProgress: 0 });
    }

    if (typeof window !== "undefined") {
      fetch("/api/v1/tasks/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId }),
      }).catch(() => {});
    }

    if (typeof window !== "undefined") {
      try {
        if (carriedOverTasks.length === 0) {
          const raw =
            localStorage.getItem(`workpulse_simple_tasks_${employeeId}`) ||
            (updatedEmp?.email ? localStorage.getItem(`workpulse_simple_tasks_${updatedEmp.email.toLowerCase()}`) : null) ||
            localStorage.getItem(`workpulse_sod_submitted_tasks_${employeeId}`) ||
            localStorage.getItem("workpulse_simple_tasks");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
              carriedOverTasks = parsed
                .filter((t: any) => {
                  const p = Number(t.progress !== undefined ? t.progress : t.completionPercentage) || 0;
                  return p < 100 && t.status !== "COMPLETED";
                })
                .map((t: any) => {
                  const p = Number(t.progress !== undefined ? t.progress : t.completionPercentage) || 0;
                  return {
                    ...t,
                    progress: p,
                    completionPercentage: p,
                    status: p > 0 ? "IN_PROGRESS" : "NOT_STARTED",
                  };
                });
            }
          }
        }

        const todayKey = new Date().toISOString().split("T")[0];
        localStorage.removeItem(`workpulse_morning_plan_submitted_${employeeId}`);
        localStorage.removeItem(`workpulse_evening_wrapup_submitted_${employeeId}`);
        localStorage.removeItem(`workpulse_eod_timestamp_${employeeId}`);
        localStorage.removeItem(`workpulse_eod_approved_timestamp_${employeeId}`);
        localStorage.removeItem(`workpulse_eod_submitted_timestamp_${employeeId}`);
        localStorage.removeItem(`workpulse_sod_submitted_tasks_${employeeId}`);
        localStorage.removeItem(`workpulse_eod_submitted_tasks_${employeeId}`);
        localStorage.removeItem(`workpulse_eod_submitted_${employeeId}_${todayKey}`);

        // Update active tasks with only carried-over pending tasks with exact percentage
        const simpleRollover = carriedOverTasks.map((t) => ({
          id: t.id,
          title: t.title,
          category: t.category || t.project || "General",
          priority: t.priority || "MEDIUM",
          status: (t.progress || 0) > 0 ? "IN_PROGRESS" : "NOT_STARTED",
          progress: t.progress || 0,
          completionPercentage: t.progress || 0,
          dueDate: "Today",
        }));

        localStorage.setItem(`workpulse_simple_tasks_${employeeId}`, JSON.stringify(simpleRollover));
        if (updatedEmp?.email) {
          const emailKey = updatedEmp.email.toLowerCase();
          localStorage.removeItem(`workpulse_morning_plan_submitted_${emailKey}`);
          localStorage.removeItem(`workpulse_evening_wrapup_submitted_${emailKey}`);
          localStorage.removeItem(`workpulse_eod_timestamp_${emailKey}`);
          localStorage.removeItem(`workpulse_eod_approved_timestamp_${emailKey}`);
          localStorage.removeItem(`workpulse_eod_submitted_timestamp_${emailKey}`);
          localStorage.removeItem(`workpulse_sod_submitted_tasks_${emailKey}`);
          localStorage.removeItem(`workpulse_eod_submitted_tasks_${emailKey}`);
          localStorage.removeItem(`workpulse_eod_submitted_${emailKey}_${todayKey}`);
          localStorage.setItem(`workpulse_simple_tasks_${emailKey}`, JSON.stringify(simpleRollover));
        }
        if (targetId.includes("sarah") || targetId.includes("employee.test")) {
          localStorage.removeItem("workpulse_morning_plan_submitted_emp-sarah");
          localStorage.removeItem("workpulse_evening_wrapup_submitted_emp-sarah");
          localStorage.removeItem("workpulse_eod_timestamp_emp-sarah");
          localStorage.removeItem("workpulse_eod_approved_timestamp_emp-sarah");
          localStorage.removeItem("workpulse_eod_submitted_timestamp_emp-sarah");
          localStorage.removeItem("workpulse_morning_plan_submitted_employee.test@xorstack.com");
          localStorage.removeItem("workpulse_evening_wrapup_submitted_employee.test@xorstack.com");
          localStorage.removeItem("workpulse_eod_timestamp_employee.test@xorstack.com");
          localStorage.removeItem("workpulse_eod_approved_timestamp_employee.test@xorstack.com");
          localStorage.removeItem("workpulse_eod_submitted_timestamp_employee.test@xorstack.com");
          localStorage.removeItem("workpulse_sod_submitted_tasks_emp-sarah");
          localStorage.removeItem("workpulse_sod_submitted_tasks_employee.test@xorstack.com");
          localStorage.removeItem("workpulse_sod_submitted_tasks");
          localStorage.removeItem("workpulse_eod_submitted_tasks_emp-sarah");
          localStorage.removeItem("workpulse_eod_submitted_tasks_employee.test@xorstack.com");
          localStorage.removeItem(`workpulse_eod_submitted_emp-sarah_${todayKey}`);
          localStorage.removeItem(`workpulse_eod_submitted_employee.test@xorstack.com_${todayKey}`);
          localStorage.setItem("workpulse_simple_tasks", JSON.stringify(simpleRollover));
        }

        const savedFeedback = JSON.parse(localStorage.getItem("workpulse_lead_daily_feedback") || "{}");
        const resetFeedbackEntry = (k: string) => {
          if (savedFeedback[k]) {
            savedFeedback[k].sodAcknowledged = false;
            savedFeedback[k].eodAcknowledged = false;
            savedFeedback[k].eodReviewed = false;
            savedFeedback[k].eodSubmittedTime = undefined;
            savedFeedback[k].eodTimestamp = undefined;
            savedFeedback[k].eodApprovedTimestamp = undefined;
            savedFeedback[k].sodTime = undefined;
            savedFeedback[k].sodNote = undefined;
          }
        };
        resetFeedbackEntry(employeeId);
        if (updatedEmp?.email) resetFeedbackEntry(updatedEmp.email.toLowerCase());
        if (targetId.includes("sarah") || targetId.includes("employee.test")) {
          resetFeedbackEntry("emp-sarah");
          resetFeedbackEntry("employee.test@xorstack.com");
        }
        localStorage.setItem("workpulse_lead_daily_feedback", JSON.stringify(savedFeedback));
        window.dispatchEvent(new CustomEvent("workpulse:lead_feedback_updated", { detail: { employeeId, type: "new_workday" } }));
        window.dispatchEvent(new CustomEvent("workpulse:tasks_changed", { detail: { employeeId, tasks: simpleRollover } }));
        window.dispatchEvent(new CustomEvent("workpulse_sync"));
      } catch {}
    }

    notify();
    return updatedEmp;
  },

  // Permanently delete / reset Start of Day submission and tasks
  deleteSOD: (employeeId: string, _workDate?: string) => {
    const targetId = String(employeeId).trim().toLowerCase();
    let updatedEmp: OrgEmployee | undefined;

    globalDepartments = globalDepartments.map((dept) => ({
      ...dept,
      employees: dept.employees.map((emp) => {
        if (emp.id.toLowerCase() === targetId || emp.email.toLowerCase() === targetId) {
          updatedEmp = {
            ...emp,
            sodStatus: "PENDING",
            sodTime: undefined,
            sodVerifiedBy: undefined,
            sodVerifiedAt: undefined,
            sodLeadNote: undefined,
            plannedTasks: [],
            overallProgress: 0,
          };
          return updatedEmp;
        }
        return emp;
      }),
    }));

    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`workpulse_morning_plan_submitted_${employeeId}`);
        localStorage.removeItem(`workpulse_morning_plan_timestamp_${employeeId}`);
        localStorage.removeItem(`workpulse_simple_tasks_${employeeId}`);
        localStorage.removeItem("workpulse_simple_tasks");
        localStorage.removeItem(`workpulse_sod_submitted_tasks_${employeeId}`);
        if (updatedEmp?.email) {
          const emailKey = updatedEmp.email.toLowerCase();
          localStorage.removeItem(`workpulse_morning_plan_submitted_${emailKey}`);
          localStorage.removeItem(`workpulse_morning_plan_timestamp_${emailKey}`);
          localStorage.removeItem(`workpulse_simple_tasks_${emailKey}`);
          localStorage.removeItem(`workpulse_sod_submitted_tasks_${emailKey}`);
        }
        if (targetId.includes("sarah") || targetId.includes("employee.test")) {
          localStorage.removeItem("workpulse_morning_plan_submitted_emp-sarah");
          localStorage.removeItem("workpulse_morning_plan_submitted_employee.test@xorstack.com");
          localStorage.removeItem("workpulse_morning_plan_timestamp_emp-sarah");
          localStorage.removeItem("workpulse_morning_plan_timestamp_employee.test@xorstack.com");
          localStorage.removeItem("workpulse_sod_submitted_tasks_emp-sarah");
          localStorage.removeItem("workpulse_sod_submitted_tasks_employee.test@xorstack.com");
          localStorage.removeItem("workpulse_sod_submitted_tasks");
        }
        fetch("/api/v1/workdays/sod", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employeeId }),
        }).catch(() => {});
        fetch("/api/v1/supabase/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete_sod", employeeId }),
        }).catch(() => {});
        window.dispatchEvent(new CustomEvent("workpulse_sync"));
      } catch {}
    }

    notify();
    try {
      realtimeEventBus.emit("workday:sod_deleted", { employeeId });
    } catch {}
    return updatedEmp;
  },

  // Permanently delete / reset End of Day wrapup
  deleteEOD: (employeeId: string, _workDate?: string) => {
    const targetId = String(employeeId).trim().toLowerCase();
    let updatedEmp: OrgEmployee | undefined;

    globalDepartments = globalDepartments.map((dept) => ({
      ...dept,
      employees: dept.employees.map((emp) => {
        if (emp.id.toLowerCase() === targetId || emp.email.toLowerCase() === targetId) {
          updatedEmp = {
            ...emp,
            eodStatus: "PENDING",
            eodTime: undefined,
            eodVerifiedBy: undefined,
            eodVerifiedAt: undefined,
            eodLeadRating: undefined,
            eodLeadComment: undefined,
            eodLeadActionItem: undefined,
          };
          return updatedEmp;
        }
        return emp;
      }),
    }));

    if (typeof window !== "undefined") {
      try {
        const todayKey = new Date().toISOString().split("T")[0];
        localStorage.removeItem(`workpulse_eod_submitted_${employeeId}_${todayKey}`);
        localStorage.removeItem(`workpulse_eod_timestamp_${employeeId}`);
        localStorage.removeItem(`workpulse_eod_submitted_tasks_${employeeId}`);
        localStorage.removeItem(`workpulse_evening_wrapup_submitted_${employeeId}`);
        if (updatedEmp?.email) {
          const emailKey = updatedEmp.email.toLowerCase();
          localStorage.removeItem(`workpulse_eod_submitted_${emailKey}_${todayKey}`);
          localStorage.removeItem(`workpulse_eod_timestamp_${emailKey}`);
          localStorage.removeItem(`workpulse_eod_submitted_tasks_${emailKey}`);
          localStorage.removeItem(`workpulse_evening_wrapup_submitted_${emailKey}`);
        }
        if (targetId.includes("sarah") || targetId.includes("employee.test")) {
          localStorage.removeItem(`workpulse_eod_submitted_emp-sarah_${todayKey}`);
          localStorage.removeItem(`workpulse_eod_submitted_employee.test@xorstack.com_${todayKey}`);
          localStorage.removeItem("workpulse_eod_timestamp_emp-sarah");
          localStorage.removeItem("workpulse_eod_timestamp_employee.test@xorstack.com");
          localStorage.removeItem("workpulse_evening_wrapup_submitted_emp-sarah");
          localStorage.removeItem("workpulse_evening_wrapup_submitted_employee.test@xorstack.com");
        }
        fetch("/api/v1/workdays/eod", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ employeeId }),
        }).catch(() => {});
        fetch("/api/v1/supabase/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete_eod", employeeId }),
        }).catch(() => {});
        window.dispatchEvent(new CustomEvent("workpulse_sync"));
      } catch {}
    }

    notify();
    try {
      realtimeEventBus.emit("workday:eod_deleted", { employeeId });
    } catch {}
    return updatedEmp;
  },


  leadVerifyEveningWrapup: (
    employeeId: string,
    leadName: string,
    feedback: {
      rating: number;
      comment: string;
      actionItem?: string;
    }
  ) => {
    const now = new Date();
    const timeStr = `Today at ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    const targetId = String(employeeId).trim().toLowerCase();

    let updatedEmp: OrgEmployee | undefined;
    globalDepartments = globalDepartments.map((dept) => ({
      ...dept,
      employees: dept.employees.map((emp) => {
        if (emp.id.toLowerCase() === targetId || emp.email.toLowerCase() === targetId) {
          updatedEmp = {
            ...emp,
            eodStatus: "VERIFIED",
            eodVerifiedBy: leadName || "Alex Lead",
            eodVerifiedAt: timeStr,
            eodLeadRating: feedback.rating,
            eodLeadComment: feedback.comment,
            eodLeadActionItem: feedback.actionItem || "Present highlights in tomorrow's sync.",
          };
          return updatedEmp;
        }
        return emp;
      }),
    }));

    // Cascade update to global feedbacks
    WorkpulseSharedStore.updateLeadFeedback({
      employeeId,
      employeeName: updatedEmp?.name || "Employee",
      note: feedback.comment,
      rating: feedback.rating,
      actionItem: feedback.actionItem,
    });

    notify();

    // Persist to Supabase
    syncWorkdayToSupabase({
      employeeId,
      eodStatus: "VERIFIED",
      eodVerifiedBy: leadName || "Alex Lead",
      eodVerifiedAt: timeStr,
      eodLeadRating: feedback.rating,
      eodLeadComment: feedback.comment,
      eodLeadActionItem: feedback.actionItem,
    });

    if (typeof window !== "undefined") {
      try {
        const approvedTs = Date.now();
        localStorage.setItem(`workpulse_eod_approved_timestamp_${employeeId}`, String(approvedTs));
        localStorage.setItem(`workpulse_eod_timestamp_${employeeId}`, String(approvedTs));
        if (updatedEmp?.email) {
          localStorage.setItem(`workpulse_eod_approved_timestamp_${updatedEmp.email.toLowerCase()}`, String(approvedTs));
          localStorage.setItem(`workpulse_eod_timestamp_${updatedEmp.email.toLowerCase()}`, String(approvedTs));
        }
        if (targetId.includes("sarah") || targetId.includes("employee.test")) {
          localStorage.setItem("workpulse_eod_approved_timestamp_emp-sarah", String(approvedTs));
          localStorage.setItem("workpulse_eod_approved_timestamp_employee.test@xorstack.com", String(approvedTs));
          localStorage.setItem("workpulse_eod_timestamp_emp-sarah", String(approvedTs));
          localStorage.setItem("workpulse_eod_timestamp_employee.test@xorstack.com", String(approvedTs));
        }

        const savedFeedback = JSON.parse(localStorage.getItem("workpulse_lead_daily_feedback") || "{}");
        const entry = {
          ...savedFeedback[employeeId],
          eodAcknowledged: true,
          eodReviewed: true,
          rating: feedback.rating,
          eodLeadRating: feedback.rating,
          eodLeadComment: feedback.comment,
          eodComment: feedback.comment,
          actionItem: feedback.actionItem,
          eodLeadActionItem: feedback.actionItem,
          eodTime: timeStr,
          eodVerifiedBy: leadName || "Alex Lead",
          eodApprovedTimestamp: approvedTs,
          eodTimestamp: approvedTs,
        };
        savedFeedback[employeeId] = entry;
        if (updatedEmp?.email) {
          savedFeedback[updatedEmp.email.toLowerCase()] = entry;
        }
        if (targetId.includes("sarah") || targetId.includes("employee.test")) {
          savedFeedback["emp-sarah"] = entry;
          savedFeedback["employee.test@xorstack.com"] = entry;
        }
        localStorage.setItem("workpulse_lead_daily_feedback", JSON.stringify(savedFeedback));
        window.dispatchEvent(new CustomEvent("workpulse:lead_feedback_updated", { detail: { employeeId, type: "eod_verified", eodApprovedTimestamp: approvedTs } }));
      } catch {}
    }

    try {
      realtimeEventBus.emit("workday:eod_verified", { employeeId, leadName, feedback });
    } catch {}

    return updatedEmp;
  },

  // Leave Requests
  getLeaveRequests: () => {
    return globalLeaveRequests;
  },
  isSupabaseSyncedLeave: () => supabaseSyncedLeave,
  setLeaveRequestsFromSupabase: (requests: SharedLeaveRequest[]) => {
    if (Array.isArray(requests)) {
      supabaseSyncedLeave = true; // Mark Supabase as authoritative for leave data
      const deletedIds = getDeletedLeaveIds();
      // Supabase is authoritative. Only preserve active optimistic requests from the current session that have _isOptimistic === true and are not yet in requests.
      const pendingOptimistic = globalLeaveRequests.filter(
        (localReq) =>
          localReq._isOptimistic &&
          !deletedIds.has(localReq.id) &&
          !requests.some((r) => r.id === localReq.id)
      );
      globalLeaveRequests = [...pendingOptimistic, ...requests].filter((r) => !deletedIds.has(r.id));
      saveToStorage(STORAGE_KEYS.LEAVE, globalLeaveRequests);
      notify();
    }
  },
  tlApproveLeave: (requestId: string, comment?: string, leadName?: string) => {
    let updatedReq: SharedLeaveRequest | undefined;
    globalLeaveRequests = globalLeaveRequests.map((req) => {
      if (req.id === requestId) {
        updatedReq = {
          ...req,
          status: "FORWARDED_TO_HR",
          tlApproverName: leadName || "Alex Lead (Team Lead)",
          tlApprovedAt: `Today at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          tlComment: comment || "Approved by Team Lead. Forwarded to HR for final sign-off.",
        };
        return updatedReq;
      }
      return req;
    });
    saveToStorage(STORAGE_KEYS.LEAVE, globalLeaveRequests);
    notify();
    if (updatedReq) syncLeaveRequestToSupabase(updatedReq);
    try {
      realtimeEventBus.emit("leave:approved", { id: requestId, stage: "STAGE_1", comment });
    } catch {
      // safe fallback
    }
  },
  tlRejectLeave: (requestId: string, reason: string) => {
    let updatedReq: SharedLeaveRequest | undefined;
    globalLeaveRequests = globalLeaveRequests.map((req) => {
      if (req.id === requestId) {
        updatedReq = {
          ...req,
          status: "REJECTED",
          rejectionReason: reason || "Rejected by Team Lead",
        };
        return updatedReq;
      }
      return req;
    });
    saveToStorage(STORAGE_KEYS.LEAVE, globalLeaveRequests);
    notify();
    if (updatedReq) syncLeaveRequestToSupabase(updatedReq);
    try {
      realtimeEventBus.emit("leave:rejected", { id: requestId, stage: "STAGE_1", reason });
    } catch {
      // safe fallback
    }
  },
  hrApproveLeave: (requestId: string, comment?: string) => {
    let affectedEmployeeId: string | undefined;
    let daysDeducted = 1.0;
    let updatedReq: SharedLeaveRequest | undefined;

    globalLeaveRequests = globalLeaveRequests.map((req) => {
      if (req.id === requestId) {
        affectedEmployeeId = req.employeeId;
        daysDeducted = req.daysCount || 1.0;
        const newBalance = Math.max(0, req.remainingBalance - daysDeducted);
        updatedReq = {
          ...req,
          status: "APPROVED",
          hrApproverName: "Rachel HR (People Ops Lead)",
          hrApprovedAt: `Today at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          hrComment: comment || "Final HR Approval granted.",
          remainingBalance: newBalance,
        };
        return updatedReq;
      }
      return req;
    });

    if (affectedEmployeeId) {
      // 1. Update in-memory employee leave balance
      globalDepartments = globalDepartments.map((dept) => ({
        ...dept,
        employees: dept.employees.map((emp) =>
          emp.id === affectedEmployeeId
            ? {
                ...emp,
                remainingLeaveBalance: Math.max(0, emp.remainingLeaveBalance - daysDeducted),
              }
            : emp
        ),
      }));

      // 2. Persist updated leave balance to Supabase
      if (typeof window !== "undefined") {
        const emp = WorkpulseSharedStore.getEmployeeById(affectedEmployeeId);
        if (emp) {
          fetch(`/api/v1/employees/${emp.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ remainingLeaveBalance: emp.remainingLeaveBalance }),
          }).catch((err) => console.warn("Supabase leave balance sync error:", err));
        }
      }
    }

    saveToStorage(STORAGE_KEYS.LEAVE, globalLeaveRequests);
    notify();
    if (updatedReq) syncLeaveRequestToSupabase(updatedReq);
    try {
      realtimeEventBus.emit("leave:approved", { id: requestId, stage: "STAGE_2", comment });
    } catch {
      // safe fallback
    }
  },
  hrRejectLeave: (requestId: string, reason: string) => {
    let updatedReq: SharedLeaveRequest | undefined;
    globalLeaveRequests = globalLeaveRequests.map((req) => {
      if (req.id === requestId) {
        updatedReq = {
          ...req,
          status: "REJECTED",
          rejectionReason: reason || "Rejected by HR",
        };
        return updatedReq;
      }
      return req;
    });
    saveToStorage(STORAGE_KEYS.LEAVE, globalLeaveRequests);
    notify();
    if (updatedReq) syncLeaveRequestToSupabase(updatedReq);
  },

  addLeaveRequest: (req: {
    id?: string;
    employeeId?: string;
    employeeName?: string;
    departmentId?: string;
    departmentName?: string;
    designation?: string;
    leaveType: "CASUAL" | "SICK" | "PRIVILEGE" | "UNPAID";
    startDate: string;
    endDate: string;
    daysCount?: number;
    reason: string;
    handoverNotes?: string;
    backupPersonName?: string;
  }) => {
    const daysCount = req.daysCount ?? 1.0;
    const newReq: SharedLeaveRequest = {
      id: req.id || `leave-req-v2-${Date.now()}`,
      employeeId: req.employeeId || "emp-sarah",
      employeeName: req.employeeName || "Sarah Dev",
      departmentId: req.departmentId || "dept-development",
      departmentName: req.departmentName || "Development",
      designation: req.designation || "Senior Backend Engineer",
      leaveType: req.leaveType,
      startDate: req.startDate,
      endDate: req.endDate,
      daysCount,
      reason: req.reason,
      handoverNotes: req.handoverNotes || "Tasks reassigned to backup engineer.",
      backupPersonName: req.backupPersonName || "Rohit Sharma (Frontend)",
      remainingBalance: 11.0,
      status: "PENDING_TL_STAGE_1",
      createdAt: new Date().toISOString(),
      _isOptimistic: true,
    };
    globalLeaveRequests = [newReq, ...globalLeaveRequests];
    saveToStorage(STORAGE_KEYS.LEAVE, globalLeaveRequests);
    notify();
    try {
      realtimeEventBus.emit("leave:created", { id: newReq.id });
    } catch {}
    syncLeaveRequestToSupabase(newReq);
    return newReq;
  },

  deleteLeaveRequest: (requestId: string) => {
    serverDeletedLeaveIds.add(requestId);
    const target = globalLeaveRequests.find((r) => r.id === requestId);
    if (target) {
      const duplicates = globalLeaveRequests.filter(
        (r) =>
          r.employeeId === target.employeeId &&
          r.startDate === target.startDate &&
          (r.reason || "") === (target.reason || "")
      );
      duplicates.forEach((d) => serverDeletedLeaveIds.add(d.id));
      globalLeaveRequests = globalLeaveRequests.filter(
        (req) =>
          req.id !== requestId &&
          !(
            req.employeeId === target.employeeId &&
            req.startDate === target.startDate &&
            (req.reason || "") === (target.reason || "")
          )
      );
    } else {
      globalLeaveRequests = globalLeaveRequests.filter((req) => req.id !== requestId);
    }

    if (typeof window !== "undefined") {
      try {
        const deleted = Array.from(getDeletedLeaveIds());
        if (!deleted.includes(requestId)) {
          deleted.push(requestId);
        }
        if (target) {
          const duplicates = (loadFromStorage<SharedLeaveRequest[]>(STORAGE_KEYS.LEAVE, []) || []).filter(
            (r) =>
              r.employeeId === target.employeeId &&
              r.startDate === target.startDate &&
              (r.reason || "") === (target.reason || "")
          );
          duplicates.forEach((d) => {
            if (!deleted.includes(d.id)) deleted.push(d.id);
          });
        }
        window.localStorage.setItem(STORAGE_KEYS.DELETED_LEAVE_IDS, JSON.stringify(deleted));
        saveToStorage(STORAGE_KEYS.LEAVE, globalLeaveRequests);
      } catch {}

      // Trigger Server-Side Admin Supabase Deletion
      fetch("/api/v1/supabase/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          table: "leave_requests",
          id: requestId,
          employeeId: target?.employeeId,
          startDate: target?.startDate,
        }),
      }).catch(() => {});

      fetch(`/api/v1/leave/${requestId}`, { method: "DELETE" }).catch(() => {});
      fetch(`/api/v1/leave-requests/${requestId}`, { method: "DELETE" }).catch(() => {});
    }
    notify();
    try {
      realtimeEventBus.emit("leave:deleted", { id: requestId });
    } catch {}
  },

  removeLeaveRequestFromRealtime: (requestId: string) => {
    serverDeletedLeaveIds.add(requestId);
    globalLeaveRequests = globalLeaveRequests.filter((req) => req.id !== requestId);
    if (typeof window !== "undefined") {
      try {
        const deleted = Array.from(getDeletedLeaveIds());
        if (!deleted.includes(requestId)) deleted.push(requestId);
        window.localStorage.setItem(STORAGE_KEYS.DELETED_LEAVE_IDS, JSON.stringify(deleted));
        saveToStorage(STORAGE_KEYS.LEAVE, globalLeaveRequests);
      } catch {}
    }
    notify();
    try {
      realtimeEventBus.emit("leave:deleted", { id: requestId });
    } catch {}
  },

  addWfhRequest: (req: {
    id?: string;
    employeeId?: string;
    employeeName?: string;
    departmentId?: string;
    departmentName?: string;
    designation?: string;
    startDate: string;
    endDate?: string;
    daysCount?: number;
    reason: string;
    availabilityHours?: string;
    contactMethod?: string;
    plannedDeliverables?: string;
  }) => {
    const newReq: SharedWfhRequest = {
      id: req.id || `wfh-req-v2-${Date.now()}`,
      employeeId: req.employeeId || "emp-sarah",
      employeeName: req.employeeName || "Sarah Dev",
      departmentId: req.departmentId || "dept-development",
      departmentName: req.departmentName || "Development",
      designation: req.designation || "Senior Backend Engineer",
      startDate: req.startDate,
      endDate: req.endDate || req.startDate,
      daysCount: req.daysCount ?? 1.0,
      reason: req.reason,
      availabilityHours: req.availabilityHours || "10:00 AM – 07:00 PM",
      contactMethod: req.contactMethod || "Slack & Zoom",
      plannedDeliverables: req.plannedDeliverables || "Complete assigned sprint tasks",
      status: "PENDING_TL_STAGE_1",
      createdAt: new Date().toISOString(),
      _isOptimistic: true,
    };

    globalWfhRequests = [newReq, ...globalWfhRequests];
    saveToStorage(STORAGE_KEYS.WFH, globalWfhRequests);
    notify();
    try {
      realtimeEventBus.emit("wfh:created", { id: newReq.id });
    } catch {}

    syncWfhRequestToSupabase(newReq);
    return newReq;
  },

  deleteWfhRequest: (requestId: string) => {
    globalWfhRequests = globalWfhRequests.filter((req) => req.id !== requestId);
    saveToStorage(STORAGE_KEYS.WFH, globalWfhRequests);
    notify();
    try {
      realtimeEventBus.emit("wfh:deleted", { id: requestId });
    } catch {}

    if (typeof window !== "undefined") {
      fetch("/api/v1/supabase/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          table: "wfh_requests",
          id: requestId,
        }),
      }).catch(() => {});
      fetch(`/api/v1/leave/wfh/${requestId}`, { method: "DELETE" }).catch(() => {});
    }
  },

  removeWfhRequestFromRealtime: (requestId: string) => {
    globalWfhRequests = globalWfhRequests.filter((req) => req.id !== requestId);
    saveToStorage(STORAGE_KEYS.WFH, globalWfhRequests);
    notify();
    try {
      realtimeEventBus.emit("wfh:deleted", { id: requestId });
    } catch {}
  },

  // WFH Requests
  getWfhRequests: () => {
    return globalWfhRequests;
  },
  isSupabaseSyncedWfh: () => supabaseSyncedWfh,
  setWfhRequestsFromSupabase: (requests: SharedWfhRequest[]) => {
    if (Array.isArray(requests)) {
      supabaseSyncedWfh = true; // Mark Supabase as authoritative for WFH data
      // Supabase is authoritative. Only preserve active optimistic requests from the current session that have _isOptimistic === true and are not yet in requests.
      const pendingOptimistic = globalWfhRequests.filter(
        (localReq) =>
          localReq._isOptimistic &&
          !requests.some((r) => r.id === localReq.id)
      );
      globalWfhRequests = [...pendingOptimistic, ...requests];
      saveToStorage(STORAGE_KEYS.WFH, globalWfhRequests);
      notify();
    }
  },
  tlApproveWfh: (requestId: string, comment?: string, leadName?: string) => {
    const req = globalWfhRequests.find((r) => r.id === requestId);
    if (!req) return;

    const updatedReq: SharedWfhRequest = {
      ...req,
      status: "FORWARDED_TO_HR",
      tlApproverName: leadName || "Alex Lead (Team Lead)",
      tlApprovedAt: `Today at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      tlComment: comment || "Approved by Team Lead. Forwarded to HR for final sign-off.",
    };

    globalWfhRequests = globalWfhRequests.map((r) => (r.id === requestId ? updatedReq : r));
    saveToStorage(STORAGE_KEYS.WFH, globalWfhRequests);
    notify();
    syncWfhRequestToSupabase(updatedReq);
    try {
      realtimeEventBus.emit("wfh:approved", { id: requestId, stage: "STAGE_1", comment });
    } catch {}

    if (typeof window !== "undefined") {
      fetch(`/api/v1/leave/wfh/${requestId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tlComment: updatedReq.tlComment, tlApproverName: updatedReq.tlApproverName }),
      }).catch(() => {});
    }
  },
  tlRejectWfh: (requestId: string, reason: string) => {
    const req = globalWfhRequests.find((r) => r.id === requestId);
    if (!req) return;

    const updatedReq: SharedWfhRequest = {
      ...req,
      status: "REJECTED",
      rejectionReason: reason || "Rejected by Team Lead",
    };

    globalWfhRequests = globalWfhRequests.map((r) => (r.id === requestId ? updatedReq : r));
    saveToStorage(STORAGE_KEYS.WFH, globalWfhRequests);
    notify();
    syncWfhRequestToSupabase(updatedReq);
    try {
      realtimeEventBus.emit("wfh:rejected", { id: requestId, stage: "STAGE_1", reason });
    } catch {}

    if (typeof window !== "undefined") {
      fetch(`/api/v1/leave/wfh/${requestId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason: updatedReq.rejectionReason }),
      }).catch(() => {});
    }
  },
  hrApproveWfh: (requestId: string, comment?: string) => {
    const req = globalWfhRequests.find((r) => r.id === requestId);
    if (!req) return;

    const updatedReq: SharedWfhRequest = {
      ...req,
      status: "APPROVED",
      hrApproverName: "Rachel HR (People Ops Lead)",
      hrApprovedAt: `Today at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      hrComment: comment || "Final HR Approval granted for remote workday.",
    };

    globalWfhRequests = globalWfhRequests.map((r) => (r.id === requestId ? updatedReq : r));
    saveToStorage(STORAGE_KEYS.WFH, globalWfhRequests);
    notify();
    syncWfhRequestToSupabase(updatedReq);
    try {
      realtimeEventBus.emit("wfh:approved", { id: requestId, stage: "STAGE_2", comment });
    } catch {}

    if (typeof window !== "undefined") {
      fetch(`/api/v1/leave/wfh/${requestId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hrComment: updatedReq.hrComment, hrApproverName: updatedReq.hrApproverName }),
      }).catch(() => {});
    }
  },
  hrRejectWfh: (requestId: string, reason: string) => {
    const req = globalWfhRequests.find((r) => r.id === requestId);
    if (!req) return;

    const updatedReq: SharedWfhRequest = {
      ...req,
      status: "REJECTED",
      rejectionReason: reason || "Rejected by HR",
    };

    globalWfhRequests = globalWfhRequests.map((r) => (r.id === requestId ? updatedReq : r));
    saveToStorage(STORAGE_KEYS.WFH, globalWfhRequests);
    notify();
    syncWfhRequestToSupabase(updatedReq);
    try {
      realtimeEventBus.emit("wfh:rejected", { id: requestId, stage: "STAGE_2", reason });
    } catch {}

    if (typeof window !== "undefined") {
      fetch(`/api/v1/leave/wfh/${requestId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejectionReason: updatedReq.rejectionReason }),
      }).catch(() => {});
    }
  },

  // Profile Change Queries
  getProfileQueries: () => globalProfileQueries,
  submitProfileQuery: (query: {
    employeeId: string;
    employeeName: string;
    employeeEmail: string;
    departmentName?: string;
    category: string;
    requestedChange: string;
    reason?: string;
  }) => {
    const newTicketNum = `HR-REQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const newQuery: SharedProfileQuery = {
      id: `qry-${Date.now()}`,
      ticketNumber: newTicketNum,
      employeeId: query.employeeId,
      employeeName: query.employeeName,
      employeeEmail: query.employeeEmail,
      departmentName: query.departmentName || "Development",
      category: query.category,
      requestedChange: query.requestedChange,
      reason: query.reason || "Profile record update request.",
      status: "PENDING_HR_REVIEW",
      submittedAt: `Today at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    };
    globalProfileQueries = [newQuery, ...globalProfileQueries];
    notify();
    try {
      realtimeEventBus.emit("profile:query_submitted", newQuery);
    } catch {
      // safe fallback
    }
    return newQuery;
  },
  hrApproveProfileQuery: (queryId: string, remarks?: string) => {
    let affectedQuery: SharedProfileQuery | undefined;
    const targetId = String(queryId).trim().toLowerCase();
    globalProfileQueries = globalProfileQueries.map((q) => {
      if (q.id.toLowerCase() === targetId || q.ticketNumber.toLowerCase() === targetId) {
        affectedQuery = {
          ...q,
          status: "APPROVED",
          hrRemarks: remarks || "Approved and applied to employee records.",
          resolvedAt: `Today at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        };
        return affectedQuery;
      }
      return q;
    });

    if (affectedQuery) {
      // Automatically apply changes to the employee record
      const emp = WorkpulseSharedStore.getAllEmployees().find(
        (e) =>
          e.id === affectedQuery?.employeeId ||
          e.email.toLowerCase() === affectedQuery?.employeeEmail.toLowerCase()
      );

      if (emp) {
        const cat = affectedQuery.category.toLowerCase();
        const change = affectedQuery.requestedChange;

        if (cat.includes("contact") || cat.includes("phone") || cat.includes("mobile")) {
          // Extract phone number or use requestedChange
          const phoneMatch = change.match(/(\+?\d[\d\s-]{7,}\d)/);
          const newPhone = phoneMatch ? phoneMatch[0] : change;
          WorkpulseSharedStore.updateEmployee(emp.id, { phoneNumber: newPhone });
        } else if (cat.includes("name")) {
          WorkpulseSharedStore.updateEmployee(emp.id, { name: change });
        } else if (cat.includes("department")) {
          WorkpulseSharedStore.updateEmployee(emp.id, { departmentName: change });
        } else if (cat.includes("shift") || cat.includes("location")) {
          WorkpulseSharedStore.updateEmployee(emp.id, { workLocation: change });
        }
      }
    }

    notify();
    try {
      realtimeEventBus.emit("profile:query_approved", { id: queryId, remarks });
    } catch {
      // safe fallback
    }
    return affectedQuery;
  },
  hrRejectProfileQuery: (queryId: string, remarks?: string) => {
    let affectedQuery: SharedProfileQuery | undefined;
    const targetId = String(queryId).trim().toLowerCase();
    globalProfileQueries = globalProfileQueries.map((q) => {
      if (q.id.toLowerCase() === targetId || q.ticketNumber.toLowerCase() === targetId) {
        affectedQuery = {
          ...q,
          status: "REJECTED",
          hrRemarks: remarks || "Declined: Details could not be verified.",
          resolvedAt: `Today at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
        };
        return affectedQuery;
      }
      return q;
    });
    notify();
    try {
      realtimeEventBus.emit("profile:query_rejected", { id: queryId, remarks });
    } catch {
      // safe fallback
    }
    return affectedQuery;
  },
  getHelpRequests: () => [...globalHelpRequests],
  requestLeadHelp: (req: Omit<SharedLeadHelpRequest, "id" | "createdAt" | "status">) => {
    const now = new Date();
    const timeStr = `Today at ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    const newHelp: SharedLeadHelpRequest = {
      id: `help-${Date.now()}`,
      ...req,
      status: "PENDING",
      createdAt: timeStr,
      resolvedByEmployee: false,
      resolvedByLead: false,
    };
    globalHelpRequests = [newHelp, ...globalHelpRequests.filter((h) => h.employeeId !== req.employeeId || h.status === "RESOLVED" || (h.resolvedByEmployee && h.resolvedByLead))];
    notify();
    try {
      realtimeEventBus.emit("workday:help_requested", newHelp);
    } catch {}
    return newHelp;
  },
  acknowledgeHelpRequest: (id: string, responseNote?: string) => {
    const now = new Date();
    const timeStr = `Today at ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    globalHelpRequests = globalHelpRequests.map((h) =>
      h.id === id
        ? {
            ...h,
            status: "ACKNOWLEDGED",
            acknowledgedAt: timeStr,
            leadResponse: responseNote || "Lead has acknowledged your request and is connecting with you.",
          }
        : h
    );
    notify();
    try {
      realtimeEventBus.emit("workday:help_acknowledged", { id, responseNote });
    } catch {}
  },
  resolveHelpRequest: (id: string, actor: "employee" | "lead" | "both" = "both") => {
    const now = new Date();
    const timeStr = `Today at ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    globalHelpRequests = globalHelpRequests.map((h) => {
      if (h.id !== id) return h;
      const resolvedByEmployee = actor === "employee" || actor === "both" ? true : !!h.resolvedByEmployee;
      const resolvedByLead = actor === "lead" || actor === "both" ? true : !!h.resolvedByLead;
      const bothResolved = resolvedByEmployee && resolvedByLead;

      return {
        ...h,
        resolvedByEmployee,
        resolvedByEmployeeAt: (actor === "employee" || actor === "both") ? (h.resolvedByEmployeeAt || timeStr) : h.resolvedByEmployeeAt,
        resolvedByLead,
        resolvedByLeadAt: (actor === "lead" || actor === "both") ? (h.resolvedByLeadAt || timeStr) : h.resolvedByLeadAt,
        status: bothResolved ? ("RESOLVED" as const) : h.status,
        resolvedAt: bothResolved ? (h.resolvedAt || timeStr) : h.resolvedAt,
      };
    });
    notify();
    try {
      realtimeEventBus.emit("workday:help_resolved", { id, actor });
    } catch {}
  },
  cancelHelpRequest: (id: string) => {
    globalHelpRequests = globalHelpRequests.filter((h) => h.id !== id);
    notify();
  },
  getTeamPresence: () => [...globalTeamPresence],
  verifyMemberPresence: (id: string, verifierName: string = "Alex Lead") => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    globalTeamPresence = globalTeamPresence.map((p) =>
      p.id === id
        ? {
            ...p,
            verified: true,
            verifiedAt: timeStr,
            verifiedBy: verifierName,
            status: "ON_TIME",
          }
        : p
    );
    notify();
    try {
      realtimeEventBus.emit("attendance:presence_verified", { id, verifierName, verifiedAt: timeStr });
    } catch {}
  },
  verifyAllMemberPresence: (verifierName: string = "Alex Lead") => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    globalTeamPresence = globalTeamPresence.map((p) => ({
      ...p,
      verified: true,
      verifiedAt: timeStr,
      verifiedBy: verifierName,
      status: "ON_TIME",
    }));
    notify();
    try {
      realtimeEventBus.emit("attendance:all_presence_verified", { verifierName, verifiedAt: timeStr });
    } catch {}
  },
  unverifyMemberPresence: (id: string) => {
    globalTeamPresence = globalTeamPresence.map((p) =>
      p.id === id
        ? {
            ...p,
            verified: false,
            verifiedAt: undefined,
            verifiedBy: undefined,
          }
        : p
    );
    notify();
  },
  syncGoal: syncGoalToSupabase,
};

// React hook for consuming shared state
export { useWorkpulseSharedStore } from "./use-workpulse-store";

const globalWeeklyGoals: any[] = [];

const globalWeeklyReviews: any[] = [];

const globalMyPunches: any[] = [];

const globalLeaveBalances: any[] = [];

export const workpulseSharedStore = {
  getState: () => ({
    departments: WorkpulseSharedStore.getDepartments(),
    allEmployees: WorkpulseSharedStore.getAllEmployees(),
    getEmployeeById: WorkpulseSharedStore.getEmployeeById,
    addEmployee: WorkpulseSharedStore.addEmployee,
    updateEmployee: WorkpulseSharedStore.updateEmployee,
    deleteEmployee: WorkpulseSharedStore.deleteEmployee,
    leaveRequests: WorkpulseSharedStore.getLeaveRequests(),
    wfhRequests: WorkpulseSharedStore.getWfhRequests(),
    weeklyGoals: globalWeeklyGoals,
    weeklyReviews: globalWeeklyReviews,
    myPunches: globalMyPunches,
    leaveBalances: globalLeaveBalances,
    tlApproveLeave: WorkpulseSharedStore.tlApproveLeave,
    tlRejectLeave: WorkpulseSharedStore.tlRejectLeave,
    leadApproveLeave: WorkpulseSharedStore.tlApproveLeave,
    hrApproveLeave: WorkpulseSharedStore.hrApproveLeave,
    hrRejectLeave: WorkpulseSharedStore.hrRejectLeave,
    tlApproveWfh: WorkpulseSharedStore.tlApproveWfh,
    tlRejectWfh: WorkpulseSharedStore.tlRejectWfh,
    hrApproveWfh: WorkpulseSharedStore.hrApproveWfh,
    hrRejectWfh: WorkpulseSharedStore.hrRejectWfh,
    submitEmployeeMorningPlan: WorkpulseSharedStore.submitEmployeeMorningPlan,
    leadVerifyMorningPlan: WorkpulseSharedStore.leadVerifyMorningPlan,
    leadRequestMorningPlanChanges: WorkpulseSharedStore.leadRequestMorningPlanChanges,
    submitEmployeeEveningWrapup: WorkpulseSharedStore.submitEmployeeEveningWrapup,
    leadVerifyEveningWrapup: WorkpulseSharedStore.leadVerifyEveningWrapup,
    deleteSOD: WorkpulseSharedStore.deleteSOD,
    deleteEOD: WorkpulseSharedStore.deleteEOD,
    startNewWorkday: WorkpulseSharedStore.startNewWorkday,
    virtualPunch: () => {
      globalMyPunches.unshift({
        id: `punch-${Date.now()}`,
        employeeId: "emp-sarah",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        direction: "OUT",
        method: "VIRTUAL_SIMULATOR",
        location: "HQ Office Floor 0",
        status: "VERIFIED",
      });
      syncBiometricPunchToSupabase({
        employeeId: "emp-sarah",
        employeeName: "Sarah Dev",
        punchType: "OUT",
        location: "HQ Office Floor 0",
        method: "VIRTUAL_SIMULATOR",
      });
    },
  }),
};
