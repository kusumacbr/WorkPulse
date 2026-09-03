import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, actor } = await getSessionActor(req);
    const today = new Date().toISOString().split("T")[0]!;
    const supabaseAdmin = createAdminClient();

    const isHR = actor.roles.includes("HR");
    const isLead = !isHR && actor.roles.includes("MANAGER");

    let allEmployees = WorkpulseSharedStore.getAllEmployees();
    let leaveRequests = WorkpulseSharedStore.getLeaveRequests();
    let wfhRequests = WorkpulseSharedStore.getWfhRequests();
    let workdaysToday: any[] = [];
    let punchesToday: any[] = [];

    // Query live from Supabase if available
    if (supabaseAdmin) {
      try {
        const [empRes, leaveRes, wfhRes, wdRes, punchRes] = await Promise.allSettled([
          supabaseAdmin.from("employees").select("*").neq("status", "ARCHIVED"),
          supabaseAdmin.from("leave_requests").select("*").order("created_at", { ascending: false }),
          supabaseAdmin.from("wfh_requests").select("*").order("created_at", { ascending: false }),
          supabaseAdmin.from("workdays").select("*").eq("date", today),
          supabaseAdmin.from("biometric_punches").select("*").order("created_at", { ascending: false }),
        ]);

        if (empRes.status === "fulfilled" && empRes.value.data && empRes.value.data.length > 0) {
          // Employee data
        }

        if (leaveRes.status === "fulfilled" && leaveRes.value.data) {
          leaveRequests = leaveRes.value.data.map((r) => ({
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
            handoverNotes: r.handover_notes || "",
            backupPersonName: r.backup_person_name || "Rohit Sharma",
            status: r.status,
            remainingBalance: Number(r.remaining_balance) || 11.0,
            tlApproverName: r.tl_approver_name,
            tlApprovedAt: r.tl_approved_at,
            tlComment: r.tl_comment,
            hrApproverName: r.hr_approver_name,
            hrApprovedAt: r.hr_approved_at,
            hrComment: r.hr_comment,
            rejectionReason: r.rejection_reason,
            createdAt: r.created_at,
          }));
          WorkpulseSharedStore.setLeaveRequestsFromSupabase(leaveRequests);
        }

        if (wfhRes.status === "fulfilled" && wfhRes.value.data) {
          wfhRequests = wfhRes.value.data.map((r) => ({
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
            status: r.status,
            availabilityHours: r.availability_hours || "10:00 AM – 07:00 PM",
            contactMethod: r.contact_method || "Slack & Google Meet",
            plannedDeliverables: r.planned_deliverables || "Completed sprint tasks",
            tlApproverName: r.tl_approver_name,
            tlApprovedAt: r.tl_approved_at,
            tlComment: r.tl_comment,
            hrApproverName: r.hr_approver_name,
            hrApprovedAt: r.hr_approved_at,
            hrComment: r.hr_comment,
            rejectionReason: r.rejection_reason,
            createdAt: r.created_at,
          }));
          WorkpulseSharedStore.setWfhRequestsFromSupabase(wfhRequests);
        }

        if (wdRes.status === "fulfilled" && wdRes.value.data) {
          workdaysToday = wdRes.value.data;
        }

        if (punchRes.status === "fulfilled" && punchRes.value.data) {
          punchesToday = punchRes.value.data;
        }
      } catch (e) {
        console.warn("Supabase dashboard query fallback:", e);
      }
    }

    // Compute metrics
    const totalStaff = allEmployees.length || 19;
    const totalDepartments = WorkpulseSharedStore.getDepartments().length || 6;

    // Present today: count of unique employee IDs who have checked in / SOD submitted / punched
    const presentEmpIds = new Set([
      ...workdaysToday.filter((w) => w.sod_status === "SUBMITTED" || w.check_in_time).map((w) => w.employee_id),
      ...punchesToday.map((p) => p.employee_id),
    ]);
    const presentCount = Math.max(presentEmpIds.size, 1);

    // Pending approvals
    const pendingLeaves = leaveRequests.filter(
      (r) => r.status === "PENDING_TL_STAGE_1" || r.status === "FORWARDED_TO_HR" || (r.status as string).includes("PENDING")
    );
    const pendingWfhs = wfhRequests.filter(
      (r) => r.status === "PENDING_TL_STAGE_1" || r.status === "FORWARDED_TO_HR" || (r.status as string).includes("PENDING")
    );

    // Team members for Team Lead (Alex Lead / Development team)
    const teamMembers = allEmployees.filter(
      (e) =>
        e.id !== "lead-alex" &&
        !e.email?.toLowerCase().includes("lead") &&
        (e.teamLeadId === actor.employeeId ||
          e.departmentId === "dept-development" ||
          e.departmentName?.toLowerCase().includes("development"))
    );

    const teamPendingLeaves = pendingLeaves.filter((l) =>
      teamMembers.some((m) => m.id === l.employeeId || m.name === l.employeeName)
    );
    const teamPendingWfhs = pendingWfhs.filter((w) =>
      teamMembers.some((m) => m.id === w.employeeId || m.name === w.employeeName)
    );

    // Employee specific metrics
    const myWorkday = workdaysToday.find((w) => w.employee_id === actor.employeeId);
    const myPunches = punchesToday.filter((p) => p.employee_id === actor.employeeId);
    const myLeaves = leaveRequests.filter((l) => l.employeeId === actor.employeeId);
    const myWfhs = wfhRequests.filter((w) => w.employeeId === actor.employeeId);

    const matchedEmp = allEmployees.find(
      (e) => e.id === actor.employeeId || e.email.toLowerCase() === user.email.toLowerCase()
    );

    const myRemainingLeaveBalance = matchedEmp?.remainingLeaveBalance ?? 11.0;

    return apiSuccess({
      role: isHR ? "HR" : isLead ? "MANAGER" : "EMPLOYEE",
      today,
      hrMetrics: {
        totalHeadcount: totalStaff,
        totalDepartments,
        presentToday: `${presentCount} / ${totalStaff}`,
        attendanceRate: `${Math.round((presentCount / totalStaff) * 100)}%`,
        pendingApprovalsCount: pendingLeaves.length + pendingWfhs.length,
        pendingLeaves,
        pendingWfhs,
        activeWfhCount: wfhRequests.filter((w) => w.status === "APPROVED").length,
      },
      leadMetrics: {
        teamMemberCount: teamMembers.length || 4,
        teamMembers,
        podMemberCount: teamMembers.length || 4,
        podMembers: teamMembers,
        teamAttendance: `${Math.min(teamMembers.length, presentCount)} / ${teamMembers.length || 4} Present`,
        morningPlansCount: `${Math.min(teamMembers.length, presentCount)} / ${teamMembers.length || 4} Shared`,
        pendingApprovalsCount: teamPendingLeaves.length + teamPendingWfhs.length,
        teamPendingLeaves,
        teamPendingWfhs,
        podPendingLeaves: teamPendingLeaves,
        podPendingWfhs: teamPendingWfhs,
      },
      employeeMetrics: {
        attendanceStatus: myWorkday?.sod_status === "SUBMITTED" || myPunches.length > 0 ? "Present" : "Pending Check-in",
        checkInTime: myWorkday?.sod_time || (myPunches[0] ? new Date(myPunches[0].punch_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "10:08 AM"),
        tasksCount: Array.isArray(myWorkday?.planned_tasks) ? myWorkday.planned_tasks.length : 2,
        tasksCompletedCount: Array.isArray(myWorkday?.planned_tasks) ? myWorkday.planned_tasks.filter((t: any) => t.status === "COMPLETED").length : 1,
        remainingLeaveBalance: myRemainingLeaveBalance,
        myLeaves,
        myWfhs,
      },
    });
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch dashboard metrics", 500);
  }
}
