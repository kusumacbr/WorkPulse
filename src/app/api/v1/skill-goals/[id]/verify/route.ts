import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { SkillDevelopmentService } from "@/server/services/coaching-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { actor } = await getSessionActor(req);

  if (!actor.roles.includes("MANAGER") && !actor.roles.includes("HR")) {
    return apiError("Forbidden: Only Team Leads and HR can verify employee skill development goals.", 403, "FORBIDDEN");
  }

  try {
    const verified = await SkillDevelopmentService.verifySkillGoal({
      actor,
      goalId: id,
    });

    return apiSuccess({ skillGoal: verified, message: "Skill development goal verified." });
  } catch (err: any) {
    return apiError(err.message || "Failed to verify skill goal", 400, "BAD_REQUEST");
  }
}
