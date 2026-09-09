import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { WorkpulseSharedStore, getDeletedLeaveIds } from "@/lib/stores/workpulse-shared-store";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { actor } = await getSessionActor(req);
    const employeeId = actor.employeeId;

    // Always try Supabase first for fresh data with fast fallback
    try {
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        let query = supabaseAdmin.from("leave_requests").select("*").order("created_at", { ascending: false });
        if (!actor.roles.includes("HR")) {
          if (!actor.roles.includes("MANAGER")) {
            query = query.eq("employee_id", employeeId);
          }
        }
        const { data, error }: any = await Promise.race([
          query,
          new Promise((resolve) => setTimeout(() => resolve({ data: null, error: new Error("DB_TIMEOUT") }), 500)),
        ]);
        if (!error && data) {
          const deletedIds = getDeletedLeaveIds();
          const requests = data
            .map((r: any) => ({
              id: r.id,
              employeeId: r.employee_id,
              employeeName: r.employee_name,
              departmentId: r.department_id || "dept-development",
              departmentName: r.department_name || "Development",
              designation: r.designation || "Engineer",
              leaveType: r.leave_type || "CASUAL",
              startDate: r.start_date,
              endDate: r.end_date,
              daysCount: Number(r.days_count) || 1,
              reason: r.reason,
              handoverNotes: r.handover_notes,
              backupPersonName: r.backup_person_name,
              remainingBalance: Number(r.remaining_balance) || 11.0,
              status: r.status,
              tlApproverName: r.tl_approver_name,
              tlApprovedAt: r.tl_approved_at,
              tlComment: r.tl_comment,
              hrApproverName: r.hr_approver_name,
              hrApprovedAt: r.hr_approved_at,
              hrComment: r.hr_comment,
              rejectionReason: r.rejection_reason,
              createdAt: r.created_at,
            }))
            .filter((r: any) => !deletedIds.has(r.id));

          // Sync to in-memory store for live UI updates
          WorkpulseSharedStore.setLeaveRequestsFromSupabase(requests);

          // Get leave balance from Supabase
          const { data: empData } = await supabaseAdmin
            .from("employees")
            .select("leave_balance")
            .eq("id", employeeId)
            .maybeSingle();

          const balance = {
            employeeId,
            year: new Date().getFullYear(),
            leaveType: "CASUAL",
            annualAllotment: 12.0,
            usedDays: 0,
            pendingDays: 0,
            remainingDays: empData ? Number(empData.leave_balance) || 12.0 : 12.0,
          };

          return apiSuccess({ requests, balance });
        }
      }
    } catch {
      // safe fallback
    }

    // Fallback to in-memory store
    const requests = WorkpulseSharedStore.getLeaveRequests();
    const balance = {
      employeeId,
      year: new Date().getFullYear(),
      leaveType: "CASUAL",
      annualAllotment: 12.0,
      usedDays: 0,
      pendingDays: 0,
      remainingDays: 12.0,
    };

    return apiSuccess({ requests, balance });
  } catch (err: any) {
    return apiError(err.message || "Failed to list leave requests", 400);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, actor } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));

    // Resolve employee details
    const allEmployees = WorkpulseSharedStore.getAllEmployees();
    const matchedEmp = allEmployees.find(
      (e) => e.email.toLowerCase() === user.email.toLowerCase() || e.id === actor.employeeId
    ) || allEmployees[0];

    const employeeId = matchedEmp?.id || actor.employeeId || user.id;
    const employeeName = matchedEmp?.name || user.name || "Employee";
    const departmentName = matchedEmp?.departmentName || user.department || "Development";
    const departmentId = matchedEmp?.departmentId || "dept-development";
    const designation = matchedEmp?.designation || user.designation || "Engineer";

    const startDate = body.startDate;
    const endDate = body.endDate || body.startDate;
    const isHalfDay = Boolean(body.isHalfDay);
    const leaveType = body.leaveType || "CASUAL";
    const reason = body.reason || "Personal leave";

    // Calculate days count
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysCount = isHalfDay ? 0.5 : Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const remainingBalance = matchedEmp?.remainingLeaveBalance ?? 12.0;

    // Determine initial status: if actor is a TL/Manager, skip TL stage → go directly to HR
    const isLeadOrManager = actor.roles.includes("MANAGER") || user.primaryRole === "MANAGER";
    const initialStatus = isLeadOrManager ? "FORWARDED_TO_HR" : "PENDING_TL_STAGE_1";

    // Create in-memory request
    const newReq = WorkpulseSharedStore.addLeaveRequest({
      id: body.id,
      employeeId,
      employeeName,
      departmentId,
      departmentName,
      designation,
      leaveType,
      startDate,
      endDate,
      daysCount,
      reason,
      handoverNotes: body.handoverNotes,
      backupPersonName: body.backupPersonName,
    });

    // Override status for TL's own requests
    if (isLeadOrManager && newReq) {
      (newReq as any).status = initialStatus;
    }

    // Persist to Supabase with fast timeout cap so API responds in milliseconds
    try {
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        const upsertPromise = supabaseAdmin.from("leave_requests").upsert({
          id: newReq.id,
          employee_id: employeeId,
          employee_name: employeeName,
          employee_email: user.email,
          department_name: departmentName,
          department_id: departmentId,
          designation,
          leave_type: leaveType,
          start_date: startDate,
          end_date: endDate,
          days_count: daysCount,
          reason,
          handover_notes: body.handoverNotes || null,
          backup_person_name: body.backupPersonName || null,
          remaining_balance: remainingBalance,
          status: initialStatus,
          tl_approver_name: isLeadOrManager ? `${employeeName} (Self — Auto-forwarded)` : null,
          tl_approved_at: isLeadOrManager ? new Date().toISOString() : null,
          tl_comment: isLeadOrManager ? "Auto-forwarded to HR (submitted by Team Lead)." : null,
        });

        await Promise.race([
          upsertPromise,
          new Promise((resolve) => setTimeout(resolve, 300)),
        ]);
      }
    } catch {
      // graceful fallback
    }

    return apiSuccess({ request: newReq, message: "Leave application submitted and forwarded for approval" }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to apply for leave", 400);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    let employeeId: string | undefined;
    try {
      const { actor } = await getSessionActor(req);
      employeeId = actor.employeeId;
    } catch {}

    const body = await req.json().catch(() => ({}));
    const targetEmpId = body.employeeId || employeeId;

    try {
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        if (targetEmpId) {
          await supabaseAdmin.from("leave_requests").delete().eq("employee_id", targetEmpId);
        } else {
          await supabaseAdmin.from("leave_requests").delete().neq("id", "__dummy__");
        }
      }
    } catch (err) {
      console.warn("[Leave Bulk DELETE API] Supabase delete warning:", err);
    }

    return apiSuccess({ success: true, message: "Leave requests permanently deleted from Supabase." });
  } catch (err: any) {
    return apiError(err.message || "Failed to delete leave requests", 400);
  }
}
