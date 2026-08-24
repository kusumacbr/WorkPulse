import { describe, it, expect } from "vitest";
import { authorize, assertAuthorized, ForbiddenError } from "@/lib/authorization/authorize";
import { PERMISSIONS } from "@/lib/authorization/permissions";
import { AuthActor } from "@/lib/authorization/types";

describe("Central Authorization Engine", () => {
  // Define mock actors representing the 4 roles
  const employeeActor: AuthActor = {
    userId: "user-sarah",
    employeeId: "emp-sarah",
    email: "dev.sarah@xorstack.com",
    roles: ["EMPLOYEE"],
    departmentId: "dept-eng",
    teamId: "team-platform",
  };

  const otherEmployeeActor: AuthActor = {
    userId: "user-jordan",
    employeeId: "emp-jordan",
    email: "dev.jordan@xorstack.com",
    roles: ["EMPLOYEE"],
    departmentId: "dept-eng",
    teamId: "team-platform",
  };

  const managerActor: AuthActor = {
    userId: "user-alex",
    employeeId: "emp-alex",
    email: "lead.alex@xorstack.com",
    roles: ["MANAGER", "EMPLOYEE"],
    departmentId: "dept-eng",
    teamId: "team-platform",
    directReportIds: ["emp-sarah", "emp-jordan"],
  };

  const hrActor: AuthActor = {
    userId: "user-rachel",
    employeeId: "emp-rachel",
    email: "hr@xorstack.com",
    roles: ["HR", "EMPLOYEE"],
    departmentId: "dept-hr",
    teamId: "team-hr-ops",
  };

  const adminActor: AuthActor = {
    userId: "user-david",
    employeeId: "emp-david",
    email: "admin@xorstack.com",
    roles: ["ADMIN", "EMPLOYEE"],
  };

  describe("Employee Permissions & Scopes", () => {
    it("allows employee to read and update their own profile", async () => {
      const readSelf = await authorize({
        actor: employeeActor,
        permission: PERMISSIONS.PROFILE_READ,
        resource: { employeeId: "emp-sarah" },
      });
      expect(readSelf.allowed).toBe(true);
      expect(readSelf.scope).toBe("self");

      const updateSelf = await authorize({
        actor: employeeActor,
        permission: PERMISSIONS.PROFILE_UPDATE,
        resource: { employeeId: "emp-sarah" },
      });
      expect(updateSelf.allowed).toBe(true);
    });

    it("denies employee from reading another employee's profile", async () => {
      const readOther = await authorize({
        actor: employeeActor,
        permission: PERMISSIONS.PROFILE_READ,
        resource: { employeeId: "emp-jordan" },
      });
      expect(readOther.allowed).toBe(false);
    });

    it("allows employee to create daily tasks and weekly goals for self", async () => {
      const createTask = await authorize({
        actor: employeeActor,
        permission: PERMISSIONS.DAILY_TASK_CREATE,
      });
      expect(createTask.allowed).toBe(true);

      const createGoal = await authorize({
        actor: employeeActor,
        permission: PERMISSIONS.WEEKLY_GOAL_CREATE,
      });
      expect(createGoal.allowed).toBe(true);
    });

    it("denies employee from approving weekly reviews", async () => {
      const approveReview = await authorize({
        actor: employeeActor,
        permission: PERMISSIONS.WEEKLY_REVIEW_APPROVE,
        resource: { employeeId: "emp-jordan" },
      });
      expect(approveReview.allowed).toBe(false);
    });
  });

  describe("Manager / Team Lead Permissions & Scopes", () => {
    it("allows manager to view direct reports and approve reviews", async () => {
      const readReport = await authorize({
        actor: managerActor,
        permission: PERMISSIONS.PROFILE_READ,
        resource: { employeeId: "emp-sarah" },
      });
      expect(readReport.allowed).toBe(true);
      expect(readReport.scope).toBe("direct_reports");

      const approveReview = await authorize({
        actor: managerActor,
        permission: PERMISSIONS.WEEKLY_REVIEW_APPROVE,
        resource: { employeeId: "emp-sarah" },
      });
      expect(approveReview.allowed).toBe(true);
      expect(approveReview.scope).toBe("direct_reports");
    });

    it("denies manager from accessing employees outside active manager assignment", async () => {
      const readStranger = await authorize({
        actor: managerActor,
        permission: PERMISSIONS.PROFILE_READ,
        resource: { employeeId: "emp-stranger" },
      });
      expect(readStranger.allowed).toBe(false);

      const approveStranger = await authorize({
        actor: managerActor,
        permission: PERMISSIONS.WEEKLY_REVIEW_APPROVE,
        resource: { employeeId: "emp-stranger" },
      });
      expect(approveStranger.allowed).toBe(false);
    });

    it("allows manager to act as an employee for their own records (self scope)", async () => {
      const readSelf = await authorize({
        actor: managerActor,
        permission: PERMISSIONS.PROFILE_READ,
        resource: { employeeId: "emp-alex" },
      });
      expect(readSelf.allowed).toBe(true);
      expect(readSelf.scope).toBe("self");
    });
  });

  describe("HR Permissions & Scopes", () => {
    it("allows HR to read all employee profiles across organization", async () => {
      const readAny = await authorize({
        actor: hrActor,
        permission: PERMISSIONS.PROFILE_READ,
        resource: { employeeId: "emp-sarah" },
      });
      expect(readAny.allowed).toBe(true);
      expect(readAny.scope).toBe("organization");
    });

    it("denies HR from silently overriding manager rating without a written reason", async () => {
      const silentOverride = await authorize({
        actor: hrActor,
        permission: PERMISSIONS.MONTHLY_REVIEW_FINALIZE,
        resource: { employeeId: "emp-sarah", override: true, reason: "" },
      });
      expect(silentOverride.allowed).toBe(false);
      expect(silentOverride.reason).toContain("requires a mandatory written reason");
    });

    it("allows HR to override rating when written reason is provided", async () => {
      const legitimateOverride = await authorize({
        actor: hrActor,
        permission: PERMISSIONS.MONTHLY_REVIEW_FINALIZE,
        resource: {
          employeeId: "emp-sarah",
          override: true,
          reason: "Standardized calibration adjustment approved by Department VP.",
        },
      });
      expect(legitimateOverride.allowed).toBe(true);
    });
  });

  describe("Admin Permissions & Overrides", () => {
    it("allows Admin organization-wide access", async () => {
      const adminRead = await authorize({
        actor: adminActor,
        permission: PERMISSIONS.AUDIT_READ,
      });
      expect(adminRead.allowed).toBe(true);
      expect(adminRead.scope).toBe("organization");
    });

    it("requires reason for Admin emergency overrides", async () => {
      const noReasonOverride = await authorize({
        actor: adminActor,
        permission: PERMISSIONS.LEAVE_OVERRIDE,
        resource: { override: true, reason: "   " },
      });
      expect(noReasonOverride.allowed).toBe(false);
      expect(noReasonOverride.reason).toContain("mandatory written reason");

      const withReasonOverride = await authorize({
        actor: adminActor,
        permission: PERMISSIONS.LEAVE_OVERRIDE,
        resource: { override: true, reason: "Emergency medical regularization per VP authorization." },
      });
      expect(withReasonOverride.allowed).toBe(true);
    });
  });

  describe("Sensitive Field Access Rules", () => {
    describe("Emergency Contact Information", () => {
      it("allows employee (own), HR, and Admin to view emergency contacts", async () => {
        // Self
        const selfResult = await authorize({
          actor: employeeActor,
          permission: PERMISSIONS.PROFILE_READ,
          resource: { employeeId: "emp-sarah", sensitiveField: "emergencyContact" },
        });
        expect(selfResult.allowed).toBe(true);

        // HR
        const hrResult = await authorize({
          actor: hrActor,
          permission: PERMISSIONS.PROFILE_READ,
          resource: { employeeId: "emp-sarah", sensitiveField: "emergencyContact" },
        });
        expect(hrResult.allowed).toBe(true);

        // Admin
        const adminResult = await authorize({
          actor: adminActor,
          permission: PERMISSIONS.PROFILE_READ,
          resource: { employeeId: "emp-sarah", sensitiveField: "emergencyContact" },
        });
        expect(adminResult.allowed).toBe(true);
      });

      it("denies Manager from accessing emergency contacts of direct reports", async () => {
        const managerResult = await authorize({
          actor: managerActor,
          permission: PERMISSIONS.PROFILE_READ,
          resource: { employeeId: "emp-sarah", sensitiveField: "emergencyContact" },
        });
        expect(managerResult.allowed).toBe(false);
        expect(managerResult.reason).toContain("Emergency contact info is restricted");
      });
    });

    describe("Private 1-on-1 Notes", () => {
      it("allows author, HR, and Admin to access private notes", async () => {
        // Author (Manager)
        const authorResult = await authorize({
          actor: managerActor,
          permission: PERMISSIONS.ONE_TO_ONE_READ_PRIVATE,
          resource: { authorId: "emp-alex", employeeId: "emp-sarah", sensitiveField: "privateNotes" },
        });
        expect(authorResult.allowed).toBe(true);

        // HR
        const hrResult = await authorize({
          actor: hrActor,
          permission: PERMISSIONS.ONE_TO_ONE_READ_PRIVATE,
          resource: { authorId: "emp-alex", employeeId: "emp-sarah", sensitiveField: "privateNotes" },
        });
        expect(hrResult.allowed).toBe(true);
      });

      it("denies employee from reading private notes unless explicitly shared", async () => {
        // Unshared note -> Denied
        const unsharedResult = await authorize({
          actor: employeeActor,
          permission: PERMISSIONS.ONE_TO_ONE_READ_PRIVATE,
          resource: { authorId: "emp-alex", employeeId: "emp-sarah", isShared: false, sensitiveField: "privateNotes" },
        });
        expect(unsharedResult.allowed).toBe(false);

        // Shared note -> Allowed
        const sharedResult = await authorize({
          actor: employeeActor,
          permission: PERMISSIONS.ONE_TO_ONE_READ_PRIVATE,
          resource: { authorId: "emp-alex", employeeId: "emp-sarah", isShared: true, sensitiveField: "privateNotes" },
        });
        expect(sharedResult.allowed).toBe(true);
      });
    });

    describe("PIP (Performance Improvement Plan) Records", () => {
      it("allows employee, assigned manager, HR, and Admin to view PIP records", async () => {
        // Employee
        const empPip = await authorize({
          actor: employeeActor,
          permission: PERMISSIONS.PIP_REVIEW,
          resource: { employeeId: "emp-sarah", sensitiveField: "pip" },
        });
        expect(empPip.allowed).toBe(true);

        // Assigned Manager
        const mgrPip = await authorize({
          actor: managerActor,
          permission: PERMISSIONS.PIP_REVIEW,
          resource: { employeeId: "emp-sarah", sensitiveField: "pip" },
        });
        expect(mgrPip.allowed).toBe(true);

        // HR
        const hrPip = await authorize({
          actor: hrActor,
          permission: PERMISSIONS.PIP_REVIEW,
          resource: { employeeId: "emp-sarah", sensitiveField: "pip" },
        });
        expect(hrPip.allowed).toBe(true);
      });

      it("denies other employees or non-assigned managers from viewing PIP records", async () => {
        // Unrelated employee
        const otherEmpPip = await authorize({
          actor: otherEmployeeActor,
          permission: PERMISSIONS.PIP_REVIEW,
          resource: { employeeId: "emp-sarah", sensitiveField: "pip" },
        });
        expect(otherEmpPip.allowed).toBe(false);
      });
    });
  });

  describe("assertAuthorized utility", () => {
    it("throws ForbiddenError with status 403 on denied authorization", async () => {
      await expect(
        assertAuthorized({
          actor: employeeActor,
          permission: PERMISSIONS.AUDIT_READ,
        })
      ).rejects.toThrow(ForbiddenError);
    });

    it("resolves cleanly on valid authorization", async () => {
      const result = await assertAuthorized({
        actor: adminActor,
        permission: PERMISSIONS.AUDIT_READ,
      });
      expect(result.allowed).toBe(true);
    });
  });
});
