import { AuditService } from "@/lib/audit/audit-service";
import { AuthActor } from "@/lib/authorization/types";
import { AnnouncementCreateInput } from "@/lib/validation/communication";
import { createAdminClient } from "@/lib/supabase/admin";
import { realtimeEventBus } from "@/server/realtime/event-bus";
import { NotificationService } from "@/server/services/notification-service";

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
  authorName?: string;
  createdAt: string;
  updatedAt: string;
  acknowledgedBy?: string[];
  receipts: {
    employeeId: string;
    readAt: string;
    acknowledgedAt?: string | null;
  }[];
}

const DEFAULT_ANNOUNCEMENTS: AnnouncementRecord[] = [
  {
    id: "anc-1",
    organizationId: "org-xorstack",
    title: "Mandatory Information Security Policy",
    body: "Please review and acknowledge the updated corporate information security protocols and data handling standards for 2026.",
    category: "POLICY",
    priority: "HIGH",
    audienceType: "ALL",
    audienceTargetId: null,
    publishDate: new Date(Date.now() - 86400000).toISOString(),
    expiryDate: null,
    attachmentUrl: null,
    acknowledgementRequired: true,
    channels: ["IN_APP"],
    authorId: "hr-rachel",
    authorName: "Rachel HR",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    acknowledgedBy: ["emp-sarah", "hr-rachel"],
    receipts: [
      { employeeId: "emp-sarah", readAt: new Date().toISOString(), acknowledgedAt: new Date().toISOString() },
      { employeeId: "hr-rachel", readAt: new Date().toISOString(), acknowledgedAt: new Date().toISOString() },
    ],
  },
  {
    id: "anc-2",
    organizationId: "org-xorstack",
    title: "Q3 2026 Engineering All-Hands Gala",
    body: "All engineering and cross-functional teams gather for quarterly architecture showcases, milestone celebrations, and product roadmaps.",
    category: "COMPANY_NEWS",
    priority: "HIGH",
    audienceType: "ALL",
    audienceTargetId: null,
    publishDate: new Date().toISOString(),
    expiryDate: null,
    attachmentUrl: null,
    acknowledgementRequired: false,
    channels: ["IN_APP"],
    authorId: "admin-david",
    authorName: "David Director",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    acknowledgedBy: [],
    receipts: [],
  },
];

let fallbackCache: AnnouncementRecord[] = [...DEFAULT_ANNOUNCEMENTS];
const deletedAnnouncementIds = new Set<string>();

