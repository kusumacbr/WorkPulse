import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { actor } = await getSessionActor(req);

    // Always try Supabase first
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
        if (!error && data) {
          const requests = data
            .map((r: any) => ({
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

          // Sync to in-memory store
          WorkpulseSharedStore.setWfhRequestsFromSupabase(requests);

          return apiSuccess({ requests });
        }
      }
    } catch {
      // safe fallback
    }

    // Fallback to in-memory
    const requests = WorkpulseSharedStore.getWfhRequests();
    return apiSuccess({ requests });
  } catch (err: any) {
    return apiError(err.message || "Failed to list WFH requests", 400);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, actor } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));

    // Generate/Resolve fields if they are missing (e.g. from test suite)
    const id = body.id || `wfh-req-v2-${Date.now()}`;
    const employeeId = body.employeeId || actor.employeeId || user.id;
    const employeeName = body.employeeName || user.name || "Employee";
    const departmentName = body.departmentName || user.department || "Development";
    const departmentId = body.departmentId || "dept-development";
    const designation = body.designation || user.designation || "Engineer";

    const startDate = body.startDate || body.date || new Date().toISOString();
    const endDate = body.endDate || startDate;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysCount = body.daysCount || Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);
    
    const reason = body.reason || "Remote workday";
    const plannedDeliverables = body.deliverables || body.plannedDeliverables || "Planned sprint deliverables";
    const availabilityHours = body.availabilityHours || "10:00 AM – 07:00 PM";
    const contactMethod = body.contactMethod || "Slack & Google Meet";

    const isLeadOrManager = actor.roles.includes("MANAGER") || user.primaryRole === "MANAGER";
    const status = body.status || (isLeadOrManager ? "FORWARDED_TO_HR" : "PENDING_TL_STAGE_1");

    // Persist to Supabase directly
    try {
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        await supabaseAdmin.from("wfh_requests").upsert({
          id,
          employee_id: employeeId,
          employee_name: employeeName,
          employee_email: user.email,
          department_name: departmentName,
          department_id: departmentId,
          designation,
          start_date: startDate,
          end_date: endDate,
          days_count: daysCount,
          reason,
          availability_hours: availabilityHours,
          contact_method: contactMethod,
          planned_deliverables: plannedDeliverables,
          status,
          tl_approver_name: isLeadOrManager ? `${employeeName} (Self — Auto-forwarded)` : null,
          tl_approved_at: isLeadOrManager ? new Date().toISOString() : null,
          tl_comment: isLeadOrManager ? "Auto-forwarded to HR (submitted by Team Lead)." : null,
        });
      }
    } catch (err) {
      console.error("[WFH POST] Supabase write error:", err);
      return apiError("Failed to persist to database", 500);
    }

    return apiSuccess({ request: { id, status }, message: "WFH request submitted successfully" }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to apply for WFH", 400);
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
          await supabaseAdmin.from("wfh_requests").delete().eq("employee_id", targetEmpId);
        } else {
          await supabaseAdmin.from("wfh_requests").delete().neq("id", "__dummy__");
        }
      }
    } catch (err) {
      console.warn("[WFH Bulk DELETE API] Supabase delete warning:", err);
    }

    return apiSuccess({ success: true, message: "WFH requests permanently deleted from Supabase." });
  } catch (err: any) {
    return apiError(err.message || "Failed to delete WFH requests", 400);
  }
}
