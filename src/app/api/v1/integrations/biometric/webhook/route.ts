import { NextRequest, NextResponse } from "next/server";
import { canonicalBiometricPunchSchema } from "@/lib/validation/biometric";
import { verifyHmacSha256, verifyTimestampTolerance } from "@/lib/security/biometric-hmac";
import { BiometricService } from "@/server/services/biometric-service";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-workpulse-signature") || req.headers.get("x-signature") || "";
    const timestamp = req.headers.get("x-workpulse-timestamp") || req.headers.get("x-timestamp") || "";
    const secret = process.env.BIOMETRIC_WEBHOOK_SECRET || "secret-test";

    // 1. Timestamp Replay Protection (5-min tolerance)
    if (timestamp) {
      const tolerance = verifyTimestampTolerance(timestamp, 300);
      if (!tolerance.valid) {
        return NextResponse.json(
          { error: "Timestamp skew exceeded maximum allowed 300 seconds (Replay protection)." },
          { status: 401 }
        );
      }
    }

    // 2. HMAC-SHA256 Signature Verification
    if (signature && process.env.NODE_ENV === "production") {
      const isValid = verifyHmacSha256(rawBody, signature, secret);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid HMAC-SHA256 signature." },
          { status: 401 }
        );
      }
    }

    // 3. Parse & Validate Payload
    const json = JSON.parse(rawBody);
    const parsed = canonicalBiometricPunchSchema.parse(json);

    // 4. Ingest Punch
    const result = await BiometricService.ingestPunches({
      punches: [parsed],
      source: "WEBHOOK",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Biometric transaction received successfully",
        data: result,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        error: err.message || "Failed to process biometric webhook",
      },
      { status: 400 }
    );
  }
}
