export type RoleType = "EMPLOYEE" | "MANAGER" | "HR" | "ADMIN";

export type RecordScope =
  | "self"
  | "direct_reports"
  | "department"
  | "organization"
  | "assigned_record";

export type SensitiveField =
  | "emergencyContact"
  | "privateNotes"
  | "pip"
  | "biometricSecrets"
  | "performanceRank";

export interface AuthActor {
  userId: string;
  employeeId?: string;
  email: string;
  roles: RoleType[];
  departmentId?: string | null;
  teamId?: string | null;
  directReportIds?: string[];
  assignedRecordIds?: string[];
}

export interface ResourceContext {
  id?: string;
  employeeId?: string;
  departmentId?: string | null;
  teamId?: string | null;
  authorId?: string | null;
  fallbackReviewerId?: string | null;
  isShared?: boolean;
  sensitiveField?: SensitiveField;
  reason?: string | null;
  override?: boolean;
  [key: string]: unknown;
}

export interface AuthorizeOptions {
  actor: AuthActor;
  permission: string;
  resource?: ResourceContext;
}

export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
  scope?: RecordScope;
}
