import { NextRequest } from "next/server";
import { apiSuccess } from "@/server/api-helpers";

export async function GET(_req: NextRequest) {
  const monthlyReviews = [
    {
      id: "rev-monthly-aug26",
      employeeId: "emp-sarah",
      employeeName: "Sara Dev",
      department: "Engineering",
      period: "August 2026",
      periodStart: "2026-08-01",
      periodEnd: "2026-08-31",
      status: "APPROVED",
      calculatedScore: 92.4,
      finalScore: 92.4,
      scoringModel: {
        taskGoalExecution: 40,
        qualityOfWork: 20,
        timelyDelivery: 15,
        communicationReporting: 10,
        collaborationSupport: 10,
        initiativeLearning: 5,
      },
      ratings: {
        taskExecution: 4.8,
        quality: 4.9,
        timeliness: 4.6,
        communication: 4.5,
        collaboration: 4.7,
        learning: 4.8,
      },
      managerFeedback: "Exceptional platform architecture execution during the biometric engine roll-out.",
      leadName: "Alex Lead",
      approvedAt: "2026-08-20T16:00:00Z",
    },
  ];

  return apiSuccess({ reviews: monthlyReviews, total: monthlyReviews.length });
}
