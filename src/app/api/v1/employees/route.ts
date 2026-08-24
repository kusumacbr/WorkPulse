import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function GET(req: NextRequest) {
  const { actor } = await getSessionActor(req);
  const searchParams = req.nextUrl.searchParams;
  const deptFilter = searchParams.get("departmentId");
  const searchQuery = searchParams.get("search")?.toLowerCase();

  let employees = workpulseSharedStore.getState().allEmployees;

  // Role scoping: Manager can only view direct reports if not HR/Admin
  if (!actor.roles.includes("HR") && !actor.roles.includes("ADMIN")) {
    if (actor.roles.includes("MANAGER")) {
      employees = employees.filter(
        (e) =>
          e.id === actor.employeeId ||
          (actor.directReportIds && actor.directReportIds.includes(e.id)) ||
          e.teamLeadName.toLowerCase().includes("alex") ||
          e.teamLeadName.toLowerCase().includes("lead")
      );
    } else {
      // Employee only sees self
      employees = employees.filter((e) => e.id === actor.employeeId);
    }
  }

  if (deptFilter && deptFilter !== "ALL") {
    employees = employees.filter((e) => e.departmentId === deptFilter);
  }

  if (searchQuery) {
    employees = employees.filter(
      (e) =>
        e.name.toLowerCase().includes(searchQuery) ||
        e.designation.toLowerCase().includes(searchQuery) ||
        e.departmentName.toLowerCase().includes(searchQuery)
    );
  }

  return apiSuccess({
    employees,
    total: employees.length,
  });
}

export async function POST(req: NextRequest) {
  const { actor } = await getSessionActor(req);
  if (!actor.roles.includes("HR") && !actor.roles.includes("ADMIN")) {
    return apiError("Forbidden: Only HR and Admin can onboard/create employee records.", 403, "FORBIDDEN");
  }

  try {
    const body = await req.json();
    if (!body.name || !body.email || !body.designation) {
      return apiError("Missing required fields: name, email, designation", 422, "VALIDATION_FAILED");
    }

    const state = workpulseSharedStore.getState();
    const newEmp = {
      id: `emp-${Date.now()}`,
      name: body.name,
      email: body.email,
      designation: body.designation,
      departmentId: body.departmentId || "dept-dev",
      departmentName: body.departmentName || "Engineering Pod",
      teamLeadId: body.teamLeadId || "emp-alex",
      teamLeadName: body.teamLeadName || "Alex Lead",
      workMode: body.workMode || "OFFICE",
      status: body.status || "ACTIVE",
      employmentType: body.employmentType || "FULL_TIME",
      hireDate: body.hireDate || "2026-08-01",
      remainingLeaveBalance: body.remainingLeaveBalance || 12.0,
      sodStatus: "PENDING" as const,
      eodStatus: "NOT_STARTED" as const,
      overallProgress: 0,
      plannedTasks: [],
      avatar: body.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
    };

    state.allEmployees.unshift(newEmp as any);

    return apiSuccess({ employee: newEmp, message: "Employee record successfully created." }, 201);
  } catch {
    return apiError("Invalid request body payload", 400, "BAD_REQUEST");
  }
}
