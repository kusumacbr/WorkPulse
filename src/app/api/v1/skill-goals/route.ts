import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { SkillDevelopmentService } from "@/server/services/coaching-service";

export async function GET(req: NextRequest) {
  const { actor } = await getSessionActor(req);
  const sampleGoals = [
    {
      id: "skg-1",
      employeeId: actor.employeeId,
      skillName: "Distributed Systems Architecture",
      currentLevel: "ADVANCED",
      targetLevel: "EXPERT",
      learningActivity: "Architected zero-loss biometric ingest stream buffer with exponential backoff",
      certificationName: "AWS Certified Solutions Architect",
      targetDate: "2026-10-31",
      status: "VERIFIED",
      verifiedById: "emp-alex",
      verifiedAt: "2026-08-15T10:00:00Z",
    },
  ];

  return apiSuccess({ skillGoals: sampleGoals, total: sampleGoals.length });
}

export async function POST(req: NextRequest) {
  const { actor } = await getSessionActor(req);

  try {
    const body = await req.json();
    if (!body.skillName || !body.learningActivity || !body.targetDate) {
      return apiError("Missing required fields: skillName, learningActivity, targetDate", 422, "VALIDATION_FAILED");
    }

    const goal = await SkillDevelopmentService.createSkillGoal({
      actor,
      input: {
        skillName: body.skillName,
        currentLevel: body.currentLevel || "BEGINNER",
        targetLevel: body.targetLevel || "INTERMEDIATE",
        learningActivity: body.learningActivity,
        certificationName: body.certificationName,
        targetDate: body.targetDate,
        evidenceUrl: body.evidenceUrl,
      },
    });

    return apiSuccess({ skillGoal: goal, message: "Skill development goal created." }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to create skill goal", 400, "BAD_REQUEST");
  }
}
