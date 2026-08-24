import { AuditService } from "@/lib/audit/audit-service";
import { AuthActor } from "@/lib/authorization/types";
import { AnnouncementCreateInput } from "@/lib/validation/communication";

export interface AnnouncementRecord {
  id: string;
  organizationId: string;
  title: string;
  body: string;
  category: "GENERAL" | "POLICY" | "BIRTHDAY" | "FESTIVAL" | "HOLIDAY" | "EVENT" | "EMERGENCY" | "COMPANY_NEWS";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  audienceType: "ALL" | "DEPARTMENT" | "TEAM" | "EMPLOYEE";
  audienceTargetId?: string | null;
  publishDate: string;
  expiryDate?: string | null;
  attachmentUrl?: string | null;
  acknowledgementRequired: boolean;
  channels: string[];
  authorId: string;
  createdAt: string;
  updatedAt: string;
  receipts: {
    employeeId: string;
    readAt: string;
    acknowledgedAt?: string | null;
  }[];
}

const inMemoryAnnouncements = new Map<string, AnnouncementRecord>();

// Pre-seed sample announcements
const sampleAnnouncements: AnnouncementRecord[] = [
  {
    id: "ann-1",
    organizationId: "org-xorstack",
    title: "Updated Q3 Engineering Remote Work & Security Guidelines",
    body: "Please review our updated device encryption, VPN compliance, and biometric attendance regularisation guidelines for hybrid teams.",
    category: "POLICY",
    priority: "HIGH",
    audienceType: "ALL",
    audienceTargetId: null,
    publishDate: new Date(Date.now() - 86400000).toISOString(),
    expiryDate: "2026-12-31",
    attachmentUrl: "https://docs.xorstack.com/policies/sec-2026.pdf",
    acknowledgementRequired: true,
    channels: ["IN_APP", "SLACK", "EMAIL"],
    authorId: "emp-priya",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    receipts: [
      { employeeId: "emp-sarah", readAt: new Date().toISOString(), acknowledgedAt: new Date().toISOString() },
    ],
  },
  {
    id: "ann-2",
    organizationId: "org-xorstack",
    title: "Happy Birthday Alex Lead & Welcome New Joiners!",
    body: "Wishing Alex a very Happy Birthday today! Also welcoming our 3 new frontend & backend engineering interns joining Bangalore HQ.",
    category: "BIRTHDAY",
    priority: "NORMAL",
    audienceType: "ALL",
    audienceTargetId: null,
    publishDate: new Date().toISOString(),
    expiryDate: null,
    attachmentUrl: null,
    acknowledgementRequired: false,
    channels: ["IN_APP", "SLACK"],
    authorId: "emp-priya",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    receipts: [],
  },
];

sampleAnnouncements.forEach((a) => inMemoryAnnouncements.set(a.id, a));

export class AnnouncementService {
  static async createAnnouncement(params: {
    actor: AuthActor;
    input: AnnouncementCreateInput;
  }): Promise<AnnouncementRecord> {
    const announcementId = `ann-${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const record: AnnouncementRecord = {
      id: announcementId,
      organizationId: "org-xorstack",
      title: params.input.title,
      body: params.input.body,
      category: params.input.category || "GENERAL",
      priority: params.input.priority || "NORMAL",
      audienceType: params.input.audienceType || "ALL",
      audienceTargetId: params.input.audienceTargetId || null,
      publishDate: now,
      expiryDate: params.input.expiryDate || null,
      attachmentUrl: params.input.attachmentUrl || null,
      acknowledgementRequired: Boolean(params.input.acknowledgementRequired),
      channels: params.input.channels || ["IN_APP"],
      authorId: params.actor.employeeId || params.actor.userId,
      createdAt: now,
      updatedAt: now,
      receipts: [],
    };

    inMemoryAnnouncements.set(record.id, record);

    await AuditService.record({
      actorId: params.actor.userId,
      action: "announcement_published",
      entity: "Announcement",
      entityId: record.id,
      reason: `Published announcement: ${record.title}`,
    });

    return record;
  }

  static async getAnnouncementsForEmployee(params: {
    actor: AuthActor;
  }): Promise<AnnouncementRecord[]> {
    const employeeId = params.actor.employeeId || params.actor.userId;
    const departmentId = params.actor.departmentId;

    return Array.from(inMemoryAnnouncements.values()).filter((ann) => {
      if (ann.audienceType === "ALL") return true;
      if (ann.audienceType === "EMPLOYEE" && ann.audienceTargetId === employeeId) return true;
      if (ann.audienceType === "DEPARTMENT" && ann.audienceTargetId === departmentId) return true;
      return false;
    });
  }

  static async recordReadReceipt(params: {
    actor: AuthActor;
    announcementId: string;
  }): Promise<void> {
    const ann = inMemoryAnnouncements.get(params.announcementId);
    if (!ann) return;

    const employeeId = params.actor.employeeId || params.actor.userId;
    const existing = ann.receipts.find((r) => r.employeeId === employeeId);

    if (!existing) {
      ann.receipts.push({
        employeeId,
        readAt: new Date().toISOString(),
      });
    }
  }

  static async acknowledgeAnnouncement(params: {
    actor: AuthActor;
    announcementId: string;
  }): Promise<AnnouncementRecord> {
    const ann = inMemoryAnnouncements.get(params.announcementId);
    if (!ann) throw new Error(`Announcement ${params.announcementId} not found.`);

    const employeeId = params.actor.employeeId || params.actor.userId;
    const now = new Date().toISOString();
    let receipt = ann.receipts.find((r) => r.employeeId === employeeId);

    if (!receipt) {
      receipt = { employeeId, readAt: now, acknowledgedAt: now };
      ann.receipts.push(receipt);
    } else {
      receipt.acknowledgedAt = now;
    }

    return ann;
  }

  static async getAnnouncementReadMetrics(announcementId: string): Promise<{
    totalDelivered: number;
    readCount: number;
    acknowledgedCount: number;
    readRatePercentage: number;
  }> {
    const ann = inMemoryAnnouncements.get(announcementId);
    if (!ann) return { totalDelivered: 0, readCount: 0, acknowledgedCount: 0, readRatePercentage: 0 };

    const totalEstimatedAudience = 100; // Simulated org headcount
    const readCount = ann.receipts.length;
    const acknowledgedCount = ann.receipts.filter((r) => r.acknowledgedAt !== null).length;
    const readRatePercentage = Math.round((readCount / totalEstimatedAudience) * 100);

    return {
      totalDelivered: totalEstimatedAudience,
      readCount,
      acknowledgedCount,
      readRatePercentage,
    };
  }

  static clearStore(): void {
    inMemoryAnnouncements.clear();
    sampleAnnouncements.forEach((a) => inMemoryAnnouncements.set(a.id, a));
  }
}
