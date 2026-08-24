import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function POST(req: NextRequest) {
  try {
    await getSessionActor(req);
    const body = await req.json().catch(() => ({}));

    if (!body.employeeId || !body.note) {
      return apiError("employeeId and note are required", 400);
    }

    WorkpulseSharedStore.updateLeadFeedback({
      employeeId: body.employeeId,
      employeeName: body.employeeName || "Employee",
      note: body.note,
      rating: Number(body.rating) || 5,
      actionItem: body.actionItem,
    });

    return apiSuccess({ message: "Lead EOD feedback logged successfully" }, 200);
  } catch (err: any) {
    return apiError(err.message || "Failed to log lead feedback", 400);
  }
}
