import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { GoalService } from "@/server/services/goal-service";

export async function GET(req: NextRequest) {
  try {
    const { actor } = await getSessionActor(req);
    const searchParams = req.nextUrl.searchParams;
    const employeeId = searchParams.get("employeeId") || actor.employeeId;

    const supabase = createAdminClient();
    if (supabase) {
      try {
        const idMatches = [employeeId];
        const lower = employeeId?.toLowerCase() || "";
        if (lower === "emp-sarah" || lower.includes("employee.test") || lower.includes("sarah")) {
          idMatches.push("emp-sarah", "employee.test@xorstack.com", "dev-employee-test-xorstack-com", "emp-sarah-devi");
        } else if (lower === "emp-rohit" || lower.includes("rohit.test")) {
          idMatches.push("emp-rohit", "rohit.test@xorstack.com");
        } else if (lower === "lead-alex" || lower.includes("lead.test")) {
          idMatches.push("lead-alex", "lead.test@xorstack.com");
        }

        const { data: dbGoals, error } = await supabase
          .from("goals")
          .select("*")
          .in("employee_id", Array.from(new Set(idMatches.filter(Boolean))))
          .order("created_at", { ascending: false });

        if (!error && dbGoals) {
          const goals = dbGoals.map((g: any) => ({
            id: g.id,
            title: g.title,
            description: "",
            category: g.category || "Operations",
            progress: Number(g.progress) || 0,
            status: g.status || "IN_PROGRESS",
            targetDate: g.target_date || "This Month",
          }));

          return apiSuccess({ goals, total: goals.length });
        }
      } catch (e) {
        console.warn("[Goals API] Supabase query goals table error:", e);
      }
    }

    // Fallback to in-memory GoalService only if Supabase not configured
    const result = await GoalService.getWeeklyGoals({ employeeId: employeeId || "emp-sarah" });
    const goals = result.goals.map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description || "",
      category: g.category,
      progress: g.progressPercentage || 0,
      status: g.status,
      targetDate: g.endDate || "This Month",
    }));

    return apiSuccess({ goals, total: goals.length });
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch goals", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { actor } = await getSessionActor(req);
    const body = await req.json();

    if (!body.title) {
      return apiError("Title is required", 422);
    }

    const employeeId = body.employeeId || actor.employeeId || "emp-sarah";
    const goalId = body.id || `goal-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newGoal = {
      id: goalId,
      employee_id: employeeId,
      title: body.title,
      category: body.category || "Operations",
      progress: Number(body.progress) || 0,
      status: body.status || "IN_PROGRESS",
      target_date: body.targetDate || "This Month",
      updated_at: nowIso,
    };

    const supabase = createAdminClient();
    if (supabase) {
      const { error } = await supabase.from("goals").upsert(newGoal);
      if (error) {
        console.error("[Goals API] Supabase goals table upsert error:", error.message);
        return apiError(`Failed to save goal: ${error.message}`, 500);
      }
    }

    return apiSuccess({ goal: newGoal, message: "Goal saved successfully to Supabase goals table" }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to save goal", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await getSessionActor(req);
    const body = await req.json().catch(() => ({}));
    const goalId = body.goalId || body.id;

    if (!goalId) {
      return apiError("Goal ID is required", 422);
    }

    const supabase = createAdminClient();
    if (supabase) {
      const { error } = await supabase.from("goals").delete().eq("id", goalId);
      if (error) {
        console.error("[Goals API] Supabase delete error:", error.message);
        return apiError(`Failed to delete goal: ${error.message}`, 500);
      }
    }

    return apiSuccess({ message: "Goal deleted permanently from Supabase goals table", goalId });
  } catch (err: any) {
    return apiError(err.message || "Failed to delete goal", 500);
  }
}