export class AnnouncementService {
  /**
   * Fetch all announcements from Supabase with audience scoping and resilient fallback
   */
  static async getAnnouncementsForEmployee(params?: {
    actor?: AuthActor;
  }): Promise<AnnouncementRecord[]> {
    const actor = params?.actor;
    const employeeId = actor?.employeeId || actor?.userId;
    const departmentId = actor?.departmentId;

    const filterAudience = (list: AnnouncementRecord[]) => {
      if (!actor) return list;
      return list.filter((ann) => {
        if (!ann.audienceType || ann.audienceType === "ALL") return true;
        if (ann.audienceType === "EMPLOYEE" && ann.audienceTargetId === employeeId) return true;
        if (ann.audienceType === "DEPARTMENT" && ann.audienceTargetId === departmentId) return true;
        return false;
      });
    };

    const deduplicateAndFilter = (list: AnnouncementRecord[]) => {
      const audienceList = filterAudience(list).filter((ann) => !deletedAnnouncementIds.has(ann.id));
      const map = new Map<string, AnnouncementRecord>();
      for (const ann of audienceList) {
        const key = (ann.title || "").toLowerCase().trim();
        if (!key) continue;
        if (!map.has(key)) {
          map.set(key, { ...ann, acknowledgedBy: [...(ann.acknowledgedBy || [])] });
        } else {
          const existing = map.get(key)!;
          const combinedAcks = Array.from(
            new Set([...(existing.acknowledgedBy || []), ...(ann.acknowledgedBy || [])])
          );
          existing.acknowledgedBy = combinedAcks;
          existing.acknowledgementRequired = existing.acknowledgementRequired || ann.acknowledgementRequired;
        }
      }
      return Array.from(map.values());
    };

    const supabase = createAdminClient();
    if (!supabase) return deduplicateAndFilter(fallbackCache);

    try {
      // 1. Try public.announcements table first
      const { data: ancData, error: ancErr } = await supabase
        .from("announcements")
        .select("*")
        .order("publish_date", { ascending: false });

      if (!ancErr && Array.isArray(ancData) && ancData.length > 0) {
        const mapped = ancData.map((row: any) => ({
          id: row.id,
          organizationId: row.organization_id || "org-xorstack",
          title: row.title,
          body: row.body,
          category: row.category || "GENERAL",
          priority: row.priority || "NORMAL",
          audienceType: row.audience_type || "ALL",
          audienceTargetId: row.audience_target_id || null,
          publishDate: row.publish_date || row.created_at,
          expiryDate: row.expiry_date || null,
          attachmentUrl: row.attachment_url || null,
          acknowledgementRequired: Boolean(row.acknowledgement_required),
          channels: row.channels || ["IN_APP"],
          authorId: row.author_id || "hr-rachel",
          authorName: row.author_name || "People Operations",
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          acknowledgedBy: Array.isArray(row.acknowledged_by) ? row.acknowledged_by : [],
          receipts: Array.isArray(row.acknowledged_by)
            ? row.acknowledged_by.map((empId: string) => ({
                employeeId: empId,
                readAt: row.created_at,
                acknowledgedAt: row.created_at,
              }))
            : [],
        }));
        return deduplicateAndFilter(mapped);
      }

      // 2. Query Supabase feedbacks namespace where lead_id = 'ANNOUNCEMENT'
      const { data: fbData, error: fbErr } = await supabase
        .from("feedbacks")
        .select("*")
        .eq("lead_id", "ANNOUNCEMENT")
        .order("created_at", { ascending: false });

      if (!fbErr && Array.isArray(fbData) && fbData.length > 0) {
        const mapped = fbData.map((row: any) => {
          let metadata: any = {};
          try {
            metadata = JSON.parse(row.action_item || "{}");
          } catch {}

          return {
            id: row.id,
            organizationId: "org-xorstack",
            title: row.employee_name,
            body: row.notes,
            category: (metadata.category || row.employee_id || "GENERAL") as any,
            priority: (metadata.priority || row.sentiment || "NORMAL") as any,
            audienceType: (metadata.audienceType || "ALL") as any,
            audienceTargetId: metadata.audienceTargetId || null,
            publishDate: metadata.publishDate || row.created_at,
            expiryDate: metadata.expiryDate || null,
            attachmentUrl: metadata.attachmentUrl || null,
            acknowledgementRequired: Boolean(metadata.acknowledgementRequired),
            channels: metadata.channels || ["IN_APP"],
            authorId: metadata.authorId || "hr-rachel",
            authorName: row.lead_name || "People Operations",
            createdAt: row.created_at,
            updatedAt: row.created_at,
            acknowledgedBy: Array.isArray(metadata.acknowledgedBy) ? metadata.acknowledgedBy : [],
            receipts: Array.isArray(metadata.acknowledgedBy)
              ? metadata.acknowledgedBy.map((empId: string) => ({
                  employeeId: empId,
                  readAt: row.created_at,
                  acknowledgedAt: row.created_at,
                }))
              : [],
          };
        });
        return deduplicateAndFilter(mapped);
      }

      // Supabase is the source of truth. An empty result means HR deleted every
      // announcement; never recreate demo/default notices on a later refresh.
      return [];
    } catch (err) {
      console.warn("[AnnouncementService] Supabase query error, falling back to cache:", err);
      return deduplicateAndFilter(fallbackCache);
    }
  }

