import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/server/api-helpers";
import { BlockerService } from "@/server/services/coaching-service";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const blocker = BlockerService.getActiveBlockers().find((b) => b.id === id);
  if (!blocker) return apiError(`Blocker '${id}' not found`, 404, "NOT_FOUND");

  blocker.status = "VERIFIED";
  return apiSuccess({ blocker, message: "Blocker resolution verified." });
}
