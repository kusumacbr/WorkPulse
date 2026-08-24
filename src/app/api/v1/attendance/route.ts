import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { AttendanceService } from "@/server/services/attendance-service";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export async function GET(req: NextRequest) {
  try {
    await getSessionActor(req);
    const whosWhere = await AttendanceService.getWhosWhereToday();
    const departments = WorkpulseSharedStore.getDepartments();

    return apiSuccess({
      whosWhere,
      departments,
      shiftAdherence: {
        targetShift: "10:00 AM – 07:00 PM",
        graceWindowUntil: "10:15 AM",
        onTimeAdherenceRate: "98.2%",
      },
    });
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch attendance data", 400);
  }
}
