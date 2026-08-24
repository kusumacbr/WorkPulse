import { AuditService } from "@/lib/audit/audit-service";
import { AuthActor } from "@/lib/authorization/types";
import {
  BlockerCreateInput,
  BlockerResolveInput,
  OneToOneScheduleInput,
  OneToOneUpdateInput,
  BadgeAwardCreateInput,
  GoalTemplateCreateInput,
  ProbationRecommendInput,
  PipCreateInput,
  SkillGoalCreateInput,
} from "@/lib/validation/coaching";

// ----------------------------------------------------
// Interfaces
// ----------------------------------------------------

export interface BlockerRecord {
  id: string;
  taskId?: string | null;
  employeeId: string;
  description: string;
  category: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  responsibleTeam: string;
  supportRequired: string;
  reportedAt: string;
  targetResolutionAt?: string | null;
  status: "OPEN" | "ACKNOWLEDGED" | "IN_PROGRESS" | "RESOLVED" | "VERIFIED" | "CLOSED" | "DUPLICATE" | "INVALID" | "WITHDRAWN";
  resolutionSummary?: string | null;
  isConfidential: boolean;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  escalations: BlockerEscalationRecord[];
}

export interface BlockerEscalationRecord {
  id: string;
  blockerId: string;
  escalatedToRole: string; // "MANAGER", "ADMIN"
  escalatedAt: string;
  reason: string;
  acknowledgedAt?: string | null;
}

