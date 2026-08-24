import { describe, it, expect, beforeEach } from "vitest";
import {
  OneToOneService,
  PipService,
  SkillDevelopmentService,
} from "@/server/services/coaching-service";
import { AuthActor } from "@/lib/authorization/types";

describe("Sensitive Visibility & Query-Level Access Control (Phase 5)", () => {
  const employeeSarah: AuthActor = {
    userId: "user-sarah",
    employeeId: "emp-sarah",
    email: "sarah@xorstack.com",
    roles: ["EMPLOYEE"],
    departmentId: "dept-core",
  };

  const managerAlex: AuthActor = {
    userId: "user-alex",
    employeeId: "emp-alex",
    email: "alex@xorstack.com",
    roles: ["MANAGER"],
    departmentId: "dept-core",
    directReportIds: ["emp-sarah"],
  };

  const hrPriya: AuthActor = {
    userId: "user-priya",
    employeeId: "emp-priya",
    email: "priya@xorstack.com",
    roles: ["HR"],
    departmentId: "dept-hr",
  };

  const adminActor: AuthActor = {
    userId: "user-admin",
    employeeId: "emp-admin",
    email: "admin@xorstack.com",
    roles: ["ADMIN"],
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
    SkillDevelopmentService.clearStore();
  });

  describe("1-on-1 Meeting Private Notes Query-Level Privacy", () => {
    it("proves privateManagerNotes are genuinely omitted at query level for the employee, while visible to author, HR, and Admin", async () => {
      // 1. Manager Alex schedules a 1-on-1 with Sarah
      const meeting = await OneToOneService.scheduleMeeting({
        actor: managerAlex,
        input: {
          employeeId: "emp-sarah",
          scheduledAt: "2026-08-25T10:00:00Z",
          durationMinutes: 30,
          agenda: "Q3 Career Checkpoint",
        },
      });

      // 2. Manager Alex updates meeting with shared and confidential private notes
      await OneToOneService.updateMeetingNotes({
        actor: managerAlex,
        input: {
          meetingId: meeting.id,
          sharedNotes: "Agreed on Q3 database scalability goals.",
          privateManagerNotes: "CONFIDENTIAL: Strong candidate for Tech Lead promotion.",
        },
      });

      // 3. Employee Sarah queries her own meeting -> privateManagerNotes MUST be null
      const sarahView = await OneToOneService.getMeetingForActor({
        actor: employeeSarah,
        meetingId: meeting.id,
      });

      expect(sarahView?.sharedNotes).toBe("Agreed on Q3 database scalability goals.");
      expect(sarahView?.privateManagerNotes).toBeNull(); // PROVES QUERY-LEVEL STRIPPING

      // 4. Manager Alex queries the meeting -> sees private notes
      const managerView = await OneToOneService.getMeetingForActor({
        actor: managerAlex,
        meetingId: meeting.id,
      });
      expect(managerView?.privateManagerNotes).toBe("CONFIDENTIAL: Strong candidate for Tech Lead promotion.");

      // 5. HR Priya queries the meeting -> sees private notes
      const hrView = await OneToOneService.getMeetingForActor({
        actor: hrPriya,
        meetingId: meeting.id,
      });
      expect(hrView?.privateManagerNotes).toBe("CONFIDENTIAL: Strong candidate for Tech Lead promotion.");

      // 6. Admin queries the meeting -> sees private notes
      const adminView = await OneToOneService.getMeetingForActor({
        actor: adminActor,
        meetingId: meeting.id,
      });
      expect(adminView?.privateManagerNotes).toBe("CONFIDENTIAL: Strong candidate for Tech Lead promotion.");
    });
  });

  describe("PIP Confidentiality & 4-Role Scoped Access Control", () => {
    it("proves PIP records are strictly inaccessible to unauthorized peers or unrelated managers", async () => {
      // 1. Manager Alex creates a PIP for Sarah
      const pip = await PipService.createPip({
        actor: managerAlex,
        input: {
          employeeId: "emp-sarah",
          reason: "Sprint closure velocity improvement",
          performanceConcerns: "Task completion dropped for 2 sprints",
          measurableGoals: "Maintain >= 85% task closure",
          supportOffered: "Weekly 1-on-1 coaching",
          startDate: "2026-08-01",
          endDate: "2026-09-01",
          checkInFrequency: "WEEKLY",
        },
      });

      // 2. Authorized roles can access: Employee (Sarah), Manager (Alex), HR (Priya), Admin
      const sarahPip = await PipService.getPipForActor({ actor: employeeSarah, pipId: pip.id });
      expect(sarahPip.id).toBe(pip.id);

      const managerPip = await PipService.getPipForActor({ actor: managerAlex, pipId: pip.id });
      expect(managerPip.id).toBe(pip.id);

      const hrPip = await PipService.getPipForActor({ actor: hrPriya, pipId: pip.id });
      expect(hrPip.id).toBe(pip.id);

      const adminPip = await PipService.getPipForActor({ actor: adminActor, pipId: pip.id });
      expect(adminPip.id).toBe(pip.id);

      // 3. Unauthorized peer John MUST be rejected with ForbiddenError
      await expect(
        PipService.getPipForActor({ actor: peerJohn, pipId: pip.id })
      ).rejects.toThrow(/Forbidden: PIP records are strictly confidential/);
    });
  });
});
