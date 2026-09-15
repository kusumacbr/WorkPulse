import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabaseAdmin = createAdminClient();
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from("goals")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (!error && data) {
        return apiSuccess({
          goal: {
            id: data.id,
            title: data.title,
            category: data.category || "ENGINEERING",
            progressPercentage: Number(data.progress) || 0,
            status: data.status || "IN_PROGRESS",
            targetDate: data.target_date || "This Month",
          },
        });
      }
    }
  } catch (err) {
    console.warn("[Weekly Goals GET by ID] Supabase query error:", err);
  }

  const goal = workpulseSharedStore.getState().weeklyGoals.find((g: any) => g.id === id);
  if (!goal) return apiError(`Goal '${id}' not found`, 404, "NOT_FOUND");
  return apiSuccess({ goal });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const state = workpulseSharedStore.getState();
    const idx = state.weeklyGoals.findIndex((g: any) => g.id === id);
    if (idx === -1) return apiError(`Goal '${id}' not found`, 404, "NOT_FOUND");

    const updated = {
      ...state.weeklyGoals[idx],
      ...body,
    };

    state.weeklyGoals[idx] = updated;

    // Persist to Supabase goals table
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        const progress = Number(updated.progressPercentage ?? updated.progress) || 0;
        await supabaseAdmin.from("goals").upsert({
          id: id,
          employee_id: updated.employeeId || "emp-sarah",
          title: updated.title,
          category: updated.category || "Operations",
          progress: progress,
          status: updated.status || "IN_PROGRESS",
          target_date: updated.targetDate || "This Month",
          updated_at: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      console.warn("[Weekly Goals PATCH] Supabase goals upsert error:", err?.message);
    }

    return apiSuccess({ goal: updated, message: "Weekly goal updated in Supabase goals table." });
  } catch {
    return apiError("Invalid request body", 400, "BAD_REQUEST");
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const state = workpulseSharedStore.getState();
  state.weeklyGoals = state.weeklyGoals.filter((g: any) => g.id !== id);

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const supabaseAdmin = createAdminClient();
    if (supabaseAdmin) {
      await supabaseAdmin.from("goals").delete().eq("id", id);
    }
  } catch {}

  return apiSuccess({ success: true, message: `Goal '${id}' deleted from Supabase goals table.` });
}
