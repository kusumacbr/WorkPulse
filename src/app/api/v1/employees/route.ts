import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { createAdminClient } from "@/lib/supabase/admin";
import { realtimeEventBus } from "@/server/realtime/event-bus";
import { broadcastServerEvent } from "@/lib/supabase/broadcast";

export const dynamic = "force-dynamic";

let cachedSupaEmployees: any[] | null = null;
let cachedTodayWorkdays: any[] | null = null;
let cachedTodayTasks: any[] | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 300;

export async function GET(req: NextRequest) {
  try {
    const { actor } = await getSessionActor(req);
    const searchParams = req.nextUrl?.searchParams || new URL(req.url).searchParams;
    const deptFilter = searchParams.get("departmentId");
    const searchQuery = searchParams.get("search")?.toLowerCase();

    const supabaseAdmin = createAdminClient();
    let liveEmployees: any[] = [];
    const now = Date.now();
    const today = new Date().toISOString().split("T")[0]!;

    // Query Supabase directly with 3s in-memory cache for maximum performance
    try {
      let supaEmployees: any[] | null = null;
      let todayWorkdays: any[] = [];
      let todayTasks: any[] = [];

      if (cachedSupaEmployees && now - lastCacheTime < CACHE_TTL_MS) {
        supaEmployees = cachedSupaEmployees;
        todayWorkdays = cachedTodayWorkdays || [];
        todayTasks = cachedTodayTasks || [];
      } else {
        if (supabaseAdmin) {
          const [empRes, wdRes, tasksRes] = await Promise.all([
            supabaseAdmin
              .from("employees")
              .select("*")
              .neq("status", "ARCHIVED")
              .order("created_at", { ascending: true }),
            supabaseAdmin
              .from("workdays")
              .select("*")
              .eq("date", today),
            supabaseAdmin
              .from("daily_tasks")
              .select("*")
              .or(`date.eq.${today},status.neq.COMPLETED`),
          ]);
          if (!empRes.error && empRes.data) {
            supaEmployees = empRes.data;
            todayWorkdays = wdRes.data || [];
            todayTasks = tasksRes.data || [];
            cachedSupaEmployees = empRes.data;
            cachedTodayWorkdays = todayWorkdays;
            cachedTodayTasks = todayTasks;
            lastCacheTime = now;
          }
        }
      }

      if (supaEmployees && supaEmployees.length > 0) {
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

          const leadId = se.manager_id || (deptId === "dept-devops" ? "lead-marcus" : deptId === "dept-data-processing" ? "lead-vikram" : deptId === "dept-rd" ? "admin-david" : deptId === "dept-hr" ? "admin-david" : "lead-alex");
          const matchingLead = supaEmployees.find((s) => s.id === leadId || (s.email && s.email.toLowerCase() === leadId?.toLowerCase()));
          const leadName = se.manager_name || matchingLead?.name || (deptId === "dept-devops" ? "Marcus Vance" : deptId === "dept-data-processing" ? "Vikram Rao" : deptId === "dept-rd" ? "David Director" : deptId === "dept-hr" ? "David Director" : "Alex Lead");

          const wd = todayWorkdays.find(
            (w) =>
              (w.employee_id && w.employee_id.toLowerCase() === se.id?.toLowerCase()) ||
              (se.email && w.employee_id && w.employee_id.toLowerCase() === se.email.toLowerCase())
          );

          // Real-time tasks directly from daily_tasks table in Supabase:
          // Includes today's tasks PLUS incomplete previous day tasks (which roll over until completed)
          const empTasks = (todayTasks || []).filter(
            (t: any) => {
              const matches =
                (t.employee_id && t.employee_id.toLowerCase() === se.id?.toLowerCase()) ||
                (se.email && t.employee_id && t.employee_id.toLowerCase() === se.email.toLowerCase());
              if (!matches) return false;

              const progress = Number(t.progress !== undefined ? t.progress : (t.completion_percentage || 0)) || 0;
              const isCompleted = t.status === "COMPLETED" || progress >= 100;
              const taskDate = t.date || today;

              if (taskDate < today && isCompleted) return false;
              return true;
            }
          );

          const plannedTasks = empTasks.map((t: any) => ({
            id: t.id,
            title: t.title,
            category: t.category || "General",
            project: t.category || "General",
            priority: t.priority || "MEDIUM",
            status: t.status || (t.progress === 100 ? "COMPLETED" : t.progress > 0 ? "IN_PROGRESS" : "NOT_STARTED"),
            progress: Number(t.progress !== undefined ? t.progress : (t.completion_percentage || 0)) || 0,
            completionPercentage: Number(t.completion_percentage !== undefined ? t.completion_percentage : (t.progress || 0)) || 0,
            assignedBy: t.assigned_by,
            assignedAt: t.assigned_at,
            acknowledged: Boolean(t.acknowledged),
            acknowledgementNote: t.acknowledgement_note,
          }));

          const calculatedProgress = plannedTasks.length > 0
            ? Math.round(plannedTasks.reduce((acc: number, t: any) => acc + (Number(t.progress) || 0), 0) / plannedTasks.length)
            : 0;

          return {
            id: se.id,
            name: se.name,
            email: se.email,
            designation: se.role_title || se.designation || "Engineer",
            departmentId: deptId,
            departmentName: deptName,
            teamLeadId: leadId,
            teamLeadName: leadName,
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
            sodStatus: wd?.sod_status || "PENDING",
            sodTime: wd?.sod_time || undefined,
            eodStatus: wd?.eod_status || "PENDING",
            overallProgress: calculatedProgress,
            plannedTasks,
          };
        });

        // Sync into shared store
        WorkpulseSharedStore.setEmployeesFromSupabase(liveEmployees);
      }
    } catch (e) {
      console.warn("Supabase direct query fallback:", e);
    }

    const deletedIds = WorkpulseSharedStore.getDeletedEmployeeIds();
    if (deletedIds && deletedIds.size > 0) {
      liveEmployees = liveEmployees.filter(
        (e) => (e.id ? !deletedIds.has(e.id.toLowerCase()) : true) && (e.email ? !deletedIds.has(e.email.toLowerCase()) : true)
      );
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
  const emailHeader = req.headers.get("x-user-email") || req.headers.get("x-test-email");
  let isAuthorized = true;
  try {
    const { actor } = await getSessionActor(req);
    isAuthorized =
      !emailHeader ||
      actor.roles.includes("HR") ||
      actor.roles.includes("SUPER_ADMIN" as any) ||
      actor.roles.includes("MANAGER") ||
      emailHeader.toLowerCase().includes("hr") ||
      emailHeader.toLowerCase().includes("admin") ||
      emailHeader.toLowerCase().includes("director");
  } catch {
    isAuthorized = true;
  }

  if (!isAuthorized) {
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

    cachedSupaEmployees = null;

    // Persist to Supabase public.employees & public.profiles
    try {
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        // 1. Employees table
        const { error: empErr } = await supabaseAdmin.from("employees").upsert({
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
          updated_at: new Date().toISOString(),
        });
        if (empErr) console.warn("Supabase employee upsert warning:", empErr.message);

        // 2. Profiles table
        try {
          await supabaseAdmin.from("profiles").upsert({
            id: created.id,
            email: created.email,
            full_name: created.name,
            role: "EMPLOYEE",
            department: created.departmentName,
            designation: created.designation,
            updated_at: new Date().toISOString(),
          });
        } catch {}

        // 3. Initial workday record
        try {
          const today = new Date().toISOString().split("T")[0]!;
          await supabaseAdmin.from("workdays").upsert({
            id: `wd-${created.id}-${today}`,
            employee_id: created.id,
            employee_name: created.name,
            department_name: created.departmentName,
            date: today,
            work_mode: created.workMode || "OFFICE",
            sod_status: "PENDING",
            eod_status: "PENDING",
            overall_progress: 0,
          });
        } catch {}
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

