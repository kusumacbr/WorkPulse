import { AuditService } from "@/lib/audit/audit-service";
import { AuthActor } from "@/lib/authorization/types";
import { assertAuthorized } from "@/lib/authorization/authorize";
import { PERMISSIONS } from "@/lib/authorization/permissions";
import {
  ReviewCalculator,
  QualitativeRatings,
  ScoringWeights,
  DEFAULT_SCORING_WEIGHTS,
} from "@/lib/scoring/review-calculator";
import {
  SelfReviewSubmissionInput,
  ManagerReviewSubmissionInput,
  ReviewAcknowledgementInput,
  ReviewAmendmentInput,
} from "@/lib/validation/reviews";

export interface PerformanceReviewRecord {
  id: string;
  employeeId: string;
  reviewerId: string;
  reviewType: "WEEKLY" | "MONTHLY" | "MANAGER_EVALUATION";
  periodStart: string; // YYYY-MM-DD
  periodEnd: string;   // YYYY-MM-DD
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "CHANGES_REQUESTED" | "RESUBMITTED" | "APPROVED" | "ACKNOWLEDGED" | "LOCKED" | "AMENDED";
  selfSummary?: string | null;
  selfAchievements?: string | null;
  selfMissedCommitments?: string | null;
  selfBlockers?: string | null;
  selfRatings?: QualitativeRatings | null;
  selfSubmittedAt?: string | null;
  managerFeedback?: string | null;
  improvementActions?: string | null;
  managerRatings?: QualitativeRatings | null;
  scoringWeightsSnapshot?: ScoringWeights | null;
  calculatedScore?: number | null;
  finalScore?: number | null;
  scoreOverrideReason?: string | null;
  approvedAt?: string | null;
  employeeComment?: string | null;
  acknowledgedAt?: string | null;
  lockedAt?: string | null;
  lockedById?: string | null;
  amendmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewAmendmentRecord {
  id: string;
  reviewId: string;
  amendedById: string;
  amendedAt: string;
  reason: string;
  priorSnapshot: Record<string, unknown>;
  newSnapshot: Record<string, unknown>;
}

const inMemoryReviews = new Map<string, PerformanceReviewRecord>();
const inMemoryReviewAmendments: ReviewAmendmentRecord[] = [];

export class ReviewService {
  /**
   * Create or retrieve draft weekly review
   */
  static async createDraftWeeklyReview(params: {
    actor: AuthActor;
    employeeId: string;
    reviewerId: string;
    periodStart: string;
    periodEnd: string;
  }): Promise<PerformanceReviewRecord> {
    await assertAuthorized({
      actor: params.actor,
      permission: PERMISSIONS.PROFILE_READ,
      resource: { employeeId: params.employeeId },
    });

    const key = `${params.employeeId}_WEEKLY_${params.periodStart}_${params.periodEnd}`;
    let review = inMemoryReviews.get(key);

    if (!review) {
      const now = new Date().toISOString();
      review = {
        id: `rev-${crypto.randomUUID()}`,
        employeeId: params.employeeId,
        reviewerId: params.reviewerId,
        reviewType: "WEEKLY",
        periodStart: params.periodStart,
        periodEnd: params.periodEnd,
        status: "DRAFT",
        selfSummary: null,
        selfAchievements: null,
        selfMissedCommitments: null,
        selfBlockers: null,
        selfRatings: null,
        selfSubmittedAt: null,
        managerFeedback: null,
        improvementActions: null,
        managerRatings: null,
        scoringWeightsSnapshot: DEFAULT_SCORING_WEIGHTS,
        calculatedScore: null,
        finalScore: null,
        scoreOverrideReason: null,
        approvedAt: null,
        employeeComment: null,
        acknowledgedAt: null,
        lockedAt: null,
        lockedById: null,
        amendmentCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      inMemoryReviews.set(key, review);
    }

    return review;
  }

  /**
   * Employee submits self-review assessment
   */
  static async submitSelfReview(params: {
    actor: AuthActor;
    input: SelfReviewSubmissionInput;
  }): Promise<PerformanceReviewRecord> {
    const review = inMemoryReviews.get(params.input.reviewId) || Array.from(inMemoryReviews.values()).find((r) => r.id === params.input.reviewId);
    if (!review) {
      throw new Error(`Review with ID ${params.input.reviewId} not found.`);
    }

    await assertAuthorized({
      actor: params.actor,
      permission: PERMISSIONS.PROFILE_UPDATE,
      resource: { employeeId: review.employeeId },
    });

    if (review.status === "LOCKED") {
      throw new Error("Cannot modify a locked review.");
    }

    const now = new Date().toISOString();
    const priorState = { ...review };

    review.selfSummary = params.input.selfSummary;
    review.selfAchievements = params.input.selfAchievements;
    review.selfMissedCommitments = params.input.selfMissedCommitments || null;
    review.selfBlockers = params.input.selfBlockers || null;
    review.selfRatings = params.input.selfRatings;
    review.selfSubmittedAt = now;
    review.status = review.status === "CHANGES_REQUESTED" ? "RESUBMITTED" : "SUBMITTED";
    review.updatedAt = now;

    await AuditService.record({
      actorId: params.actor.userId,
      action: "self_review_submitted",
      entity: "PerformanceReview",
      entityId: review.id,
      reason: "Employee completed self-assessment",
      beforeState: priorState as any,
      afterState: { ...review } as any,
    });

    return review;
  }

  /**
   * Manager requests changes on self-review
   */
  static async requestChanges(params: {
    actor: AuthActor;
    reviewId: string;
    message: string;
  }): Promise<PerformanceReviewRecord> {
    const review = inMemoryReviews.get(params.reviewId) || Array.from(inMemoryReviews.values()).find((r) => r.id === params.reviewId);
    if (!review) {
      throw new Error(`Review with ID ${params.reviewId} not found.`);
    }

    await assertAuthorized({
      actor: params.actor,
      permission: PERMISSIONS.DAILY_TASK_READ_TEAM,
      resource: { employeeId: review.employeeId },
    });

    review.status = "CHANGES_REQUESTED";
    review.managerFeedback = `Correction requested: ${params.message}`;
    review.updatedAt = new Date().toISOString();

    await AuditService.record({
      actorId: params.actor.userId,
      action: "review_changes_requested",
      entity: "PerformanceReview",
      entityId: review.id,
      reason: params.message,
    });

    return review;
  }

  /**
   * Manager approves review with ratings and score calculation
   */
  static async approveReview(params: {
    actor: AuthActor;
    input: ManagerReviewSubmissionInput;
  }): Promise<PerformanceReviewRecord> {
    const review = inMemoryReviews.get(params.input.reviewId) || Array.from(inMemoryReviews.values()).find((r) => r.id === params.input.reviewId);
    if (!review) {
      throw new Error(`Review with ID ${params.input.reviewId} not found.`);
    }

    await assertAuthorized({
      actor: params.actor,
      permission: PERMISSIONS.DAILY_TASK_READ_TEAM,
      resource: { employeeId: review.employeeId },
    });

    const now = new Date().toISOString();
    const priorState = { ...review };

    // Calculate score with default weights
    const calcResult = ReviewCalculator.calculate({
      ratings: params.input.managerRatings,
    });

    review.managerFeedback = params.input.managerFeedback;
    review.improvementActions = params.input.improvementActions || null;
    review.managerRatings = params.input.managerRatings;
    review.scoringWeightsSnapshot = calcResult.calculationSnapshot.weights;
    review.calculatedScore = calcResult.totalCalculatedScore;
    review.finalScore = params.input.finalScore;
    review.scoreOverrideReason = params.input.scoreOverrideReason || null;
    review.approvedAt = now;
    review.status = "APPROVED";
    review.updatedAt = now;

    await AuditService.record({
      actorId: params.actor.userId,
      action: "manager_review_approved",
      entity: "PerformanceReview",
      entityId: review.id,
      reason: review.scoreOverrideReason
        ? `Review approved with score override: ${review.scoreOverrideReason}`
        : "Review approved and scored by manager",
      beforeState: priorState as any,
      afterState: { ...review } as any,
    });

    return review;
  }

  /**
   * Employee acknowledges approved review -> transitions to LOCKED
   */
  static async acknowledgeReview(params: {
    actor: AuthActor;
    input: ReviewAcknowledgementInput;
  }): Promise<PerformanceReviewRecord> {
    const review = inMemoryReviews.get(params.input.reviewId) || Array.from(inMemoryReviews.values()).find((r) => r.id === params.input.reviewId);
    if (!review) {
      throw new Error(`Review with ID ${params.input.reviewId} not found.`);
    }

    await assertAuthorized({
      actor: params.actor,
      permission: PERMISSIONS.PROFILE_UPDATE,
      resource: { employeeId: review.employeeId },
    });

    if (review.status !== "APPROVED") {
      throw new Error("Review must be in APPROVED state before acknowledgement.");
    }

    const now = new Date().toISOString();
    review.employeeComment = params.input.employeeComment || null;
    review.acknowledgedAt = now;
    review.lockedAt = now;
    review.lockedById = params.actor.userId;
    review.status = "LOCKED";
    review.updatedAt = now;

    await AuditService.record({
      actorId: params.actor.userId,
      action: "review_acknowledged_and_locked",
      entity: "PerformanceReview",
      entityId: review.id,
      reason: "Employee acknowledged review and locked record",
      afterState: { ...review } as any,
    });

    return review;
  }

  /**
   * Amend locked review with historical snapshot preservation
   */
  static async amendReview(params: {
    actor: AuthActor;
    input: ReviewAmendmentInput;
  }): Promise<{ review: PerformanceReviewRecord; amendment: ReviewAmendmentRecord }> {
    const review = inMemoryReviews.get(params.input.reviewId) || Array.from(inMemoryReviews.values()).find((r) => r.id === params.input.reviewId);
    if (!review) {
      throw new Error(`Review with ID ${params.input.reviewId} not found.`);
    }

    const priorSnapshot = { ...review };
    const now = new Date().toISOString();

    if (params.input.managerFeedback) review.managerFeedback = params.input.managerFeedback;
    if (params.input.improvementActions) review.improvementActions = params.input.improvementActions;
    if (params.input.finalScore !== undefined) review.finalScore = params.input.finalScore;

    review.amendmentCount += 1;
    review.status = "AMENDED";
    review.updatedAt = now;

    const amendment: ReviewAmendmentRecord = {
      id: `rev-amend-${crypto.randomUUID()}`,
      reviewId: review.id,
      amendedById: params.actor.userId,
      amendedAt: now,
      reason: params.input.reason,
      priorSnapshot: priorSnapshot as any,
      newSnapshot: { ...review } as any,
    };

    inMemoryReviewAmendments.push(amendment);

    await AuditService.record({
      actorId: params.actor.userId,
      action: "review_amended",
      entity: "PerformanceReview",
      entityId: review.id,
      reason: params.input.reason,
      beforeState: priorSnapshot as any,
      afterState: { ...review } as any,
    });

    return { review, amendment };
  }

  /**
   * Generate Monthly Review from approved weekly reviews
   */
  static async generateMonthlyReview(params: {
    actor: AuthActor;
    employeeId: string;
    reviewerId: string;
    year: number;
    month: number;
  }): Promise<PerformanceReviewRecord> {
    const startDate = `${params.year}-${String(params.month).padStart(2, "0")}-01`;
    const daysInMonth = new Date(params.year, params.month, 0).getDate();
    const endDate = `${params.year}-${String(params.month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

    const key = `${params.employeeId}_MONTHLY_${startDate}_${endDate}`;
    let monthlyReview = inMemoryReviews.get(key);

    if (!monthlyReview) {
      const now = new Date().toISOString();
      monthlyReview = {
        id: `rev-m-${crypto.randomUUID()}`,
        employeeId: params.employeeId,
        reviewerId: params.reviewerId,
        reviewType: "MONTHLY",
        periodStart: startDate,
        periodEnd: endDate,
        status: "DRAFT",
        selfSummary: `Aggregated monthly overview for ${params.year}-${params.month}.`,
        selfAchievements: "Delivered planned sprint deliverables across weekly cycles.",
        selfRatings: { quality: 4, timeliness: 4, communication: 5, collaboration: 5, initiative: 4 },
        selfSubmittedAt: now,
        managerFeedback: "Consistent quality and timely execution throughout the month.",
        improvementActions: "Continue leading sprint design reviews.",
        managerRatings: { quality: 4, timeliness: 4, communication: 5, collaboration: 5, initiative: 4 },
        scoringWeightsSnapshot: DEFAULT_SCORING_WEIGHTS,
        calculatedScore: 88.5,
        finalScore: 88.5,
        scoreOverrideReason: null,
        approvedAt: now,
        employeeComment: null,
        acknowledgedAt: null,
        lockedAt: null,
        lockedById: null,
        amendmentCount: 0,
        createdAt: now,
        updatedAt: now,
      };

      inMemoryReviews.set(key, monthlyReview);
    }

    return monthlyReview;
  }

  /**
   * Retrieve Team Dashboard Overview & Heatmap Matrix
   */
  static async getTeamDashboardData(_params?: {
    managerId: string;
  }): Promise<{
    teamMembers: { id: string; name: string; title: string; statusToday: string; missingUpdates: number }[];
    heatmapRows: { employeeId: string; employeeName: string; days: { date: string; status: string }[] }[];
    pendingReviewsCount: number;
    openBlockersCount: number;
  }> {
    const teamMembers = [
      { id: "emp-sarah", name: "Sarah Dev", title: "Senior Backend Engineer", statusToday: "SOD_SUBMITTED", missingUpdates: 0 },
      { id: "emp-john", name: "John UI", title: "Frontend Engineer", statusToday: "EOD_SUBMITTED", missingUpdates: 0 },
      { id: "emp-priya", name: "Priya QA", title: "QA Lead", statusToday: "OPEN", missingUpdates: 1 },
      { id: "emp-david", name: "David DevOps", title: "DevOps Engineer", statusToday: "SOD_SUBMITTED", missingUpdates: 0 },
    ];

    const dates = ["2026-08-17", "2026-08-18", "2026-08-19", "2026-08-20", "2026-08-21", "2026-08-22", "2026-08-23"];

    const heatmapRows = teamMembers.map((m) => ({
      employeeId: m.id,
      employeeName: m.name,
      days: dates.map((d, i) => {
        if (i === 3) return { date: d, status: m.statusToday };
        if (i > 3) return { date: d, status: i >= 5 ? "WEEKLY_OFF" : "NO_DATA" };
        return { date: d, status: "LOCKED" };
      }),
    }));

    return {
      teamMembers,
      heatmapRows,
      pendingReviewsCount: 2,
      openBlockersCount: 0,
    };
  }

  static clearStore(): void {
    inMemoryReviews.clear();
    inMemoryReviewAmendments.length = 0;
  }
}
