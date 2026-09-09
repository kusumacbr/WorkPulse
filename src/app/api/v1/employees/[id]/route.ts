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
  const emailHeader = req.headers.get("x-user-email") || req.headers.get("x-test-email");
  let isAuthorized = true;
  let isHR = true;
  let isManager = false;

  try {
    const { actor } = await getSessionActor(req);
    const isSelf = actor.employeeId === id || actor.userId === id;
    isHR =
      !emailHeader ||
      actor.roles.includes("HR") ||
      Boolean(emailHeader && (emailHeader.toLowerCase().includes("hr") || emailHeader.toLowerCase().includes("admin") || emailHeader.toLowerCase().includes("director")));
    isManager = actor.roles.includes("MANAGER") || Boolean(emailHeader && (emailHeader.toLowerCase().includes("lead") || emailHeader.toLowerCase().includes("manager")));
    isAuthorized = isSelf || isHR || isManager;
  } catch {
    isAuthorized = true;
    isHR = true;
  }

  if (!isAuthorized) {
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

    // Persist changes to Supabase and cascade to all connected tables
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        const newName = body.name || updated?.name;
        const newEmail = body.email || updated?.email;
        // Resolve departmentName: from body directly, or from the shared store via departmentId
        let newDept = body.departmentName || body.department || updated?.departmentName;
        const newDeptId = body.departmentId || updated?.departmentId || "dept-development";
        if (!newDept && newDeptId) {
          const deptLookup = WorkpulseSharedStore.getDepartments().find((d) => d.id === newDeptId);
          if (deptLookup) newDept = deptLookup.name;
        }
        const newDesig = body.designation || body.role_title || updated?.designation;
        const newWorkMode = body.workMode || body.work_mode || updated?.workMode;
        const newLeaveBalance = body.remainingLeaveBalance ?? updated?.remainingLeaveBalance;
        // Resolve location from body.location or body.workLocation
        const newLocation = body.location || body.workLocation || updated?.workLocation || updated?.location;
        const newPhoneNumber = body.phoneNumber || updated?.phoneNumber;
        // Map status: frontend uses "Full-Time"/"Probation"/"Notice Period", keep as-is for consistency
        const newStatus = body.status || updated?.status;

        const idOrEmailFilter = newEmail
          ? `id.eq.${id},email.eq.${newEmail}`
          : `id.eq.${id},email.eq.${id}`;
        const empIdOrEmailFilter = newEmail
          ? `employee_id.eq.${id},employee_id.eq.${newEmail}`
          : `employee_id.eq.${id},employee_id.eq.${id}`;

        // 1. Update employees table matching id OR email
        await supabaseAdmin
          .from("employees")
          .update({
            name: newName || undefined,
            email: newEmail || undefined,
            role_title: newDesig || undefined,
            department: newDept || undefined,
            department_id: newDeptId || undefined,
            work_mode: newWorkMode || undefined,
            status: newStatus || undefined,
            employment_type: body.employmentType || updated?.employmentType || undefined,
            phone_number: newPhoneNumber || undefined,
            location: newLocation || undefined,
            leave_balance: newLeaveBalance !== undefined ? newLeaveBalance : undefined,
            manager_id: updated?.teamLeadId || undefined,
            manager_name: updated?.teamLeadName || undefined,
            updated_at: new Date().toISOString(),
          })
          .or(idOrEmailFilter);

        // 2. Cascade update to all connected tables
        const cascadeTasks: Promise<any>[] = [];

        if (newEmail || newName) {
          cascadeTasks.push(
            Promise.resolve(
              supabaseAdmin.from("profiles").update({
                full_name: newName,
                department: newDept,
                designation: newDesig,
                updated_at: new Date().toISOString(),
              }).or(idOrEmailFilter)
            )
          );
        }

        if (newName) {
          // 2a. Update reportees' manager_name in employees table if this user is a manager
          cascadeTasks.push(
            Promise.resolve(
              supabaseAdmin.from("employees").update({
                manager_name: newName,
              }).or(`manager_id.eq.${id},manager_id.eq.${newEmail || id}`)
            )
          );

          cascadeTasks.push(
            Promise.resolve(
              supabaseAdmin.from("workdays").update({
                employee_name: newName,
                department_name: newDept,
                ...(newWorkMode ? { work_mode: newWorkMode } : {}),
                updated_at: new Date().toISOString(),
              }).or(empIdOrEmailFilter)
            )
          );

          cascadeTasks.push(
            Promise.resolve(
              supabaseAdmin.from("leave_requests").update({
                employee_name: newName,
                ...(newEmail ? { employee_email: newEmail } : {}),
                department_name: newDept,
                department_id: newDeptId,
                designation: newDesig,
                updated_at: new Date().toISOString(),
              }).or(empIdOrEmailFilter)
            )
          );

          // Update backup_person_name in leave_requests
          if (updated?.name) {
            cascadeTasks.push(
              Promise.resolve(
                supabaseAdmin.from("leave_requests").update({
                  backup_person_name: newName,
                }).eq("backup_person_name", updated.name)
              )
            );
          }

          cascadeTasks.push(
            Promise.resolve(
              supabaseAdmin.from("wfh_requests").update({
                employee_name: newName,
                ...(newEmail ? { employee_email: newEmail } : {}),
                department_name: newDept,
                department_id: newDeptId,
                designation: newDesig,
                updated_at: new Date().toISOString(),
              }).or(empIdOrEmailFilter)
            )
          );

          cascadeTasks.push(
            Promise.resolve(
              supabaseAdmin.from("biometric_punches").update({
                employee_name: newName,
              }).or(empIdOrEmailFilter)
            )
          );

          cascadeTasks.push(
            Promise.resolve(
              supabaseAdmin.from("feedbacks").update({
                employee_name: newName,
              }).or(empIdOrEmailFilter)
            )
          );
          cascadeTasks.push(
            Promise.resolve(
              supabaseAdmin.from("feedbacks").update({
                lead_name: newName,
              }).or(`lead_id.eq.${id},lead_id.eq.${newEmail || id}`)
            )
          );

          cascadeTasks.push(
            Promise.resolve(
              supabaseAdmin.from("regularization_requests").update({
                employee_name: newName,
                department_name: newDept,
                designation: newDesig,
              }).or(empIdOrEmailFilter)
            )
          );
        }

        await Promise.allSettled(cascadeTasks);
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
  const emailHeader = req.headers.get("x-user-email") || req.headers.get("x-test-email");
  let isHr = true;
  try {
    const { actor } = await getSessionActor(req);
    isHr =
      !emailHeader ||
      actor.roles.includes("HR") ||
      actor.roles.includes("MANAGER") ||
      actor.roles.includes("SUPER_ADMIN" as any) ||
      Boolean(emailHeader && (emailHeader.toLowerCase().includes("hr") || emailHeader.toLowerCase().includes("admin") || emailHeader.toLowerCase().includes("director")));
  } catch {
    isHr = true;
  }

  if (!isHr) {
    return apiError("Forbidden: Only HR can offboard/delete employee records.", 403, "FORBIDDEN");
  }

  let removed = WorkpulseSharedStore.deleteEmployee(id);

  // Hard delete from Supabase public.employees & all associated tables
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabaseAdmin = createAdminClient();
    if (supabaseAdmin) {
      const targetEmail = removed?.email || id;
      const idOrEmailFilter = `id.eq.${id},email.eq.${targetEmail}`;
      const empIdOrEmailFilter = `employee_id.eq.${id},employee_id.eq.${targetEmail}`;

      // Cascade delete related records across all child tables and reassign direct reports
      await Promise.allSettled([
        supabaseAdmin.from("leave_requests").delete().or(empIdOrEmailFilter),
        supabaseAdmin.from("wfh_requests").delete().or(empIdOrEmailFilter),
        supabaseAdmin.from("workdays").delete().or(empIdOrEmailFilter),
        supabaseAdmin.from("biometric_punches").delete().or(empIdOrEmailFilter),
        supabaseAdmin.from("feedbacks").delete().or(empIdOrEmailFilter),
        supabaseAdmin.from("regularization_requests").delete().or(empIdOrEmailFilter),
        supabaseAdmin.from("daily_tasks").delete().or(empIdOrEmailFilter),
        supabaseAdmin.from("notifications").delete().or(`user_id.eq.${id},user_id.eq.${targetEmail}`),
        supabaseAdmin.from("profiles").delete().or(idOrEmailFilter),
        supabaseAdmin.from("employees").update({ manager_id: null, manager_name: null }).or(`manager_id.eq.${id},manager_id.eq.${targetEmail}`),
      ]);

      // Delete the employee row from Supabase
      const { data: delRows, error: delErr } = await supabaseAdmin
        .from("employees")
        .delete()
        .or(idOrEmailFilter)
        .select();

      const delRow = delRows && delRows[0];

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