  /**
   * Create a new announcement and persist directly to Supabase cloud PostgreSQL
   */
  static async createAnnouncement(params: {
    actor?: AuthActor;
    input: AnnouncementCreateInput & { authorName?: string };
  }): Promise<AnnouncementRecord> {
    const supabase = createAdminClient();
    const announcementId = `anc-${Date.now()}`;
    const now = new Date().toISOString();
    const authorName = params.input.authorName || params.actor?.email || "People Operations";
    const authorId = params.actor?.employeeId || params.actor?.userId || "hr-rachel";

    const record: AnnouncementRecord = {
      id: announcementId,
      organizationId: "org-xorstack",
      title: params.input.title,
      body: params.input.body,
      category: (params.input.category as any) || "COMPANY_NEWS",
      priority: (params.input.priority as any) || "NORMAL",
      audienceType: (params.input.audienceType as any) || "ALL",
      audienceTargetId: params.input.audienceTargetId || null,
      publishDate: now,
      expiryDate: params.input.expiryDate || null,
      attachmentUrl: params.input.attachmentUrl || null,
      acknowledgementRequired: Boolean(params.input.acknowledgementRequired),
      channels: params.input.channels || ["IN_APP"],
      authorId,
      authorName,
      createdAt: now,
      updatedAt: now,
      acknowledgedBy: [],
      receipts: [],
    };

    // Update in-memory fallback cache
    fallbackCache = [record, ...fallbackCache.filter((a) => a.id !== record.id)];

    // Persist to Supabase
    if (supabase) {
      try {
        const { error: ancErr } = await supabase.from("announcements").insert({
          id: record.id,
          title: record.title,
          body: record.body,
          category: record.category,
          priority: record.priority,
          audience_type: record.audienceType,
          audience_target_id: record.audienceTargetId,
          publish_date: record.publishDate,
          author_name: record.authorName,
          author_id: record.authorId,
          acknowledgement_required: record.acknowledgementRequired,
          acknowledged_by: [],
        });

        if (ancErr) {
          await supabase.from("feedbacks").insert({
            id: record.id,
            employee_id: record.category,
            employee_name: record.title,
            lead_id: "ANNOUNCEMENT",
            lead_name: authorName,
            date: now.split("T")[0],
            rating: 5.0,
            sentiment: record.priority,
            notes: record.body,
            action_item: JSON.stringify({
              category: record.category,
              priority: record.priority,
              audienceType: record.audienceType,
              audienceTargetId: record.audienceTargetId,
              acknowledgementRequired: record.acknowledgementRequired,
              channels: record.channels,
              authorId: record.authorId,
              publishDate: record.publishDate,
              acknowledgedBy: [],
            }),
          });
        }
      } catch (err) {
        console.warn("[AnnouncementService] Supabase insert warning:", err);
      }
    }

    // Emit real-time event to server event bus
    realtimeEventBus.emit("announcement:broadcast", record);

    if (params.actor?.userId) {
      await AuditService.record({
        actorId: params.actor.userId,
        action: "announcement_published",
        entity: "Announcement",
        entityId: record.id,
        reason: `Published notice: ${record.title}`,
      }).catch(() => {});
    }

    return record;
  }

