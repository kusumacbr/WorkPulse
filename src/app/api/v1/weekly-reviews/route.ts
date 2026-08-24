import { NextRequest } from "next/server";
import { apiSuccess } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const status = searchParams.get("status");

  const reviews = workpulseSharedStore.getState().weeklyReviews;
  let filtered = reviews;
  if (status) {
    filtered = filtered.filter((r: any) => r.status === status);
  }

  return apiSuccess({ reviews: filtered, total: filtered.length });
}
