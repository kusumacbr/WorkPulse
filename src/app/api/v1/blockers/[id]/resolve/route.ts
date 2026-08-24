import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { BlockerService } from "@/server/services/coaching-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { actor } = await getSessionActor(req);

  try {
    const body = await req.json();
    const blocker = await BlockerService.resolveBlocker({
      actor,
      input: {
        blockerId: id,
        resolutionSummary: body.resolutionSummary || "Blocker resolved by team.",
        status: body.status || "RESOLVED",
      },
    });

    return apiSuccess({ blocker, message: "Blocker resolved." });
  } catch (err: any) {
    return apiError(err.message || "Failed to resolve blocker", 400, "BAD_REQUEST");
  }
}
