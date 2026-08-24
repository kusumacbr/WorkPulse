import { NextRequest } from "next/server";
import { apiSuccess } from "@/server/api-helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ reportCode: string }> }
) {
  const { reportCode } = await params;

  const reports: Record<string, any> = {
    DAILY_WORK: {
      title: "Daily Work & SOD Completion Report",
      generatedAt: new Date().toISOString(),
      summary: { totalLogged: 19, completionRate: "98.4%", onTimeRate: "100%" },
    },
    PERFORMANCE: {
      title: "Organization Performance & Review Turnaround",
      generatedAt: new Date().toISOString(),
      summary: { averageScore: 91.8, reviewsCompleted: 19, overdueCount: 0 },
    },
    ATTENDANCE: {
      title: "Muster Roll & Shift Punctuality Report",
      generatedAt: new Date().toISOString(),
      summary: { presentRate: "98.2%", wfhRate: "12%", graceUsage: "3%" },
    },
    BLOCKERS: {
      title: "Task Blocker Ageing & Escalation Summary",
      generatedAt: new Date().toISOString(),
      summary: { openCount: 0, resolvedThisWeek: 4, averageResolutionHours: 2.1 },
    },
  };

  const report = reports[reportCode.toUpperCase()] || {
    title: `Custom Report [${reportCode}]`,
    generatedAt: new Date().toISOString(),
    summary: { totalRecords: 42 },
  };

  return apiSuccess({ reportCode, report });
}
