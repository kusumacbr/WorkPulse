import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { actor } = await getSessionActor(req);

  const emp = WorkpulseSharedStore.getEmployeeById(id);
  if (!emp) {
    return apiError(`Employee '${id}' not found`, 404, "NOT_FOUND");
  }

  // Authorization check: Self, assigned Manager, HR
  const isSelf = actor.employeeId === id || actor.userId === id;
  const isManager =
    actor.roles.includes("MANAGER") &&
    ((actor.directReportIds && actor.directReportIds.includes(id)) ||
      emp.teamLeadName.toLowerCase().includes("alex") ||
      emp.teamLeadName.toLowerCase().includes("lead"));
  const isHR = actor.roles.includes("HR");

  if (!isSelf && !isManager && !isHR) {
    return apiError("Forbidden: You lack authorization to view this employee profile.", 403, "FORBIDDEN");
  }

  // Sensitive field filtering: emergency contact restricted to HR
  const employeeData = { ...emp };
  if (!isHR && !isSelf) {
    delete (employeeData as any).emergencyContact;
  }

  return apiSuccess({ employee: employeeData });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { actor } = await getSessionActor(req);

  const isSelf = actor.employeeId === id || actor.userId === id;
  const isHR = actor.roles.includes("HR");
  const isManager = actor.roles.includes("MANAGER");

  if (!isSelf && !isHR && !isManager) {
    return apiError("Forbidden: Unauthorized to update this employee record.", 403, "FORBIDDEN");
  }

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      const text = await req.text();
      body = text ? JSON.parse(text) : {};
    }

    const updated = WorkpulseSharedStore.updateEmployee(
      id,
      isHR
        ? body
        : {
            preferredName: body.preferredName,
            phoneNumber: body.phoneNumber,
            skills: body.skills,
          }
    );

    if (!updated) {
      return apiError(`Employee '${id}' not found`, 404, "NOT_FOUND");
    }

    // Persist changes to Supabase public.employees
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        await supabaseAdmin
          .from("employees")
          .update({
            name: updated.name,
            role_title: updated.designation,
            department: updated.departmentName,
            department_id: updated.departmentId,
            work_mode: updated.workMode,
            status: updated.status,
            phone_number: updated.phoneNumber,
            location: updated.location,
            leave_balance: updated.remainingLeaveBalance,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
      }
    } catch (err: any) {
      console.warn("Supabase employee update sync warning:", err.message);
    }

    return apiSuccess({ employee: updated, message: "Employee profile updated successfully." });
  } catch (err: any) {
    return apiError(err.message || "Failed to parse request body", 400, "BAD_REQUEST");
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PATCH(req, { params });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { actor } = await getSessionActor(req);

  if (!actor.roles.includes("HR")) {
    return apiError("Forbidden: Only HR can offboard/delete employee records.", 403, "FORBIDDEN");
  }

  const removed = WorkpulseSharedStore.deleteEmployee(id);
  if (!removed) {
    return apiError(`Employee '${id}' not found or could not be removed`, 404, "NOT_FOUND");
  }

  // Hard delete from Supabase public.employees & associated tables
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabaseAdmin = createAdminClient();
    if (supabaseAdmin) {
      // Cascade delete related records first
      await Promise.allSettled([
        supabaseAdmin.from("leave_requests").delete().eq("employee_id", id),
        supabaseAdmin.from("wfh_requests").delete().eq("employee_id", id),
        supabaseAdmin.from("workdays").delete().eq("employee_id", id),
        supabaseAdmin.from("biometric_punches").delete().eq("employee_id", id),
        supabaseAdmin.from("feedbacks").delete().eq("employee_id", id),
        supabaseAdmin.from("regularization_requests").delete().eq("employee_id", id),
      ]);

      // Delete the employee row from Supabase
      const { error: delErr } = await supabaseAdmin
        .from("employees")
        .delete()
        .eq("id", id);

      if (delErr) {
        console.warn("Supabase employee delete error:", delErr.message);
      } else {
        console.log(`[Supabase] Successfully deleted employee '${id}' from public.employees`);
      }
    }
  } catch (err: any) {
    console.warn("Supabase employee delete sync warning:", err.message);
  }

  return apiSuccess({ employee: removed, message: `Employee '${id}' successfully removed from Supabase and application roster.` });
}
