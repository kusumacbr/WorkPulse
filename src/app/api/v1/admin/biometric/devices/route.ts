import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { BiometricIntegrationService } from "@/server/services/biometric-service";

export async function GET(req: NextRequest) {
  const { actor } = await getSessionActor(req);
  if (!actor.roles.includes("ADMIN") && !actor.roles.includes("HR")) {
    return apiError("Forbidden: Only HR and Admin can access biometric device status.", 403, "FORBIDDEN");
  }

  const devices = await BiometricIntegrationService.listDevices();
  return apiSuccess({ devices, total: devices.length });
}

export async function POST(req: NextRequest) {
  const { actor } = await getSessionActor(req);
  if (!actor.roles.includes("ADMIN")) {
    return apiError("Forbidden: Only Admin can register biometric edge devices.", 403, "FORBIDDEN");
  }

  try {
    const body = await req.json();
    const device = await BiometricIntegrationService.registerDevice({
      actor,
      input: {
        name: body.name || "Edge Terminal",
        locationName: body.locationName || "Bangalore HQ",
        provider: body.provider || "GENERIC_WEBHOOK",
        serialNumber: body.serialNumber || `SN-${Date.now()}`,
        model: body.model || "ZKTeco ProFace X",
        timezone: body.timezone || "Asia/Kolkata",
      },
    });

    return apiSuccess({ device, message: "Biometric device registered with SHA-256 HMAC credential." }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to register device", 400, "BAD_REQUEST");
  }
}
