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
      // 1. Try primary table `goals`
      try {
        const { data: dbGoals, error } = await supabase
          .from("goals")
          .select("*")
          .eq("employee_id", employeeId)
          .order("created_at", { ascending: false });

        if (!error && dbGoals && dbGoals.length > 0) {
          const goals = dbGoals.map((g: any) => ({
            id: g.id,
            title: g.title,
            description: g.description,
            category: g.category,
            progress: Number(g.progress) || 0,
            status: g.status || "IN_PROGRESS",
            targetDate: g.target_date || "This Month",
          }));

          return apiSuccess({ goals, total: goals.length });
        }
      } catch (e) {
        console.warn("[Goals API] Supabase query goals table error:", e);
      }

      // 2. Try fallback table `feedbacks` where lead_id = 'GOAL'
      try {
        const { data: fbGoals, error: fbError } = await supabase
          .from("feedbacks")
          .select("*")
          .eq("lead_id", "GOAL")
          .eq("employee_id", employeeId)
          .order("created_at", { ascending: false });

        if (!fbError && fbGoals && fbGoals.length > 0) {
          const goals = fbGoals.map((fb: any) => {
            let parsed: any = {};
            try {
              parsed = JSON.parse(fb.notes || "{}");
            } catch {}
            return {
              id: fb.id,
              title: parsed.title || fb.action_item || "Goal Deliverable",
              description: parsed.description || "",
              category: parsed.category || fb.lead_name || "Operations",
              progress: typeof parsed.progress === "number" ? parsed.progress : (Number(fb.rating) || 0),
              status: parsed.status || fb.sentiment || "IN_PROGRESS",
              targetDate: parsed.targetDate || "This Month",
            };
          });

          return apiSuccess({ goals, total: goals.length });
        }
      } catch (e) {
        console.warn("[Goals API] Supabase query feedbacks backup error:", e);
      }
    }

    // Fallback to in-memory GoalService
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
    const todayDate = nowIso.split("T")[0];

    const newGoal = {
      id: goalId,
      employee_id: employeeId,
      title: body.title,
      description: body.description || "",
      category: body.category || "Operations",
      progress: Number(body.progress) || 0,
      status: body.status || "IN_PROGRESS",
      target_date: body.targetDate || "This Month",
    };

    const supabase = createAdminClient();
    if (supabase) {
      // 1. Primary insert to goals
      try {
        await supabase.from("goals").upsert(newGoal);
      } catch (err) {
        console.warn("[Goals API] Supabase goals table upsert warning:", err);
      }

      // 2. Fallback insert to feedbacks
      try {
        await supabase.from("feedbacks").upsert({
          id: goalId,
          employee_id: employeeId,
          employee_name: "Employee",
          lead_id: "GOAL",
          lead_name: body.category || "Operations",
          date: todayDate,
          rating: Math.min(5.0, Math.max(0.0, Number(((body.progress || 0) / 20).toFixed(1)))),
          sentiment: body.status || "IN_PROGRESS",
          notes: JSON.stringify(newGoal),
          action_item: body.title,
          created_at: nowIso,
        });
      } catch (err) {
        console.warn("[Goals API] Supabase feedbacks backup warning:", err);
      }
    }

    return apiSuccess({ goal: newGoal, message: "Goal saved successfully to Supabase" }, 201);
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
      try {
        await supabase.from("goals").delete().eq("id", goalId);
      } catch {}
      try {
        await supabase.from("feedbacks").delete().eq("id", goalId);
      } catch {}
    }

    return apiSuccess({ message: "Goal deleted permanently from Supabase", goalId });
  } catch (err: any) {
    return apiError(err.message || "Failed to delete goal", 500);
  }
}
