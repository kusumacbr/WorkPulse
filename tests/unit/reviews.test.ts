import { describe, it, expect, beforeEach } from "vitest";
import { ReviewService } from "@/server/services/review-service";
import { AuthActor } from "@/lib/authorization/types";

describe("Review Lifecycle State Machine & Versioning (Phase 2)", () => {
  const employeeActor: AuthActor = {
    userId: "user-sarah",
    employeeId: "emp-sarah",
    email: "dev.sarah@xorstack.com",
    roles: ["EMPLOYEE"],
    departmentId: "dept-eng",
  };

  const managerActor: AuthActor = {
    userId: "user-alex",
    employeeId: "emp-alex",
    email: "lead.alex@xorstack.com",
    roles: ["MANAGER", "EMPLOYEE"],
    departmentId: "dept-eng",
    directReportIds: ["emp-sarah"],
  };

  beforeEach(() => {
    ReviewService.clearStore();
  });

  it("executes full weekly review lifecycle end-to-end (Draft -> Submitted -> Approved -> Acknowledged -> Locked)", async () => {
    // 1. Create Draft
    const draft = await ReviewService.createDraftWeeklyReview({
      actor: employeeActor,
      employeeId: "emp-sarah",
      reviewerId: "emp-alex",
      periodStart: "2026-08-17",
      periodEnd: "2026-08-23",
    });

    expect(draft.status).toBe("DRAFT");

    // 2. Employee submits self-assessment
    const submitted = await ReviewService.submitSelfReview({
      actor: employeeActor,
      input: {
        reviewId: draft.id,
        selfSummary: "Delivered all Sprint 34 deliverables on schedule.",
        selfAchievements: "Shipped core platform authorization engine.",
        selfMissedCommitments: "None",
        selfRatings: { quality: 5, timeliness: 5, communication: 4, collaboration: 5, initiative: 4 },
      },
    });

    expect(submitted.status).toBe("SUBMITTED");
    expect(submitted.selfSubmittedAt).toBeDefined();

    // 3. Manager approves review with ratings and scoring
    const approved = await ReviewService.approveReview({
      actor: managerActor,
      input: {
        reviewId: draft.id,
        managerFeedback: "Excellent sprint delivery and robust architectural patterns.",
        improvementActions: "Share authorization testing patterns with QA team.",
        managerRatings: { quality: 5, timeliness: 5, communication: 4, collaboration: 5, initiative: 4 },
        calculatedScore: 92.0,
        finalScore: 92.0,
      },
    });

    expect(approved.status).toBe("APPROVED");
    expect(approved.finalScore).toBe(92.0);
    expect(approved.approvedAt).toBeDefined();

    // 4. Employee acknowledges review -> transitions to LOCKED
    const locked = await ReviewService.acknowledgeReview({
      actor: employeeActor,
      input: {
        reviewId: draft.id,
        employeeComment: "Thank you for the constructive feedback.",
      },
    });

    expect(locked.status).toBe("LOCKED");
    expect(locked.lockedAt).toBeDefined();
    expect(locked.employeeComment).toContain("Thank you");

    // 5. Attempting to modify locked review throws error
    await expect(
      ReviewService.submitSelfReview({
        actor: employeeActor,
        input: {
          reviewId: draft.id,
          selfSummary: "Trying to overwrite locked review",
          selfAchievements: "None",
          selfRatings: { quality: 1, timeliness: 1, communication: 1, collaboration: 1, initiative: 1 },
        },
      })
    ).rejects.toThrow(/Cannot modify a locked review/);
  });

  it("handles manager correction request cycle (Submitted -> Changes Requested -> Resubmitted)", async () => {
    const draft = await ReviewService.createDraftWeeklyReview({
      actor: employeeActor,
      employeeId: "emp-sarah",
      reviewerId: "emp-alex",
      periodStart: "2026-08-17",
      periodEnd: "2026-08-23",
    });

    await ReviewService.submitSelfReview({
      actor: employeeActor,
      input: {
        reviewId: draft.id,
        selfSummary: "Summary text",
        selfAchievements: "Achievements text",
        selfRatings: { quality: 4, timeliness: 4, communication: 4, collaboration: 4, initiative: 4 },
      },
    });

    // Manager requests changes
    const changesReq = await ReviewService.requestChanges({
      actor: managerActor,
      reviewId: draft.id,
      message: "Please elaborate on unit test fixtures delivered.",
    });

    expect(changesReq.status).toBe("CHANGES_REQUESTED");
    expect(changesReq.managerFeedback).toContain("elaborate on unit test");

    // Employee resubmits
    const resubmitted = await ReviewService.submitSelfReview({
      actor: employeeActor,
      input: {
        reviewId: draft.id,
        selfSummary: "Summary text with detailed test fixture documentation",
        selfAchievements: "Achievements with test fixtures",
        selfRatings: { quality: 4, timeliness: 4, communication: 4, collaboration: 4, initiative: 4 },
      },
    });

    expect(resubmitted.status).toBe("RESUBMITTED");
  });

  it("allows authorized amendment of locked review while preserving prior snapshot in ReviewAmendment", async () => {
    const draft = await ReviewService.createDraftWeeklyReview({
      actor: employeeActor,
      employeeId: "emp-sarah",
      reviewerId: "emp-alex",
      periodStart: "2026-08-17",
      periodEnd: "2026-08-23",
    });

    await ReviewService.submitSelfReview({
      actor: employeeActor,
      input: {
        reviewId: draft.id,
        selfSummary: "Summary",
        selfAchievements: "Achievements",
        selfRatings: { quality: 4, timeliness: 4, communication: 4, collaboration: 4, initiative: 4 },
      },
    });

    await ReviewService.approveReview({
      actor: managerActor,
      input: {
        reviewId: draft.id,
        managerFeedback: "Initial feedback",
        managerRatings: { quality: 4, timeliness: 4, communication: 4, collaboration: 4, initiative: 4 },
        calculatedScore: 80.0,
        finalScore: 80.0,
      },
    });

    await ReviewService.acknowledgeReview({
      actor: employeeActor,
      input: { reviewId: draft.id },
    });

    // Amend review
    const { review, amendment } = await ReviewService.amendReview({
      actor: managerActor,
      input: {
        reviewId: draft.id,
        reason: "Adjusted final score post incident postmortem review.",
        finalScore: 88.0,
      },
    });

    expect(review.status).toBe("AMENDED");
    expect(review.finalScore).toBe(88.0);
    expect(review.amendmentCount).toBe(1);
    expect(amendment.priorSnapshot).toBeDefined();
    expect(amendment.reason).toContain("post incident postmortem");
  });

  it("aggregates Team Dashboard data with member status and heatmap matrix", async () => {
    const data = await ReviewService.getTeamDashboardData({ managerId: "emp-alex" });

    expect(data.teamMembers.length).toBe(4);
    expect(data.heatmapRows.length).toBe(4);
    expect(data.pendingReviewsCount).toBeGreaterThan(0);
  });
});
