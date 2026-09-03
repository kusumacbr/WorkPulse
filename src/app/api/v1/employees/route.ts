import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { createAdminClient } from "@/lib/supabase/admin";
import { realtimeEventBus } from "@/server/realtime/event-bus";
import { broadcastServerEvent } from "@/lib/supabase/broadcast";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { actor } = await getSessionActor(req);
    const searchParams = req.nextUrl?.searchParams || new URL(req.url).searchParams;
    const deptFilter = searchParams.get("departmentId");
    const searchQuery = searchParams.get("search")?.toLowerCase();

    let liveEmployees: any[] = [];

    // Query Supabase directly
    try {
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        const { data: supaEmployees, error } = await supabaseAdmin
          .from("employees")
          .select("*")
          .neq("status", "ARCHIVED")
          .order("created_at", { ascending: true });

        if (!error && supaEmployees && supaEmployees.length > 0) {
          liveEmployees = supaEmployees.map((se) => {
            const deptName = se.department || "Development";
            const deptId =
              se.department_id ||
              (deptName.toLowerCase().includes("devops")
                ? "dept-devops"
                : deptName.toLowerCase().includes("data")
                ? "dept-data-processing"
                : deptName.toLowerCase().includes("r & d") || deptName.toLowerCase().includes("rd")
                ? "dept-rd"
                : deptName.toLowerCase().includes("configtap") || deptName.toLowerCase().includes("service")
                ? "dept-configtap"
                : deptName.toLowerCase().includes("hr") || deptName.toLowerCase().includes("human")
                ? "dept-hr"
                : "dept-development");

            const isLead =
              se.id.startsWith("lead-") ||
              se.id.startsWith("admin-") ||
              (se.role_title && se.role_title.toLowerCase().includes("lead")) ||
              (se.role_title && se.role_title.toLowerCase().includes("director"));

            return {
              id: se.id,
              name: se.name,
              email: se.email,
              designation: se.role_title || se.designation || "Engineer",
              departmentId: deptId,
              departmentName: deptName,
              teamLeadId: se.manager_id || (deptId === "dept-devops" ? "lead-marcus" : deptId === "dept-data-processing" ? "lead-vikram" : deptId === "dept-rd" ? "admin-david" : deptId === "dept-hr" ? "admin-david" : "lead-alex"),
              teamLeadName: se.manager_name || (deptId === "dept-devops" ? "Marcus Vance" : deptId === "dept-data-processing" ? "Vikram Rao" : deptId === "dept-rd" ? "David Director" : deptId === "dept-hr" ? "David Director" : "Alex Lead"),
              avatar: se.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
              workMode: se.work_mode || "OFFICE",
              status: se.status || "ACTIVE",
              employmentType: se.employment_type || "Full-Time",
              remainingLeaveBalance: Number(se.leave_balance) || 12.0,
              joiningDate: se.joining_date || "2025-06-01",
              phoneNumber: se.phone_number || "+91 98450 11223",
              location: se.location || "Bangalore HQ",
              workLocation: se.location || "Bangalore HQ",
              isLead,
              sodStatus: "SUBMITTED",
              sodTime: "10:15 AM",
              eodStatus: "IN_PROGRESS",
              overallProgress: 80,
              plannedTasks: [],
            };
          });

          // Sync into shared store
          WorkpulseSharedStore.setEmployeesFromSupabase(liveEmployees);
        }
      }
    } catch (e) {
      console.warn("Supabase direct query fallback:", e);
    }

    if (liveEmployees.length === 0) {
      liveEmployees = WorkpulseSharedStore.getAllEmployees();
    }

    let employees = liveEmployees;

    // Role scoping: Manager can only view direct reports if not HR
    if (!actor.roles.includes("HR")) {
      if (actor.roles.includes("MANAGER")) {
        employees = employees.filter(
          (e) =>
            e.id === actor.employeeId ||
            (actor.directReportIds && actor.directReportIds.includes(e.id)) ||
            (e.teamLeadName &&
              (e.teamLeadName.toLowerCase().includes("alex") ||
                e.teamLeadName.toLowerCase().includes("lead")))
        );
      } else {
        // Employee only sees self
        employees = employees.filter((e) => e.id === actor.employeeId);
      }
    }

    if (deptFilter && deptFilter !== "ALL") {
      employees = employees.filter((e) => e.departmentId === deptFilter);
    }

    if (searchQuery) {
      employees = employees.filter(
        (e) =>
          e.name.toLowerCase().includes(searchQuery) ||
          e.designation.toLowerCase().includes(searchQuery) ||
          (e.departmentName && e.departmentName.toLowerCase().includes(searchQuery))
      );
    }

    return apiSuccess({
      employees,
      total: employees.length,
    });
  } catch (err: any) {
    return apiError(err.message || "Failed to list employees", 500);
  }
}

export async function POST(req: NextRequest) {
  const { actor } = await getSessionActor(req);
  if (!actor.roles.includes("HR")) {
    return apiError("Forbidden: Only HR can onboard/create employee records.", 403, "FORBIDDEN");
  }

  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      const text = await req.text();
      body = text ? JSON.parse(text) : {};
    }

    if (!body || !body.name || !body.email || !body.designation) {
      return apiError("Missing required fields: name, email, designation", 422, "VALIDATION_FAILED");
    }

    const created = WorkpulseSharedStore.addEmployee({
      name: String(body.name).trim(),
      email: String(body.email).trim(),
      designation: String(body.designation).trim(),
      departmentId: body.departmentId || "dept-development",
      departmentName: body.departmentName,
      workMode: body.workMode || "OFFICE",
      status: body.status || "Full-Time",
      employmentType: body.employmentType || "Full-Time",
      remainingLeaveBalance: body.remainingLeaveBalance !== undefined ? Number(body.remainingLeaveBalance) : 12.0,
      joiningDate: body.joiningDate || body.hireDate || new Date().toISOString().split("T")[0],
      phoneNumber: body.phoneNumber || "+91 98450 11223",
      location: body.location || body.workLocation || "Bangalore HQ",
    });

    if (!created) {
      return apiError("Failed to onboard employee", 400, "BAD_REQUEST");
    }

    // Persist to Supabase public.employees
    try {
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        await supabaseAdmin.from("employees").upsert({
          id: created.id,
          name: created.name,
          email: created.email,
          role_title: created.designation,
          department: created.departmentName,
          department_id: created.departmentId,
          work_mode: created.workMode,
          status: created.status || "ACTIVE",
          employment_type: created.employmentType || "Full-Time",
          leave_balance: created.remainingLeaveBalance,
          phone_number: created.phoneNumber,
          location: created.location,
          joining_date: created.joiningDate,
          manager_id: created.teamLeadId,
          manager_name: created.teamLeadName,
        });

      }
    } catch (err: any) {
      console.warn("Supabase employee sync warning:", err.message);
    }

    // Broadcast real-time event across Supabase Realtime channel and server event bus
    await broadcastServerEvent("employee:created", created);
    realtimeEventBus.emit("employee:created", created);

    return apiSuccess({ employee: created, message: "Employee record successfully created." }, 201);
  } catch (err: any) {
    return apiError(err.message || "Invalid request body payload", 400, "BAD_REQUEST");
  }
}

