import { AuthActor, AuthorizationResult, ResourceContext, RoleType } from "./types";
import { PERMISSIONS } from "./permissions";

/**
 * Checks if the resource belongs to the actor (self scope).
 */
export function isSelf(actor: AuthActor, resource?: ResourceContext): boolean {
  if (!resource) return false;
  if (resource.employeeId && actor.employeeId && resource.employeeId === actor.employeeId) {
    return true;
  }
  if (resource.id && (resource.id === actor.userId || resource.id === actor.employeeId)) {
    return true;
  }
  return false;
}

/**
 * Checks if the resource belongs to a direct report of the manager.
 */
export function isDirectReport(actor: AuthActor, resource?: ResourceContext): boolean {
  if (!resource || !resource.employeeId || !actor.directReportIds) return false;
  return actor.directReportIds.includes(resource.employeeId);
}

/**
 * Checks if the actor is designated as the fallback reviewer for an unassigned employee.
 */
export function isFallbackReviewer(actor: AuthActor, resource?: ResourceContext): boolean {
  if (!resource) return false;
  if (
    resource.fallbackReviewerId &&
    (actor.userId === resource.fallbackReviewerId || actor.employeeId === resource.fallbackReviewerId)
  ) {
    return true;
  }
  if (
    actor.assignedRecordIds &&
    resource.employeeId &&
    actor.assignedRecordIds.includes(resource.employeeId)
  ) {
    return true;
  }
  return false;
}

/**
 * Checks if the resource is within the same department.
 */
export function isSameDepartment(actor: AuthActor, resource?: ResourceContext): boolean {
  if (!resource || !resource.departmentId || !actor.departmentId) return false;
  return actor.departmentId === resource.departmentId;
}

/**
 * Evaluates sensitive field access rules.
 */
export function evaluateSensitiveFieldAccess(
  actor: AuthActor,
  resource: ResourceContext
): AuthorizationResult {
  const { sensitiveField } = resource;
  if (!sensitiveField) {
    return { allowed: true };
  }

  const isHR = actor.roles.includes("HR");
  const self = isSelf(actor, resource);
  const directReport = isDirectReport(actor, resource);

  switch (sensitiveField) {
    case "emergencyContact": {
      // Emergency contact: employee (own), HR only. (Manager cannot view)
      if (self) return { allowed: true, scope: "self" };
      if (isHR) return { allowed: true, scope: "organization" };
      return {
        allowed: false,
        reason: "Access denied: Emergency contact info is restricted to the employee and HR.",
      };
    }

    case "privateNotes": {
      // Private 1-on-1 notes: author and HR only — never employee unless explicitly shared
      const isAuthor =
        resource.authorId &&
        (resource.authorId === actor.userId || resource.authorId === actor.employeeId);
      if (isAuthor) return { allowed: true, scope: "self" };
      if (resource.isShared && self) return { allowed: true, scope: "self" };
      if (isHR) return { allowed: true, scope: "organization" };
      return {
        allowed: false,
        reason: "Access denied: Private one-to-one notes are restricted to the author and HR.",
      };
    }

    case "pip": {
      // PIP records: the employee, their assigned manager, and HR only
      if (self) return { allowed: true, scope: "self" };
      if (directReport && actor.roles.includes("MANAGER")) {
        return { allowed: true, scope: "direct_reports" };
      }
      if (isHR) return { allowed: true, scope: "organization" };
      return {
        allowed: false,
        reason: "Access denied: PIP records are restricted to the employee, assigned manager, and HR.",
      };
    }

    case "biometricSecrets": {
      // Biometric secrets: HR only
      if (isHR) return { allowed: true, scope: "organization" };
      return {
        allowed: false,
        reason: "Access denied: Biometric device secrets are strictly restricted to HR.",
      };
    }

    case "performanceRank": {
      // Performance rank: employee sees only own rank; manager sees direct reports; HR sees aggregates
      if (self) return { allowed: true, scope: "self" };
      if (directReport && actor.roles.includes("MANAGER")) {
        return { allowed: true, scope: "direct_reports" };
      }
      if (isHR) return { allowed: true, scope: "organization" };
      return {
        allowed: false,
        reason: "Access denied: Performance rank visibility is strictly scoped.",
      };
    }

    default:
      return { allowed: true };
  }
}

/**
 * Checks policy for a specific role and permission.
 */