export interface OneToOneMeetingRecord {
  id: string;
  managerId: string;
  employeeId: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  agenda?: string | null;
  discussionNotes?: string | null;
  employeeConcerns?: string | null;
  achievements?: string | null;
  developmentTopics?: string | null;
  sharedNotes?: string | null;
  privateManagerNotes?: string | null; // Confidential: only author, HR, Admin
  employeeAcknowledgedAt?: string | null;
  followUpDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BadgeDefinitionRecord {
  id: string;
  name: string;
  description: string;
  iconName: string;
  category: "PERFORMANCE" | "COLLABORATION" | "INNOVATION" | "LEADERSHIP" | "LEARNING" | "CUSTOMER";
  points: number;
  isSystem: boolean;
}

export interface BadgeAwardRecord {
  id: string;
  badgeDefinitionId: string;
  badgeName: string;
  recipientEmployeeId: string;
  issuerEmployeeId: string;
  reason: string;
  relatedTaskId?: string | null;
  relatedGoalId?: string | null;
  points: number;
  visibility: string;
  awardedAt: string;
}

export interface GoalTemplateRecord {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  departmentId?: string | null;
  designation?: string | null;
  items: {
    id: string;
    title: string;
    description?: string | null;
    category: string;
    measurableOutcome: string;
    targetValue?: number | null;
    targetUnit?: string | null;
    defaultWeight: number;
    evidenceRequired: boolean;
  }[];
}

export interface ProbationReviewRecord {
  id: string;
  employeeId: string;
  checkpointDay: number;
  managerRecommendation: "CONFIRM_EMPLOYMENT" | "EXTEND_PROBATION" | "TRAINING_REQUIRED" | "START_PIP" | "TERMINATE_PROBATION";
  managerComments: string;
  workQualityScore: number;
  taskCompletionScore: number;
  attendanceScore: number;
  communicationScore: number;
  collaborationScore: number;
  learningScore: number;
  technicalScore: number;
  conductScore: number;
  hrDecision?: string | null;
  hrComments?: string | null;
  adminConfirmed: boolean;
  adminComments?: string | null;
  status: "PENDING_HR" | "PENDING_ADMIN" | "CONFIRMED" | "EXTENDED";
  reviewedAt: string;
}

export interface PipRecordItem {
  id: string;
  employeeId: string;
  managerId: string;
  reason: string;
  performanceConcerns: string;
  measurableGoals: string;
  supportOffered: string;
  startDate: string;
  endDate: string;
  checkInFrequency: string;
  status: "DRAFT" | "AWAITING_HR_REVIEW" | "AWAITING_EMPLOYEE_ACK" | "ACTIVE" | "IMPROVING" | "AT_RISK" | "COMPLETED_SUCCESSFULLY" | "EXTENDED" | "UNSUCCESSFUL" | "CANCELLED";
  employeeAcknowledgedAt?: string | null;
  finalOutcome?: string | null;
  createdAt: string;
  updatedAt: string;
  checkpoints: {
    id: string;
    checkpointDate: string;
    notes: string;
    isImproving: boolean;
    supportProvided?: string | null;
  }[];
}

export interface SkillGoalRecord {
  id: string;
  employeeId: string;
  skillName: string;
  currentLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  targetLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
  learningActivity: string;
  certificationName?: string | null;
  targetDate: string;
  evidenceUrl?: string | null;
  status: "IN_PROGRESS" | "VERIFIED" | "COMPLETED";
  verifiedById?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
}

// In-memory Mock Stores
const inMemoryBlockers = new Map<string, BlockerRecord>();
const inMemoryMeetings = new Map<string, OneToOneMeetingRecord>();
const inMemoryBadgeDefinitions = new Map<string, BadgeDefinitionRecord>();
const inMemoryBadgeAwards = new Map<string, BadgeAwardRecord>();
const inMemoryGoalTemplates = new Map<string, GoalTemplateRecord>();
const inMemoryProbationReviews = new Map<string, ProbationReviewRecord>();
const inMemoryPips = new Map<string, PipRecordItem>();
const inMemorySkillGoals = new Map<string, SkillGoalRecord>();

// Pre-seed 9 Starter Badges
const starterBadges: BadgeDefinitionRecord[] = [
  { id: "badge-1", name: "Outstanding Performer", description: "Consistently exceeds delivery expectations and deliverables", iconName: "Award", category: "PERFORMANCE", points: 25, isSystem: true },
  { id: "badge-2", name: "On-Time Delivery", description: "Flawless track record of meeting sprint commitments on schedule", iconName: "Clock", category: "PERFORMANCE", points: 15, isSystem: true },
  { id: "badge-3", name: "Team Player", description: "Provides exceptional cross-team collaboration and unblocks teammates", iconName: "Users", category: "COLLABORATION", points: 20, isSystem: true },
  { id: "badge-4", name: "Problem Solver", description: "Resolves critical production incidents and thorny architectural hurdles", iconName: "Zap", category: "INNOVATION", points: 20, isSystem: true },
  { id: "badge-5", name: "Innovation Champion", description: "Introduces impactful technical or operational improvements", iconName: "Sparkles", category: "INNOVATION", points: 25, isSystem: true },
  { id: "badge-6", name: "Customer Champion", description: "Demonstrates exceptional customer empathy and stakeholder support", iconName: "Heart", category: "CUSTOMER", points: 20, isSystem: true },
  { id: "badge-7", name: "Consistent Performer", description: "Delivers steady, reliable engineering output day in and day out", iconName: "ShieldCheck", category: "PERFORMANCE", points: 15, isSystem: true },
  { id: "badge-8", name: "Learning Champion", description: "Pursues continuous skill development, certifications, and knowledge sharing", iconName: "BookOpen", category: "LEARNING", points: 15, isSystem: true },
  { id: "badge-9", name: "Leadership Award", description: "Demonstrates inspiring technical mentorship and team guidance", iconName: "Crown", category: "LEADERSHIP", points: 30, isSystem: true },
];

starterBadges.forEach((b) => inMemoryBadgeDefinitions.set(b.id, b));

// ----------------------------------------------------
// 1. BLOCKER & ESCALATION SERVICE
// ----------------------------------------------------

export class BlockerService {
  static async createBlocker(params: {
    actor: AuthActor;
    input: BlockerCreateInput;
  }): Promise<BlockerRecord> {
    const employeeId = params.actor.employeeId || params.actor.userId;
    const now = new Date().toISOString();
    const blockerId = `blk-${crypto.randomUUID()}`;

    const blocker: BlockerRecord = {
      id: blockerId,
      taskId: params.input.taskId || null,
      employeeId,
      description: params.input.description,
      category: params.input.category || "TECHNICAL",
      severity: params.input.severity || "MEDIUM",
      responsibleTeam: params.input.responsibleTeam || "Engineering",
      supportRequired: params.input.supportRequired,
      reportedAt: now,
      targetResolutionAt: params.input.targetResolutionAt || null,
      status: "OPEN",
      resolutionSummary: null,
      isConfidential: Boolean(params.input.isConfidential),
      resolvedAt: null,
      createdAt: now,
      updatedAt: now,
      escalations: [],
    };

    inMemoryBlockers.set(blocker.id, blocker);

    await AuditService.record({
      actorId: params.actor.userId,
      action: "blocker_created",
      entity: "Blocker",
      entityId: blocker.id,
      reason: `Blocker reported (${blocker.severity}): ${blocker.description}`,
    });

    return blocker;
  }

