import { NextRequest, NextResponse } from "next/server";
import { BiometricService } from "@/server/services/biometric-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { deviceId, firmwareVersion, ipAddress } = body;

    if (!deviceId) {
      return NextResponse.json({ error: "deviceId is required" }, { status: 400 });
    }

    const device = await BiometricService.recordHeartbeat({
      deviceId,
      firmwareVersion,
      ipAddress,
    });

    return NextResponse.json(
      {
        success: true,
        device: {
          id: device.id,
          name: device.name,
          status: device.status,
          lastHeartbeatAt: device.lastHeartbeatAt,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Heartbeat error" }, { status: 400 });
  }
}
