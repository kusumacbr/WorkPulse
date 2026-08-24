import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { PipService } from "@/server/services/coaching-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { actor } = await getSessionActor(req);

  try {
    const body = await req.json();
    const pip = await PipService.addCheckpoint({
      actor,
      pipId: id,
      notes: body.notes || "Weekly check-in completed",
      isImproving: body.isImproving !== false,
      supportProvided: body.supportProvided,
    });

    return apiSuccess({ pip, message: "PIP checkpoint logged." }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to add checkpoint", 400, "BAD_REQUEST");
  }
}