  static async resolveBlocker(params: {
    actor: AuthActor;
    input: BlockerResolveInput;
  }): Promise<BlockerRecord> {
    const blocker = inMemoryBlockers.get(params.input.blockerId);
    if (!blocker) throw new Error(`Blocker ${params.input.blockerId} not found.`);

    const now = new Date().toISOString();
    blocker.status = params.input.status;
    blocker.resolutionSummary = params.input.resolutionSummary;
    blocker.resolvedAt = now;
    blocker.updatedAt = now;

    await AuditService.record({
      actorId: params.actor.userId,
      action: `blocker_${params.input.status.toLowerCase()}`,
      entity: "Blocker",
      entityId: blocker.id,
      reason: blocker.resolutionSummary,
    });

    return blocker;
  }

  /**
   * Automated SLA Escalation Job.
   * Critical (2h) -> Admin; High (8h) -> Admin; Medium (16h) -> Admin; Low -> Weekly Review.
   * Escalations are recorded as separate immutable events.
   */
  static async checkAndEscalateBlockers(params: {
    currentTimeIso?: string;
  }): Promise<{ escalatedCount: number; escalations: BlockerEscalationRecord[] }> {
    const now = params.currentTimeIso ? new Date(params.currentTimeIso).getTime() : Date.now();
    const newEscalations: BlockerEscalationRecord[] = [];

    for (const blocker of inMemoryBlockers.values()) {
      if (blocker.status === "OPEN" || blocker.status === "IN_PROGRESS" || blocker.status === "ACKNOWLEDGED") {
        const reportedTime = new Date(blocker.reportedAt).getTime();
        const elapsedHours = (now - reportedTime) / (1000 * 60 * 60);

        let shouldEscalateToAdmin = false;
        let reason = "";

        if (blocker.severity === "CRITICAL" && elapsedHours >= 2) {
          shouldEscalateToAdmin = true;
          reason = `Critical blocker SLA breached (${elapsedHours.toFixed(1)}h >= 2h threshold). Escalated to Admin.`;
        } else if (blocker.severity === "HIGH" && elapsedHours >= 8) {
          shouldEscalateToAdmin = true;
          reason = `High blocker SLA breached (${elapsedHours.toFixed(1)}h >= 8h threshold). Escalated to Admin.`;
        } else if (blocker.severity === "MEDIUM" && elapsedHours >= 16) {
          shouldEscalateToAdmin = true;
          reason = `Medium blocker SLA breached (${elapsedHours.toFixed(1)}h >= 16h threshold). Escalated to Admin.`;
        }

        if (shouldEscalateToAdmin && !blocker.escalations.some((e) => e.escalatedToRole === "ADMIN")) {
          const esc: BlockerEscalationRecord = {
            id: `esc-${crypto.randomUUID()}`,
            blockerId: blocker.id,
            escalatedToRole: "ADMIN",
            escalatedAt: new Date(now).toISOString(),
            reason,
          };
          blocker.escalations.push(esc);
          newEscalations.push(esc);
        }
      }
    }

    return {
      escalatedCount: newEscalations.length,
      escalations: newEscalations,
    };
  }

