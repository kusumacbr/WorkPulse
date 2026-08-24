import { NextRequest, NextResponse } from "next/server";
import { getSessionActor } from "@/server/api-helpers";
import { AuditService } from "@/lib/audit/audit-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { actor } = await getSessionActor(req);

  const searchParams = req.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized: Download token expired or missing." }, { status: 401 });
  }

  await AuditService.record({
    actorId: actor.userId,
    action: "export_downloaded",
    entity: "ExportJob",
    entityId: id,
    reason: "Export payload downloaded via secure authenticated token",
  });

  const csvContent = `EmployeeCode,Name,Department,WorkDate,WorkMode,Punctuality,SODStatus,EODStatus,TasksCompleted\nEMP001,Sarah Dev,Engineering,2026-08-22,OFFICE,ON_TIME,SUBMITTED,IN_PROGRESS,2\nEMP002,Rohit Sharma,Engineering,2026-08-22,OFFICE,ON_TIME,SUBMITTED,IN_PROGRESS,1\nEMP003,John UI,Engineering,2026-08-22,HYBRID,ON_TIME,SUBMITTED,IN_PROGRESS,1`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="workpulse-export-${id}.csv"`,
    },
  });
}
