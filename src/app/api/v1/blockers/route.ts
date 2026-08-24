import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { BlockerService } from "@/server/services/coaching-service";

export async function GET() {
  const blockers = BlockerService.getActiveBlockers();
  return apiSuccess({ blockers, total: blockers.length });
}

export async function POST(req: NextRequest) {
  const { actor } = await getSessionActor(req);

  try {
    const body = await req.json();
    if (!body.description || !body.supportRequired) {
      return apiError("Missing required fields: description, supportRequired", 422, "VALIDATION_FAILED");
    }

    const blocker = await BlockerService.createBlocker({
      actor,
      input: {
        taskId: body.taskId,
        description: body.description,
        category: body.category || "TECHNICAL",
        severity: body.severity || "MEDIUM",
        responsibleTeam: body.responsibleTeam || "Engineering",
        supportRequired: body.supportRequired,
        targetResolutionAt: body.targetResolutionAt,
        isConfidential: Boolean(body.isConfidential),
      },
    });

    return apiSuccess({ blocker, message: "Blocker reported successfully." }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to create blocker", 400, "BAD_REQUEST");
  }
}
