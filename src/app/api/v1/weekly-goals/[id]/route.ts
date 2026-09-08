import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    // Persist to Supabase
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        const progress = Number(updated.progressPercentage ?? updated.progress) || 0;
        await supabaseAdmin.from("feedbacks").upsert({
          id: `fb-${id}`,
          employee_id: updated.employeeId || "emp-sarah",
          employee_name: updated.employeeName || "Sarah Dev",
          lead_id: "lead-alex",
          lead_name: "Alex Lead",
          date: new Date().toISOString().split("T")[0]!,
          rating: progress >= 100 ? 5 : progress >= 50 ? 4 : 3,
          sentiment: updated.status === "COMPLETED" ? "EXCELLENT" : "GOOD",
          notes: `[GOAL - ${updated.category || "ENGINEERING"}] ${updated.title}: ${updated.description || ""} (Progress: ${progress}%)`,
          action_item: `Target: ${updated.measurableOutcome || "Deliverables"}`,
        });
      }
    } catch {}

    return apiSuccess({ goal: updated, message: "Weekly goal updated." });
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
      await supabaseAdmin.from("feedbacks").delete().eq("id", `fb-${id}`);
    }
  } catch {}

  return apiSuccess({ success: true, message: `Goal '${id}' deleted.` });
}
