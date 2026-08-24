import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { assertAuthorized } from "@/lib/authorization/authorize";
import { PERMISSIONS } from "@/lib/authorization/permissions";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { actor } = await getSessionActor(req);
    await assertAuthorized({
      actor,
      permission: PERMISSIONS.PROFILE_READ,
      resource: { employeeId: id },
    });

    const all = WorkpulseSharedStore.getAllEmployees();
    const employee = all.find((e) => e.id === id);

    if (!employee) {
      return apiError("Employee not found", 404);
    }

    return apiSuccess({ employee });
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch employee profile", 400);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { actor } = await getSessionActor(req);
    await assertAuthorized({
      actor,
      permission: PERMISSIONS.PROFILE_UPDATE,
      resource: { employeeId: id },
    });

    const body = await req.json().catch(() => ({}));
    const updated = WorkpulseSharedStore.updateEmployee(id, {
      name: body.name,
      email: body.email,
      designation: body.designation,
      departmentId: body.departmentId,
      workMode: body.workMode,
      remainingLeaveBalance: body.remainingLeaveBalance !== undefined ? Number(body.remainingLeaveBalance) : undefined,
    });

    if (!updated) {
      return apiError("Employee not found or could not be updated", 404);
    }

    return apiSuccess({ employee: updated, message: "Employee record updated successfully" }, 200);
  } catch (err: any) {
    return apiError(err.message || "Failed to update employee", 400);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { actor } = await getSessionActor(req);
    await assertAuthorized({
      actor,
      permission: PERMISSIONS.PROFILE_UPDATE,
      resource: { employeeId: id },
    });

    const removed = WorkpulseSharedStore.deleteEmployee(id);
    if (!removed) {
      return apiError("Employee not found", 404);
    }

    return apiSuccess({ employee: removed, message: "Employee offboarded & archived" }, 200);
  } catch (err: any) {
    return apiError(err.message || "Failed to offboard employee", 400);
  }
}
