import { apiSuccess } from "@/server/api-helpers";

export async function GET() {
  const reviews = [
    {
      id: "prob-1",
      employeeId: "emp-john",
      employeeName: "John UI",
      designation: "Frontend Engineer",
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
      adminConfirmed: false,
      status: "PENDING_ADMIN",
      reviewedAt: "2026-08-20T10:00:00Z",
    },
  ];

  return apiSuccess({ probationReviews: reviews, total: reviews.length });
}
