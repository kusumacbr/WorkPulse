import { describe, it, expect, afterEach, vi } from "vitest";
import { POST, GET } from "@/app/api/v1/dev/login/route";
import { SEEDED_TEST_ACCOUNTS } from "@/lib/auth/dev-personas";
import { NextRequest } from "next/server";

describe("Dev-Only Test Infrastructure & Production Hardening", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("Production Isolation & Security Gate", () => {
    it("strictly returns 404 Not Found in production mode when dev tools are not explicitly enabled", async () => {
      // Set to production
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("DEV_TOOLS_ENABLED", "false");

      // GET request in production
      const getRes = await GET();
      expect(getRes.status).toBe(404);

      // POST request in production
      const req = new NextRequest("http://localhost:3000/api/v1/dev/login", {
        method: "POST",
        body: JSON.stringify({ email: "admin.test@xorstack.com" }),
      });

      const postRes = await POST(req);
      expect(postRes.status).toBe(404);
    });
  });

  describe("4 Seeded Test Personas & Email Convention", () => {
    it("contains all 4 required roles under the @xorstack.com domain convention", () => {
      const emails = SEEDED_TEST_ACCOUNTS.map((a) => a.email);
      const roles = SEEDED_TEST_ACCOUNTS.map((a) => a.role);

      expect(emails).toContain("employee.test@xorstack.com");
      expect(emails).toContain("lead.test@xorstack.com");
      expect(emails).toContain("hr.test@xorstack.com");
      expect(emails).toContain("admin.test@xorstack.com");

      expect(roles).toContain("EMPLOYEE");
      expect(roles).toContain("MANAGER");
      expect(roles).toContain("HR");
      expect(roles).toContain("ADMIN");

      // Verify all emails strictly end with @xorstack.com
      emails.forEach((email) => {
        expect(email.endsWith("@xorstack.com")).toBe(true);
      });
    });

    it("rejects non-seeded email addresses in development mode", async () => {
      vi.stubEnv("NODE_ENV", "development");

      const req = new NextRequest("http://localhost:3000/api/v1/dev/login", {
        method: "POST",
        body: JSON.stringify({ email: "unauthorized.hacker@gmail.com" }),
      });

      const res = await POST(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toContain("Must be one of the 4 seeded test accounts");
    });
  });
});
