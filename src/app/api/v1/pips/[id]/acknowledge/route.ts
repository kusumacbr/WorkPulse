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
    const pip = await PipService.acknowledgePip({
      actor,
      pipId: id,
    });
    return apiSuccess({ pip, message: "PIP acknowledged by employee." });
  } catch (err: any) {
    return apiError(err.message || "Failed to acknowledge PIP", 400, "BAD_REQUEST");
  }
}
