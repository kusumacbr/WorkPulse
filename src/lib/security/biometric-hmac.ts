import crypto from "crypto";
import { CanonicalBiometricPunchInput } from "../validation/biometric";

/**
 * Deterministic deduplication key generator for biometric punches.
 * Preferred: provider:deviceId:vendorTransactionId
 * Fallback: sha256(organizationId:deviceId:deviceEmployeeCode:occurredAt:direction)
 */
export function generateDeduplicationKey(punch: CanonicalBiometricPunchInput): string {
  if (punch.vendorTransactionId && punch.vendorTransactionId.trim().length > 0) {
    return `${punch.provider}:${punch.deviceId}:${punch.vendorTransactionId.trim()}`;
  }

  const rawKey = [
    punch.organizationId || "org-xorstack",
    punch.deviceId,
    punch.deviceEmployeeCode.trim(),
    new Date(punch.occurredAt).toISOString(),
    punch.direction || "UNKNOWN",
  ].join(":");

  const hash = crypto.createHash("sha256").update(rawKey).digest("hex");
  return `hash:${hash}`;
}

/**
 * Computes HMAC-SHA256 signature for webhook payload.
 */
export function computeHmacSha256(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Verifies HMAC-SHA256 signature with constant-time equality check.
 */
export function verifyHmacSha256(payload: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  const expected = computeHmacSha256(payload, secret);

  const sigBuffer = Buffer.from(signature, "hex");
  const expBuffer = Buffer.from(expected, "hex");

  if (sigBuffer.length !== expBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, expBuffer);
}

/**
 * Timestamp replay protection tolerance check (default 5 minutes / 300 seconds).
 */
export function verifyTimestampTolerance(
  timestampIsoOrEpoch: string | number,
  maxSkewSeconds = 300
): { valid: boolean; skewSeconds: number } {
  const sentTime = typeof timestampIsoOrEpoch === "number" ? timestampIsoOrEpoch : new Date(timestampIsoOrEpoch).getTime();
  const now = Date.now();
  const diffMs = Math.abs(now - sentTime);
  const skewSeconds = Math.round(diffMs / 1000);

  return {
    valid: skewSeconds <= maxSkewSeconds,
    skewSeconds,
  };
}
