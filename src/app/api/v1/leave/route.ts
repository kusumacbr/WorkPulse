import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { LeaveService } from "@/server/services/leave-service";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, actor } = await getSessionActor(req);
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId") || actor.employeeId || user.id;

    let requests = WorkpulseSharedStore.getLeaveRequests();

    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        let query = supabaseAdmin.from("leave_requests").select("*").order("created_at", { ascending: false });
        if (!actor.roles.includes("HR")) {
          if (!actor.roles.includes("MANAGER")) {
            query = query.eq("employee_id", employeeId);
          }
        }
        const { data } = await query;
        if (data && data.length > 0) {
          requests = data.map((r: any) => ({
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
          }));
        }
      }
    } catch {
      // safe fallback
    }

    const balance = await LeaveService.getLeaveBalance({ employeeId });

    return apiSuccess({ requests, balance });
  } catch (err: any) {
    return apiError(err.message || "Failed to list leave requests", 400);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, actor } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));
    const employeeId = body.employeeId || actor.employeeId || user.id;

    const request = await LeaveService.submitLeaveRequest({
      actor,
      employeeId,
      input: {
        leaveType: body.leaveType || "CASUAL",
        startDate: body.startDate,
        endDate: body.endDate || body.startDate,
        isHalfDay: Boolean(body.isHalfDay),
        reason: body.reason || "Personal leave",
        handoverNotes: body.handoverNotes,
      },
    });

    return apiSuccess({ request, message: "Leave application submitted and forwarded for approval" }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to apply for leave", 400);
  }
}