  /**
   * Modify / update an existing announcement and persist to Supabase
   */
  static async updateAnnouncement(params: {
    actor: AuthActor;
    announcementId: string;
    input: Partial<AnnouncementCreateInput> & { authorName?: string };
  }): Promise<AnnouncementRecord> {
    if (!params.actor.roles.includes("HR")) {
      throw new Error("Only HR users can modify announcements");
    }

    const target = fallbackCache.find((a) => a.id === params.announcementId);
    if (target) {
      if (params.input.title !== undefined) target.title = params.input.title;
      if (params.input.body !== undefined) target.body = params.input.body;
      if (params.input.category !== undefined) target.category = params.input.category as any;
      if (params.input.priority !== undefined) target.priority = params.input.priority as any;
      if (params.input.audienceType !== undefined) target.audienceType = params.input.audienceType as any;
      target.updatedAt = new Date().toISOString();
    }

    const supabase = createAdminClient();
    if (supabase) {
      try {
        const title = params.input.title;
        const body = params.input.body;
        const category = params.input.category;
        const priority = params.input.priority;

        const updatePayload: any = { updated_at: new Date().toISOString() };
        if (title !== undefined) updatePayload.title = title;
        if (body !== undefined) updatePayload.body = body;
        if (category !== undefined) updatePayload.category = category;
        if (priority !== undefined) updatePayload.priority = priority;

        await supabase.from("announcements").update(updatePayload).eq("id", params.announcementId);

        // Compatibility update in feedbacks table
        const fbPayload: any = {};
        if (title !== undefined) fbPayload.employee_name = title;
        if (body !== undefined) fbPayload.notes = body;
        if (category !== undefined) fbPayload.employee_id = category;
        if (priority !== undefined) fbPayload.sentiment = priority;

        await supabase.from("feedbacks").update(fbPayload).eq("id", params.announcementId);

        // Update corresponding notifications in Supabase
        const notifId = `notif-ann-${params.announcementId}`;
        await NotificationService.updateNotification(notifId, {
          title,
          message: body,
        });
      } catch (err) {
        console.warn("[AnnouncementService] Supabase update warning:", err);
      }
    }

    realtimeEventBus.emit("announcement:broadcast", {
      type: "UPDATE",
      announcement: target,
    });

    return target || fallbackCache[0]!;
  }

  /**
   * Record read receipt for an employee
   */
  static async recordReadReceipt(params: {
    actor: AuthActor;
    announcementId: string;
  }): Promise<void> {
    const employeeId = params.actor.employeeId || params.actor.userId;
    const target = fallbackCache.find((a) => a.id === params.announcementId);
    if (target) {
      if (!target.receipts.some((r) => r.employeeId === employeeId)) {
        target.receipts.push({
          employeeId,
          readAt: new Date().toISOString(),
        });
      }
    }
  }

  /**
   * Acknowledge an announcement in Supabase
   */
  static async acknowledgeAnnouncement(params: {
    actor?: AuthActor;
    announcementId: string;
    employeeId?: string;
  }): Promise<AnnouncementRecord> {
    const empId = params.employeeId || params.actor?.employeeId || params.actor?.userId || "emp-sarah";
    const supabase = createAdminClient();

    // Update in-memory fallback
    const target = fallbackCache.find((a) => a.id === params.announcementId);
    if (target) {
      const ackSet = new Set(target.acknowledgedBy || []);
      ackSet.add(empId);
      target.acknowledgedBy = Array.from(ackSet);
      const existingReceipt = target.receipts.find((r) => r.employeeId === empId);
      if (existingReceipt) {
        existingReceipt.acknowledgedAt = new Date().toISOString();
      } else {
        target.receipts.push({
          employeeId: empId,
          readAt: new Date().toISOString(),
          acknowledgedAt: new Date().toISOString(),
        });
      }
    }

    if (supabase) {
      try {
        const { data: ancRow } = await supabase
          .from("announcements")
          .select("*")
          .eq("id", params.announcementId)
          .single();

        if (ancRow) {
          const currentAcks: string[] = Array.isArray(ancRow.acknowledged_by) ? ancRow.acknowledged_by : [];
          if (!currentAcks.includes(empId)) {
            currentAcks.push(empId);
            await supabase
              .from("announcements")
              .update({ acknowledged_by: currentAcks, updated_at: new Date().toISOString() })
              .eq("id", params.announcementId);
          }
        } else {
          const { data: fbRow } = await supabase
            .from("feedbacks")
            .select("*")
            .eq("id", params.announcementId)
            .single();

          if (fbRow) {
            let metadata: any = {};
            try {
              metadata = JSON.parse(fbRow.action_item || "{}");
            } catch {}

            const acks: string[] = Array.isArray(metadata.acknowledgedBy) ? metadata.acknowledgedBy : [];
            if (!acks.includes(empId)) {
              acks.push(empId);
              metadata.acknowledgedBy = acks;
              await supabase
                .from("feedbacks")
                .update({ action_item: JSON.stringify(metadata) })
                .eq("id", params.announcementId);
            }
          }
        }
      } catch (err) {
        console.warn("[AnnouncementService] Supabase acknowledge error:", err);
      }
    }

    // Emit update event
    realtimeEventBus.emit("announcement:broadcast", {
      type: "ACKNOWLEDGE",
      announcementId: params.announcementId,
      employeeId: empId,
    });

    return target || fallbackCache[0]!;
  }

