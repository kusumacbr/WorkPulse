import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { BadgeService } from "@/server/services/coaching-service";

export async function POST(req: NextRequest) {
  const { actor } = await getSessionActor(req);

  if (!actor.roles.includes("MANAGER") && !actor.roles.includes("HR")) {
    return apiError("Forbidden: Only Team Leads and HR can issue appreciation badges.", 403, "FORBIDDEN");
  }

  try {
    const body = await req.json();
    if (!body.badgeDefinitionId || !body.recipientEmployeeId || !body.reason) {
      return apiError("Missing required fields: badgeDefinitionId, recipientEmployeeId, reason", 422, "VALIDATION_FAILED");
    }

    const award = await BadgeService.issueBadgeAward({
      actor,
      input: {
        badgeDefinitionId: body.badgeDefinitionId,
        recipientEmployeeId: body.recipientEmployeeId,
        reason: body.reason,
        points: body.points,
        relatedTaskId: body.relatedTaskId,
        relatedGoalId: body.relatedGoalId,
      },
    });

    return apiSuccess({ award, message: "Appreciation badge awarded successfully." }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to issue badge", 400, "BAD_REQUEST");
  }
}
