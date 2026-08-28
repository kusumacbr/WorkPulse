import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { LeaveService } from "@/server/services/leave-service";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { actor } = await getSessionActor(req);
    let requests = WorkpulseSharedStore.getWfhRequests();

    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        let query = supabaseAdmin.from("wfh_requests").select("*").order("created_at", { ascending: false });
        if (!actor.roles.includes("HR")) {
          if (!actor.roles.includes("MANAGER")) {
            query = query.eq("employee_id", actor.employeeId);
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
            startDate: r.start_date,
            endDate: r.end_date,
            daysCount: Number(r.days_count) || 1,
            reason: r.reason,
            availabilityHours: r.availability_hours || "10:00 AM – 07:00 PM",
            contactMethod: r.contact_method || "Slack & Zoom",
            plannedDeliverables: r.planned_deliverables,
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

    return apiSuccess({ requests });
  } catch (err: any) {
    return apiError(err.message || "Failed to list WFH requests", 400);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, actor } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));
    const employeeId = body.employeeId || actor.employeeId || user.id;

    const request = await LeaveService.submitWfhRequest({
      actor,
      employeeId,
      input: {
        startDate: body.startDate || body.date,
        endDate: body.endDate || body.startDate || body.date,
        reason: body.reason || "Remote workday",
        plannedDeliverables: body.deliverables || body.plannedDeliverables || "Planned sprint deliverables",
      },
    });

    return apiSuccess({ request, message: "WFH request submitted and forwarded for approval" }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to apply for WFH", 400);
  }
}
