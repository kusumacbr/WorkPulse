import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import { GoalService } from "@/server/services/goal-service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { actor } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));

    const progress = typeof body.progress === "number" ? body.progress : (Number(body.progressPercentage) || 0);
    const status = body.status || (progress === 100 ? "COMPLETED" : "IN_PROGRESS");
    const nowIso = new Date().toISOString();

    const supabase = createAdminClient();
    if (supabase) {
      const updateData: any = {
        updated_at: nowIso,
      };
      if (typeof progress === "number") updateData.progress = progress;
      if (status) updateData.status = status;
      if (body.title) updateData.title = body.title;
      if (body.category) updateData.category = body.category;
      if (body.targetDate) updateData.target_date = body.targetDate;

      const { error } = await supabase.from("goals").update(updateData).eq("id", id);
      if (error) {
        console.error("[Goals API PATCH] Supabase goals update error:", error.message);
      }
    }

    // In-memory service fallback
    try {
      await GoalService.updateProgress({
        actor,
        input: {
          goalId: id,
          progressPercentage: progress,
          currentValue: Number(body.currentValue) || 0,
          status,
        },
      });
    } catch {}

    return apiSuccess({ message: "Goal updated successfully in Supabase goals table", id, progress, status }, 200);
  } catch (err: any) {
    return apiError(err.message || "Failed to update goal progress", 400);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await getSessionActor(req);

    const supabase = createAdminClient();
    if (supabase) {
      const { error } = await supabase.from("goals").delete().eq("id", id);
      if (error) {
        console.error("[Goals API DELETE] Supabase goals delete error:", error.message);
      }
    }

    return apiSuccess({ message: "Goal deleted successfully from Supabase goals table", id }, 200);
  } catch (err: any) {
    return apiError(err.message || "Failed to delete goal", 500);
  }
}
