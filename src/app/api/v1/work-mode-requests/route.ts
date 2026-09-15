import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { workpulseSharedStore, WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { actor } = await getSessionActor(req);

  // Always try Supabase first for authoritative data
  try {
    const supabaseAdmin = createAdminClient();
    if (supabaseAdmin) {
      let query = supabaseAdmin.from("wfh_requests").select("*").order("created_at", { ascending: false });
      if (!actor.roles.includes("HR")) {
        if (!actor.roles.includes("MANAGER")) {
          query = query.eq("employee_id", actor.employeeId);
        }
      }
      const { data, error } = await query;
      if (!error && Array.isArray(data)) {
        const requests = data.map((r: any) => ({
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
          deliverables: r.planned_deliverables,
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

        WorkpulseSharedStore.setWfhRequestsFromSupabase(requests);
        return apiSuccess({ requests, total: requests.length });
      }
    }
  } catch (err) {
    console.warn("[WorkModeRequests API GET] Supabase fetch error:", err);
  }

  // Fallback: return empty when Supabase is configured
  const supabaseAdmin = createAdminClient();
  if (supabaseAdmin) {
    return apiSuccess({ requests: [], total: 0 });
  }

  // Only use in-memory store when Supabase is completely unconfigured
  const state = workpulseSharedStore.getState();
  return apiSuccess({ requests: state.wfhRequests, total: state.wfhRequests.length });
}

export async function POST(req: NextRequest) {
  const { user, actor } = await getSessionActor(req);

  try {
    const body = await req.json();
    if (!body.startDate || !body.endDate || !body.reason) {
      return apiError("Missing required fields: startDate, endDate, reason", 422, "VALIDATION_FAILED");
    }

    const state = workpulseSharedStore.getState();
    const newReq = {
      id: `wfh-${Date.now()}`,
      employeeId: actor.employeeId,
      employeeName: user.name,
      departmentName: user.department,
      startDate: body.startDate,
      endDate: body.endDate,
      daysCount: body.daysCount || 1,
      reason: body.reason,
      deliverables: body.deliverables || body.plannedDeliverables || "Architecture documentation",
      availabilityHours: body.availabilityHours || "10:00 AM - 07:00 PM",
      contactMethod: body.contactMethod || "Slack & Google Meet",
      status: "FORWARDED_TO_HR" as const,
      createdAt: new Date().toISOString(),
    };

    state.wfhRequests.unshift(newReq as any);

    // Persist to Supabase
    try {
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        await supabaseAdmin.from("wfh_requests").upsert({
          id: newReq.id,
          employee_id: newReq.employeeId,
          employee_name: newReq.employeeName,
          department_name: newReq.departmentName,
          start_date: newReq.startDate,
          end_date: newReq.endDate,
          days_count: newReq.daysCount,
          reason: newReq.reason,
          planned_deliverables: newReq.deliverables,
          availability_hours: newReq.availabilityHours,
          contact_method: newReq.contactMethod,
          status: newReq.status,
          created_at: newReq.createdAt,
        });
      }
    } catch {}

    return apiSuccess({ request: newReq, message: "Work-from-home request submitted." }, 201);
  } catch {
    return apiError("Invalid request body", 400, "BAD_REQUEST");
  }
}
