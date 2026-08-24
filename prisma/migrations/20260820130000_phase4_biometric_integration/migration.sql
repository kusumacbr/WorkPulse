-- CreateEnum
CREATE TYPE "BiometricProvider" AS ENUM ('ESLATE', 'MATRIX', 'ZKTECO', 'ANVIZ', 'GENERIC_WEBHOOK', 'LOCAL_CONNECTOR');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "PunchDirection" AS ENUM ('IN', 'OUT', 'BREAK_START', 'BREAK_END', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "VerificationMethod" AS ENUM ('FINGERPRINT', 'FACE', 'CARD', 'PIN', 'MOBILE', 'MANUAL', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "IngestionStatus" AS ENUM ('PROCESSED', 'QUARANTINED', 'DUPLICATE_REJECTED', 'FAILED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'BIOMETRIC_SYNC_ERROR';

-- CreateTable
CREATE TABLE "biometric_device" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locationId" TEXT,
    "locationName" TEXT NOT NULL DEFAULT 'HQ Office',
    "provider" "BiometricProvider" NOT NULL DEFAULT 'GENERIC_WEBHOOK',
    "serialNumber" TEXT NOT NULL,
    "model" TEXT NOT NULL DEFAULT 'Standard Biometric Terminal',
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "apiKeyHash" TEXT NOT NULL,
    "apiSecretHash" TEXT NOT NULL,
    "status" "DeviceStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastHeartbeatAt" TIMESTAMP(3),
    "lastPunchAt" TIMESTAMP(3),
    "syncFailureCount" INTEGER NOT NULL DEFAULT 0,
    "firmwareVersion" TEXT,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "biometric_device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biometric_employee_mapping" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "provider" "BiometricProvider" NOT NULL DEFAULT 'GENERIC_WEBHOOK',
    "deviceId" TEXT,
    "deviceEmployeeCode" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "effectiveFrom" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "biometric_employee_mapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biometric_punch_transaction" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "locationId" TEXT,
    "deviceId" TEXT NOT NULL,
    "provider" "BiometricProvider" NOT NULL DEFAULT 'GENERIC_WEBHOOK',
    "vendorTransactionId" TEXT,
    "deviceEmployeeCode" TEXT NOT NULL,
    "mappedEmployeeId" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "originalTimezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "direction" "PunchDirection" NOT NULL DEFAULT 'UNKNOWN',
    "verificationMethod" "VerificationMethod" NOT NULL DEFAULT 'UNKNOWN',
    "rawPayloadRedacted" JSONB,
    "ingestionStatus" "IngestionStatus" NOT NULL DEFAULT 'PROCESSED',
    "duplicateKey" TEXT NOT NULL,
    "quarantineReason" TEXT,
    "resolvedById" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "biometric_punch_transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "biometric_device_serialNumber_key" ON "biometric_device"("serialNumber");
CREATE INDEX "biometric_device_organizationId_status_idx" ON "biometric_device"("organizationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "biometric_employee_mapping_organizationId_provider_deviceEmployeeCode_effectiveFrom_key" ON "biometric_employee_mapping"("organizationId", "provider", "deviceEmployeeCode", "effectiveFrom");
CREATE INDEX "biometric_employee_mapping_deviceEmployeeCode_idx" ON "biometric_employee_mapping"("deviceEmployeeCode");
CREATE INDEX "biometric_employee_mapping_employeeId_idx" ON "biometric_employee_mapping"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "biometric_punch_transaction_duplicateKey_key" ON "biometric_punch_transaction"("duplicateKey");
CREATE INDEX "biometric_punch_transaction_organizationId_ingestionStatus_idx" ON "biometric_punch_transaction"("organizationId", "ingestionStatus");
CREATE INDEX "biometric_punch_transaction_deviceId_occurredAt_idx" ON "biometric_punch_transaction"("deviceId", "occurredAt");
CREATE INDEX "biometric_punch_transaction_mappedEmployeeId_idx" ON "biometric_punch_transaction"("mappedEmployeeId");

-- AddForeignKey
ALTER TABLE "biometric_device" ADD CONSTRAINT "biometric_device_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "biometric_employee_mapping" ADD CONSTRAINT "biometric_employee_mapping_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "biometric_device"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "biometric_employee_mapping" ADD CONSTRAINT "biometric_employee_mapping_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "biometric_punch_transaction" ADD CONSTRAINT "biometric_punch_transaction_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "biometric_device"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "biometric_punch_transaction" ADD CONSTRAINT "biometric_punch_transaction_mappedEmployeeId_fkey" FOREIGN KEY ("mappedEmployeeId") REFERENCES "employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
