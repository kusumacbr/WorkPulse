import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { GoalTemplateService } from "@/server/services/coaching-service";

export async function GET() {
  const sampleTemplate = {
    id: "gtpl-senior-eng",
    organizationId: "org-xorstack",
    name: "Senior Backend Engineer Q3 Goals",
    departmentId: "dept-dev",
    designation: "Senior Backend Engineer",
    items: [
      {
        id: "item-1",
        title: "High Performance Biometric Pipeline Architecture",
        category: "ENGINEERING",
        measurableOutcome: "99.9% uptime with SHA-256 deduplication",
        defaultWeight: 50,
        evidenceRequired: true,
      },
      {
        id: "item-2",
        title: "Mentorship & Code Review SLA",
        category: "COLLABORATION",
        measurableOutcome: "Review all team PRs within 4 hours",
        defaultWeight: 50,
        evidenceRequired: false,
      },
    ],
  };

  return apiSuccess({ templates: [sampleTemplate], total: 1 });
}

export async function POST(req: NextRequest) {
  const { actor } = await getSessionActor(req);
  if (!actor.roles.includes("HR") && !actor.roles.includes("ADMIN")) {
    return apiError("Forbidden: Only HR and Admin can create goal templates.", 403, "FORBIDDEN");
  }

  try {
    const body = await req.json();
    const template = await GoalTemplateService.createTemplate({
      actor,
      input: {
        name: body.name,
        description: body.description,
        departmentId: body.departmentId,
        designation: body.designation,
        items: body.items || [],
      },
    });

    return apiSuccess({ template, message: "Goal template created." }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to create template", 400, "BAD_REQUEST");
  }
}
