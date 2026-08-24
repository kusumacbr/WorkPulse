-- CreateEnum
CREATE TYPE "AnnouncementCategory" AS ENUM ('GENERAL', 'POLICY', 'BIRTHDAY', 'FESTIVAL', 'HOLIDAY', 'EVENT', 'EMERGENCY', 'COMPANY_NEWS');

-- CreateEnum
CREATE TYPE "AnnouncementPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "AudienceType" AS ENUM ('ALL', 'DEPARTMENT', 'TEAM', 'EMPLOYEE');

-- CreateEnum
CREATE TYPE "ExportJobStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ExportFormat" AS ENUM ('CSV', 'XLSX', 'PDF');

-- CreateEnum
CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('QUEUED', 'PROCESSING', 'DELIVERED', 'FAILED', 'RETRYING', 'DEAD_LETTER');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'ANNOUNCEMENT';
ALTER TYPE "NotificationType" ADD VALUE 'EXPORT_COMPLETED';

-- CreateTable
CREATE TABLE "announcement" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" "AnnouncementCategory" NOT NULL DEFAULT 'GENERAL',
    "priority" "AnnouncementPriority" NOT NULL DEFAULT 'NORMAL',
    "audienceType" "AudienceType" NOT NULL DEFAULT 'ALL',
    "audienceTargetId" TEXT,
    "publishDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" DATE,
    "attachmentUrl" TEXT,
    "acknowledgementRequired" BOOLEAN NOT NULL DEFAULT false,
    "channels" JSONB,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "announcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcement_receipt" (
    "id" TEXT NOT NULL,
    "announcementId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" TIMESTAMP(3),

    CONSTRAINT "announcement_receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_calendar_event" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "externalEventId" TEXT NOT NULL,
    "meetingId" TEXT,
    "title" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "syncStatus" TEXT NOT NULL DEFAULT 'SYNCED',
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "external_calendar_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_job" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "filters" JSONB,
    "format" "ExportFormat" NOT NULL DEFAULT 'CSV',
    "status" "ExportJobStatus" NOT NULL DEFAULT 'QUEUED',
    "downloadToken" TEXT,
    "tokenExpiresAt" TIMESTAMP(3),
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "fileSizeBytes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "export_job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "announcement_organizationId_priority_idx" ON "announcement"("organizationId", "priority");
CREATE INDEX "announcement_publishDate_idx" ON "announcement"("publishDate");
CREATE UNIQUE INDEX "announcement_receipt_announcementId_employeeId_key" ON "announcement_receipt"("announcementId", "employeeId");
CREATE INDEX "announcement_receipt_employeeId_idx" ON "announcement_receipt"("employeeId");
CREATE INDEX "external_calendar_event_externalEventId_idx" ON "external_calendar_event"("externalEventId");
CREATE UNIQUE INDEX "export_job_downloadToken_key" ON "export_job"("downloadToken");
CREATE INDEX "export_job_requesterId_status_idx" ON "export_job"("requesterId", "status");

-- AddForeignKey
ALTER TABLE "announcement" ADD CONSTRAINT "announcement_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "announcement_receipt" ADD CONSTRAINT "announcement_receipt_announcementId_fkey" FOREIGN KEY ("announcementId") REFERENCES "announcement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "announcement_receipt" ADD CONSTRAINT "announcement_receipt_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "external_calendar_event" ADD CONSTRAINT "external_calendar_event_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "one_to_one_meeting"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "export_job" ADD CONSTRAINT "export_job_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
