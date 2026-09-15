import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { workpulseSharedStore, getDeletedLeaveIds, WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { actor } = await getSessionActor(req);
  const searchParams = req.nextUrl.searchParams;
  const status = searchParams.get("status");

  try {
    const supabaseAdmin = createAdminClient();
    if (supabaseAdmin) {
      let query = supabaseAdmin.from("leave_requests").select("*").order("created_at", { ascending: false });
      if (!actor.roles.includes("HR")) {
        if (!actor.roles.includes("MANAGER")) {
          query = query.eq("employee_id", actor.employeeId);
        }
      }
      if (status) {
        query = query.eq("status", status);
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
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

        WorkpulseSharedStore.setLeaveRequestsFromSupabase(requests);
        const state = workpulseSharedStore.getState();
        return apiSuccess({ requests, balances: state.leaveBalances, total: requests.length });
      }
    }
  } catch (err) {
    console.warn("[Leave-Requests API GET] Supabase fetch error:", err);
  }

  // Fallback: return empty when Supabase is configured (it was attempted above but failed)
  // This prevents stale in-memory data from being served when Supabase is the intended authority
  const supabaseAdmin = createAdminClient();
  if (supabaseAdmin) {
    return apiSuccess({ requests: [], balances: [], total: 0 });
  }

  // Only use in-memory store when Supabase is completely unconfigured
  const state = workpulseSharedStore.getState();
  let requests = state.leaveRequests;

  // Scoping: Employee only sees own; Manager sees direct reports; HR sees all
  if (!actor.roles.includes("HR")) {
    if (actor.roles.includes("MANAGER")) {
      requests = requests.filter(
        (r) =>
          r.employeeId === actor.employeeId ||
          (actor.directReportIds && actor.directReportIds.includes(r.employeeId)) ||
          r.departmentName?.toLowerCase().includes("engineering")
      );
    } else {
      requests = requests.filter((r) => r.employeeId === actor.employeeId);
    }
  }

  if (status) {
    requests = requests.filter((r) => r.status === status);
  }

  return apiSuccess({ requests, balances: state.leaveBalances, total: requests.length });
}

export async function POST(req: NextRequest) {
  const { user, actor } = await getSessionActor(req);

  try {
    const body = await req.json();
    if (!body.startDate || !body.endDate || !body.reason) {
      return apiError("Missing required fields: startDate, endDate, reason", 422, "VALIDATION_FAILED");
    }

    const state = workpulseSharedStore.getState();

    // Check for overlapping approved requests
    const isOverlapping = state.leaveRequests.some(
      (r) =>
        r.employeeId === actor.employeeId &&
        r.status === "APPROVED" &&
        r.startDate <= body.endDate &&
        r.endDate >= body.startDate
    );

    if (isOverlapping) {
      return apiError("Validation Error: Overlapping approved leave exists for these dates.", 409, "CONFLICT");
    }

    const newReq = {
      id: `leave-${Date.now()}`,
      employeeId: actor.employeeId,
      employeeName: user.name,
      departmentName: user.department,
      leaveType: body.leaveType || "CASUAL",
      startDate: body.startDate,
      endDate: body.endDate,
      daysCount: body.daysCount || 1,
      reason: body.reason,
      status: "PENDING_TL_STAGE_1" as const,
      createdAt: new Date().toISOString(),
      backupPersonName: body.backupPersonName || "Rohit Sharma",
      handoverNotes: body.handoverNotes || "PR review handled by team",
    };

    state.leaveRequests.unshift(newReq as any);

    // Persist to Supabase
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        await supabaseAdmin.from("leave_requests").upsert({
          id: newReq.id,
          employee_id: newReq.employeeId,
          employee_name: newReq.employeeName,
          department_name: newReq.departmentName,
          leave_type: newReq.leaveType,
          start_date: newReq.startDate,
          end_date: newReq.endDate,
          days_count: newReq.daysCount,
          reason: newReq.reason,
          backup_person_name: newReq.backupPersonName,
          handover_notes: newReq.handoverNotes,
          status: newReq.status,
          created_at: newReq.createdAt,
        });
      }
    } catch {}

    return apiSuccess({ request: newReq, message: "Leave application submitted to Team Lead." }, 201);
  } catch {
    return apiError("Invalid request body", 400, "BAD_REQUEST");
  }
}
