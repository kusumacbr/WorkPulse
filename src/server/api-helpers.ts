import { NextResponse } from "next/server";
import { getCurrentUser, CurrentUser } from "@/lib/auth/get-current-user";
import { AuthActor, RoleType } from "@/lib/authorization/types";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(
  message: string,
  status = 400,
  code = "API_ERROR",
  fieldErrors: Record<string, string> = {}
) {
  const correlationId = `corr-${Math.random().toString(36).substring(2, 9)}`;
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        fieldErrors,
        correlationId,
      },
      message,
      code,
    },
    { status }
  );
}

export async function getSessionActor(req?: Request): Promise<{ user: CurrentUser; actor: AuthActor }> {
  let email: string | undefined;
  if (req) {
    email = req.headers.get("x-user-email") || req.headers.get("x-test-email") || undefined;
  }

  let user: CurrentUser;

  if (email) {
    const normalizedEmail = email.toLowerCase().trim();
    const allEmployees = WorkpulseSharedStore.getAllEmployees();
    const departments = WorkpulseSharedStore.getDepartments();

    const matched = allEmployees.find((e) => e.email.toLowerCase() === normalizedEmail);
    const matchedLead = departments.find((d) => d.teamLead.email.toLowerCase() === normalizedEmail);

    if (matched) {
      const role: RoleType =
        normalizedEmail.includes("hr") || normalizedEmail.includes("admin") || normalizedEmail.includes("director")
          ? "HR"
          : normalizedEmail.includes("lead") || normalizedEmail.includes("manager")
          ? "MANAGER"
          : "EMPLOYEE";
      const roles: RoleType[] =
        role === "HR"
          ? ["HR", "EMPLOYEE"]
          : role === "MANAGER"
          ? ["MANAGER", "EMPLOYEE"]
          : ["EMPLOYEE"];
      user = {
        id: matched.id,
        email: matched.email,
        name: matched.name,
        roles,
        primaryRole: role,
        designation: matched.designation,
        department: matched.departmentName,
        team: `${matched.departmentName} Pod`,
      };
    } else if (matchedLead) {
      user = {
        id: matchedLead.teamLead.id,
        email: matchedLead.teamLead.email,
        name: matchedLead.teamLead.name,
        roles: ["MANAGER", "EMPLOYEE"],
        primaryRole: "MANAGER",
        designation: matchedLead.teamLead.designation,
        department: matchedLead.name,
        team: `${matchedLead.name} Pod`,
      };
    } else if (normalizedEmail.includes("manager") || normalizedEmail.includes("lead")) {
      user = {
        id: "lead-alex",
        email,
        name: "Alex Lead",
        roles: ["MANAGER", "EMPLOYEE"],
        primaryRole: "MANAGER",
        designation: "Engineering Lead · Development",
        department: "Development",
        team: "Development Pod",
      };
    } else if (normalizedEmail.includes("hr") || normalizedEmail.includes("admin") || normalizedEmail.includes("director")) {
      user = {
        id: "hr-rachel",
        email,
        name: "Rachel HR",
        roles: ["HR", "EMPLOYEE"],
        primaryRole: "HR",
        designation: "Head of People Operations",
        department: "Human Resources",
        team: "Human Resources Pod",
      };
    } else {
      user = {
        id: "emp-sarah",
        email,
        name: "Sara Dev",
        roles: ["EMPLOYEE"],
        primaryRole: "EMPLOYEE",
        designation: "Senior Backend Engineer",
        department: "Engineering",
        team: "Platform Core",
      };
    }
  } else {
    try {
      user = await getCurrentUser();
    } catch {
      user = {
        id: "emp-sarah",
        email: "employee.test@xorstack.com",
        name: "Sara Dev",
        roles: ["EMPLOYEE"],
        primaryRole: "EMPLOYEE",
        designation: "Senior Backend Engineer",
        department: "Engineering",
        team: "Platform Core",
      };
    }
  }

  const actor: AuthActor = {
    userId: user.id,
    employeeId: user.id,
    email: user.email,
    roles: user.roles,
    departmentId: "dept-dev",
    teamId: "team-platform",
    directReportIds: user.roles.includes("MANAGER") ? ["emp-sarah", "emp-john"] : undefined,
  };

  return { user, actor };
}
