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
        const { data } = await query;
        if (data && data.length > 0) {
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

    const startDate = body.startDate || body.date;
    const endDate = body.endDate || startDate;
    const reason = body.reason || "Remote workday";
    const plannedDeliverables = body.deliverables || body.plannedDeliverables || "Planned sprint deliverables";
    const availabilityHours = body.availabilityHours || "10:00 AM – 07:00 PM";
    const contactMethod = body.contactMethod || "Slack & Google Meet";

    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysCount = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    // TL's own WFH goes directly to HR
    const isLeadOrManager = actor.roles.includes("MANAGER") || user.primaryRole === "MANAGER";
    const initialStatus = isLeadOrManager ? "FORWARDED_TO_HR" : "PENDING_TL_STAGE_1";

    // Add to in-memory store
    const newReq = WorkpulseSharedStore.addWfhRequest({
      employeeId,
      employeeName,
      departmentId,
      departmentName,
      designation,
      startDate,
      endDate,
      daysCount,
      reason,
      availabilityHours,
      contactMethod,
      plannedDeliverables,
    });

    if (isLeadOrManager && newReq) {
      (newReq as any).status = initialStatus;
    }

    // Persist to Supabase
    try {
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        await supabaseAdmin.from("wfh_requests").upsert({
          id: newReq.id,
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
          status: initialStatus,
          tl_approver_name: isLeadOrManager ? `${employeeName} (Self — Auto-forwarded)` : null,
          tl_approved_at: isLeadOrManager ? new Date().toISOString() : null,
          tl_comment: isLeadOrManager ? "Auto-forwarded to HR (submitted by Team Lead)." : null,
        });
      }
    } catch {
      // graceful fallback
    }

    return apiSuccess({ request: newReq, message: "WFH request submitted and forwarded for approval" }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to apply for WFH", 400);
  }
}
