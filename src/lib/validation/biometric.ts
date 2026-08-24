import { z } from "zod";

export const BiometricProviderEnum = z.enum([
  "ESLATE",
  "MATRIX",
  "ZKTECO",
  "ANVIZ",
  "GENERIC_WEBHOOK",
  "LOCAL_CONNECTOR",
]);

export const PunchDirectionEnum = z.enum(["IN", "OUT", "BREAK_START", "BREAK_END", "UNKNOWN"]);

export const VerificationMethodEnum = z.enum([
  "FINGERPRINT",
  "FACE",
  "CARD",
  "PIN",
  "MOBILE",
  "MANUAL",
  "UNKNOWN",
]);

// Compliance: Keywords that must NEVER appear in incoming biometric transaction payloads
export const FORBIDDEN_BIOMETRIC_KEYS = [
  "fingerprintImage",
  "fingerprintTemplate",
  "minutiae",
  "faceTemplate",
  "faceEmbedding",
  "faceVector",
  "irisTemplate",
  "irisScan",
  "biometricBlob",
  "enrollmentBlob",
  "rawBiometric",
  "photoForMatching",
] as const;

export function checkForForbiddenBiometricData(obj: unknown): void {
  if (!obj || typeof obj !== "object") return;
  const keys = Object.keys(obj as Record<string, unknown>);

  for (const key of keys) {
    const lowerKey = key.toLowerCase();
    for (const forbidden of FORBIDDEN_BIOMETRIC_KEYS) {
      if (lowerKey.includes(forbidden.toLowerCase())) {
        throw new Error(
          `Security & Compliance Violation: Ingestion of raw biometric templates or images ('${key}') is strictly prohibited by WorkPulse policy.`
        );
      }
    }

    const value = (obj as Record<string, unknown>)[key];
    if (typeof value === "object" && value !== null) {
      checkForForbiddenBiometricData(value);
    }
  }
}

export const canonicalBiometricPunchSchema = z
  .object({
    organizationId: z.string().optional().default("org-xorstack"),
    locationId: z.string().optional().nullable(),
    deviceId: z.string().min(1, "Device ID is required"),
    provider: BiometricProviderEnum.default("GENERIC_WEBHOOK"),
    vendorTransactionId: z.string().optional().nullable(),
    deviceEmployeeCode: z.string().min(1, "Device employee code is required"),
    occurredAt: z.string().min(10, "occurredAt timestamp is required"),
    originalTimezone: z.string().optional().default("Asia/Kolkata"),
    direction: PunchDirectionEnum.default("UNKNOWN"),
    verificationMethod: VerificationMethodEnum.default("UNKNOWN"),
    rawPayloadRedacted: z.record(z.unknown()).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    try {
      checkForForbiddenBiometricData(data);
    } catch (err: any) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: err.message,
        path: ["rawPayloadRedacted"],
      });
    }
  });

export type CanonicalBiometricPunchInput = z.input<typeof canonicalBiometricPunchSchema>;
export type CanonicalBiometricPunchOutput = z.output<typeof canonicalBiometricPunchSchema>;

export const biometricBatchSyncSchema = z.object({
  deviceId: z.string(),
  provider: BiometricProviderEnum.default("LOCAL_CONNECTOR"),
  sentAt: z.string(),
  punches: z.array(canonicalBiometricPunchSchema).min(1, "Batch must contain at least one punch transaction"),
});

export type BiometricBatchSyncInput = z.infer<typeof biometricBatchSyncSchema>;

export const biometricDeviceRegisterSchema = z.object({
  name: z.string().min(3, "Device name must be at least 3 characters"),
  serialNumber: z.string().min(3, "Serial number is required"),
  locationName: z.string().default("HQ Office"),
  provider: BiometricProviderEnum.default("GENERIC_WEBHOOK"),
  model: z.string().default("Standard Biometric Terminal"),
  timezone: z.string().default("Asia/Kolkata"),
});

export type BiometricDeviceRegisterInput = z.infer<typeof biometricDeviceRegisterSchema>;
