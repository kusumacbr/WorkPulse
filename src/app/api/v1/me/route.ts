import { NextRequest } from "next/server";
import { apiSuccess, getSessionActor } from "@/server/api-helpers";
import { PERMISSIONS } from "@/lib/authorization/permissions";

export async function GET(req: NextRequest) {
  const { user, actor } = await getSessionActor(req);

  // Compute permissions for active roles
  const permissions: string[] = [];
  if (user.roles.includes("ADMIN")) {
    permissions.push(...Object.values(PERMISSIONS));
  } else {
    if (user.roles.includes("EMPLOYEE")) {
      permissions.push(
        PERMISSIONS.PROFILE_READ,
        PERMISSIONS.PROFILE_UPDATE,
        PERMISSIONS.DAILY_TASK_CREATE,
        PERMISSIONS.DAILY_TASK_UPDATE,
        PERMISSIONS.WEEKLY_GOAL_CREATE,
        PERMISSIONS.WEEKLY_REVIEW_SUBMIT,
        PERMISSIONS.LEAVE_REQUEST,
        PERMISSIONS.LEAVE_CREATE,
        PERMISSIONS.WFH_CREATE,
        PERMISSIONS.ATTENDANCE_READ,
        PERMISSIONS.ATTENDANCE_REGULARIZE,
        PERMISSIONS.BLOCKER_CREATE,
        PERMISSIONS.ONE_TO_ONE_CREATE
      );
    }
    if (user.roles.includes("MANAGER")) {
      permissions.push(
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
        PERMISSIONS.PIP_REVIEW
      );
    }
    if (user.roles.includes("HR")) {
      permissions.push(
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
        PERMISSIONS.ONE_TO_ONE_READ_PRIVATE
      );
    }
  }

  const uniquePermissions = Array.from(new Set(permissions));

  return apiSuccess({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles,
      primaryRole: user.primaryRole,
      designation: user.designation,
      department: user.department,
      team: user.team,
    },
    actor,
    permissions: uniquePermissions,
    organization: {
      id: "org-xorstack",
      name: "Xorstack Enterprise",
      domain: "xorstack.com",
      timezone: "Asia/Kolkata",
    },
    team: {
      id: "team-platform",
      name: "Platform Core",
      department: "Engineering",
    },
  });
}
