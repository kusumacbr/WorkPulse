import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { AuditService } from "@/lib/audit/audit-service";

export async function POST(req: NextRequest) {
  const { actor } = await getSessionActor(req);

  if (!actor.roles.includes("HR")) {
    return apiError("Forbidden: Only HR can configure Microsoft Teams integrations.", 403, "FORBIDDEN");
  }

  try {
    const body = await req.json();

    await AuditService.record({
      actorId: actor.userId,
      action: "teams_integration_connected",
      entity: "TeamsIntegration",
      entityId: `teams-${Date.now()}`,
      reason: "Configured Microsoft Teams webhook connector",
    });

    return apiSuccess({
      integration: {
        id: `teams-${Date.now()}`,
        tenantId: body.tenantId || "teams-xorstack-tenant",
        status: "ACTIVE",
        webhookUrlMasked: "https://outlook.office.com/webhook/xxxx...xxxx",
      },
      message: "Microsoft Teams integration connected.",
    }, 201);
  } catch {
    return apiError("Invalid request body", 400, "BAD_REQUEST");
  }
}
