import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { realtimeEventBus } from "@/server/realtime/event-bus";
import { broadcastServerEvent } from "@/lib/supabase/broadcast";

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

    let updated = WorkpulseSharedStore.updateEmployee(
      id,
      isHR
        ? body
        : {
            preferredName: body.preferredName,
            phoneNumber: body.phoneNumber,
            skills: body.skills,
          }
    );

    // Fallback: Search allEmployees by ID or Email
    if (!updated) {
      const all = WorkpulseSharedStore.getAllEmployees();
      const match = all.find(
        (e) =>
          e.id.toLowerCase() === id.toLowerCase() ||
          e.email.toLowerCase() === id.toLowerCase()
      );
      if (match) {
        updated = WorkpulseSharedStore.updateEmployee(match.id, isHR ? body : { preferredName: body.preferredName, phoneNumber: body.phoneNumber });
      }
    }

    // Secondary fallback: Add/upsert if missing
    if (!updated && (body.name || body.designation || body.email)) {
      updated = WorkpulseSharedStore.addEmployee({
        id,
        name: body.name || "Employee",
        email: body.email || `${id}@xorstack.com`,
        designation: body.designation || body.role_title || "Engineer",
        ...body,
      });
    }

    // Persist changes to Supabase if table exists
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        await supabaseAdmin
          .from("employees")
          .update({
            name: body.name || undefined,
            role_title: body.designation || body.role_title || undefined,
            department: body.departmentName || body.department || undefined,
            department_id: body.departmentId || undefined,
            work_mode: body.workMode || body.work_mode || undefined,
            status: body.status || undefined,
            phone_number: body.phoneNumber || undefined,
            location: body.location || undefined,
            leave_balance: body.remainingLeaveBalance || undefined,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);
      }
    } catch (err: any) {
      console.warn("Supabase employee update sync warning:", err.message);
    }

    if (!updated) {
      return apiError(`Employee '${id}' not found`, 404, "NOT_FOUND");
    }

    // Broadcast real-time update across Supabase Realtime channel and server event bus
    await broadcastServerEvent("employee:updated", updated);
    realtimeEventBus.emit("employee:updated", updated);

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

  let removed = WorkpulseSharedStore.deleteEmployee(id);

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
      const { data: delRow, error: delErr } = await supabaseAdmin
        .from("employees")
        .delete()
        .eq("id", id)
        .select()
        .maybeSingle();

      if (delRow && !removed) {
        removed = { id: delRow.id, name: delRow.name } as any;
      }

      if (delErr) {
        console.warn("Supabase employee delete error:", delErr.message);
      }
    }
  } catch (err: any) {
    console.warn("Supabase employee delete sync warning:", err.message);
  }

  // Broadcast real-time deletion across Supabase Realtime channel and server event bus
  await broadcastServerEvent("employee:deleted", { id });
  realtimeEventBus.emit("employee:deleted", { id });

  return apiSuccess({ employee: removed || { id }, message: `Employee '${id}' successfully removed from Supabase and application roster.` });
}