  /** Permanently remove a notice and its read receipts from every backing store. */
  static async deleteAnnouncement(params: {
    actor: AuthActor;
    announcementId: string;
  }): Promise<void> {
    if (!params.actor.roles.includes("HR")) {
      throw new Error("Only HR users can delete announcements");
    }

    const supabase = createAdminClient();
    if (supabase) {
      try {
        // Resolve the notice content first. Older sync paths can create duplicate
        // rows with different IDs; deleting only the visible ID makes its twin
        // appear after refresh.
        const [{ data: announcementRecord }, { data: feedbackRecord }] = await Promise.all([
          supabase.from("announcements").select("id,title,body").eq("id", params.announcementId).maybeSingle(),
          supabase.from("feedbacks").select("id,employee_name,notes").eq("id", params.announcementId).maybeSingle(),
        ]);
        const title = announcementRecord?.title || feedbackRecord?.employee_name;
        const body = announcementRecord?.body || feedbackRecord?.notes;
        const idsToDelete = new Set<string>([params.announcementId]);

        if (title && body) {
          const [{ data: announcementDuplicates }, { data: feedbackDuplicates }] = await Promise.all([
            supabase.from("announcements").select("id").eq("title", title).eq("body", body),
            supabase.from("feedbacks").select("id").eq("employee_name", title).eq("notes", body),
          ]);
          (announcementDuplicates || []).forEach((row: any) => idsToDelete.add(row.id));
          (feedbackDuplicates || []).forEach((row: any) => idsToDelete.add(row.id));
        }
        const ids = Array.from(idsToDelete);
        const [{ error: announcementError }, { error: feedbackError }] = await Promise.all([
          supabase.from("announcements").delete().in("id", ids),
          // Older environments stored announcements in feedbacks. Delete that
          // exact Supabase row as well, rather than only hiding it in the UI.
          supabase.from("feedbacks").delete().in("id", ids),
        ]);
        // A live Supabase announcements table must be successfully deleted. The
        // feedback table is a compatibility fallback for legacy setups that do
        // not have the dedicated announcements table yet.
        if (announcementError && announcementError.code !== "PGRST205") {
          throw new Error(announcementError.message);
        }
        if (announcementError?.code === "PGRST205" && feedbackError) {
          throw new Error(feedbackError.message);
        }
      } catch (error) {
        console.warn("[AnnouncementService] Supabase delete error:", error);
        throw new Error("Unable to permanently delete the announcement");
      }
    }

    deletedAnnouncementIds.add(params.announcementId);
    fallbackCache = fallbackCache.filter((announcement) => announcement.id !== params.announcementId);
    await NotificationService.deleteAnnouncementNotifications(params.announcementId);
    realtimeEventBus.emit("announcement:deleted", { id: params.announcementId });

    await AuditService.record({
      actorId: params.actor.userId,
      action: "announcement_deleted",
      entity: "Announcement",
      entityId: params.announcementId,
      reason: "Deleted announcement",
    }).catch(() => {});
  }

  /**
   * Get read and acknowledgment metrics
   */
  static async getAnnouncementReadMetrics(announcementId: string): Promise<{
    totalDelivered: number;
    readCount: number;
    acknowledgedCount: number;
    readRatePercentage: number;
  }> {
    const ann = fallbackCache.find((a) => a.id === announcementId);
    if (!ann) return { totalDelivered: 0, readCount: 0, acknowledgedCount: 0, readRatePercentage: 0 };

    const totalEstimatedAudience = 100;
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
    fallbackCache = [];
  }
}
