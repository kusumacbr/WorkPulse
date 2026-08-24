-- CreateEnum
CREATE TYPE "BlockerSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "BlockerStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'VERIFIED', 'CLOSED', 'DUPLICATE', 'INVALID', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "BadgeCategory" AS ENUM ('PERFORMANCE', 'COLLABORATION', 'INNOVATION', 'LEADERSHIP', 'LEARNING', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "ProbationDecision" AS ENUM ('CONFIRM_EMPLOYMENT', 'EXTEND_PROBATION', 'TRAINING_REQUIRED', 'START_PIP', 'TERMINATE_PROBATION');

-- CreateEnum
CREATE TYPE "PipStatus" AS ENUM ('DRAFT', 'AWAITING_HR_REVIEW', 'AWAITING_EMPLOYEE_ACK', 'ACTIVE', 'IMPROVING', 'AT_RISK', 'COMPLETED_SUCCESSFULLY', 'EXTENDED', 'UNSUCCESSFUL', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'BLOCKER_ESCALATED';
ALTER TYPE "NotificationType" ADD VALUE 'BADGE_AWARDED';
ALTER TYPE "NotificationType" ADD VALUE 'PIP_ALERT';
ALTER TYPE "NotificationType" ADD VALUE 'PROBATION_ALERT';

-- CreateTable
CREATE TABLE "blocker" (
    "id" TEXT NOT NULL,
    "taskId" TEXT,
    "employeeId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'TECHNICAL',
    "severity" "BlockerSeverity" NOT NULL DEFAULT 'MEDIUM',
    "responsibleTeam" TEXT NOT NULL DEFAULT 'Engineering',
    "supportRequired" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "targetResolutionAt" TIMESTAMP(3),
    "status" "BlockerStatus" NOT NULL DEFAULT 'OPEN',
    "resolutionSummary" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blocker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocker_escalation" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "escalatedToRole" TEXT NOT NULL,
    "escalatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT NOT NULL,
    "acknowledgedAt" TIMESTAMP(3),

    CONSTRAINT "blocker_escalation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal_template" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "departmentId" TEXT,
    "designation" TEXT,
    "teamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "goal_template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal_template_item" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "measurableOutcome" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION,
    "targetUnit" TEXT,
    "defaultWeight" INTEGER NOT NULL DEFAULT 20,
    "evidenceRequired" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "goal_template_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "one_to_one_action_item" (
    "id" TEXT NOT NULL,
    "meetingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "dueDate" DATE,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "one_to_one_action_item_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "one_to_one_meeting" ADD COLUMN "durationMinutes" INTEGER NOT NULL DEFAULT 30;
ALTER TABLE "one_to_one_meeting" ADD COLUMN "discussionNotes" TEXT;
ALTER TABLE "one_to_one_meeting" ADD COLUMN "employeeConcerns" TEXT;
ALTER TABLE "one_to_one_meeting" ADD COLUMN "achievements" TEXT;
ALTER TABLE "one_to_one_meeting" ADD COLUMN "developmentTopics" TEXT;
ALTER TABLE "one_to_one_meeting" ADD COLUMN "employeeAcknowledgedAt" TIMESTAMP(3);
ALTER TABLE "one_to_one_meeting" ADD COLUMN "followUpDate" DATE;

-- CreateTable
CREATE TABLE "badge_definition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "iconName" TEXT NOT NULL DEFAULT 'Award',
    "category" "BadgeCategory" NOT NULL DEFAULT 'PERFORMANCE',
    "points" INTEGER NOT NULL DEFAULT 10,
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badge_definition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "badge_award" (
    "id" TEXT NOT NULL,
    "badgeDefinitionId" TEXT NOT NULL,
    "recipientEmployeeId" TEXT NOT NULL,
    "issuerEmployeeId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "relatedTaskId" TEXT,
    "relatedGoalId" TEXT,
    "points" INTEGER NOT NULL DEFAULT 10,
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "badge_award_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "probation_review" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "checkpointDay" INTEGER NOT NULL DEFAULT 90,
    "managerRecommendation" "ProbationDecision" NOT NULL DEFAULT 'CONFIRM_EMPLOYMENT',
    "managerComments" TEXT NOT NULL,
    "workQualityScore" INTEGER NOT NULL DEFAULT 4,
    "taskCompletionScore" INTEGER NOT NULL DEFAULT 4,
    "attendanceScore" INTEGER NOT NULL DEFAULT 4,
    "communicationScore" INTEGER NOT NULL DEFAULT 4,
    "collaborationScore" INTEGER NOT NULL DEFAULT 4,
    "learningScore" INTEGER NOT NULL DEFAULT 4,
    "technicalScore" INTEGER NOT NULL DEFAULT 4,
    "conductScore" INTEGER NOT NULL DEFAULT 4,
    "hrDecision" "ProbationDecision",
    "hrComments" TEXT,
    "adminConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "adminComments" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_HR',
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "probation_review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pip_record" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "performanceConcerns" TEXT NOT NULL,
    "measurableGoals" TEXT NOT NULL,
    "supportOffered" TEXT NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "checkInFrequency" TEXT NOT NULL DEFAULT 'WEEKLY',
    "status" "PipStatus" NOT NULL DEFAULT 'DRAFT',
    "employeeAcknowledgedAt" TIMESTAMP(3),
    "finalOutcome" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pip_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pip_checkpoint" (
    "id" TEXT NOT NULL,
    "pipId" TEXT NOT NULL,
    "checkpointDate" DATE NOT NULL,
    "notes" TEXT NOT NULL,
    "isImproving" BOOLEAN NOT NULL DEFAULT true,
    "supportProvided" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pip_checkpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_goal" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "skillName" TEXT NOT NULL,
    "currentLevel" "SkillLevel" NOT NULL DEFAULT 'BEGINNER',
    "targetLevel" "SkillLevel" NOT NULL DEFAULT 'INTERMEDIATE',
    "learningActivity" TEXT NOT NULL,
    "certificationName" TEXT,
    "targetDate" DATE NOT NULL,
    "evidenceUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "verifiedById" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_goal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "blocker_employeeId_status_idx" ON "blocker"("employeeId", "status");
CREATE INDEX "blocker_severity_status_idx" ON "blocker"("severity", "status");
CREATE INDEX "blocker_escalation_blockerId_idx" ON "blocker_escalation"("blockerId");
CREATE INDEX "one_to_one_action_item_meetingId_idx" ON "one_to_one_action_item"("meetingId");
CREATE UNIQUE INDEX "badge_definition_name_key" ON "badge_definition"("name");
CREATE INDEX "badge_award_recipientEmployeeId_idx" ON "badge_award"("recipientEmployeeId");
CREATE INDEX "badge_award_issuerEmployeeId_idx" ON "badge_award"("issuerEmployeeId");
CREATE INDEX "probation_review_employeeId_idx" ON "probation_review"("employeeId");
CREATE INDEX "pip_record_employeeId_status_idx" ON "pip_record"("employeeId", "status");
CREATE INDEX "pip_record_managerId_idx" ON "pip_record"("managerId");
CREATE INDEX "pip_checkpoint_pipId_idx" ON "pip_checkpoint"("pipId");
CREATE INDEX "skill_goal_employeeId_idx" ON "skill_goal"("employeeId");

-- AddForeignKey
ALTER TABLE "blocker" ADD CONSTRAINT "blocker_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "daily_task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "blocker" ADD CONSTRAINT "blocker_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "blocker_escalation" ADD CONSTRAINT "blocker_escalation_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "blocker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "goal_template" ADD CONSTRAINT "goal_template_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "goal_template_item" ADD CONSTRAINT "goal_template_item_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "goal_template"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "one_to_one_action_item" ADD CONSTRAINT "one_to_one_action_item_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "one_to_one_meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "badge_award" ADD CONSTRAINT "badge_award_badgeDefinitionId_fkey" FOREIGN KEY ("badgeDefinitionId") REFERENCES "badge_definition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "badge_award" ADD CONSTRAINT "badge_award_recipientEmployeeId_fkey" FOREIGN KEY ("recipientEmployeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "badge_award" ADD CONSTRAINT "badge_award_issuerEmployeeId_fkey" FOREIGN KEY ("issuerEmployeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "probation_review" ADD CONSTRAINT "probation_review_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pip_record" ADD CONSTRAINT "pip_record_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pip_record" ADD CONSTRAINT "pip_record_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "pip_checkpoint" ADD CONSTRAINT "pip_checkpoint_pipId_fkey" FOREIGN KEY ("pipId") REFERENCES "pip_record"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "skill_goal" ADD CONSTRAINT "skill_goal_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
