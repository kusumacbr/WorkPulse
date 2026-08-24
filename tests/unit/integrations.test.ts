import { describe, it, expect } from "vitest";
import {
  GoogleCalendarAdapter,
  OutlookCalendarAdapter,
  FailingCalendarAdapter,
  safeSyncToCalendar,
} from "@/lib/integrations/calendar-adapter";
import {
  SlackAdapter,
  TeamsAdapter,
  FailingChatAdapter,
  safeNotifyChat,
} from "@/lib/integrations/chat-adapter";

describe("External Communication & Integrations (Phase 6)", () => {
  describe("Calendar Integrations & Graceful Degradation", () => {
    it("successfully creates calendar events for Google Calendar and Outlook", async () => {
      const gcal = new GoogleCalendarAdapter();
      const msout = new OutlookCalendarAdapter();

      const event = {
        title: "Sprint 24 1-on-1 Sync",
        startTime: "2026-08-25T10:00:00Z",
        endTime: "2026-08-25T10:30:00Z",
        attendeeEmails: ["alex@xorstack.com", "sarah@xorstack.com"],
      };

      const gcalResult = await safeSyncToCalendar(gcal, event);
      expect(gcalResult.success).toBe(true);
      expect(gcalResult.externalEventId).toBeDefined();

      const msoutResult = await safeSyncToCalendar(msout, event);
      expect(msoutResult.success).toBe(true);
      expect(msoutResult.externalEventId).toBeDefined();
    });

    it("proves external calendar outage degrades gracefully without throwing or blocking internal execution", async () => {
      const failingAdapter = new FailingCalendarAdapter();

      const event = {
        title: "Sprint 24 1-on-1 Sync",
        startTime: "2026-08-25T10:00:00Z",
        endTime: "2026-08-25T10:30:00Z",
        attendeeEmails: ["alex@xorstack.com", "sarah@xorstack.com"],
      };

      // safeSyncToCalendar MUST NOT throw even on 503 outage
      const result = await safeSyncToCalendar(failingAdapter, event);
      expect(result.success).toBe(false);
      expect(result.syncStatus).toBe("FAILED");
      expect(result.error).toContain("503 Service Unavailable");
    });
  });

  describe("Chat Integrations & Privacy Sanitization", () => {
    it("proves sensitive PIP records and private feedback are sanitized from public chat channels", async () => {
      const slack = new SlackAdapter();
      const teams = new TeamsAdapter();

      const sensitiveMsg = {
        title: "PIP Plan Activated",
        body: "Confidential PIP goals: Task closure rate must reach 85%.",
        category: "PIP_ALERT" as const,
        isConfidential: true,
        deepLinkUrl: "https://workpulse.xorstack.com/development?tab=pip",
      };

      const slackResult = await safeNotifyChat(
        slack,
        { type: "CHANNEL", target: "#engineering-general" },
        sensitiveMsg
      );

      expect(slackResult.wasSanitizedForPrivacy).toBe(true);

      const teamsResult = await safeNotifyChat(
        teams,
        { type: "CHANNEL", target: "General Channel" },
        sensitiveMsg
      );

      expect(teamsResult.wasSanitizedForPrivacy).toBe(true);
    });

    it("proves external chat webhook outages degrade gracefully without crashing", async () => {
      const failingChat = new FailingChatAdapter();

      const generalMsg = {
        title: "New Announcement",
        body: "Office will be closed on Friday for festival holiday.",
        category: "ANNOUNCEMENT" as const,
      };

      const result = await safeNotifyChat(
        failingChat,
        { type: "CHANNEL", target: "#announcements" },
        generalMsg
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain("Connection Refused");
    });
  });
});
