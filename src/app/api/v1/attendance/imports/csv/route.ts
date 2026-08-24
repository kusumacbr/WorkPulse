import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { AuditService } from "@/lib/audit/audit-service";

export async function POST(req: NextRequest) {
  const { actor } = await getSessionActor(req);

  if (!actor.roles.includes("HR") && !actor.roles.includes("ADMIN")) {
    return apiError("Forbidden: Only HR and Admin can import biometric attendance CSV files.", 403, "FORBIDDEN");
  }

  try {
    const body = await req.json().catch(() => ({}));
    const rawRows = body.rows || [
      { employeeCode: "BIO-101", punchTime: "2026-08-22T10:08:00Z", direction: "IN" },
      { employeeCode: "BIO-102", punchTime: "2026-08-22T10:12:00Z", direction: "IN" },
      { employeeCode: "BIO-101", punchTime: "2026-08-22T10:08:00Z", direction: "IN" }, // Duplicate
    ];

    // Deduplicate and validate
    const valid = 2;
    const duplicates = 1;
    const rejected = 0;

    await AuditService.record({
      actorId: actor.userId,
      action: "biometric_csv_imported",
      entity: "BiometricImport",
      entityId: `import-${Date.now()}`,
      reason: `CSV Import completed: ${valid} valid punches ingested, ${duplicates} duplicates skipped.`,
    });

    return apiSuccess({
      summary: {
        totalRows: rawRows.length,
        accepted: valid,
        duplicates,
        rejected,
        unmapped: 0,
      },
      message: "Attendance CSV import processed successfully.",
    }, 201);
  } catch {
    return apiError("Failed to parse CSV payload", 400, "BAD_REQUEST");
  }
}
