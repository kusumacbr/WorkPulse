export const PERMISSIONS = {
  // Profile
  PROFILE_READ: "profile:read",
  PROFILE_UPDATE: "profile:update",

  // Tasks & Daily work
  DAILY_TASK_CREATE: "dailyTask:create",
  DAILY_TASK_UPDATE: "dailyTask:update",
  DAILY_TASK_READ_TEAM: "dailyTask:readTeam",

  // Goals
  WEEKLY_GOAL_CREATE: "weeklyGoal:create",

  // Reviews
  WEEKLY_REVIEW_SUBMIT: "weeklyReview:submit",
  WEEKLY_REVIEW_APPROVE: "weeklyReview:approve",
  MONTHLY_REVIEW_REVIEW: "monthlyReview:review",
  MONTHLY_REVIEW_FINALIZE: "monthlyReview:finalize",

  // Leave & Attendance
  LEAVE_REQUEST: "leave:request",
  LEAVE_CREATE: "leave:create",
  LEAVE_APPROVE: "leave:approve",
  LEAVE_APPROVE_MANAGER: "leave:approveManager",
  LEAVE_APPROVE_HR: "leave:approveHr",
  LEAVE_OVERRIDE: "leave:override",
  WFH_CREATE: "wfh:create",
  WFH_APPROVE: "wfh:approve",
  ATTENDANCE_READ: "attendance:read",
  ATTENDANCE_REGULARIZE: "attendance:regularize",
  ATTENDANCE_APPROVE: "attendance:approve",
  HOLIDAY_MANAGE: "holiday:manage",

  // Blockers & 1-on-1s
  BLOCKER_CREATE: "blocker:create",
  BLOCKER_ESCALATE: "blocker:escalate",
  BLOCKER_RESOLVE: "blocker:resolve",
  ONE_TO_ONE_CREATE: "oneToOne:create",
  ONE_TO_ONE_READ_PRIVATE: "oneToOne:readPrivate",

  // Recognition & Badges
  BADGE_ISSUE: "badge:issue",
  BADGE_MANAGE_DEF: "badge:manageDefinition",

  // Probation & PIP
  PROBATION_RECOMMEND: "probation:recommend",
  PROBATION_FINALIZE: "probation:finalize",
  PIP_CREATE: "pip:create",
  PIP_REVIEW: "pip:review",
  PIP_FINALIZE: "pip:finalize",

  // Announcements & Management
  ANNOUNCEMENT_CREATE: "announcement:create",
  ANNOUNCEMENT_PUBLISH: "announcement:publish",
  INTEGRATION_MANAGE: "integration:manage",
  DEVICE_MANAGE: "device:manage",
  AUDIT_READ: "audit:read",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS] | string;
