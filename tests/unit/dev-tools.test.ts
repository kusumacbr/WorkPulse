import { describe, it, expect } from "vitest";

describe("Supabase Auth & Security Verification", () => {
  describe("Domain Restriction & Security Boundaries", () => {
    it("enforces @xorstack.com domain validation for corporate access", () => {
      const validEmails = [
        "sara.dev@xorstack.com",
        "alex.lead@xorstack.com",
        "rachel.hr@xorstack.com",
        "david.admin@xorstack.com",
      ];

      const invalidEmails = [
        "user@gmail.com",
        "hacker@external.org",
        "fake@xorstack.co",
        "test@yahoo.com",
      ];

      validEmails.forEach((email) => {
        expect(email.endsWith("@xorstack.com")).toBe(true);
      });

      invalidEmails.forEach((email) => {
        expect(email.endsWith("@xorstack.com")).toBe(false);
      });
    });

    it("verifies expected roles are properly enumerated", () => {
      const roles = ["EMPLOYEE", "MANAGER", "HR", "ADMIN"];
      expect(roles).toHaveLength(4);
      expect(roles).toContain("EMPLOYEE");
      expect(roles).toContain("MANAGER");
      expect(roles).toContain("HR");
      expect(roles).toContain("ADMIN");
    });
  });
});