function evaluateRolePolicy(
  role: RoleType,
  permission: string,
  actor: AuthActor,
  resource?: ResourceContext
): AuthorizationResult {
  const self = isSelf(actor, resource);
  const directReport = isDirectReport(actor, resource);
  const isFallback = isFallbackReviewer(actor, resource);

  switch (role) {
    case "HR": {
      // HR cannot silently override manager rating — requires reason
      if (
        permission === PERMISSIONS.MONTHLY_REVIEW_FINALIZE &&
        resource?.override &&
        !resource?.reason?.trim()
      ) {
        return {
          allowed: false,
          reason: "HR rating override requires a mandatory written reason for audit trail.",
        };
      }

      // If actor is the assigned fallback reviewer for an unassigned employee
      if (isFallback) {
        return { allowed: true, scope: "assigned_record" };
      }

      // HR organization-wide permissions for oversight.
      // (Note: DAILY_TASK_READ_TEAM is intentionally excluded — HR daily tasks flow strictly via manager assignment)
      const hrAllowedPermissions = [
        PERMISSIONS.PROFILE_READ,
        PERMISSIONS.PROFILE_UPDATE,
        PERMISSIONS.ATTENDANCE_READ,
        PERMISSIONS.ATTENDANCE_REGULARIZE,
        PERMISSIONS.ATTENDANCE_APPROVE,
        PERMISSIONS.LEAVE_REQUEST,
        PERMISSIONS.LEAVE_CREATE,
        PERMISSIONS.LEAVE_APPROVE,
        PERMISSIONS.LEAVE_APPROVE_HR,
        PERMISSIONS.LEAVE_OVERRIDE,
        PERMISSIONS.WFH_CREATE,
        PERMISSIONS.WFH_APPROVE,
        PERMISSIONS.HOLIDAY_MANAGE,
        PERMISSIONS.PROBATION_RECOMMEND,
        PERMISSIONS.PROBATION_FINALIZE,
        PERMISSIONS.PIP_CREATE,
        PERMISSIONS.PIP_REVIEW,
        PERMISSIONS.PIP_FINALIZE,
        PERMISSIONS.ANNOUNCEMENT_CREATE,
        PERMISSIONS.ANNOUNCEMENT_PUBLISH,
        PERMISSIONS.DEVICE_MANAGE,
        PERMISSIONS.AUDIT_READ,
        PERMISSIONS.BADGE_ISSUE,
        PERMISSIONS.BADGE_MANAGE_DEF,
        PERMISSIONS.WEEKLY_REVIEW_APPROVE,
        PERMISSIONS.MONTHLY_REVIEW_REVIEW,
        PERMISSIONS.MONTHLY_REVIEW_FINALIZE,
        PERMISSIONS.ONE_TO_ONE_READ_PRIVATE,
      ];

      if (hrAllowedPermissions.includes(permission as any)) {
        return { allowed: true, scope: "organization" };
      }

      // HR employee self functions
      if (self) return { allowed: true, scope: "self" };
      break;
    }

    case "MANAGER": {
      // Manager is an employee + manager powers over direct reports
      if (self) {
        return { allowed: true, scope: "self" };
      }

      if (isFallback) {
        return { allowed: true, scope: "assigned_record" };
      }

      const managerDirectReportPermissions = [
        PERMISSIONS.PROFILE_READ,
        PERMISSIONS.DAILY_TASK_READ_TEAM,
        PERMISSIONS.WEEKLY_REVIEW_APPROVE,
        PERMISSIONS.MONTHLY_REVIEW_REVIEW,
        PERMISSIONS.LEAVE_APPROVE,
        PERMISSIONS.LEAVE_APPROVE_MANAGER,
        PERMISSIONS.WFH_APPROVE,
        PERMISSIONS.ATTENDANCE_APPROVE,
        PERMISSIONS.BLOCKER_ESCALATE,
        PERMISSIONS.BLOCKER_RESOLVE,
        PERMISSIONS.ONE_TO_ONE_CREATE,
        PERMISSIONS.ONE_TO_ONE_READ_PRIVATE,
        PERMISSIONS.BADGE_ISSUE,
        PERMISSIONS.PROBATION_RECOMMEND,
        PERMISSIONS.PIP_CREATE,
        PERMISSIONS.PIP_REVIEW,
      ];

      if (directReport && managerDirectReportPermissions.includes(permission as any)) {
        return { allowed: true, scope: "direct_reports" };
      }
      break;
    }

    case "EMPLOYEE": {
      // Employee self capabilities
      const employeeSelfPermissions = [
        PERMISSIONS.PROFILE_READ,
        PERMISSIONS.PROFILE_UPDATE,
        PERMISSIONS.DAILY_TASK_CREATE,
        PERMISSIONS.DAILY_TASK_UPDATE,
        PERMISSIONS.DAILY_TASK_READ_TEAM,
        PERMISSIONS.WEEKLY_GOAL_CREATE,
        PERMISSIONS.WEEKLY_REVIEW_SUBMIT,
        PERMISSIONS.LEAVE_REQUEST,
        PERMISSIONS.LEAVE_CREATE,
        PERMISSIONS.WFH_CREATE,
        PERMISSIONS.ATTENDANCE_READ,
        PERMISSIONS.ATTENDANCE_REGULARIZE,
        PERMISSIONS.BLOCKER_CREATE,
        PERMISSIONS.ONE_TO_ONE_CREATE,
      ];

      // Non-scoped actions (e.g. creating own task/goal/leave request)
      if (!resource || !resource.employeeId) {
        if (employeeSelfPermissions.includes(permission as any)) {
          return { allowed: true, scope: "self" };
        }
      }

      // Shared 1-on-1 note access for employee
      if (
        permission === PERMISSIONS.ONE_TO_ONE_READ_PRIVATE &&
        resource?.isShared &&
        self
      ) {
        return { allowed: true, scope: "self" };
      }

      // PIP review for own record
      if (permission === PERMISSIONS.PIP_REVIEW && self) {
        return { allowed: true, scope: "self" };
      }

      if (self && employeeSelfPermissions.includes(permission as any)) {
        return { allowed: true, scope: "self" };
      }
      break;
    }
  }

  return { allowed: false };
}

/**
 * Evaluates authorization across all roles held by the actor.
 */
export function evaluateAuthorization(
  actor: AuthActor,
  permission: string,
  resource?: ResourceContext
): AuthorizationResult {
  // 1. Check sensitive field access first
  if (resource?.sensitiveField) {
    const sensitiveResult = evaluateSensitiveFieldAccess(actor, resource);
    if (!sensitiveResult.allowed) {
      return sensitiveResult;
    }
  }

  // 2. Evaluate roles (Union of permitted capabilities)
  let bestResult: AuthorizationResult = {
    allowed: false,
    reason: `Access denied: Role(s) [${actor.roles.join(", ")}] lack permission '${permission}' for the requested resource scope.`,
  };

  for (const role of actor.roles) {
    const result = evaluateRolePolicy(role, permission, actor, resource);
    if (result.allowed) {
      return result;
    }
    if (result.reason) {
      bestResult = result;
    }
  }

  return bestResult;
}
