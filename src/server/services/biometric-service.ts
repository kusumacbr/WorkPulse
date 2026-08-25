import crypto from "crypto";
import { AuditService } from "@/lib/audit/audit-service";
import { AuthActor } from "@/lib/authorization/types";
import { assertAuthorized } from "@/lib/authorization/authorize";
import { PERMISSIONS } from "@/lib/authorization/permissions";
import {
  CanonicalBiometricPunchInput,
  BiometricDeviceRegisterInput,
} from "@/lib/validation/biometric";
import { generateDeduplicationKey } from "@/lib/security/biometric-hmac";
import { AttendanceService } from "./attendance-service";

export interface BiometricDeviceRecord {
  id: string;
  organizationId: string;
  name: string;
  locationId?: string | null;
  locationName: string;
  provider: "ESLATE" | "MATRIX" | "ZKTECO" | "ANVIZ" | "GENERIC_WEBHOOK" | "LOCAL_CONNECTOR";
  serialNumber: string;
  model: string;
  timezone: string;
  apiKeyHash: string;
  apiSecretHash: string;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "DISCONNECTED";
  lastHeartbeatAt?: string | null;
  lastPunchAt?: string | null;
  syncFailureCount: number;
  firmwareVersion?: string | null;
  ipAddress?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BiometricEmployeeMappingRecord {
  id: string;
  organizationId: string;
  provider: string;
  deviceId?: string | null;
  deviceEmployeeCode: string;
  employeeId: string;
  effectiveFrom: string; // YYYY-MM-DD
  effectiveTo?: string | null;
}

export interface BiometricPunchTransactionRecord {
  id: string;
  organizationId: string;
  locationId?: string | null;
  deviceId: string;
  provider: string;
  vendorTransactionId?: string | null;
  deviceEmployeeCode: string;
  mappedEmployeeId?: string | null;
  occurredAt: string;
  originalTimezone: string;
  direction: "IN" | "OUT" | "BREAK_START" | "BREAK_END" | "UNKNOWN";
  verificationMethod: "FINGERPRINT" | "FACE" | "CARD" | "PIN" | "MOBILE" | "MANUAL" | "UNKNOWN";
  rawPayloadRedacted?: Record<string, unknown> | null;
  ingestionStatus: "PROCESSED" | "QUARANTINED" | "DUPLICATE_REJECTED" | "FAILED";
  duplicateKey: string;
  quarantineReason?: string | null;
  resolvedById?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
}

// In-memory stores
const inMemoryDevices = new Map<string, BiometricDeviceRecord>();
const inMemoryMappings = new Map<string, BiometricEmployeeMappingRecord>();
const inMemoryTransactions = new Map<string, BiometricPunchTransactionRecord>();

// Pre-populate sample mappings for Sara (code "BIO-101"), John ("BIO-102"), Alex ("BIO-103")
const initialMappings: BiometricEmployeeMappingRecord[] = [
  { id: "map-1", organizationId: "org-xorstack", provider: "GENERIC_WEBHOOK", deviceEmployeeCode: "BIO-101", employeeId: "emp-sarah", effectiveFrom: "2026-01-01" },
  { id: "map-2", organizationId: "org-xorstack", provider: "GENERIC_WEBHOOK", deviceEmployeeCode: "BIO-102", employeeId: "emp-john", effectiveFrom: "2026-01-01" },
  { id: "map-3", organizationId: "org-xorstack", provider: "GENERIC_WEBHOOK", deviceEmployeeCode: "BIO-103", employeeId: "emp-alex", effectiveFrom: "2026-01-01" },
  { id: "map-4", organizationId: "org-xorstack", provider: "LOCAL_CONNECTOR", deviceEmployeeCode: "BIO-101", employeeId: "emp-sarah", effectiveFrom: "2026-01-01" },
];

initialMappings.forEach((m) => inMemoryMappings.set(m.id, m));

// Sample initial device
const initialDevice: BiometricDeviceRecord = {
  id: "dev-hq-floor3",
  organizationId: "org-xorstack",
  name: "HQ 3rd Floor Main Entrance",
  locationName: "HQ Bangalore",
  provider: "GENERIC_WEBHOOK",
  serialNumber: "SN-ZK-883921",
  model: "ZK-Teco SenseFace 4A",
  timezone: "Asia/Kolkata",
  apiKeyHash: crypto.createHash("sha256").update("api-key-test").digest("hex"),
  apiSecretHash: crypto.createHash("sha256").update("secret-test").digest("hex"),
  status: "ACTIVE",
  lastHeartbeatAt: new Date().toISOString(),
  lastPunchAt: new Date().toISOString(),
  syncFailureCount: 0,
  firmwareVersion: "v4.1.8-sec",
  ipAddress: "192.168.1.140",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

inMemoryDevices.set(initialDevice.id, initialDevice);

export class BiometricService {
  /**
   * Register a new biometric hardware device (Admin-only).
   * Generates plaintext keys once and stores secure hashes.
   */
  static async registerDevice(params: {
    actor: AuthActor;
    input: BiometricDeviceRegisterInput;
  }): Promise<{
    device: BiometricDeviceRecord;
    apiKey: string;
    apiSecret: string;
  }> {
    await assertAuthorized({
      actor: params.actor,
      permission: PERMISSIONS.DEVICE_MANAGE,
    });

    const deviceId = `dev-${crypto.randomUUID()}`;
    const rawApiKey = `wp_live_${crypto.randomBytes(16).toString("hex")}`;
    const rawApiSecret = `wp_sec_${crypto.randomBytes(32).toString("hex")}`;

    const now = new Date().toISOString();
    const device: BiometricDeviceRecord = {
      id: deviceId,
      organizationId: "org-xorstack",
      name: params.input.name,
      locationName: params.input.locationName,
      provider: params.input.provider,
      serialNumber: params.input.serialNumber,
      model: params.input.model,
      timezone: params.input.timezone,
      apiKeyHash: crypto.createHash("sha256").update(rawApiKey).digest("hex"),
      apiSecretHash: crypto.createHash("sha256").update(rawApiSecret).digest("hex"),
      status: "ACTIVE",
      lastHeartbeatAt: now,
      lastPunchAt: null,
      syncFailureCount: 0,
      firmwareVersion: "v1.0.0",
      createdAt: now,
      updatedAt: now,
    };

    inMemoryDevices.set(device.id, device);

    await AuditService.record({
      actorId: params.actor.userId,
      action: "biometric_device_registered",
      entity: "BiometricDevice",
      entityId: device.id,
      reason: `Registered biometric device: ${device.name} (SN: ${device.serialNumber})`,
      afterState: { ...device } as any,
    });

    return {
      device,
      apiKey: rawApiKey,
      apiSecret: rawApiSecret,
    };
  }

  /**
   * Record periodic device heartbeat (Health / status)
   */
  static async recordHeartbeat(params: {
    deviceId: string;
    firmwareVersion?: string;
    ipAddress?: string;
  }): Promise<BiometricDeviceRecord> {
    const device = inMemoryDevices.get(params.deviceId);
    if (!device) {
      throw new Error(`Device ${params.deviceId} not found.`);
    }

    const now = new Date().toISOString();
    device.lastHeartbeatAt = now;
    device.status = "ACTIVE";
    device.syncFailureCount = 0;
    if (params.firmwareVersion) device.firmwareVersion = params.firmwareVersion;
    if (params.ipAddress) device.ipAddress = params.ipAddress;
    device.updatedAt = now;

    return device;
  }

  /**
   * Resolve date-effective employee mapping
   */
  static resolveEmployeeMapping(params: {
    deviceEmployeeCode: string;
    provider: string;
    occurredAt: string;
  }): BiometricEmployeeMappingRecord | null {
    const dateStr = params.occurredAt.split("T")[0]!;

    for (const mapping of inMemoryMappings.values()) {
      if (mapping.deviceEmployeeCode === params.deviceEmployeeCode) {
        if (mapping.effectiveFrom <= dateStr && (!mapping.effectiveTo || mapping.effectiveTo >= dateStr)) {
          return mapping;
        }
      }
    }
    return null;
  }

  /**
   * Main Ingestion Engine: Ingests punches, applies SHA-256 deduplication,
   * resolves employee mappings, and quarantines unmapped records.
   */
  static async ingestPunches(params: {
    punches: CanonicalBiometricPunchInput[];
    source: "WEBHOOK" | "CONNECTOR_SYNC" | "API_PULL";
  }): Promise<{
    totalIngested: number;
    processedCount: number;
    duplicateCount: number;
    quarantinedCount: number;
    transactions: BiometricPunchTransactionRecord[];
  }> {
    const now = new Date().toISOString();
    const results: BiometricPunchTransactionRecord[] = [];
    let processedCount = 0;
    let duplicateCount = 0;
    let quarantinedCount = 0;

    for (const punch of params.punches) {
      const duplicateKey = generateDeduplicationKey(punch);
      const provider = punch.provider || "GENERIC_WEBHOOK";
      const direction = (punch.direction as any) || "UNKNOWN";
      const verificationMethod = (punch.verificationMethod as any) || "UNKNOWN";

      // Check Deduplication
      if (inMemoryTransactions.has(duplicateKey)) {
        duplicateCount++;
        const existing = inMemoryTransactions.get(duplicateKey)!;
        results.push(existing);
        continue;
      }

      // Resolve Employee Mapping
      const mapping = this.resolveEmployeeMapping({
        deviceEmployeeCode: punch.deviceEmployeeCode,
        provider,
        occurredAt: punch.occurredAt,
      });

      let status: BiometricPunchTransactionRecord["ingestionStatus"] = "PROCESSED";
      let quarantineReason: string | null = null;
      let mappedEmployeeId: string | null = null;

      if (mapping) {
        mappedEmployeeId = mapping.employeeId;
        processedCount++;

        // Trigger Day Recalculation
        const punchTime = punch.occurredAt.slice(11, 16); // HH:MM
        AttendanceService.calculateDayAttendance({
          employeeId: mappedEmployeeId,
          workDate: punch.occurredAt.slice(0, 10),
          biometricPunches: [
            {
              time: punchTime,
              type: direction === "OUT" ? "OUT" : "IN",
            },
          ],
        });
      } else {
        // Unmapped employee code -> Quarantine
        status = "QUARANTINED";
        quarantineReason = `Unmapped device employee code: '${punch.deviceEmployeeCode}'. Placed in quarantine for HR/Admin resolution.`;
        quarantinedCount++;
      }

      const txRecord: BiometricPunchTransactionRecord = {
        id: `tx-${crypto.randomUUID()}`,
        organizationId: punch.organizationId || "org-xorstack",
        locationId: punch.locationId || null,
        deviceId: punch.deviceId,
        provider,
        vendorTransactionId: punch.vendorTransactionId || null,
        deviceEmployeeCode: punch.deviceEmployeeCode,
        mappedEmployeeId,
        occurredAt: punch.occurredAt,
        originalTimezone: punch.originalTimezone || "Asia/Kolkata",
        direction,
        verificationMethod,
        rawPayloadRedacted: punch.rawPayloadRedacted || null,
        ingestionStatus: status,
        duplicateKey,
        quarantineReason,
        createdAt: now,
      };

      inMemoryTransactions.set(duplicateKey, txRecord);
      results.push(txRecord);

      // Persist to Supabase public.biometric_punches table
      if (status === "PROCESSED" && mappedEmployeeId) {
        try {
          const { createAdminClient } = await import("@/lib/supabase/admin");
          const supabase = createAdminClient();
          if (supabase) {
            await supabase.from("biometric_punches").insert({
              employee_id: mappedEmployeeId,
              punch_time: punch.occurredAt,
              punch_type: direction === "OUT" ? "OUT" : "IN",
              terminal_id: punch.deviceId,
              method: verificationMethod,
              status: "VERIFIED",
              raw_payload: punch.rawPayloadRedacted || {},
            });
          }
        } catch {
          // Graceful fallback
        }
      }

      // Update Device Last Punch
      const device = inMemoryDevices.get(punch.deviceId);
      if (device) {
        device.lastPunchAt = now;
      }
    }

    return {
      totalIngested: params.punches.length,
      processedCount,
      duplicateCount,
      quarantinedCount,
      transactions: results,
    };
  }

  /**
   * Get Quarantined Punches for Admin / HR review
   */
  static async getQuarantineQueue(): Promise<BiometricPunchTransactionRecord[]> {
    return Array.from(inMemoryTransactions.values()).filter(
      (tx) => tx.ingestionStatus === "QUARANTINED"
    );
  }

  /**
   * Resolve quarantined punch to an employee (Admin / HR)
   */
  static async resolveQuarantinedPunch(params: {
    actor: AuthActor;
    transactionId: string;
    employeeId: string;
    createPermanentMapping?: boolean;
  }): Promise<BiometricPunchTransactionRecord> {
    await assertAuthorized({
      actor: params.actor,
      permission: PERMISSIONS.DEVICE_MANAGE,
    });

    const tx = Array.from(inMemoryTransactions.values()).find((t) => t.id === params.transactionId);
    if (!tx) {
      throw new Error(`Transaction ${params.transactionId} not found in quarantine.`);
    }

    const now = new Date().toISOString();
    tx.mappedEmployeeId = params.employeeId;
    tx.ingestionStatus = "PROCESSED";
    tx.quarantineReason = null;
    tx.resolvedById = params.actor.userId;
    tx.resolvedAt = now;

    if (params.createPermanentMapping) {
      const mapId = `map-${crypto.randomUUID()}`;
      const mapping: BiometricEmployeeMappingRecord = {
        id: mapId,
        organizationId: tx.organizationId,
        provider: tx.provider,
        deviceId: tx.deviceId,
        deviceEmployeeCode: tx.deviceEmployeeCode,
        employeeId: params.employeeId,
        effectiveFrom: tx.occurredAt.slice(0, 10),
      };
      inMemoryMappings.set(mapId, mapping);
    }

    await AuditService.record({
      actorId: params.actor.userId,
      action: "biometric_punch_quarantine_resolved",
      entity: "BiometricPunchTransaction",
      entityId: tx.id,
      reason: `Quarantine punch resolved to employee '${params.employeeId}'`,
      afterState: { ...tx } as any,
    });

    return tx;
  }

  /**
   * Get Admin Device Health Summary
   */
  static async getDeviceHealthSummary(): Promise<{
    devices: BiometricDeviceRecord[];
    totalDevices: number;
    activeCount: number;
    quarantinedPunchesCount: number;
  }> {
    const devices = Array.from(inMemoryDevices.values());
    const activeCount = devices.filter((d) => d.status === "ACTIVE").length;
    const quarantinedPunchesCount = Array.from(inMemoryTransactions.values()).filter(
      (t) => t.ingestionStatus === "QUARANTINED"
    ).length;

    return {
      devices,
      totalDevices: devices.length,
      activeCount,
      quarantinedPunchesCount,
    };
  }

  static async listDevices(): Promise<BiometricDeviceRecord[]> {
    return Array.from(inMemoryDevices.values());
  }

  static async createEmployeeMapping(params: {
    actor: AuthActor;
    input: {
      deviceEmployeeCode: string;
      employeeId: string;
      provider?: string;
      deviceId?: string | null;
      effectiveFrom?: string;
    };
  }): Promise<BiometricEmployeeMappingRecord> {
    const id = `map-${Date.now()}`;
    const mapping: BiometricEmployeeMappingRecord = {
      id,
      organizationId: "org-xorstack",
      provider: params.input.provider || "GENERIC_WEBHOOK",
      deviceId: params.input.deviceId || null,
      deviceEmployeeCode: params.input.deviceEmployeeCode,
      employeeId: params.input.employeeId,
      effectiveFrom: params.input.effectiveFrom || new Date().toISOString().split("T")[0]!,
    };
    inMemoryMappings.set(id, mapping);
    return mapping;
  }

  static async ingestCanonicalPunches(params: {
    deviceId: string;
    connectorId: string;
    events: any[];
  }): Promise<{
    accepted: number;
    duplicates: number;
    rejected: number;
    errors: string[];
  }> {
    const punches: CanonicalBiometricPunchInput[] = params.events.map((e) => ({
      deviceId: params.deviceId,
      deviceEmployeeCode: e.employeeCode || e.deviceEmployeeCode,
      occurredAt: e.occurredAt || new Date().toISOString(),
      direction: e.direction || "IN",
      verificationMethod: e.verificationMethod || "FINGERPRINT",
      vendorTransactionId: e.transactionId || e.vendorTransactionId || null,
      provider: "LOCAL_CONNECTOR",
    }));

    const result = await this.ingestPunches({
      punches,
      source: "CONNECTOR_SYNC",
    });

    return {
      accepted: result.processedCount,
      duplicates: result.duplicateCount,
      rejected: 0,
      errors: [],
    };
  }

  static clearStore(): void {
    inMemoryDevices.clear();
    inMemoryTransactions.clear();
    // restore sample mappings and device
    initialMappings.forEach((m) => inMemoryMappings.set(m.id, m));
    inMemoryDevices.set(initialDevice.id, initialDevice);
  }
}

export const BiometricIntegrationService = BiometricService;

