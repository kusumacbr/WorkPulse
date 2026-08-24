import { describe, it, expect, beforeEach } from "vitest";
import { BiometricService } from "@/server/services/biometric-service";
import { checkForForbiddenBiometricData } from "@/lib/validation/biometric";
import {
  computeHmacSha256,
  verifyHmacSha256,
  verifyTimestampTolerance,
  generateDeduplicationKey,
} from "@/lib/security/biometric-hmac";
import { AuthActor } from "@/lib/authorization/types";

describe("Direct Biometric Attendance Integration (Phase 4)", () => {
  const adminActor: AuthActor = {
    userId: "user-admin",
    employeeId: "emp-admin",
    email: "admin@xorstack.com",
    roles: ["ADMIN"],
    departmentId: "dept-core",
  };

  beforeEach(() => {
    BiometricService.clearStore();
  });

  describe("Replay Protection & SHA-256 Deduplication", () => {
    it("proves replayed / offline-buffered transactions are idempotent and never create duplicates", async () => {
      const offlinePunches = [
        {
          deviceId: "dev-hq-floor3",
          provider: "LOCAL_CONNECTOR" as const,
          vendorTransactionId: "TX-BATCH-001",
          deviceEmployeeCode: "BIO-101", // Mapped to Sarah
          occurredAt: "2026-08-20T09:12:00Z",
          direction: "IN" as const,
          verificationMethod: "FINGERPRINT" as const,
        },
        {
          deviceId: "dev-hq-floor3",
          provider: "LOCAL_CONNECTOR" as const,
          vendorTransactionId: "TX-BATCH-002",
          deviceEmployeeCode: "BIO-102", // Mapped to John
          occurredAt: "2026-08-20T09:15:00Z",
          direction: "IN" as const,
          verificationMethod: "CARD" as const,
        },
      ];

      // 1. First Ingestion: Should process both transactions
      const firstIngestion = await BiometricService.ingestPunches({
        punches: offlinePunches,
        source: "CONNECTOR_SYNC",
      });

      expect(firstIngestion.totalIngested).toBe(2);
      expect(firstIngestion.processedCount).toBe(2);
      expect(firstIngestion.duplicateCount).toBe(0);

      // 2. Replayed Offline Buffer Ingestion: Should detect duplicates and ignore without duplication
      const replayIngestion = await BiometricService.ingestPunches({
        punches: offlinePunches,
        source: "CONNECTOR_SYNC",
      });

      expect(replayIngestion.totalIngested).toBe(2);
      expect(replayIngestion.processedCount).toBe(0);
      expect(replayIngestion.duplicateCount).toBe(2);
    });

    it("generates deterministic fallback deduplication hash when vendor transaction ID is absent", () => {
      const punchA = {
        organizationId: "org-xorstack",
        deviceId: "dev-hq-floor3",
        deviceEmployeeCode: "BIO-101",
        occurredAt: "2026-08-20T09:12:00.000Z",
        direction: "IN" as const,
      };

      const punchB = {
        organizationId: "org-xorstack",
        deviceId: "dev-hq-floor3",
        deviceEmployeeCode: "BIO-101",
        occurredAt: "2026-08-20T09:12:00.000Z",
        direction: "IN" as const,
      };

      const keyA = generateDeduplicationKey(punchA as any);
      const keyB = generateDeduplicationKey(punchB as any);

      expect(keyA).toBe(keyB);
      expect(keyA).toContain("hash:");
    });
  });

  describe("Quarantine Queue & Unmapped Code Resolution", () => {
    it("places unmapped employee codes into quarantine queue without auto-assigning or dropping", async () => {
      const unmappedPunch = {
        deviceId: "dev-hq-floor3",
        provider: "GENERIC_WEBHOOK" as const,
        vendorTransactionId: "TX-UNMAPPED-999",
        deviceEmployeeCode: "BIO-UNKNOWN-999",
        occurredAt: "2026-08-20T09:30:00Z",
        direction: "IN" as const,
        verificationMethod: "FACE" as const,
      };

      const result = await BiometricService.ingestPunches({
        punches: [unmappedPunch],
        source: "WEBHOOK",
      });

      expect(result.quarantinedCount).toBe(1);
      expect(result.processedCount).toBe(0);

      const quarantine = await BiometricService.getQuarantineQueue();
      expect(quarantine.length).toBe(1);
      expect(quarantine[0]?.deviceEmployeeCode).toBe("BIO-UNKNOWN-999");
      expect(quarantine[0]?.ingestionStatus).toBe("QUARANTINED");
      expect(quarantine[0]?.quarantineReason).toContain("Unmapped device employee code");
    });

    it("allows Admin to resolve quarantined punch and create permanent mapping", async () => {
      const unmappedPunch = {
        deviceId: "dev-hq-floor3",
        provider: "GENERIC_WEBHOOK" as const,
        vendorTransactionId: "TX-UNMAPPED-888",
        deviceEmployeeCode: "BIO-NEW-888",
        occurredAt: "2026-08-20T09:35:00Z",
        direction: "IN" as const,
        verificationMethod: "CARD" as const,
      };

      const ingest = await BiometricService.ingestPunches({
        punches: [unmappedPunch],
        source: "WEBHOOK",
      });

      const txId = ingest.transactions[0]?.id!;

      // Admin resolves punch to Priya QA
      const resolved = await BiometricService.resolveQuarantinedPunch({
        actor: adminActor,
        transactionId: txId,
        employeeId: "emp-priya",
        createPermanentMapping: true,
      });

      expect(resolved.ingestionStatus).toBe("PROCESSED");
      expect(resolved.mappedEmployeeId).toBe("emp-priya");

      // Verify subsequent punch with BIO-NEW-888 is now automatically recognized
      const subsequentPunch = {
        deviceId: "dev-hq-floor3",
        provider: "GENERIC_WEBHOOK" as const,
        vendorTransactionId: "TX-SUBSEQUENT-889",
        deviceEmployeeCode: "BIO-NEW-888",
        occurredAt: "2026-08-20T18:05:00Z",
        direction: "OUT" as const,
        verificationMethod: "CARD" as const,
      };

      const subsequentIngest = await BiometricService.ingestPunches({
        punches: [subsequentPunch],
        source: "WEBHOOK",
      });

      expect(subsequentIngest.processedCount).toBe(1);
      expect(subsequentIngest.quarantinedCount).toBe(0);
      expect(subsequentIngest.transactions[0]?.mappedEmployeeId).toBe("emp-priya");
    });
  });

  describe("HMAC Security & Compliance Zero-Template Enforcement", () => {
    it("validates HMAC-SHA256 signature and timestamp tolerance window", () => {
      const secret = "device_signing_secret_12345";
      const payload = JSON.stringify({ deviceId: "dev-1", punchTime: "2026-08-20T09:00:00Z" });

      const validSig = computeHmacSha256(payload, secret);
      expect(verifyHmacSha256(payload, validSig, secret)).toBe(true);

      const tamperedPayload = JSON.stringify({ deviceId: "dev-1", punchTime: "2026-08-20T10:00:00Z" });
      expect(verifyHmacSha256(tamperedPayload, validSig, secret)).toBe(false);

      // Skew tolerance
      const currentEpoch = Date.now();
      expect(verifyTimestampTolerance(currentEpoch, 300).valid).toBe(true);

      const expiredEpoch = Date.now() - 600000; // 10 minutes ago
      expect(verifyTimestampTolerance(expiredEpoch, 300).valid).toBe(false);
    });

    it("strictly rejects any payload containing forbidden raw biometric templates or fingerprint images", () => {
      expect(() => {
        checkForForbiddenBiometricData({
          deviceId: "dev-1",
          deviceEmployeeCode: "101",
          fingerprintTemplate: "base64_encoded_raw_minutiae_data",
        });
      }).toThrow(/Security & Compliance Violation/);

      expect(() => {
        checkForForbiddenBiometricData({
          deviceId: "dev-1",
          deviceEmployeeCode: "101",
          faceEmbedding: [0.123, 0.456, 0.789],
        });
      }).toThrow(/Security & Compliance Violation/);
    });
  });
});
