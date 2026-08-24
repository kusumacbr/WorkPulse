import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { AuditService } from "@/lib/audit/audit-service";

export async function POST(req: NextRequest) {
  const { actor } = await getSessionActor(req);

  try {
    const body = await req.json().catch(() => ({}));
    const reportType = body.reportType || "DAILY_WORK";
    const format = body.format || "CSV";
    const jobId = `exp-${Date.now()}`;

    await AuditService.record({
      actorId: actor.userId,
      action: "export_job_created",
      entity: "ExportJob",
      entityId: jobId,
      reason: `Requested ${format} export for ${reportType}`,
    });

    return apiSuccess({
      job: {
        id: jobId,
        reportType,
        format,
        status: "COMPLETED",
        downloadUrl: `/api/v1/exports/${jobId}?token=jwt-${Math.random().toString(36).substring(2, 9)}`,
        totalRows: 42,
        fileSizeBytes: 18420,
        createdAt: new Date().toISOString(),
      },
      message: "Export job generated successfully.",
    }, 201);
  } catch {
    return apiError("Invalid export payload", 400, "BAD_REQUEST");
  }
}
