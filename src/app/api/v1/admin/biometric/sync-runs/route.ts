import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";

export async function GET(req: NextRequest) {
  const { actor } = await getSessionActor(req);
  if (!actor.roles.includes("HR")) {
    return apiError("Forbidden: Only HR can view biometric sync history.", 403, "FORBIDDEN");
  }

  const syncRuns = [
    {
      id: "sync-run-101",
      deviceId: "dev-hq-floor0",
      deviceName: "Bangalore HQ - Main Entrance",
      status: "SUCCESS",
      ingestedCount: 42,
      duplicateCount: 3,
      quarantineCount: 0,
      timestamp: new Date().toISOString(),
    },
    {
      id: "sync-run-100",
      deviceId: "dev-hq-floor3",
      deviceName: "Bangalore HQ - Floor 3 R&D",
      status: "SUCCESS",
      ingestedCount: 28,
      duplicateCount: 1,
      quarantineCount: 1,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  return apiSuccess({ syncRuns, total: syncRuns.length });
}
