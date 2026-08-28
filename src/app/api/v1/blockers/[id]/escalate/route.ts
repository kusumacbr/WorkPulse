import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/server/api-helpers";
import { BlockerService } from "@/server/services/coaching-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const blocker = BlockerService.getActiveBlockers().find((b) => b.id === id);
  if (!blocker) return apiError(`Blocker '${id}' not found`, 404, "NOT_FOUND");

  const body = await req.json().catch(() => ({}));
  const escalation = {
    id: `esc-${Date.now()}`,
    blockerId: id,
    escalatedToRole: body.role || "HR",
    escalatedAt: new Date().toISOString(),
    reason: body.reason || "Manual escalation triggered by reviewer",
  };

  blocker.escalations.push(escalation as any);

  return apiSuccess({ blocker, escalation, message: "Blocker escalated." });
}
