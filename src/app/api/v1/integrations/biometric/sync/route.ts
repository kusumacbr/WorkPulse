import { NextRequest, NextResponse } from "next/server";
import { biometricBatchSyncSchema } from "@/lib/validation/biometric";
import { BiometricService } from "@/server/services/biometric-service";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = biometricBatchSyncSchema.parse(json);

    const result = await BiometricService.ingestPunches({
      punches: parsed.punches,
      source: "CONNECTOR_SYNC",
    });

    return NextResponse.json(
      {
        success: true,
        message: `Processed ${result.processedCount} punches (${result.duplicateCount} duplicates ignored, ${result.quarantinedCount} quarantined)`,
        data: result,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message || "Failed to process connector sync batch",
      },
      { status: 400 }
    );
  }
}
