import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/server/api-helpers";
import { BiometricIntegrationService } from "@/server/services/biometric-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await BiometricIntegrationService.recordHeartbeat({
      deviceId: body.deviceId || "dev-hq-floor0",
      firmwareVersion: body.firmwareVersion || "v2.4.1",
      ipAddress: body.ipAddress || "192.168.1.100",
    });

    return apiSuccess(result, 200);
  } catch (err: any) {
    return apiError(err.message || "Failed to record heartbeat", 400, "HEARTBEAT_ERROR");
  }
}
