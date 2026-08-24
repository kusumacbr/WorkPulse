import { NextRequest } from "next/server";
import { apiSuccess, apiError } from "@/server/api-helpers";
import { BiometricIntegrationService } from "@/server/services/biometric-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await BiometricIntegrationService.ingestCanonicalPunches({
      deviceId: body.deviceId || "dev-hq-floor0",
      connectorId: body.connectorId || "blr-office-agent",
      events: body.events || [],
    });

    return apiSuccess(result, 200);
  } catch (err: any) {
    return apiError(err.message || "Failed to process connector punches", 400, "CONNECTOR_ERROR");
  }
}
