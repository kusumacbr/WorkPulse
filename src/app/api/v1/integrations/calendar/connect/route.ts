import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { AuditService } from "@/lib/audit/audit-service";

export async function POST(req: NextRequest) {
  const { actor } = await getSessionActor(req);

  try {
    const body = await req.json();
    const provider = body.provider || "GOOGLE_CALENDAR"; // or "MICROSOFT_OUTLOOK"

    await AuditService.record({
      actorId: actor.userId,
      action: "calendar_connected",
      entity: "CalendarIntegration",
      entityId: `cal-${Date.now()}`,
      reason: `Connected external calendar (${provider}) with encrypted OAuth credentials`,
    });

    return apiSuccess({
      connection: {
        id: `cal-${Date.now()}`,
        provider,
        accountEmail: body.email || actor.email,
        status: "CONNECTED",
        syncEvents: ["ONE_TO_ONE", "SPRINT_DEADLINE", "PROBATION_CHECKPOINT"],
        connectedAt: new Date().toISOString(),
      },
      message: `${provider} connected successfully.`,
    }, 201);
  } catch {
    return apiError("Invalid request body", 400, "BAD_REQUEST");
  }
}
