import { NextRequest } from "next/server";
import { apiSuccess } from "@/server/api-helpers";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return apiSuccess({
    actionItemId: id,
    status: "COMPLETED",
    completedAt: new Date().toISOString(),
    message: "Meeting action item completed.",
  });
}
