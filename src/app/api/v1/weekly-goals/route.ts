import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function GET(_req: NextRequest) {
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabaseAdmin = createAdminClient();
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("goals")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        const goals = data.map((g: any) => ({
          id: g.id,
          title: g.title,
          description: "",
          category: g.category || "ENGINEERING",
          measurableOutcome: "Complete deliverables",
          weightage: 20,
          priority: "MEDIUM",
          status: g.status || "IN_PROGRESS",
          progressPercentage: Number(g.progress) || 0,
          currentValue: Number(g.progress) || 0,
          targetValue: 100,
          evidenceRequired: false,
          targetDate: g.target_date || "This Month",
        }));
        return apiSuccess({ goals, total: goals.length });
      }
    }
  } catch (err) {
    console.warn("[Weekly Goals GET] Supabase query error:", err);
  }

  const goals = workpulseSharedStore.getState().weeklyGoals;
  return apiSuccess({ goals, total: goals.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.title) {
      return apiError("Missing required field: title", 422, "VALIDATION_FAILED");
    }

    const state = workpulseSharedStore.getState();
    const newGoal = {
      id: `goal-${Date.now()}`,
      title: body.title,
      description: body.description || "",
      category: body.category || "ENGINEERING",
      measurableOutcome: body.measurableOutcome || "Complete deliverables",
      weightage: body.weightage || body.weight || 20,
      priority: body.priority || "MEDIUM",
      status: "IN_PROGRESS" as const,
      progressPercentage: 0,
      currentValue: 0,
      targetValue: body.targetValue || 100,
      evidenceRequired: Boolean(body.evidenceRequired),
    };

    state.weeklyGoals.push(newGoal as any);

    // Persist to Supabase goals table
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        await supabaseAdmin.from("goals").upsert({
          id: newGoal.id,
          employee_id: body.employeeId || "emp-sarah",
          title: newGoal.title,
          category: newGoal.category || "Operations",
          progress: 0,
          status: "IN_PROGRESS",
          target_date: "This Month",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.warn("[Weekly Goals] Supabase goals upsert error:", err?.message);
    }

    return apiSuccess({ goal: newGoal, message: "Weekly goal created." }, 201);
  } catch {
    return apiError("Invalid request payload", 400, "BAD_REQUEST");
  }
}
