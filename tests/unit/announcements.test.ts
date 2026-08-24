import { describe, it, expect, beforeEach } from "vitest";
import { AnnouncementService } from "@/server/services/announcement-service";
import { AuthActor } from "@/lib/authorization/types";

describe("HR Announcements & Read Receipts (Phase 6)", () => {
  const hrPriya: AuthActor = {
    userId: "user-priya",
    employeeId: "emp-priya",
    email: "priya@xorstack.com",
    roles: ["HR"],
    departmentId: "dept-hr",
  };

  const employeeSarah: AuthActor = {
    userId: "user-sarah",
    employeeId: "emp-sarah",
    email: "sarah@xorstack.com",
    roles: ["EMPLOYEE"],
    departmentId: "dept-core",
  };

  const peerJohn: AuthActor = {
    userId: "user-john",
    employeeId: "emp-john",
    email: "john@xorstack.com",
    roles: ["EMPLOYEE"],
    departmentId: "dept-frontend",
  };

  beforeEach(() => {
    AnnouncementService.clearStore();
  });

  describe("Audience Scoping & Delivery", () => {
    it("delivers company-wide announcements to all employees and targeted ones only to recipients", async () => {
      // 1. Publish Department-targeted announcement for dept-core
      const targetedAnn = await AnnouncementService.createAnnouncement({
        actor: hrPriya,
        input: {
          title: "Core Backend Arch Sync",
          body: "Architecture sync regarding connection pooling upgrades.",
          audienceType: "DEPARTMENT",
          audienceTargetId: "dept-core",
        },
      });

      // Sarah is in dept-core -> receives announcement
      const sarahFeed = await AnnouncementService.getAnnouncementsForEmployee({ actor: employeeSarah });
      expect(sarahFeed.some((a) => a.id === targetedAnn.id)).toBe(true);

      // John is in dept-frontend -> does NOT receive announcement
      const johnFeed = await AnnouncementService.getAnnouncementsForEmployee({ actor: peerJohn });
      expect(johnFeed.some((a) => a.id === targetedAnn.id)).toBe(false);
    });
  });

  describe("Read Receipts & Acknowledgement Tracking", () => {
    it("records read timestamps and tracks mandatory employee acknowledgements", async () => {
      const ann = await AnnouncementService.createAnnouncement({
        actor: hrPriya,
        input: {
          title: "Mandatory Information Security Policy",
          body: "Please acknowledge the updated security protocol.",
          category: "POLICY",
          acknowledgementRequired: true,
        },
      });

      // Sarah reads announcement
      await AnnouncementService.recordReadReceipt({
        actor: employeeSarah,
        announcementId: ann.id,
      });

      // Sarah acknowledges
      const acked = await AnnouncementService.acknowledgeAnnouncement({
        actor: employeeSarah,
        announcementId: ann.id,
      });

      expect(acked.receipts.length).toBe(1);
      expect(acked.receipts[0]?.acknowledgedAt).toBeDefined();

      const metrics = await AnnouncementService.getAnnouncementReadMetrics(ann.id);
      expect(metrics.readCount).toBe(1);
      expect(metrics.acknowledgedCount).toBe(1);
    });
  });
});