  static getActiveBlockers(): BlockerRecord[] {
    return Array.from(inMemoryBlockers.values());
  }
}

// ----------------------------------------------------
// 2. ONE-TO-ONE MEETINGS SERVICE (QUERY-LEVEL PRIVACY)
// ----------------------------------------------------

export class OneToOneService {
  static async scheduleMeeting(params: {
    actor: AuthActor;
    input: OneToOneScheduleInput;
  }): Promise<OneToOneMeetingRecord> {
    const managerId = params.actor.employeeId || params.actor.userId;
    const now = new Date().toISOString();
    const meetingId = `121-${crypto.randomUUID()}`;

    const meeting: OneToOneMeetingRecord = {
      id: meetingId,
      managerId,
      employeeId: params.input.employeeId,
      scheduledAt: params.input.scheduledAt,
      durationMinutes: params.input.durationMinutes,
      status: "SCHEDULED",
      agenda: params.input.agenda || "Weekly sync & performance checkpoints",
      discussionNotes: null,
      employeeConcerns: null,
      achievements: null,
      developmentTopics: null,
      sharedNotes: null,
      privateManagerNotes: null,
      employeeAcknowledgedAt: null,
      followUpDate: null,
      createdAt: now,
      updatedAt: now,
    };

    inMemoryMeetings.set(meeting.id, meeting);
    return meeting;
  }

  static async updateMeetingNotes(params: {
    actor: AuthActor;
    input: OneToOneUpdateInput;
  }): Promise<OneToOneMeetingRecord> {
    const meeting = inMemoryMeetings.get(params.input.meetingId);
    if (!meeting) throw new Error(`Meeting ${params.input.meetingId} not found.`);

    if (params.input.discussionNotes !== undefined) meeting.discussionNotes = params.input.discussionNotes;
    if (params.input.employeeConcerns !== undefined) meeting.employeeConcerns = params.input.employeeConcerns;
    if (params.input.achievements !== undefined) meeting.achievements = params.input.achievements;
    if (params.input.developmentTopics !== undefined) meeting.developmentTopics = params.input.developmentTopics;
    if (params.input.sharedNotes !== undefined) meeting.sharedNotes = params.input.sharedNotes;

    // Only manager author, HR, or Admin can set private manager notes
    if (params.input.privateManagerNotes !== undefined) {
      if (
        params.actor.userId === meeting.managerId ||
        params.actor.employeeId === meeting.managerId ||
        params.actor.roles.includes("HR") ||
        params.actor.roles.includes("ADMIN")
      ) {
        meeting.privateManagerNotes = params.input.privateManagerNotes;
      }
    }

    meeting.updatedAt = new Date().toISOString();
    return meeting;
  }

  /**
   * Query-level private notes access control:
   * Strips privateManagerNotes unless the actor is the Author, HR, or Admin.
   * Employee querying own meeting receives privateManagerNotes as null/undefined.
   */
  static async getMeetingForActor(params: {
    actor: AuthActor;
    meetingId: string;
  }): Promise<OneToOneMeetingRecord | null> {
    const meeting = inMemoryMeetings.get(params.meetingId);
    if (!meeting) return null;

    const isAuthorOrManager =
      params.actor.userId === meeting.managerId ||
      params.actor.employeeId === meeting.managerId;
    const isHrOrAdmin =
      params.actor.roles.includes("HR") || params.actor.roles.includes("ADMIN");

    // Copy record
    const result: OneToOneMeetingRecord = { ...meeting };

    // Query-Level Stripping: Employee never receives private notes
    if (!isAuthorOrManager && !isHrOrAdmin) {
      result.privateManagerNotes = null;
    }

    return result;
  }

  static async acknowledgeSharedNotes(params: {
    actor: AuthActor;
    meetingId: string;
  }): Promise<OneToOneMeetingRecord> {
    const meeting = inMemoryMeetings.get(params.meetingId);
    if (!meeting) throw new Error(`Meeting ${params.meetingId} not found.`);

    meeting.employeeAcknowledgedAt = new Date().toISOString();
    return meeting;
  }
}

// ----------------------------------------------------
// 3. APPRECIATION BADGES SERVICE
// ----------------------------------------------------

export class BadgeService {
  static async listBadgeDefinitions(): Promise<BadgeDefinitionRecord[]> {
    return Array.from(inMemoryBadgeDefinitions.values());
  }

