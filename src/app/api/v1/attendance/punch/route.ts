import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { BiometricService } from "@/server/services/biometric-service";

export async function POST(req: NextRequest) {
  try {
    const { user } = await getSessionActor(req);
    const body = await req.json().catch(() => ({}));
    const employeeCode = body.employeeCode || user.email.split("@")[0] || "BIO-101";

    const result = await BiometricService.ingestPunches({
      source: "WEBHOOK",
      punches: [
        {
          deviceId: body.terminalId || "dev-hq-floor3",
          deviceEmployeeCode: employeeCode,
          occurredAt: body.timestamp || new Date().toISOString(),
          direction: (body.punchType as any) || "IN",
          verificationMethod: "FINGERPRINT",
          vendorTransactionId: `tx-${Date.now()}`,
        },
      ],
    });

    return apiSuccess({ punch: result, message: "Punch event logged and verified" }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to record punch", 400);
  }
}
