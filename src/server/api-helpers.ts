import { NextResponse } from "next/server";
import { getCurrentUser, CurrentUser } from "@/lib/auth/get-current-user";
import { AuthActor, RoleType } from "@/lib/authorization/types";
import { SEEDED_TEST_ACCOUNTS } from "@/lib/auth/dev-personas";

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
    email = req.headers.get("x-user-email") || undefined;
  }

  let user: CurrentUser;

  if (email) {
    const normalizedEmail = email.toLowerCase().trim();
    const persona = SEEDED_TEST_ACCOUNTS.find((p) => p.email.toLowerCase() === normalizedEmail);

    if (persona) {
      const role = persona.role as RoleType;
      user = {
        id:
          role === "EMPLOYEE"
            ? "emp-sarah"
            : role === "MANAGER"
            ? "emp-alex"
            : role === "HR"
            ? "emp-rachel"
            : "emp-david",
        email: persona.email,
        name: persona.name,
        roles: role === "MANAGER" ? ["MANAGER", "EMPLOYEE"] : [role],
        primaryRole: role,
        designation: persona.title,
        department: "Engineering",
        team: "Platform Core",
      };
    } else if (normalizedEmail.includes("manager") || normalizedEmail.includes("lead")) {
      user = {
        id: "emp-alex",
        email,
        name: "Test Team Lead",
        roles: ["MANAGER", "EMPLOYEE"],
        primaryRole: "MANAGER",
        designation: "Engineering Lead",
        department: "Engineering",
        team: "Platform Core",
      };
    } else if (normalizedEmail.includes("hr")) {
      user = {
        id: "emp-rachel",
        email,
        name: "Test HR Partner",
        roles: ["HR"],
        primaryRole: "HR",
        designation: "HR Specialist",
        department: "People Operations",
        team: "People Operations",
      };
    } else if (normalizedEmail.includes("admin")) {
      user = {
        id: "emp-david",
        email,
        name: "Test Admin",
        roles: ["ADMIN"],
        primaryRole: "ADMIN",
        designation: "System Administrator",
        department: "Security & Operations",
        team: "Platform Core",
      };
    } else {
      user = {
        id: "emp-sarah",
        email,
        name: "Sarah Dev",
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
        name: "Sarah Dev",
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
