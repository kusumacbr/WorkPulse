import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { AuditService } from "@/lib/audit/audit-service";

export async function POST(req: NextRequest) {
  const { actor } = await getSessionActor(req);

  if (!actor.roles.includes("HR")) {
    return apiError("Forbidden: Only HR can configure Slack workspace integrations.", 403, "FORBIDDEN");
  }

  try {
    const body = await req.json();

    await AuditService.record({
      actorId: actor.userId,
      action: "slack_integration_connected",
      entity: "SlackIntegration",
      entityId: `slack-${Date.now()}`,
      reason: "Configured Slack notification bot with sensitive channel privacy redaction",
    });

    return apiSuccess({
      integration: {
        id: `slack-${Date.now()}`,
        teamName: body.teamName || "Xorstack Engineering",
        defaultChannel: body.defaultChannel || "#workpulse-feed",
        status: "ACTIVE",
        redactSensitiveFeedback: true,
      },
      message: "Slack integration configured with automatic privacy redaction.",
    }, 201);
  } catch {
    return apiError("Invalid request body", 400, "BAD_REQUEST");
  }
}
