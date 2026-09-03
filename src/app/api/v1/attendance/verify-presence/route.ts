import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { realtimeEventBus } from "@/server/realtime/event-bus";

export async function POST(req: NextRequest) {
  try {
    const { user } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));
    const { employeeId, employeeName, verifyAll } = body;

    const verifierName = user.name || "Alex Lead";
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (verifyAll) {
      realtimeEventBus.emit("attendance:all_presence_verified", {
        verifierName,
        verifiedAt: timeStr,
      });
      return apiSuccess({
        message: `All direct report presences verified in real-time by ${verifierName}`,
        verifiedAt: timeStr,
      });
    }

    if (!employeeId) {
      return apiError("employeeId is required for individual presence verification", 400);
    }

    realtimeEventBus.emit("attendance:presence_verified", {
      id: employeeId,
      employeeName: employeeName || "Team Member",
      verifierName,
      verifiedAt: timeStr,
    });

    return apiSuccess({
      message: `Presence verified for ${employeeName || employeeId} at ${timeStr}`,
      employeeId,
      verifiedAt: timeStr,
      verifierName,
    });
  } catch (err: any) {
    return apiError(err.message || "Failed to verify presence", 400);
  }
}
