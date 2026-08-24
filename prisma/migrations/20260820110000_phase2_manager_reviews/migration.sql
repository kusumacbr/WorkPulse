-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('WEEKLY', 'MONTHLY', 'MANAGER_EVALUATION');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CHANGES_REQUESTED', 'RESUBMITTED', 'APPROVED', 'ACKNOWLEDGED', 'LOCKED', 'AMENDED');

-- CreateTable
CREATE TABLE "performance_review" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "reviewType" "ReviewType" NOT NULL DEFAULT 'WEEKLY',
    "periodStart" DATE NOT NULL,
    "periodEnd" DATE NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "selfSummary" TEXT,
    "selfAchievements" TEXT,
    "selfMissedCommitments" TEXT,
    "selfBlockers" TEXT,
    "selfRatings" JSONB,
    "selfSubmittedAt" TIMESTAMP(3),
    "managerFeedback" TEXT,
    "improvementActions" TEXT,
    "managerRatings" JSONB,
    "scoringWeightsSnapshot" JSONB,
    "calculatedScore" DOUBLE PRECISION,
    "finalScore" DOUBLE PRECISION,
    "scoreOverrideReason" TEXT,
    "approvedAt" TIMESTAMP(3),
    "employeeComment" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "lockedById" TEXT,
    "amendmentCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_amendment" (
    "id" TEXT NOT NULL,
    "reviewId" TEXT NOT NULL,
    "amendedById" TEXT NOT NULL,
    "amendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT NOT NULL,
    "priorSnapshot" JSONB NOT NULL,
    "newSnapshot" JSONB NOT NULL,

    CONSTRAINT "review_amendment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "one_to_one_meeting" (
    "id" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "agenda" TEXT,
    "sharedNotes" TEXT,
    "privateManagerNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "one_to_one_meeting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "performance_review_employeeId_reviewType_periodStart_periodEnd_key" ON "performance_review"("employeeId", "reviewType", "periodStart", "periodEnd");
CREATE INDEX "performance_review_employeeId_status_idx" ON "performance_review"("employeeId", "status");
CREATE INDEX "performance_review_reviewerId_status_idx" ON "performance_review"("reviewerId", "status");
CREATE INDEX "review_amendment_reviewId_idx" ON "review_amendment"("reviewId");
CREATE INDEX "one_to_one_meeting_managerId_idx" ON "one_to_one_meeting"("managerId");
CREATE INDEX "one_to_one_meeting_employeeId_idx" ON "one_to_one_meeting"("employeeId");

-- AddForeignKey
ALTER TABLE "performance_review" ADD CONSTRAINT "performance_review_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "performance_review" ADD CONSTRAINT "performance_review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "review_amendment" ADD CONSTRAINT "review_amendment_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "performance_review"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "one_to_one_meeting" ADD CONSTRAINT "one_to_one_meeting_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "one_to_one_meeting" ADD CONSTRAINT "one_to_one_meeting_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
