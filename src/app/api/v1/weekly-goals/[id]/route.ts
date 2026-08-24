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
    return apiSuccess({ goal: updated, message: "Weekly goal updated." });
  } catch {
    return apiError("Invalid request body", 400, "BAD_REQUEST");
  }
}
