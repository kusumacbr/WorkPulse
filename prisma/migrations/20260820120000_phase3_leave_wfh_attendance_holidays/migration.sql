-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('CASUAL', 'SICK', 'PRIVILEGE', 'UNPAID');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING_MANAGER', 'PENDING_HR', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WfhStatus" AS ENUM ('PENDING_MANAGER', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RegularisationStatus" AS ENUM ('PENDING_MANAGER', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "HolidayType" AS ENUM ('NATIONAL', 'FESTIVAL', 'COMPANY_OPTIONAL');

-- CreateEnum
CREATE TYPE "PunchType" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "PunchSource" AS ENUM ('BIOMETRIC', 'WEB_MANUAL');

-- CreateTable
CREATE TABLE "leave_balance" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "leaveType" "LeaveType" NOT NULL DEFAULT 'CASUAL',
    "annualAllotment" DOUBLE PRECISION NOT NULL DEFAULT 12.0,
    "usedDays" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "pendingDays" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "remainingDays" DOUBLE PRECISION NOT NULL DEFAULT 12.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_request" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "leaveType" "LeaveType" NOT NULL DEFAULT 'CASUAL',
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "isHalfDay" BOOLEAN NOT NULL DEFAULT false,
    "halfDayType" TEXT,
    "daysCount" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "reason" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "handoverNotes" TEXT,
    "backupEmployeeId" TEXT,
    "managerApproverId" TEXT,
    "managerApprovedAt" TIMESTAMP(3),
    "managerComment" TEXT,
    "hrApproverId" TEXT,
    "hrApprovedAt" TIMESTAMP(3),
    "hrComment" TEXT,
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING_MANAGER',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wfh_request" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "daysCount" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isSelfMarked" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT NOT NULL,
    "availabilityHours" TEXT NOT NULL DEFAULT '09:00-18:00',
    "contactMethod" TEXT NOT NULL DEFAULT 'Slack & Google Meet',
    "plannedDeliverables" TEXT NOT NULL,
    "managerApproverId" TEXT,
    "managerApprovedAt" TIMESTAMP(3),
    "status" "WfhStatus" NOT NULL DEFAULT 'PENDING_MANAGER',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wfh_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_regularisation" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "workdayId" TEXT NOT NULL,
    "proposedCheckIn" TIMESTAMP(3) NOT NULL,
    "proposedCheckOut" TIMESTAMP(3) NOT NULL,
    "regularisationReason" TEXT NOT NULL,
    "evidenceUrl" TEXT,
    "managerApproverId" TEXT,
    "managerApprovedAt" TIMESTAMP(3),
    "status" "RegularisationStatus" NOT NULL DEFAULT 'PENDING_MANAGER',
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_regularisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biometric_punch" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "punchTime" TIMESTAMP(3) NOT NULL,
    "punchType" "PunchType" NOT NULL DEFAULT 'IN',
    "source" "PunchSource" NOT NULL DEFAULT 'BIOMETRIC',
    "deviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "biometric_punch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holiday" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "holidayType" "HolidayType" NOT NULL DEFAULT 'NATIONAL',
    "description" TEXT,
    "year" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holiday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shift" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TEXT NOT NULL DEFAULT '09:00',
    "endTime" TEXT NOT NULL DEFAULT '18:00',
    "crossesMidnight" BOOLEAN NOT NULL DEFAULT false,
    "gracePeriodMinutes" INTEGER NOT NULL DEFAULT 15,
    "halfDayThresholdHours" DOUBLE PRECISION NOT NULL DEFAULT 4.0,
    "fullDayThresholdHours" DOUBLE PRECISION NOT NULL DEFAULT 8.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shift_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "leave_balance_employeeId_year_leaveType_key" ON "leave_balance"("employeeId", "year", "leaveType");
CREATE INDEX "leave_balance_employeeId_idx" ON "leave_balance"("employeeId");
CREATE INDEX "leave_request_employeeId_status_idx" ON "leave_request"("employeeId", "status");
CREATE INDEX "leave_request_startDate_endDate_idx" ON "leave_request"("startDate", "endDate");
CREATE INDEX "wfh_request_employeeId_status_idx" ON "wfh_request"("employeeId", "status");
CREATE INDEX "wfh_request_startDate_endDate_idx" ON "wfh_request"("startDate", "endDate");
CREATE INDEX "attendance_regularisation_employeeId_status_idx" ON "attendance_regularisation"("employeeId", "status");
CREATE INDEX "attendance_regularisation_workdayId_idx" ON "attendance_regularisation"("workdayId");
CREATE INDEX "biometric_punch_employeeId_punchTime_idx" ON "biometric_punch"("employeeId", "punchTime");
CREATE UNIQUE INDEX "holiday_date_name_key" ON "holiday"("date", "name");
CREATE INDEX "holiday_year_date_idx" ON "holiday"("year", "date");
CREATE UNIQUE INDEX "shift_name_key" ON "shift"("name");

-- AddForeignKey
ALTER TABLE "leave_balance" ADD CONSTRAINT "leave_balance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "leave_request" ADD CONSTRAINT "leave_request_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "leave_request" ADD CONSTRAINT "leave_request_backupEmployeeId_fkey" FOREIGN KEY ("backupEmployeeId") REFERENCES "employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "wfh_request" ADD CONSTRAINT "wfh_request_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attendance_regularisation" ADD CONSTRAINT "attendance_regularisation_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "attendance_regularisation" ADD CONSTRAINT "attendance_regularisation_workdayId_fkey" FOREIGN KEY ("workdayId") REFERENCES "workday"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "biometric_punch" ADD CONSTRAINT "biometric_punch_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
