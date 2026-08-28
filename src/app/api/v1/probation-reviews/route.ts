import { apiSuccess } from "@/server/api-helpers";

export const dynamic = "force-dynamic";

export async function GET() {
  const reviews = [
    {
      id: "prob-1",
      employeeId: "emp-rohit",
      employeeName: "Rohit Sharma",
      designation: "Frontend Engineer (UI/UX)",
      checkpointDay: 30,
      managerRecommendation: "CONFIRM_EMPLOYMENT",
      managerComments: "Strong frontend deliverable pace and UI polish.",
      workQualityScore: 5,
      taskCompletionScore: 5,
      attendanceScore: 5,
      communicationScore: 4,
      collaborationScore: 5,
      learningScore: 5,
      technicalScore: 5,
      conductScore: 5,
      hrDecision: "CONFIRM_EMPLOYMENT",
      status: "CONFIRMED",
      reviewedAt: "2026-08-20T10:00:00Z",
    },
  ];

  return apiSuccess({ probationReviews: reviews, total: reviews.length });
}
