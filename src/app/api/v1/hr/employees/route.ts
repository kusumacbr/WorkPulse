import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { assertAuthorized } from "@/lib/authorization/authorize";
import { PERMISSIONS } from "@/lib/authorization/permissions";

export async function GET(req: NextRequest) {
  try {
    const { actor } = await getSessionActor(req);
    await assertAuthorized({
      actor,
      permission: PERMISSIONS.PROFILE_READ,
      resource: {},
    });

    const departments = WorkpulseSharedStore.getDepartments();
    const employees = WorkpulseSharedStore.getAllEmployees();

    return apiSuccess({ departments, employees, totalCount: employees.length });
  } catch (err: any) {
    return apiError(err.message || "Failed to list employees", 403);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { actor } = await getSessionActor(req);
    await assertAuthorized({
      actor,
      permission: PERMISSIONS.PROFILE_UPDATE,
      resource: {},
    });

    const body = await req.json().catch(() => ({}));
    if (!body.name || !body.email || !body.designation) {
      return apiError("name, email, and designation are required", 400);
    }

    const created = WorkpulseSharedStore.addEmployee({
      name: body.name,
      email: body.email,
      designation: body.designation,
      departmentId: body.departmentId || "dept-dev",
      workMode: body.workMode || "OFFICE",
      remainingLeaveBalance: Number(body.remainingLeaveBalance) || 12.0,
      employmentType: body.employmentType || "Full-Time",
      joiningDate: body.joiningDate || new Date().toISOString().split("T")[0],
      phoneNumber: body.phoneNumber,
      location: body.location || "Bangalore HQ",
    });

    return apiSuccess({ employee: created, message: "Employee onboarded successfully" }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to onboard employee", 400);
  }
}
