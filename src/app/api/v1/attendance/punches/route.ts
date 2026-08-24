import { apiSuccess } from "@/server/api-helpers";
import { workpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function GET() {
  const punches = workpulseSharedStore.getState().myPunches;
  return apiSuccess({ punches, total: punches.length });
}