  static async issueBadgeAward(params: {
    actor: AuthActor;
    input: BadgeAwardCreateInput;
  }): Promise<BadgeAwardRecord> {
    const def = inMemoryBadgeDefinitions.get(params.input.badgeDefinitionId);
    if (!def) throw new Error(`Badge definition ${params.input.badgeDefinitionId} not found.`);

    const issuerId = params.actor.employeeId || params.actor.userId;
    const awardId = `award-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const award: BadgeAwardRecord = {
      id: awardId,
      badgeDefinitionId: def.id,
      badgeName: def.name,
      recipientEmployeeId: params.input.recipientEmployeeId,
      issuerEmployeeId: issuerId,
      reason: params.input.reason,
      relatedTaskId: params.input.relatedTaskId || null,
      relatedGoalId: params.input.relatedGoalId || null,
      points: params.input.points || def.points,
      visibility: "PUBLIC",
      awardedAt: now,
    };

    inMemoryBadgeAwards.set(award.id, award);

    await AuditService.record({
      actorId: params.actor.userId,
      action: "badge_awarded",
      entity: "BadgeAward",
      entityId: award.id,
      reason: `Awarded '${def.name}' to ${award.recipientEmployeeId}`,
    });

    return award;
  }

  static async getEmployeeAwards(employeeId: string): Promise<BadgeAwardRecord[]> {
    return Array.from(inMemoryBadgeAwards.values()).filter((a) => a.recipientEmployeeId === employeeId);
  }

  static async getAllRecentAwards(): Promise<BadgeAwardRecord[]> {
    return Array.from(inMemoryBadgeAwards.values()).sort((a, b) => b.awardedAt.localeCompare(a.awardedAt));
  }
}

// ----------------------------------------------------
// 4. GOAL TEMPLATES SERVICE (DECOUPLED ASSIGNMENT)
// ----------------------------------------------------

export class GoalTemplateService {
  static async createTemplate(params: {
    actor: AuthActor;
    input: GoalTemplateCreateInput;
  }): Promise<GoalTemplateRecord> {
    const templateId = `gtpl-${crypto.randomUUID()}`;
    const template: GoalTemplateRecord = {
      id: templateId,
      organizationId: "org-xorstack",
      name: params.input.name,
      description: params.input.description || null,
      departmentId: params.input.departmentId || null,
      designation: params.input.designation || null,
      items: params.input.items.map((item, idx) => ({
        id: `item-${templateId}-${idx}`,
        title: item.title,
        description: item.description || null,
        category: item.category,
        measurableOutcome: item.measurableOutcome,
        targetValue: item.targetValue || null,
        targetUnit: item.targetUnit || null,
        defaultWeight: item.defaultWeight,
        evidenceRequired: item.evidenceRequired,
      })),
    };

    inMemoryGoalTemplates.set(template.id, template);
    return template;
  }

  /**
   * Assigning a template deep-copies its items into employee-owned goals.
   * Future template edits never rewrite already-assigned historical goals.
   */
  static async assignTemplateToEmployee(params: {
    actor: AuthActor;
    templateId: string;
    employeeId: string;
    startDate: string;
    endDate: string;
  }): Promise<{ assignedCount: number; goals: any[] }> {
    const template = inMemoryGoalTemplates.get(params.templateId);
    if (!template) throw new Error(`Template ${params.templateId} not found.`);

    const assignedGoals = template.items.map((item) => ({
      id: `goal-${crypto.randomUUID()}`,
      employeeId: params.employeeId,
      title: item.title,
      description: item.description,
      category: item.category,
      measurableOutcome: item.measurableOutcome,
      targetValue: item.targetValue,
      targetUnit: item.targetUnit,
      weight: item.defaultWeight,
      startDate: params.startDate,
      endDate: params.endDate,
      status: "IN_PROGRESS",
      progressPercentage: 0,
      evidenceRequired: item.evidenceRequired,
      copiedFromTemplateId: template.id,
      createdAt: new Date().toISOString(),
    }));

    return { assignedCount: assignedGoals.length, goals: assignedGoals };
  }
}

// ----------------------------------------------------
// 5. PROBATION REVIEW SERVICE
// ----------------------------------------------------

export class ProbationService {
  static async submitRecommendation(params: {
    actor: AuthActor;
    input: ProbationRecommendInput;
  }): Promise<ProbationReviewRecord> {
    const reviewId = `prob-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const review: ProbationReviewRecord = {
      id: reviewId,
      employeeId: params.input.employeeId,
      checkpointDay: params.input.checkpointDay,
      managerRecommendation: params.input.managerRecommendation,
      managerComments: params.input.managerComments,
      workQualityScore: params.input.workQualityScore,
      taskCompletionScore: params.input.taskCompletionScore,
      attendanceScore: params.input.attendanceScore,
      communicationScore: params.input.communicationScore,
      collaborationScore: params.input.collaborationScore,
      learningScore: params.input.learningScore,
      technicalScore: params.input.technicalScore,
      conductScore: params.input.conductScore,
      hrDecision: null,
      hrComments: null,
      adminConfirmed: false,
      adminComments: null,
      status: "PENDING_HR",
      reviewedAt: now,
    };

    inMemoryProbationReviews.set(review.id, review);

    await AuditService.record({
      actorId: params.actor.userId,
      action: "probation_recommendation_submitted",
      entity: "ProbationReview",
      entityId: review.id,
      reason: `Manager recommended: ${review.managerRecommendation}`,
    });

    return review;
  }

