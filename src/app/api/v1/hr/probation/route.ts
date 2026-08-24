import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { assertAuthorized } from "@/lib/authorization/authorize";
import { PERMISSIONS } from "@/lib/authorization/permissions";

interface ProbationRecord {
  id: string;
  employeeName: string;
  department: string;
  designation: string;
  joiningDate: string;
  confirmationDueDate: string;
  stage: "30_DAYS" | "60_DAYS" | "90_DAYS_FINAL";
  leadRecommendation: "CONFIRM" | "EXTEND_30" | "UNDER_REVIEW";
  leadNotes: string;
  leadName: string;
  okrScore: number;
  shiftPunctuality: number;
  status: "PENDING_HR_DECISION" | "CONFIRMED" | "EXTENDED";
}

let globalProbationRecords: ProbationRecord[] = [
  {
    id: "pr-1",
    employeeName: "Rohit Sharma",
    department: "Development",
    designation: "Frontend Engineer (UI/UX)",
    joiningDate: "2026-05-20",
    confirmationDueDate: "2026-08-20",
    stage: "90_DAYS_FINAL",
    leadRecommendation: "CONFIRM",
    leadNotes: "Exceeded all sprint deliverables. Ready for full-time confirmation.",
    leadName: "Alex Lead",
    okrScore: 92.5,
    shiftPunctuality: 98.4,
    status: "PENDING_HR_DECISION",
  },
  {
    id: "pr-2",
    employeeName: "Ananya Sen",
    department: "Quality Assurance",
    designation: "Automation QA Lead",
    joiningDate: "2026-06-20",
    confirmationDueDate: "2026-09-20",
    stage: "60_DAYS",
    leadRecommendation: "CONFIRM",
    leadNotes: "Engineered automated Playwright biometric regression suites.",
    leadName: "Dr. Maya Chen",
    okrScore: 94.0,
    shiftPunctuality: 99.1,
    status: "PENDING_HR_DECISION",
  },
  {
    id: "pr-3",
    employeeName: "Elena Rostova",
    department: "Devops",
    designation: "DevOps & Cloud Engineer",
    joiningDate: "2026-08-10",
    confirmationDueDate: "2026-09-10",
    stage: "30_DAYS",
    leadRecommendation: "UNDER_REVIEW",
    leadNotes: "30-day initial checkpoint on CI/CD pipelines.",
    leadName: "Marcus Vance",
    okrScore: 86.0,
    shiftPunctuality: 97.5,
    status: "PENDING_HR_DECISION",
  },
];

export async function GET(req: NextRequest) {
  try {
    const { actor } = await getSessionActor(req);
    await assertAuthorized({
      actor,
      permission: PERMISSIONS.PROFILE_READ,
      resource: {},
    });

    return apiSuccess({ probationRecords: globalProbationRecords });
  } catch (err: any) {
    return apiError(err.message || "Failed to list probation records", 403);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { actor } = await getSessionActor(req);
    await assertAuthorized({
      actor,
      permission: PERMISSIONS.PROFILE_UPDATE,
      resource: {},
    });

    const body = await req.json().catch(() => ({}));
    const { id, decision } = body;

    if (!id || !decision) {
      return apiError("id and decision are required", 400);
    }

    globalProbationRecords = globalProbationRecords.map((r) =>
      r.id === id ? { ...r, status: decision === "CONFIRM" ? "CONFIRMED" : "EXTENDED" } : r
    );

    return apiSuccess({ message: `Probation decision ${decision} recorded successfully` }, 200);
  } catch (err: any) {
    return apiError(err.message || "Failed to record probation decision", 400);
  }
}
