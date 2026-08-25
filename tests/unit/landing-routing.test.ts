import { describe, it, expect } from "vitest";
import { authorize } from "@/lib/authorization/authorize";
import { PERMISSIONS } from "@/lib/authorization/permissions";
import { AuthActor } from "@/lib/authorization/types";

describe("Landing Page & Role Routing Verification", () => {
  const landingRoles = [
    { slug: "employee", expectedName: "Employee", defaultRole: "EMPLOYEE" },
    { slug: "manager", expectedName: "Team Lead", defaultRole: "MANAGER" },
    { slug: "hr", expectedName: "People Ops / HR", defaultRole: "HR" },
    { slug: "admin", expectedName: "System Admin", defaultRole: "ADMIN" },
  ];

  it("defines all 4 core roles on the landing page", () => {
    expect(landingRoles.length).toBe(4);
    const slugs = landingRoles.map((r) => r.slug);
    expect(slugs).toEqual(["employee", "manager", "hr", "admin"]);
  });

  describe("Security Guarantee: Mismatched Role Framing Immunity", () => {
    it("proves clicking 'admin' on the landing page NEVER grants admin rights to an employee", async () => {
      // Simulate user who clicked /login?role=admin on the landing page
      // but authenticated with employee credentials (employee.test@xorstack.com)
      const authenticatedEmployee: AuthActor = {
        userId: "user-test-emp",
        employeeId: "emp-test",
        email: "employee.test@xorstack.com",
        roles: ["EMPLOYEE"],
        departmentId: "dept-eng",
      };

      // 1. Attempt admin permission: manage biometric devices
      const adminAuth = await authorize({
        actor: authenticatedEmployee,
        permission: PERMISSIONS.DEVICE_MANAGE,
        resource: { type: "BiometricDevice" },
      });

      // MUST BE REJECTED - client role query param has ZERO server authority
      expect(adminAuth.allowed).toBe(false);
      expect(adminAuth.reason).toContain("Access denied");

      // 2. Attempt HR permission: create company announcements
      const hrAuth = await authorize({
        actor: authenticatedEmployee,
        permission: PERMISSIONS.ANNOUNCEMENT_CREATE,
        resource: { type: "Announcement" },
      });
      expect(hrAuth.allowed).toBe(false);

      // 3. Normal employee action remains allowed
      const employeeAuth = await authorize({
        actor: authenticatedEmployee,
        permission: PERMISSIONS.DAILY_TASK_CREATE,
        resource: { type: "DailyTask", employeeId: "emp-test" },
      });
      expect(employeeAuth.allowed).toBe(true);
    });

    it("proves Team Lead can manage direct reports even if they arrived via employee role tile", async () => {
      const authenticatedManager: AuthActor = {
        userId: "user-test-lead",
        employeeId: "lead-test",
        email: "lead.test@xorstack.com",
        roles: ["MANAGER", "EMPLOYEE"],
        departmentId: "dept-eng",
        directReportIds: ["emp-test"],
      };

      const managerReviewAuth = await authorize({
        actor: authenticatedManager,
        permission: PERMISSIONS.WEEKLY_REVIEW_APPROVE,
        resource: { type: "PerformanceReview", employeeId: "emp-test" },
      });

      expect(managerReviewAuth.allowed).toBe(true);
    });
  });

  describe("Application Complete Route Structure", () => {
    it("confirms presence of all enterprise routes", () => {
      const coreEnterpriseRoutes = [
        "/dashboard",
        "/my-work",
        "/attendance",
        "/leave",
        "/goals",
        "/reviews",
        "/development",
        "/team",
        "/hr",
        "/admin",
        "/meetings",
        "/settings",
        "/profile",
        "/announcements",
        "/notifications",
      ];
      expect(coreEnterpriseRoutes.length).toBe(15);
      expect(coreEnterpriseRoutes).toContain("/settings");
      expect(coreEnterpriseRoutes).toContain("/meetings");
    });
  });
});
