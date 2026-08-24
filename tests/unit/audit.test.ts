import { describe, it, expect, beforeEach } from "vitest";
import { AuditService } from "@/lib/audit/audit-service";

describe("Audit Logging Service", () => {
  beforeEach(() => {
    AuditService.clearInMemoryLogs();
  });

  it("successfully records an audit log entry with all standard fields", async () => {
    const entry = await AuditService.record({
      actorId: "user-alex",
      action: "rating_change",
      entity: "PerformanceReview",
      entityId: "review-123",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 Chrome/120.0",
      correlationId: "corr-test-456",
      reason: "Quarterly review calibration completed",
      beforeState: { rating: 3, notes: "Meets expectations" },
      afterState: { rating: 4, notes: "Exceeds expectations in core deliverables" },
    });

    expect(entry).toBeDefined();
    expect(entry.id).toBeDefined();
    expect(entry.action).toBe("rating_change");
    expect(entry.entity).toBe("PerformanceReview");
    expect(entry.entityId).toBe("review-123");
    expect(entry.correlationId).toBe("corr-test-456");
    expect(entry.beforeState).toEqual({ rating: 3, notes: "Meets expectations" });
    expect(entry.afterState).toEqual({
      rating: 4,
      notes: "Exceeds expectations in core deliverables",
    });
    expect(entry.timestamp).toBeInstanceOf(Date);
  });

  it("automatically generates correlation ID when omitted", async () => {
    const entry = await AuditService.record({
      actorId: "user-sarah",
      action: "attendance_correction",
      entity: "AttendanceRecord",
      entityId: "att-789",
      reason: "Forgot punch-in due to badge reader maintenance",
    });

    expect(entry.correlationId).toBeDefined();
    expect(entry.correlationId?.length).toBeGreaterThan(10);
  });

  it("maintains in-memory buffer for querying and verification", async () => {
    await AuditService.record({
      actorId: "user-rachel",
      action: "manager_assignment",
      entity: "Employee",
      entityId: "emp-jordan",
      reason: "Promoted to squad lead under Alex",
    });

    const logs = AuditService.getInMemoryLogs();
    expect(logs.length).toBe(1);
    expect(logs[0]?.action).toBe("manager_assignment");
  });
});