  static async hrReview(params: {
    actor: AuthActor;
    reviewId: string;
    decision: "CONFIRM_EMPLOYMENT" | "EXTEND_PROBATION" | "TRAINING_REQUIRED" | "START_PIP" | "TERMINATE_PROBATION";
    comments: string;
  }): Promise<ProbationReviewRecord> {
    const review = inMemoryProbationReviews.get(params.reviewId);
    if (!review) throw new Error(`Probation review ${params.reviewId} not found.`);

    review.hrDecision = params.decision;
    review.hrComments = params.comments;
    review.status = "PENDING_ADMIN";

    await AuditService.record({
      actorId: params.actor.userId,
      action: "probation_hr_reviewed",
      entity: "ProbationReview",
      entityId: review.id,
      reason: params.comments,
    });

    return review;
  }

  static async adminConfirm(params: {
    actor: AuthActor;
    reviewId: string;
    comments?: string;
  }): Promise<ProbationReviewRecord> {
    const review = inMemoryProbationReviews.get(params.reviewId);
    if (!review) throw new Error(`Probation review ${params.reviewId} not found.`);

    review.adminConfirmed = true;
    review.adminComments = params.comments || "Confirmed by Admin.";
    review.status = review.hrDecision === "CONFIRM_EMPLOYMENT" ? "CONFIRMED" : "EXTENDED";

    await AuditService.record({
      actorId: params.actor.userId,
      action: "probation_admin_confirmed",
      entity: "ProbationReview",
      entityId: review.id,
      reason: review.adminComments,
    });

    return review;
  }
}

// ----------------------------------------------------
// 6. PIP SERVICE (STRICT 4-ROLE ACCESS CONTROL)
// ----------------------------------------------------

export class PipService {
  static async createPip(params: {
    actor: AuthActor;
    input: PipCreateInput;
  }): Promise<PipRecordItem> {
    const managerId = params.actor.employeeId || params.actor.userId;
    const pipId = `pip-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const pip: PipRecordItem = {
      id: pipId,
      employeeId: params.input.employeeId,
      managerId,
      reason: params.input.reason,
      performanceConcerns: params.input.performanceConcerns,
      measurableGoals: params.input.measurableGoals,
      supportOffered: params.input.supportOffered,
      startDate: params.input.startDate,
      endDate: params.input.endDate,
      checkInFrequency: params.input.checkInFrequency,
      status: "DRAFT",
      employeeAcknowledgedAt: null,
      finalOutcome: null,
      createdAt: now,
      updatedAt: now,
      checkpoints: [],
    };

    inMemoryPips.set(pip.id, pip);

    await AuditService.record({
      actorId: params.actor.userId,
      action: "pip_created",
      entity: "PipRecord",
      entityId: pip.id,
      reason: pip.reason,
    });

    return pip;
  }

  /**
   * Strictly limited to: Employee (self), assigned Manager, HR, and Admin.
   * Unauthorized actors throw ForbiddenError.
   */
  static async getPipForActor(params: {
    actor: AuthActor;
    pipId: string;
  }): Promise<PipRecordItem> {
    const pip = inMemoryPips.get(params.pipId);
    if (!pip) throw new Error(`PIP ${params.pipId} not found.`);

    const isSelf =
      params.actor.employeeId === pip.employeeId ||
      params.actor.userId === pip.employeeId;
    const isAssignedManager =
      params.actor.employeeId === pip.managerId ||
      params.actor.userId === pip.managerId ||
      (params.actor.directReportIds && params.actor.directReportIds.includes(pip.employeeId));
    const isHr = params.actor.roles.includes("HR");
    const isAdmin = params.actor.roles.includes("ADMIN");

    if (!isSelf && !isAssignedManager && !isHr && !isAdmin) {
      throw new Error(
        `Forbidden: PIP records are strictly confidential and restricted to the employee, assigned manager, HR, and Admin.`
      );
    }

    return { ...pip };
  }

  static async acknowledgePip(params: {
    actor: AuthActor;
    pipId: string;
  }): Promise<PipRecordItem> {
    const pip = inMemoryPips.get(params.pipId);
    if (!pip) throw new Error(`PIP ${params.pipId} not found.`);

    pip.employeeAcknowledgedAt = new Date().toISOString();
    pip.status = "ACTIVE";
    return pip;
  }

  static async addCheckpoint(params: {
    actor: AuthActor;
    pipId: string;
    notes: string;
    isImproving: boolean;
    supportProvided?: string;
  }): Promise<PipRecordItem> {
    const pip = inMemoryPips.get(params.pipId);
    if (!pip) throw new Error(`PIP ${params.pipId} not found.`);

    pip.checkpoints.push({
      id: `chk-${crypto.randomUUID()}`,
      checkpointDate: new Date().toISOString().split("T")[0]!,
      notes: params.notes,
      isImproving: params.isImproving,
      supportProvided: params.supportProvided || null,
    });

    pip.status = params.isImproving ? "IMPROVING" : "AT_RISK";
    return pip;
  }
}

// ----------------------------------------------------
// 7. SKILL DEVELOPMENT SERVICE
// ----------------------------------------------------

export class SkillDevelopmentService {
  static async createSkillGoal(params: {
    actor: AuthActor;
    input: SkillGoalCreateInput;
  }): Promise<SkillGoalRecord> {
    const employeeId = params.actor.employeeId || params.actor.userId;
    const goalId = `skg-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const goal: SkillGoalRecord = {
      id: goalId,
      employeeId,
      skillName: params.input.skillName,
      currentLevel: params.input.currentLevel || "BEGINNER",
      targetLevel: params.input.targetLevel || "INTERMEDIATE",
      learningActivity: params.input.learningActivity,
      certificationName: params.input.certificationName || null,
      targetDate: params.input.targetDate,
      evidenceUrl: params.input.evidenceUrl || null,
      status: "IN_PROGRESS",
      verifiedById: null,
      verifiedAt: null,
      createdAt: now,
    };

    inMemorySkillGoals.set(goal.id, goal);
    return goal;
  }

  static async verifySkillGoal(params: {
    actor: AuthActor;
    goalId: string;
  }): Promise<SkillGoalRecord> {
    const goal = inMemorySkillGoals.get(params.goalId);
    if (!goal) throw new Error(`Skill goal ${params.goalId} not found.`);

    goal.status = "VERIFIED";
    goal.verifiedById = params.actor.employeeId || params.actor.userId;
    goal.verifiedAt = new Date().toISOString();

    return goal;
  }

  static clearStore(): void {
    inMemoryBlockers.clear();
    inMemoryMeetings.clear();
    inMemoryBadgeAwards.clear();
    inMemoryGoalTemplates.clear();
    inMemoryProbationReviews.clear();
    inMemoryPips.clear();
    inMemorySkillGoals.clear();
    // restore starter badges
    starterBadges.forEach((b) => inMemoryBadgeDefinitions.set(b.id, b));
  }
}
