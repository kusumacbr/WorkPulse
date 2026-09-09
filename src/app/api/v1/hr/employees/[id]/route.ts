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
      departmentName: body.departmentName,
      workMode: body.workMode,
      status: body.status,
      remainingLeaveBalance: body.remainingLeaveBalance !== undefined ? Number(body.remainingLeaveBalance) : undefined,
      phoneNumber: body.phoneNumber,
      location: body.location || body.workLocation,
      workLocation: body.workLocation || body.location,
    });

    // Persist directly to Supabase with cascading updates
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        const newName = body.name || updated?.name;
        const newEmail = body.email || updated?.email;
        let newDept = body.departmentName || body.department || updated?.departmentName;
        const newDeptId = body.departmentId || updated?.departmentId || "dept-development";
        if (!newDept && newDeptId) {
          const deptLookup = WorkpulseSharedStore.getDepartments().find((d) => d.id === newDeptId);
          if (deptLookup) newDept = deptLookup.name;
        }
        const newDesig = body.designation || body.role_title || updated?.designation;
        const newWorkMode = body.workMode || body.work_mode || updated?.workMode;
        const newLeaveBalance = body.remainingLeaveBalance ?? updated?.remainingLeaveBalance;
        const newLocation = body.location || body.workLocation || updated?.workLocation || updated?.location;
        const newPhoneNumber = body.phoneNumber || updated?.phoneNumber;
        const newStatus = body.status || updated?.status;

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
          .eq("id", id);

        const cascadeTasks: Promise<any>[] = [];

        if (newEmail || newName) {
          cascadeTasks.push(
            Promise.resolve(
              supabaseAdmin.from("profiles").update({
                full_name: newName,
                department: newDept,
                designation: newDesig,
                updated_at: new Date().toISOString(),
              }).or(`id.eq.${id},email.eq.${newEmail || id}`)
            )
          );
        }

        if (newName) {
          cascadeTasks.push(
            Promise.resolve(
              supabaseAdmin.from("employees").update({
                manager_name: newName,
              }).eq("manager_id", id)
            )
          );

          cascadeTasks.push(
            Promise.resolve(
              supabaseAdmin.from("workdays").update({
                employee_name: newName,
                department_name: newDept,
                ...(newWorkMode ? { work_mode: newWorkMode } : {}),
                updated_at: new Date().toISOString(),
              }).eq("employee_id", id)
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
              }).eq("employee_id", id)
            )
          );

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
              }).eq("employee_id", id)
            )
          );

          cascadeTasks.push(
            Promise.resolve(
              supabaseAdmin.from("biometric_punches").update({
                employee_name: newName,
              }).eq("employee_id", id)
            )
          );

          cascadeTasks.push(
            Promise.resolve(
              supabaseAdmin.from("feedbacks").update({
                employee_name: newName,
              }).eq("employee_id", id)
            )
          );
          cascadeTasks.push(
            Promise.resolve(
              supabaseAdmin.from("feedbacks").update({
                lead_name: newName,
              }).eq("lead_id", id)
            )
          );

          cascadeTasks.push(
            Promise.resolve(
              supabaseAdmin.from("regularization_requests").update({
                employee_name: newName,
                department_name: newDept,
                designation: newDesig,
              }).eq("employee_id", id)
            )
          );
        }

        await Promise.allSettled(cascadeTasks);
      }
    } catch (e: any) {
      console.warn("Supabase HR employee update error:", e.message);
    }

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

    // Hard delete from Supabase public.employees & associated tables
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        await Promise.allSettled([
          supabaseAdmin.from("leave_requests").delete().eq("employee_id", id),
          supabaseAdmin.from("wfh_requests").delete().eq("employee_id", id),
          supabaseAdmin.from("workdays").delete().eq("employee_id", id),
          supabaseAdmin.from("biometric_punches").delete().eq("employee_id", id),
          supabaseAdmin.from("feedbacks").delete().eq("employee_id", id),
          supabaseAdmin.from("regularization_requests").delete().eq("employee_id", id),
          supabaseAdmin.from("daily_tasks").delete().eq("employee_id", id),
          supabaseAdmin.from("notifications").delete().eq("user_id", id),
          supabaseAdmin.from("profiles").delete().eq("id", id),
          supabaseAdmin.from("employees").update({ manager_id: null, manager_name: null }).eq("manager_id", id),
        ]);

        await supabaseAdmin.from("employees").delete().eq("id", id);
      }
    } catch (e: any) {
      console.warn("Supabase HR employee delete error:", e.message);
    }

    if (!removed) {
      return apiError("Employee not found", 404);
    }

    return apiSuccess({ employee: removed, message: "Employee offboarded & archived" }, 200);
  } catch (err: any) {
    return apiError(err.message || "Failed to offboard employee", 400);
  }
}
