-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('OFFICE', 'WFH', 'HYBRID', 'CLIENT_LOCATION', 'BUSINESS_TRAVEL', 'FULL_DAY_LEAVE', 'HALF_DAY_LEAVE', 'COMPANY_HOLIDAY', 'WEEKLY_OFF', 'ABSENT');

-- CreateEnum
CREATE TYPE "WorkdayStatus" AS ENUM ('OPEN', 'SOD_SUBMITTED', 'EOD_SUBMITTED', 'CHANGES_REQUESTED', 'LOCKED', 'AMENDED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('PLANNED', 'SUPPORT', 'MEETING', 'INCIDENT', 'LEARNING', 'ADMINISTRATIVE');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PARTIALLY_COMPLETED', 'BLOCKED', 'CARRIED_FORWARD', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GoalPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SOD_REMINDER', 'EOD_REMINDER', 'CHANGES_REQUESTED', 'GOAL_APPROVED', 'WORKDAY_LOCKED', 'BLOCKER_ALERT', 'GENERAL');

-- AlterTable
ALTER TABLE "employee" ADD COLUMN "fullName" TEXT,
ADD COLUMN "preferredName" TEXT,
ADD COLUMN "secondaryEmail" TEXT,
ADD COLUMN "profilePhoto" TEXT,
ADD COLUMN "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
ADD COLUMN "probationStartDate" DATE,
ADD COLUMN "defaultShift" TEXT NOT NULL DEFAULT '09:00-18:00',
ADD COLUMN "skills" JSONB,
ADD COLUMN "lastWorkingDate" DATE;

-- AlterTable
ALTER TABLE "manager_assignment" ADD COLUMN "isPrimary" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "isSecondary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "notes" TEXT;

-- CreateTable
CREATE TABLE "employee_project_team" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employee_project_team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workday" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "workDate" DATE NOT NULL,
    "workMode" "WorkMode" NOT NULL DEFAULT 'OFFICE',
    "shift" TEXT NOT NULL DEFAULT '09:00-18:00',
    "plannedHours" DOUBLE PRECISION NOT NULL DEFAULT 8.0,
    "checkInTime" TIMESTAMP(3),
    "checkOutTime" TIMESTAMP(3),
    "calculatedWorkedHours" DOUBLE PRECISION,
    "sodSubmittedAt" TIMESTAMP(3),
    "eodSubmittedAt" TIMESTAMP(3),
    "status" "WorkdayStatus" NOT NULL DEFAULT 'OPEN',
    "achievements" TEXT,
    "issues" TEXT,
    "supportNeeded" TEXT,
    "nextDayFocus" TEXT,
    "managerComment" TEXT,
    "requestedChanges" JSONB,
    "correctionWindowUntil" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "lockedById" TEXT,
    "lockReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workday_amendment" (
    "id" TEXT NOT NULL,
    "workdayId" TEXT NOT NULL,
    "amendedById" TEXT NOT NULL,
    "amendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT NOT NULL,
    "priorSnapshot" JSONB NOT NULL,
    "newSnapshot" JSONB NOT NULL,

    CONSTRAINT "workday_amendment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_task" (
    "id" TEXT NOT NULL,
    "workdayId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "project" TEXT NOT NULL,
    "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "taskType" "TaskType" NOT NULL DEFAULT 'PLANNED',
    "expectedOutput" TEXT,
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 60,
    "dueDate" DATE,
    "weeklyGoalId" TEXT,
    "externalTicketUrl" TEXT,
    "dependencies" TEXT,
    "isConfidential" BOOLEAN NOT NULL DEFAULT false,
    "attachments" JSONB,
    "status" "TaskStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "completionPercentage" INTEGER NOT NULL DEFAULT 0,
    "workCompleted" TEXT,
    "actualMinutes" INTEGER,
    "remainingWork" TEXT,
    "delayReason" TEXT,
    "blockerReference" TEXT,
    "evidenceUrl" TEXT,
    "nextAction" TEXT,
    "carriedForwardToTaskId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_goal" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "measurableOutcome" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION,
    "targetUnit" TEXT,
    "currentValue" DOUBLE PRECISION DEFAULT 0,
    "weight" INTEGER NOT NULL DEFAULT 20,
    "priority" "GoalPriority" NOT NULL DEFAULT 'MEDIUM',
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "status" "GoalStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "relatedProject" TEXT,
    "evidenceRequired" BOOLEAN NOT NULL DEFAULT false,
    "managerApprovalRequired" BOOLEAN NOT NULL DEFAULT false,
    "progressPercentage" INTEGER NOT NULL DEFAULT 0,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actorId" TEXT,
    "type" "NotificationType" NOT NULL DEFAULT 'GENERAL',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "linkUrl" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "employee_project_team_employeeId_teamId_key" ON "employee_project_team"("employeeId", "teamId");
CREATE UNIQUE INDEX "workday_employeeId_workDate_key" ON "workday"("employeeId", "workDate");
CREATE INDEX "workday_employeeId_status_idx" ON "workday"("employeeId", "status");
CREATE INDEX "workday_workDate_idx" ON "workday"("workDate");
CREATE INDEX "workday_amendment_workdayId_idx" ON "workday_amendment"("workdayId");
CREATE INDEX "daily_task_workdayId_idx" ON "daily_task"("workdayId");
CREATE INDEX "daily_task_employeeId_idx" ON "daily_task"("employeeId");
CREATE INDEX "daily_task_weeklyGoalId_idx" ON "daily_task"("weeklyGoalId");
CREATE INDEX "weekly_goal_employeeId_idx" ON "weekly_goal"("employeeId");
CREATE INDEX "weekly_goal_startDate_endDate_idx" ON "weekly_goal"("startDate", "endDate");
CREATE INDEX "notification_userId_read_idx" ON "notification"("userId", "read");
CREATE INDEX "notification_createdAt_idx" ON "notification"("createdAt");

-- AddForeignKey
ALTER TABLE "employee_project_team" ADD CONSTRAINT "employee_project_team_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "employee_project_team" ADD CONSTRAINT "employee_project_team_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workday" ADD CONSTRAINT "workday_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "workday_amendment" ADD CONSTRAINT "workday_amendment_workdayId_fkey" FOREIGN KEY ("workdayId") REFERENCES "workday"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "daily_task" ADD CONSTRAINT "daily_task_workdayId_fkey" FOREIGN KEY ("workdayId") REFERENCES "workday"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "daily_task" ADD CONSTRAINT "daily_task_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "daily_task" ADD CONSTRAINT "daily_task_weeklyGoalId_fkey" FOREIGN KEY ("weeklyGoalId") REFERENCES "weekly_goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "weekly_goal" ADD CONSTRAINT "weekly_goal_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notification" ADD CONSTRAINT "notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
