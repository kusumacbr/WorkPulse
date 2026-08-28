import { describe, it, expect, beforeEach } from "vitest";
import { ExportService } from "@/server/services/export-service";
import { AuthActor } from "@/lib/authorization/types";

describe("Asynchronous Exports & Row-Level Security (Phase 6)", () => {
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
    directReportIds: ["emp-sarah", "emp-john"],
  };

  const adminActor: AuthActor = {
    userId: "user-admin",
    employeeId: "emp-admin",
    email: "admin@xorstack.com",
    roles: ["HR"],
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
    ExportService.clearStore();
  });

  describe("Row-Level Permission Scoping", () => {
    it("enforces that Employee exports only contain self records while Admin receives organization-wide data", async () => {
      // 1. Employee Sarah requests attendance export
      const sarahJob = await ExportService.requestExport({
        actor: employeeSarah,
        input: {
          reportType: "ATTENDANCE_LEAVE",
          format: "CSV",
        },
      });

      expect(sarahJob.status).toBe("COMPLETED");
      expect(sarahJob.totalRows).toBe(1);
      expect(sarahJob.dataSnippet).toContain("Sara Dev");
      expect(sarahJob.dataSnippet).not.toContain("John UI");

      // 2. Manager Alex requests export -> contains direct reports
      const alexJob = await ExportService.requestExport({
        actor: managerAlex,
        input: {
          reportType: "ATTENDANCE_LEAVE",
          format: "CSV",
        },
      });

      expect(alexJob.totalRows).toBe(2);
      expect(alexJob.dataSnippet).toContain("Sara Dev");
      expect(alexJob.dataSnippet).toContain("Rohit Sharma");

      // 3. Admin requests export -> contains all organization records
      const adminJob = await ExportService.requestExport({
        actor: adminActor,
        input: {
          reportType: "ATTENDANCE_LEAVE",
          format: "CSV",
        },
      });

      expect(adminJob.totalRows).toBe(4);
      expect(adminJob.dataSnippet).toContain("Sara Dev");
      expect(adminJob.dataSnippet).toContain("Alex Lead");
      expect(adminJob.dataSnippet).toContain("Priya QA");
    });
  });

  describe("Short-Lived Download Token Verification", () => {
    it("validates download token at download time and prevents unauthorized peer downloads", async () => {
      const sarahJob = await ExportService.requestExport({
        actor: employeeSarah,
        input: {
          reportType: "DAILY_WORK",
          format: "CSV",
        },
      });

      const token = sarahJob.downloadToken!;
      expect(token).toBeDefined();

      // Sarah can download her own export
      const downloadResult = await ExportService.verifyAndDownloadExport({
        actor: employeeSarah,
        downloadToken: token,
      });

      expect(downloadResult.valid).toBe(true);
      expect(downloadResult.dataSnippet).toBeDefined();

      // Unauthorized peer John tries to download Sarah's token -> Rejected
      const unauthorizedDownload = await ExportService.verifyAndDownloadExport({
        actor: peerJohn,
        downloadToken: token,
      });

      expect(unauthorizedDownload.valid).toBe(false);
      expect(unauthorizedDownload.error).toContain("Forbidden");
    });
  });
});
