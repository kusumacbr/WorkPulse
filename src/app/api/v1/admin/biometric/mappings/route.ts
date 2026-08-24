import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { BiometricIntegrationService } from "@/server/services/biometric-service";

export async function POST(req: NextRequest) {
  const { actor } = await getSessionActor(req);
  if (!actor.roles.includes("ADMIN") && !actor.roles.includes("HR")) {
    return apiError("Forbidden: Only HR and Admin can configure biometric mappings.", 403, "FORBIDDEN");
  }

  try {
    const body = await req.json();
    const mapping = await BiometricIntegrationService.createEmployeeMapping({
      actor,
      input: {
        deviceEmployeeCode: body.deviceEmployeeCode,
        employeeId: body.employeeId,
        provider: body.provider || "GENERIC_WEBHOOK",
        deviceId: body.deviceId || null,
        effectiveFrom: body.effectiveFrom || new Date().toISOString().split("T")[0],
      },
    });

    return apiSuccess({ mapping, message: "Biometric mapping saved successfully." }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to create mapping", 400, "BAD_REQUEST");
  }
}
