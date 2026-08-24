import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const review = workpulseSharedStore.getState().weeklyReviews.find((r: any) => r.id === id);
  if (!review) return apiError(`Weekly review '${id}' not found`, 404, "NOT_FOUND");
  return apiSuccess({ review });
}
