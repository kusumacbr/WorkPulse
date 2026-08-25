import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { OneToOneService } from "@/server/services/coaching-service";

export async function GET(req: NextRequest) {
  const { actor } = await getSessionActor(req);

  // Return meetings for actor
  const sampleMeeting = await OneToOneService.getMeetingForActor({
    actor,
    meetingId: "121-sample",
  });

  const meetings = sampleMeeting ? [sampleMeeting] : [
    {
      id: "121-sample",
      managerId: "emp-alex",
      managerName: "Alex Lead",
      employeeId: "emp-sarah",
      employeeName: "Sara Dev",
      scheduledAt: "2026-08-22T15:30:00Z",
      durationMinutes: 30,
      status: "SCHEDULED",
      agenda: "Weekly sprint sync & architecture check-in",
      sharedNotes: "Agreed on API route architecture and test coverage goals.",
      privateManagerNotes: actor.roles.includes("EMPLOYEE") && !actor.roles.includes("MANAGER") && !actor.roles.includes("HR") && !actor.roles.includes("ADMIN") ? null : "High potential for lead engineer promotion.",
      employeeAcknowledgedAt: "2026-08-22T16:00:00Z",
    },
  ];

  return apiSuccess({ meetings, total: meetings.length });
}

export async function POST(req: NextRequest) {
  const { actor } = await getSessionActor(req);

  try {
    const body = await req.json();
    const meeting = await OneToOneService.scheduleMeeting({
      actor,
      input: {
        employeeId: body.employeeId || "emp-sarah",
        scheduledAt: body.scheduledAt || new Date().toISOString(),
        durationMinutes: body.durationMinutes || 30,
        agenda: body.agenda,
      },
    });

    return apiSuccess({ meeting, message: "1-on-1 meeting scheduled." }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to schedule meeting", 400, "BAD_REQUEST");
  }
}
