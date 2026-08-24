import { NextRequest } from "next/server";
import { apiSuccess, getSessionActor } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function POST(req: NextRequest) {
  const { actor } = await getSessionActor(req);

  const state = workpulseSharedStore.getState();
  state.virtualPunch();

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return apiSuccess({
    punch: {
      id: `punch-${Date.now()}`,
      employeeId: actor.employeeId,
      time: timeStr,
      direction: "OUT",
      method: "WEB_PORTAL",
      location: "Remote / Web Session",
      status: "VERIFIED",
    },
    message: `Web Check-out recorded at ${timeStr}.`,
  }, 201);
}
