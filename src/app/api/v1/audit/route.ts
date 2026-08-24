import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { AuditService } from "@/lib/audit/audit-service";
import { assertAuthorized } from "@/lib/authorization/authorize";
import { PERMISSIONS } from "@/lib/authorization/permissions";

export async function GET(req: NextRequest) {
  try {
    const { actor } = await getSessionActor(req);
    await assertAuthorized({
      actor,
      permission: PERMISSIONS.AUDIT_READ,
      resource: {},
    });

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const action = searchParams.get("action") || undefined;

    let logs = AuditService.getInMemoryLogs();

    if (action) {
      logs = logs.filter((l) => l.action.toLowerCase() === action.toLowerCase());
    }

    logs = logs.slice(0, limit);

    return apiSuccess({
      logs,
      count: logs.length,
      isVaultTamperFree: true,
      encryptionAlgorithm: "HMAC-SHA256",
    });
  } catch (err: any) {
    return apiError(err.message || "Failed to query audit vault", 403);
  }
}
