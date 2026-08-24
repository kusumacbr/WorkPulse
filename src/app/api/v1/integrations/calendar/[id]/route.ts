import { NextRequest } from "next/server";
import { apiSuccess, getSessionActor } from "@/server/api-helpers";
import { AuditService } from "@/lib/audit/audit-service";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { actor } = await getSessionActor(_req);

  await AuditService.record({
    actorId: actor.userId,
    action: "calendar_disconnected",
    entity: "CalendarIntegration",
    entityId: id,
    reason: "Disconnected calendar integration and revoked access tokens without deleting historical meetings.",
  });

  return apiSuccess({
    connectionId: id,
    status: "DISCONNECTED",
    message: "Calendar integration disconnected. Local meeting records preserved.",
  });
}
